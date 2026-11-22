/**
 * Alert endpoint tests.
 * Covers: list with filters, stats, get-by-id, status transitions, and 404 paths.
 * No real anomaly detection run; we seed Alert documents directly via the model.
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Alert = require('../src/models/Alert');
const Log = require('../src/models/Log');
const { connect, disconnect, clearCollections } = require('./helpers/dbHelper');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearCollections();
});

afterAll(async () => {
  await disconnect();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loginAs(role, suffix = '') {
  const email = `${role}${suffix}@slads-alerts.test`;
  await request(app).post('/api/auth/register').send({
    name: `${role} User`,
    email,
    password: 'Secret@12345',
  });
  const User = require('../src/models/User');
  await User.findOneAndUpdate({ email }, { role });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Secret@12345' });
  return res.body.data.token;
}

async function seedLog() {
  return Log.create({
    timestamp: new Date(),
    sourceIp: '10.5.5.5',
    username: 'seeduser',
    eventType: 'login_failed',
    statusCode: 401,
    isAnomaly: true,
    anomalyScore: 0.91,
  });
}

async function seedAlert(overrides = {}) {
  const log = await seedLog();
  return Alert.create({
    logId: log._id,
    sourceIp: log.sourceIp,
    username: log.username,
    severity: 'high',
    status: 'open',
    reason: 'Unusual login failure rate detected',
    anomalyScore: 0.91,
    ...overrides,
  });
}

// ─── GET /api/alerts ──────────────────────────────────────────────────────────
describe('GET /api/alerts', () => {
  let token;

  beforeEach(async () => {
    token = await loginAs('analyst', '1');
    await seedAlert({ severity: 'critical', status: 'open' });
    await seedAlert({ severity: 'high', status: 'acknowledged' });
    await seedAlert({ severity: 'low', status: 'resolved' });
  });

  it('should return paginated alert list with correct structure', async () => {
    const res = await request(app)
      .get('/api/alerts?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.alerts)).toBe(true);
    expect(res.body.data.pagination).toHaveProperty('total');
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('should filter alerts by severity=critical', async () => {
    const res = await request(app)
      .get('/api/alerts?severity=critical')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    res.body.data.alerts.forEach((a) => expect(a.severity).toBe('critical'));
  });

  it('should filter alerts by status=acknowledged', async () => {
    const res = await request(app)
      .get('/api/alerts?status=acknowledged')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    res.body.data.alerts.forEach((a) => expect(a.status).toBe('acknowledged'));
  });
});

// ─── GET /api/alerts/stats ────────────────────────────────────────────────────
describe('GET /api/alerts/stats', () => {
  let token;

  beforeEach(async () => {
    token = await loginAs('analyst', '2');
    await seedAlert({ severity: 'critical', status: 'open' });
    await seedAlert({ severity: 'high', status: 'resolved' });
  });

  it('should return aggregated alert statistics', async () => {
    const res = await request(app)
      .get('/api/alerts/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalAlerts');
    expect(res.body.data).toHaveProperty('openAlerts');
    expect(res.body.data).toHaveProperty('severityBreakdown');
    expect(res.body.data.totalAlerts).toBeGreaterThanOrEqual(2);
  });
});

// ─── GET /api/alerts/:id ──────────────────────────────────────────────────────
describe('GET /api/alerts/:id', () => {
  let token;
  let alertId;

  beforeEach(async () => {
    token = await loginAs('analyst', '3');
    const alert = await seedAlert();
    alertId = alert._id.toString();
  });

  it('should retrieve a specific alert by ID', async () => {
    const res = await request(app)
      .get(`/api/alerts/${alertId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.alert._id).toBe(alertId);
    expect(res.body.data.alert).toHaveProperty('severity');
    expect(res.body.data.alert).toHaveProperty('anomalyScore');
  });

  it('should return 404 for a nonexistent alert ID', async () => {
    const res = await request(app)
      .get('/api/alerts/665abc123def456789012345')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for a malformed ObjectId', async () => {
    const res = await request(app)
      .get('/api/alerts/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── PATCH /api/alerts/:id/status ────────────────────────────────────────────
describe('PATCH /api/alerts/:id/status', () => {
  let analystToken;
  let viewerToken;
  let alertId;

  beforeEach(async () => {
    analystToken = await loginAs('analyst', '4');
    viewerToken = await loginAs('viewer', '4');
    const alert = await seedAlert({ status: 'open' });
    alertId = alert._id.toString();
  });

  it('analyst can transition open -> acknowledged', async () => {
    const res = await request(app)
      .patch(`/api/alerts/${alertId}/status`)
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ status: 'acknowledged' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.alert.status).toBe('acknowledged');
  });

  it('analyst can transition acknowledged -> resolved', async () => {
    // First acknowledge
    await request(app)
      .patch(`/api/alerts/${alertId}/status`)
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ status: 'acknowledged' });

    const res = await request(app)
      .patch(`/api/alerts/${alertId}/status`)
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ status: 'resolved' })
      .expect(200);

    expect(res.body.data.alert.status).toBe('resolved');
  });

  it('analyst can reopen a resolved alert', async () => {
    await request(app)
      .patch(`/api/alerts/${alertId}/status`)
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ status: 'resolved' });

    const res = await request(app)
      .patch(`/api/alerts/${alertId}/status`)
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ status: 'open' })
      .expect(200);

    expect(res.body.data.alert.status).toBe('open');
  });

  it('should return 400 for an invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/alerts/${alertId}/status`)
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ status: 'pending' })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('viewer cannot change alert status (403)', async () => {
    const res = await request(app)
      .patch(`/api/alerts/${alertId}/status`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ status: 'acknowledged' })
      .expect(403);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 for a nonexistent alert', async () => {
    const res = await request(app)
      .patch('/api/alerts/665abc123def456789012345/status')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({ status: 'acknowledged' })
      .expect(404);
    expect(res.body.success).toBe(false);
  });
});
