/**
 * Webhook endpoint tests.
 * Outbound delivery calls to external URLs are mocked with jest.mock('axios').
 */
const request = require('supertest');
const app = require('../src/app');
const { connect, disconnect, clearCollections } = require('./helpers/dbHelper');

// Mock axios so no real HTTP calls leave the test runner
jest.mock('axios');
const axios = require('axios');

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearCollections();
  jest.clearAllMocks();
});

afterAll(async () => {
  await disconnect();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAdminToken() {
  const email = 'webhookadmin@slads.test';
  await request(app).post('/api/auth/register').send({
    name: 'Webhook Admin',
    email,
    password: 'Admin@12345',
  });
  const User = require('../src/models/User');
  await User.findOneAndUpdate({ email }, { role: 'admin' });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Admin@12345' });
  return res.body.data.token;
}

const VALID_WEBHOOK = {
  url: 'https://hooks.example.com/notify',
  secret: 'my_webhook_secret_key',
  events: ['alert.critical', 'alert.high'],
  format: 'standard',
};

// ─── POST /api/webhooks ───────────────────────────────────────────────────────
describe('POST /api/webhooks', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await getAdminToken();
  });

  it('admin can register a new webhook and get 201', async () => {
    const res = await request(app)
      .post('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(VALID_WEBHOOK)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.webhook.url).toBe(VALID_WEBHOOK.url);
    expect(res.body.data.webhook.active).toBe(true);
    expect(res.body.data.webhook.events).toEqual(expect.arrayContaining(['alert.critical']));
  });

  it('should return 400 when url is missing', async () => {
    const res = await request(app)
      .post('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ secret: 'abc' })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when secret is missing', async () => {
    const res = await request(app)
      .post('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ url: 'https://example.com/hook' })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for a non-http(s) url', async () => {
    const res = await request(app)
      .post('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...VALID_WEBHOOK, url: 'ftp://bad.protocol.com/hook' })
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/webhooks ────────────────────────────────────────────────────────
describe('GET /api/webhooks', () => {
  let adminToken;

  beforeEach(async () => {
    adminToken = await getAdminToken();
    await request(app)
      .post('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(VALID_WEBHOOK);
  });

  it('should return the list of registered webhooks', async () => {
    const res = await request(app)
      .get('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.webhooks)).toBe(true);
    expect(res.body.data.webhooks.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── DELETE /api/webhooks/:id ─────────────────────────────────────────────────
describe('DELETE /api/webhooks/:id', () => {
  let adminToken;
  let webhookId;

  beforeEach(async () => {
    adminToken = await getAdminToken();
    const created = await request(app)
      .post('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(VALID_WEBHOOK);
    webhookId = created.body.data.webhook._id;
  });

  it('admin can delete an existing webhook', async () => {
    const res = await request(app)
      .delete(`/api/webhooks/${webhookId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.deletedId).toBe(webhookId);
  });

  it('should return 404 for a nonexistent webhook', async () => {
    const res = await request(app)
      .delete('/api/webhooks/665abc123def456789012345')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for a malformed ObjectId', async () => {
    const res = await request(app)
      .delete('/api/webhooks/not-an-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/webhooks/:id/test ──────────────────────────────────────────────
describe('POST /api/webhooks/:id/test (mocked axios)', () => {
  let adminToken;
  let webhookId;

  beforeEach(async () => {
    adminToken = await getAdminToken();
    const created = await request(app)
      .post('/api/webhooks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(VALID_WEBHOOK);
    webhookId = created.body.data.webhook._id;
  });

  it('should report delivery success when axios succeeds', async () => {
    axios.post.mockResolvedValue({ status: 200, statusText: 'OK' });

    const res = await request(app)
      .post(`/api/webhooks/${webhookId}/test`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should report delivery failure when axios throws', async () => {
    axios.post.mockRejectedValue(new Error('Connection refused'));

    const res = await request(app)
      .post(`/api/webhooks/${webhookId}/test`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);  // endpoint itself succeeds; delivery result is in body

    expect(res.body.data.success).toBe(false);
  });

  it('should return 404 for a nonexistent webhook ID', async () => {
    const res = await request(app)
      .post('/api/webhooks/665abc123def456789012345/test')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/webhooks/inbound/logs ─────────────────────────────────────────
describe('POST /api/webhooks/inbound/logs', () => {
  const VALID_SECRET = 'slads_inbound_secret_2026';

  const SAMPLE_LOGS = [
    {
      timestamp: '2026-11-01T10:00:00Z',
      sourceIp: '172.16.0.1',
      username: 'ext_user',
      eventType: 'login_failed',
      statusCode: 401,
    },
  ];

  it('should accept inbound logs with the correct X-Webhook-Secret', async () => {
    const res = await request(app)
      .post('/api/webhooks/inbound/logs')
      .set('X-Webhook-Secret', VALID_SECRET)
      .send(SAMPLE_LOGS)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.acceptedCount).toBeGreaterThan(0);
  });

  it('should return 401 when X-Webhook-Secret is missing', async () => {
    const res = await request(app)
      .post('/api/webhooks/inbound/logs')
      .send(SAMPLE_LOGS)
      .expect(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for a wrong inbound secret', async () => {
    const res = await request(app)
      .post('/api/webhooks/inbound/logs')
      .set('X-Webhook-Secret', 'wrong_secret_value')
      .send(SAMPLE_LOGS)
      .expect(401);
    expect(res.body.success).toBe(false);
  });
});
