const http = require('http');
const crypto = require('crypto');

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const INBOUND_SECRET = process.env.WEBHOOK_INBOUND_SECRET || '';
const HOOK_SECRET = 'test_hook_secret_123';
const ADMIN = { email: 'admin@test.com', password: 'Admin@12345' };
const VIEWER = { email: 'viewer@test.com', password: 'Viewer@12345' };

let pass = 0, fail = 0;
const received = [];

const receiver = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => (raw += c));
  req.on('end', () => {
    received.push({ headers: req.headers, raw });
    res.writeHead(200); res.end('ok');
  });
}).listen(9999);

async function call(method, path, { token, body, headers = {} } = {}) {
  const h = { ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  if (body !== undefined) h['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, { method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined });
  let data; try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

function report(ok, name, status, data) {
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${status !== undefined ? `[${status}] ` : ''}${name}`);
  if (!ok && data !== undefined) console.log('     ', JSON.stringify(data).slice(0, 400));
}

async function t(name, expected, method, path, opts) {
  const r = await call(method, path, opts);
  report([].concat(expected).includes(r.status), name, r.status, r.data);
  return r;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const find = (o, keys) => keys.map((k) => o?.[k]).find((v) => v !== undefined);

(async () => {
  const a = await call('POST', '/api/auth/login', { body: ADMIN });
  const v = await call('POST', '/api/auth/login', { body: VIEWER });
  const at = a.data?.data?.token, vt = v.data?.data?.token;
  if (!at || !vt) { console.log('Login failed'); process.exit(1); }

  console.log('\n--- Alert generation ---');
  const d1 = await t('admin POST /api/ml/detect', [200, 201], 'POST', '/api/ml/detect', { token: at });
  console.log('     ', JSON.stringify(d1.data).slice(0, 250));
  const list = await t('GET /api/alerts', 200, 'GET', '/api/alerts?page=1&limit=10', { token: at });
  const alerts = list.data?.data?.alerts || [];
  report(alerts.length > 0, `alerts created (${alerts.length} on page 1)`);
  const first = alerts[0];
  const alertId = first?._id;

  const before = (await call('GET', '/api/alerts/stats', { token: at })).data;
  await t('re-run detect (dedup)', [200, 201], 'POST', '/api/ml/detect', { token: at });
  const after = (await call('GET', '/api/alerts/stats', { token: at })).data;
  console.log('      stats before:', JSON.stringify(before?.data).slice(0, 200));
  console.log('      stats after :', JSON.stringify(after?.data).slice(0, 200));

  console.log('\n--- Alert APIs ---');
  await t('no token -> 401', 401, 'GET', '/api/alerts');
  await t('filter severity=high', 200, 'GET', '/api/alerts?severity=high', { token: at });
  await t('filter status=open', 200, 'GET', '/api/alerts?status=open', { token: at });
  await t('GET /api/alerts/stats', 200, 'GET', '/api/alerts/stats', { token: at });
  if (alertId) {
    await t('GET /api/alerts/:id', 200, 'GET', `/api/alerts/${alertId}`, { token: at });
    await t('viewer status change -> 403', 403, 'PATCH', `/api/alerts/${alertId}/status`, { token: vt, body: { status: 'acknowledged' } });
    await t('invalid status -> 400', 400, 'PATCH', `/api/alerts/${alertId}/status`, { token: at, body: { status: 'bogus' } });
    await t('admin acknowledge', 200, 'PATCH', `/api/alerts/${alertId}/status`, { token: at, body: { status: 'acknowledged' } });
    const rs = await t('admin resolve', 200, 'PATCH', `/api/alerts/${alertId}/status`, { token: at, body: { status: 'resolved' } });
    const st = find(rs.data?.data?.alert || rs.data?.data || {}, ['status']);
    report(st === 'resolved', `status is "resolved" (got ${st})`);
  }

  console.log('\n--- Outbound webhooks ---');
  await t('viewer create webhook -> 403', 403, 'POST', '/api/webhooks', { token: vt, body: { url: 'http://localhost:9999/hook', secret: HOOK_SECRET } });
  await t('invalid URL -> 400', 400, 'POST', '/api/webhooks', { token: at, body: { url: 'not-a-url', secret: HOOK_SECRET } });
  const wc = await t('admin create webhook', [200, 201], 'POST', '/api/webhooks', {
    token: at, body: { url: 'http://localhost:9999/hook', secret: HOOK_SECRET, events: ['alert.created'], active: true } });
  const hook = wc.data?.data?.webhook || wc.data?.data || {};
  const hookId = hook._id || hook.id;
  await t('GET /api/webhooks', 200, 'GET', '/api/webhooks', { token: at });
  if (hookId) {
    await t('POST /api/webhooks/:id/test', [200, 201, 202], 'POST', `/api/webhooks/${hookId}/test`, { token: at });
    await sleep(3000);
    report(received.length > 0, `receiver got ${received.length} delivery(ies)`);
    if (received.length) {
      const d = received[0];
      const sigHeader = d.headers['x-signature'] || '';
      const expected = crypto.createHmac('sha256', HOOK_SECRET).update(d.raw).digest('hex');
      report(sigHeader.replace(/^sha256=/, '') === expected, 'X-Signature HMAC-SHA256 valid', undefined, { sigHeader, expected });
    }
  } else {
    report(false, 'webhook id missing from create response', undefined, wc.data);
  }

  console.log('\n--- Inbound webhook ---');
  const inboundLog = { timestamp: '2026-11-21T12:00:00Z', sourceIp: '198.51.100.7', username: 'ext_user', eventType: 'login_failed', resource: '/login', statusCode: 401, message: 'from external system' };
  await t('inbound without secret -> 401/403', [401, 403], 'POST', '/api/webhooks/inbound/logs', { body: inboundLog });
  await t('inbound wrong secret -> 401/403', [401, 403], 'POST', '/api/webhooks/inbound/logs', { headers: { 'X-Webhook-Secret': 'wrong' }, body: inboundLog });
  if (INBOUND_SECRET) {
    const ib = await t('inbound valid secret', [200, 201], 'POST', '/api/webhooks/inbound/logs', { headers: { 'X-Webhook-Secret': INBOUND_SECRET }, body: inboundLog });
    console.log('     ', JSON.stringify(ib.data).slice(0, 250));
  } else {
    console.log('SKIP inbound valid-secret test: set WEBHOOK_INBOUND_SECRET');
  }

  console.log('\n--- Cleanup ---');
  if (hookId) {
    await t('viewer delete webhook -> 403', 403, 'DELETE', `/api/webhooks/${hookId}`, { token: vt });
    await t('admin delete webhook', 200, 'DELETE', `/api/webhooks/${hookId}`, { token: at });
  }

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  receiver.close();
  process.exit(fail ? 1 : 0);
})();