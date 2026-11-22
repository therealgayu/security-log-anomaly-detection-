/**
 * RBAC tests – verifies that every protected endpoint enforces role boundaries.
 * Covers: viewer cannot mutate, analyst cannot train, admin can do everything.
 */
const request = require('supertest');
const app = require('../src/app');
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

async function registerAndLogin(role, suffix = '') {
  const email = `${role}${suffix}@slads-rbac.test`;
  await request(app)
    .post('/api/auth/register')
    .send({ name: `Test ${role}`, email, password: 'Secret@12345' });

  // Explicitly set role in MongoDB so token gets correct role
  const User = require('../src/models/User');
  await User.findOneAndUpdate({ email }, { role });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Secret@12345' });

  return loginRes.body.data.token;
}

// ─── Viewer role restrictions ────────────────────────────────────────────────
describe('Viewer role – read-only access', () => {
  let viewerToken;

  beforeEach(async () => {
    viewerToken = await registerAndLogin('viewer');
  });

  it('viewer can GET /api/logs (read is allowed)', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it('viewer cannot POST /api/logs (write is forbidden)', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        timestamp: new Date().toISOString(),
        sourceIp: '10.0.0.1',
        username: 'alice',
        eventType: 'login_success',
      });
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('viewer cannot POST /api/logs/bulk (write is forbidden)', async () => {
    const res = await request(app)
      .post('/api/logs/bulk')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send([]);
    expect(res.status).toBe(403);
  });

  it('viewer can GET /api/alerts', async () => {
    const res = await request(app)
      .get('/api/alerts')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it('viewer cannot PATCH /api/alerts/:id/status', async () => {
    const fakeId = '665abc123def456789012345';
    const res = await request(app)
      .patch(`/api/alerts/${fakeId}/status`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ status: 'acknowledged' });
    expect(res.status).toBe(403);
  });

  it('viewer cannot POST /api/ml/train', async () => {
    const res = await request(app)
      .post('/api/ml/train')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it('viewer cannot POST /api/ml/detect', async () => {
    const res = await request(app)
      .post('/api/ml/detect')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it('viewer can GET /api/ml/info', async () => {
    // ML service may be unreachable in test; we just expect auth to pass (not 401/403)
    const res = await request(app)
      .get('/api/ml/info')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect([200, 500, 503]).toContain(res.status);
  });

  it('viewer cannot GET /api/webhooks (admin only)', async () => {
    const res = await request(app)
      .get('/api/webhooks')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  });
});

// ─── Analyst role ─────────────────────────────────────────────────────────────
describe('Analyst role – read + ingest + detect; no train/admin/webhook', () => {
  let analystToken;

  beforeEach(async () => {
    analystToken = await registerAndLogin('analyst');
  });

  it('analyst can POST /api/logs', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({
        timestamp: new Date().toISOString(),
        sourceIp: '10.0.0.2',
        username: 'bob',
        eventType: 'login_failed',
        statusCode: 401,
      });
    // 201 (created) or 400 (validation details differ) – both mean auth passed
    expect([201, 400]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.success).toBe(true);
    }
  });

  it('analyst cannot POST /api/ml/train', async () => {
    const res = await request(app)
      .post('/api/ml/train')
      .set('Authorization', `Bearer ${analystToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it('analyst cannot DELETE /api/logs/:id', async () => {
    const fakeId = '665abc123def456789012345';
    const res = await request(app)
      .delete(`/api/logs/${fakeId}`)
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(403);
  });

  it('analyst cannot access /api/webhooks', async () => {
    const res = await request(app)
      .get('/api/webhooks')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(403);
  });
});

// ─── Admin role ───────────────────────────────────────────────────────────────
describe('Admin role – full access', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await registerAndLogin('admin');
  });

  it('admin can GET /api/logs', async () => {
    const res = await request(app)
      .get('/api/logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it('admin can GET /api/webhooks', async () => {
    const res = await request(app)
      .get('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it('admin can PATCH /api/users/:id/role', async () => {
    // Create a target user to update
    const target = await request(app).post('/api/auth/register').send({
      name: 'Target User',
      email: 'target@slads-rbac.test',
      password: 'Target@12345',
    });
    const targetId = target.body.data.user._id;

    const res = await request(app)
      .patch(`/api/users/${targetId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'analyst' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('analyst');
  });
});

// ─── Unauthenticated requests ─────────────────────────────────────────────────
describe('Unauthenticated requests', () => {
  it('GET /api/logs without token returns 401', async () => {
    const res = await request(app).get('/api/logs').expect(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/alerts without token returns 401', async () => {
    const res = await request(app).get('/api/alerts').expect(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/health (public) returns 200', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
  });
});
