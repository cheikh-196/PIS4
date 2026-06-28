// Set env vars before any module that reads them is required
process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.MONGO_URI = 'mongodb://placeholder';
process.env.NODE_ENV = 'test';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

jest.setTimeout(120000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { startupTimeout: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany();
});

describe('POST /api/auth/login — S1 rate limiting', () => {
  // This test must run first in the file so the rate limiter counter starts at 0.
  // Jest runs tests within a file sequentially in declaration order.
  it('blocks the 6th login attempt within 15 minutes with 429', async () => {
    // Attempts 1–5: must all pass through the rate limiter (may be 401 for wrong creds)
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: 'wrongpassword' });
      expect(res.status).not.toBe(429);
    }

    // Attempt 6: rate limiter kicks in
    const blocked = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'wrongpassword' });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/Trop de tentatives/);
  });
});

describe('POST /api/auth/register — not rate-limited by auth limiter', () => {
  it('returns 201 and a token when registering a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@test.com');
  });

  it('returns 400 when registering with a duplicate email', async () => {
    await User.create({ name: 'Alice', email: 'alice@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice2', email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(400);
  });
});
