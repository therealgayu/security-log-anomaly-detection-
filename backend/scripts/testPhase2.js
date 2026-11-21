const fs = require('fs');

const BASE = process.env.BASE_URL || 'http://localhost:5000';
const ADMIN = { email: 'admin@test.com', password: 'Admin@12345' };
const VIEWER = { email: 'viewer@test.com', password: 'Viewer@12345' };
const CSV_PATH = process.argv[2] || 'sample_logs.csv';

let pass = 0, fail = 0;

async function call(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  let data;
  try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function t(name, expected, method, path, opts) {
  const r = await call(method, path, opts);
  const ok = [].concat(expected).includes(r.status);
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} [${r.status}] ${name}`);
  if (!ok) console.log('     ', JSON.stringify(r.data).slice(0, 400));
  return r;
}

const log = (o = {}) => ({
  timestamp: '2026-11-20T10:15:00Z', sourceIp: '192.168.1.10', username: 'alice',
  eventType: 'login_failed', resource: '/login', statusCode: 401, message: 'Failed login', ...o,
});

(async () => {
  const a = await call('POST', '/api/auth/login', { body: ADMIN });
  const v = await call('POST', '/api/auth/login', { body: VIEWER });
  const at = a.data?.data?.token, vt = v.data?.data?.token;
  if (!at || !vt) { console.log('Login failed. Check users and credentials.'); process.exit(1); }

  console.log('\n--- Single log ---');
  const created = await t('POST /api/logs valid', 201, 'POST', '/api/logs', { token: at, body: log() });
  const id = created.data?.data?.log?._id;
  await t('invalid IP rejected', 400, 'POST', '/api/logs', { token: at, body: log({ sourceIp: '999.1.1.1' }) });
  await t('invalid eventType rejected', 400, 'POST', '/api/logs', { token: at, body: log({ eventType: 'bad_type' }) });
  await t('no token -> 401', 401, 'POST', '/api/logs', { body: log() });
  await t('viewer -> 403', 403, 'POST', '/api/logs', { token: vt, body: log() });

  console.log('\n--- Bulk ---');
  const b = (ts, ip, u, e, r, s) => ({ timestamp: ts, sourceIp: ip, username: u, eventType: e, resource: r, statusCode: s, message: 'x' });
  const r6 = await t('bulk 3 valid', [200, 201], 'POST', '/api/logs/bulk', { token: at, body: [
    b('2026-11-20T10:16:00Z', '10.0.0.5', 'bob', 'login_success', '/login', 200),
    b('2026-11-20T10:17:00Z', '10.0.0.6', 'carol', 'file_access', '/files/a.txt', 200),
    b('2026-11-20T10:18:00Z', '10.0.0.7', 'dave', 'access_denied', '/admin', 403)] });
  console.log('     ', JSON.stringify(r6.data).slice(0, 250));
  const r7 = await t('bulk 2 valid + 1 invalid', [200, 201, 207], 'POST', '/api/logs/bulk', { token: at, body: [
    b('2026-11-20T10:19:00Z', '10.0.0.8', 'eve', 'login_failed', '/login', 401),
    b('2026-11-20T10:20:00Z', '10.0.0.9', 'frank', 'login_success', '/login', 200),
    b('not-a-date', 'bad-ip', 'x', 'login_failed', '/', 401)] });
  console.log('     ', JSON.stringify(r7.data).slice(0, 250));

  console.log('\n--- File upload ---');
  if (fs.existsSync(CSV_PATH)) {
    const form = new FormData();
    form.append('file', new Blob([fs.readFileSync(CSV_PATH)]), 'sample_logs.csv');
    const r8 = await t('upload sample_logs.csv', [200, 201], 'POST', '/api/logs/upload', { token: at, form });
    console.log('     ', JSON.stringify(r8.data).slice(0, 250));
    const bad = new FormData();
    bad.append('file', new Blob(['timestamp,sourceIp,username,eventType,resource,statusCode,message\nnot-a-date,bad-ip,x,login_failed,/,401,x\n2026-11-20T11:00:00Z,10.1.1.1,gina,login_success,/login,200,ok\n']), 'bad.csv');
    const r9 = await t('upload CSV with bad row', [200, 201], 'POST', '/api/logs/upload', { token: at, form: bad });
    console.log('     ', JSON.stringify(r9.data).slice(0, 250));
    const txt = new FormData();
    txt.append('file', new Blob(['2026-11-20T11:05:00Z 10.2.2.2 hank login_failed /login 401 failed\n']), 'test.log');
    await t('upload .log file', [200, 201], 'POST', '/api/logs/upload', { token: at, form: txt });
  } else {
    console.log(`SKIP upload tests: ${CSV_PATH} not found (pass path as argument)`);
  }

  console.log('\n--- Read / filter ---');
  await t('list paginated', 200, 'GET', '/api/logs?page=1&limit=5', { token: at });
  await t('filter eventType', 200, 'GET', '/api/logs?eventType=login_failed&limit=5', { token: at });
  await t('filter sourceIp', 200, 'GET', '/api/logs?sourceIp=192.168.1.10', { token: at });
  await t('filter username', 200, 'GET', '/api/logs?username=alice', { token: at });
  await t('filter date range', 200, 'GET', '/api/logs?from=2026-11-20&to=2026-11-21', { token: at });
  await t('filter isAnomaly', 200, 'GET', '/api/logs?isAnomaly=false&limit=5', { token: at });
  await t('stats', 200, 'GET', '/api/logs/stats', { token: at });
  await t('get by id', 200, 'GET', `/api/logs/${id}`, { token: at });
  await t('list without token -> 401', 401, 'GET', '/api/logs');

  console.log('\n--- Delete ---');
  await t('viewer delete -> 403', 403, 'DELETE', `/api/logs/${id}`, { token: vt });
  await t('admin delete -> 200', 200, 'DELETE', `/api/logs/${id}`, { token: at });
  await t('get deleted -> 404', 404, 'GET', `/api/logs/${id}`, { token: at });

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();