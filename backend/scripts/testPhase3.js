const BASE = process.env.BASE_URL || 'http://localhost:5000';
const ML = process.env.ML_URL || 'http://localhost:8000';
const KEY = process.env.ML_API_KEY || 'mlkey123';
const ADMIN = { email: 'admin@test.com', password: 'Admin@12345' };
const VIEWER = { email: 'viewer@test.com', password: 'Viewer@12345' };

let pass = 0, fail = 0;

async function call(url, method, { token, key, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (key) headers['X-API-KEY'] = key;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  let data; try { data = await res.json(); } catch { data = {}; }
  return { status: res.status, data };
}

async function t(name, expected, url, method, opts) {
  const r = await call(url, method, opts);
  const ok = [].concat(expected).includes(r.status);
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'} [${r.status}] ${name}`);
  if (!ok) console.log('     ', JSON.stringify(r.data).slice(0, 400));
  return r;
}

function makeLogs() {
  const logs = [];
  const users = ['alice', 'bob', 'carol', 'dave'];
  const base = Date.parse('2026-11-20T10:00:00Z');
  for (let i = 0; i < 300; i++) {
    logs.push({
      timestamp: new Date(base + i * 60000).toISOString(),
      sourceIp: `192.168.1.${10 + (i % 4)}`, username: users[i % 4],
      eventType: i % 10 === 0 ? 'login_failed' : 'login_success',
      resource: '/login', statusCode: i % 10 === 0 ? 401 : 200, message: 'normal',
    });
  }
  for (let i = 0; i < 40; i++) {
    logs.push({
      timestamp: new Date(base + 400 * 60000 + i * 1000).toISOString(),
      sourceIp: '203.0.113.99', username: `user${i}`, eventType: 'login_failed',
      resource: '/login', statusCode: 401, message: 'burst',
    });
  }
  return logs;
}

(async () => {
  console.log('\n--- ML service direct ---');
  await t('GET /health', 200, `${ML}/health`, 'GET');
  await t('predict without key rejected', [401, 403], `${ML}/predict`, 'POST', { body: [] });
  await t('predict with wrong key rejected', [401, 403], `${ML}/predict`, 'POST', { key: 'wrong', body: [] });
  const logs = makeLogs();
  const tr = await t('POST /train', [200, 201], `${ML}/train`, 'POST', { key: KEY, body: { logs } });
  console.log('     ', JSON.stringify(tr.data).slice(0, 250));
  const info = await t('GET /model/info', 200, `${ML}/model/info`, 'GET', { key: KEY });
  console.log('     ', JSON.stringify(info.data).slice(0, 250));
  const pr = await t('POST /predict', 200, `${ML}/predict`, 'POST', { key: KEY, body: { logs } });
  const arr = Array.isArray(pr.data) ? pr.data : (Object.values(pr.data).find(Array.isArray) || []);
  const flagged = arr.filter((x) => x.isAnomaly).length;
  const burstFlagged = arr.slice(300).filter((x) => x.isAnomaly).length;
  const scoreOk = arr.length === logs.length && arr.every((x) => x.anomalyScore >= 0 && x.anomalyScore <= 1);
  scoreOk ? pass++ : fail++;
  console.log(`${scoreOk ? 'PASS' : 'FAIL'} scores returned for all logs, within 0-1 (${arr.length}/${logs.length})`);
  console.log(`      flagged ${flagged} anomalies, ${burstFlagged}/40 of the injected burst`);

  console.log('\n--- Backend integration ---');
  const a = await call(`${BASE}/api/auth/login`, 'POST', { body: ADMIN });
  const v = await call(`${BASE}/api/auth/login`, 'POST', { body: VIEWER });
  const at = a.data?.data?.token, vt = v.data?.data?.token;
  if (!at || !vt) { console.log('Backend login failed'); process.exit(1); }
  await t('viewer train -> 403', 403, `${BASE}/api/ml/train`, 'POST', { token: vt });
  await t('viewer detect -> 403', 403, `${BASE}/api/ml/detect`, 'POST', { token: vt });
  await t('no token detect -> 401', 401, `${BASE}/api/ml/detect`, 'POST');
  const bt = await t('admin POST /api/ml/train', [200, 201], `${BASE}/api/ml/train`, 'POST', { token: at });
  console.log('     ', JSON.stringify(bt.data).slice(0, 250));
  const bd = await t('admin POST /api/ml/detect', [200, 201], `${BASE}/api/ml/detect`, 'POST', { token: at });
  console.log('     ', JSON.stringify(bd.data).slice(0, 250));
  const an = await t('GET /api/logs?isAnomaly=true', 200, `${BASE}/api/logs?isAnomaly=true&limit=5`, 'GET', { token: at });
  console.log('     ', JSON.stringify(an.data).slice(0, 300));

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();