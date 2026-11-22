/**
 * Auth routes tests – covers register, login, /me, and Google auth error paths.
 * Uses mongodb-memory-server so no real MongoDB connection is required.
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

// ─── Shared test data ───────────────────────────────────────────────────────
const VALID_USER = {
  name: 'Test Admin',
  email: 'testadmin@slads.test',
  password: 'Admin@12345',
};

// ─── POST /api/auth/register ────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('should register a new user and return 201 with token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(VALID_USER)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(VALID_USER.email);
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('should return 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'No Email', password: 'Secret@123' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should return 400 when password is too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User', email: 'short@test.com', password: '123' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should return 400 or 409 on duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send(VALID_USER).expect(201);

    const res = await request(app)
      .post('/api/auth/register')
      .send(VALID_USER);

    expect([400, 409]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(VALID_USER);
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: VALID_USER.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.user.email).toBe(VALID_USER.email);
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: VALID_USER.email, password: 'WrongPass@99' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@slads.test', password: 'Secret@123' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('should return 400 when email is missing from body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Admin@12345' })
      .expect(400);

    expect(res.body.success).toBe(false);
  });
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send(VALID_USER);
    token = res.body.data.token;
  });

  it('should return the current user when given a valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(VALID_USER.email);
  });

  it('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/api/auth/me').expect(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for a malformed token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer totallyinvalidjwt')
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send(VALID_USER);
    token = res.body.data.token;
  });

  it('should acknowledge logout for authenticated user', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});

// ─── POST /api/auth/google (error path only – no real Google token) ──────────
describe('POST /api/auth/google (error path)', () => {
  it('should return 400 when idToken is missing', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('should return 401 for an invalid Google idToken', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'fake.google.id.token' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});
