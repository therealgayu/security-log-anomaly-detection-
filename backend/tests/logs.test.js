/**
 * Log ingestion, validation and preprocessing tests.
 * Tests single log, bulk, upload (CSV), pagination, filters, stats, and delete.
 */
const request = require('supertest');
const path = require('path');
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

async function getAnalystToken() {
  const res = await request(app).post('/api/auth/register').send({
    name: 'Log Analyst',
    email: 'loganalyst@slads.test',
    password: 'Secret@12345',
  });
  const User = require('../src/models/User');
  await User.findOneAndUpdate({ email: 'loganalyst@slads.test' }, { role: 'analyst' });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'loganalyst@slads.test', password: 'Secret@12345' });
  return login.body.data.token;
}

const VALID_LOG = {
  timestamp: '2026-11-01T10:30:00Z',
  sourceIp: '192.168.1.100',
  username: 'jdoe',
  eventType: 'login_failed',
  statusCode: 401,
  resource: '/api/auth/login',
  message: 'Failed login attempt',
};

// ─── POST /api/logs ───────────────────────────────────────────────────────────
describe('POST /api/logs', () => {
  let token;

  beforeEach(async () => {
    token = await getAnalystToken();
  });

  it('should ingest a valid single log and return 201', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LOG)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.log).toMatchObject({
      sourceIp: VALID_LOG.sourceIp,
      username: VALID_LOG.username,
      eventType: VALID_LOG.eventType,
    });
    expect(res.body.data.log.isAnomaly).toBe(false);
    expect(res.body.data.log.anomalyScore).toBeNull();
  });

  it('should return 400 when sourceIp is missing', async () => {
    const { sourceIp, ...incomplete } = VALID_LOG;
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send(incomplete)
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for an invalid eventType', async () => {
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...VALID_LOG, eventType: 'invalid_event_type' })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for a missing timestamp', async () => {
    const { timestamp, ...noTs } = VALID_LOG;
    const res = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send(noTs)
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/logs/bulk ──────────────────────────────────────────────────────
describe('POST /api/logs/bulk', () => {
  let token;

  beforeEach(async () => {
    token = await getAnalystToken();
  });

  it('should bulk-ingest valid logs and return acceptedCount', async () => {
    const logs = Array.from({ length: 5 }, (_, i) => ({
      ...VALID_LOG,
      sourceIp: `10.0.0.${i + 1}`,
      username: `user${i}`,
    }));

    const res = await request(app)
      .post('/api/logs/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send(logs)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.totalReceived).toBe(5);
    expect(res.body.data.acceptedCount).toBe(5);
    expect(res.body.data.rejectedCount).toBe(0);
  });

  it('should partially ingest a mixed-validity batch', async () => {
    const logs = [
      VALID_LOG,
      { sourceIp: '10.0.0.9', username: 'x', eventType: 'INVALID' },  // bad eventType
      { ...VALID_LOG, sourceIp: '10.0.0.10', username: 'user2' },
    ];

    const res = await request(app)
      .post('/api/logs/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send(logs)
      .expect(201);

    expect(res.body.data.totalReceived).toBe(3);
    expect(res.body.data.rejectedCount).toBeGreaterThan(0);
  });

  it('should return 400 for an empty array', async () => {
    const res = await request(app)
      .post('/api/logs/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send([])
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/logs/upload (CSV) ─────────────────────────────────────────────
describe('POST /api/logs/upload', () => {
  let token;

  beforeEach(async () => {
    token = await getAnalystToken();
  });

  it('should process a valid CSV file and return 201', async () => {
    const csvContent =
      'timestamp,sourceIp,username,eventType,statusCode,resource,message\n' +
      '2026-11-01T10:00:00Z,192.168.0.1,alice,login_success,200,/dashboard,OK\n' +
      '2026-11-01T10:01:00Z,192.168.0.2,bob,login_failed,401,/api/login,Bad credentials\n';

    const res = await request(app)
      .post('/api/logs/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(csvContent), {
        filename: 'test_logs.csv',
        contentType: 'text/csv',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.filename).toBe('test_logs.csv');
    expect(res.body.data.acceptedCount).toBeGreaterThan(0);
  });

  it('should return 400 when no file is attached', async () => {
    const res = await request(app)
      .post('/api/logs/upload')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/logs ────────────────────────────────────────────────────────────
describe('GET /api/logs', () => {
  let token;

  beforeEach(async () => {
    token = await getAnalystToken();
    // Seed 3 logs
    await request(app)
      .post('/api/logs/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send([
        { ...VALID_LOG, sourceIp: '10.1.1.1', username: 'alice', eventType: 'login_success' },
        { ...VALID_LOG, sourceIp: '10.1.1.2', username: 'bob',   eventType: 'login_failed' },
        { ...VALID_LOG, sourceIp: '10.1.1.3', username: 'carol', eventType: 'access_denied' },
      ]);
  });

  it('should return paginated logs', async () => {
    const res = await request(app)
      .get('/api/logs?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.logs).toHaveLength(2);
    expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(3);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('should filter logs by eventType', async () => {
    const res = await request(app)
      .get('/api/logs?eventType=login_failed')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.data.logs.every((l) => l.eventType === 'login_failed')).toBe(true);
  });

  it('should filter logs by sourceIp', async () => {
    const res = await request(app)
      .get('/api/logs?sourceIp=10.1.1.1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    res.body.data.logs.forEach((l) => expect(l.sourceIp).toBe('10.1.1.1'));
  });

  it('should filter logs by username', async () => {
    const res = await request(app)
      .get('/api/logs?username=carol')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    res.body.data.logs.forEach((l) => expect(l.username).toBe('carol'));
  });
});

// ─── GET /api/logs/stats ──────────────────────────────────────────────────────
describe('GET /api/logs/stats', () => {
  let token;

  beforeEach(async () => {
    token = await getAnalystToken();
    await request(app)
      .post('/api/logs/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send([VALID_LOG, { ...VALID_LOG, sourceIp: '10.2.2.2', username: 'dave' }]);
  });

  it('should return aggregated log statistics', async () => {
    const res = await request(app)
      .get('/api/logs/stats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalLogs');
    expect(res.body.data).toHaveProperty('totalAnomalies');
    expect(res.body.data).toHaveProperty('anomalyRate');
    expect(res.body.data).toHaveProperty('uniqueIps');
    expect(res.body.data).toHaveProperty('eventTypeDistribution');
  });
});

// ─── GET /api/logs/:id  and DELETE /api/logs/:id ─────────────────────────────
describe('GET /api/logs/:id and DELETE /api/logs/:id', () => {
  let token;
  let adminToken;
  let logId;

  beforeEach(async () => {
    token = await getAnalystToken();

    // Create admin
    await request(app).post('/api/auth/register').send({
      name: 'Log Admin',
      email: 'logadmin@slads.test',
      password: 'Secret@12345',
    });
    const User = require('../src/models/User');
    await User.findOneAndUpdate({ email: 'logadmin@slads.test' }, { role: 'admin' });
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'logadmin@slads.test', password: 'Secret@12345' });
    adminToken = adminLogin.body.data.token;

    const created = await request(app)
      .post('/api/logs')
      .set('Authorization', `Bearer ${token}`)
      .send(VALID_LOG);
    logId = created.body.data.log._id;
  });

  it('should retrieve a single log by its ID', async () => {
    const res = await request(app)
      .get(`/api/logs/${logId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.log._id).toBe(logId);
  });

  it('should return 400 for an invalid ObjectId format', async () => {
    const res = await request(app)
      .get('/api/logs/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 404 when log does not exist', async () => {
    const res = await request(app)
      .get('/api/logs/665abc123def456789012345')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(res.body.success).toBe(false);
  });

  it('admin should delete a log entry', async () => {
    const res = await request(app)
      .delete(`/api/logs/${logId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    // Confirm it no longer exists
    await request(app)
      .get(`/api/logs/${logId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(404);
  });
});
