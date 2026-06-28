// Set env vars before any module that reads them is required
process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.MONGO_URI = 'mongodb://placeholder';
process.env.NODE_ENV = 'test';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Message = require('../src/models/Message');

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
  await Message.deleteMany();
});

const makeToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

const makeUsers = async () => {
  const sender = await User.create({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
  const receiver = await User.create({ name: 'Bob', email: 'bob@test.com', password: 'password123' });
  const outsider = await User.create({ name: 'Charlie', email: 'charlie@test.com', password: 'password123' });
  return { sender, receiver, outsider };
};

describe('GET /api/messages/:reportId — S2 authorization check', () => {
  it('returns 200 and the messages to the sender', async () => {
    const { sender, receiver } = await makeUsers();
    const reportId = new mongoose.Types.ObjectId();

    await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      reportId,
      reportType: 'lost',
      content: 'Is this your bag?',
    });

    const res = await request(app)
      .get(`/api/messages/${reportId}`)
      .set('Authorization', `Bearer ${makeToken(sender._id)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.messages).toHaveLength(1);
    expect(res.body.messages[0].content).toBe('Is this your bag?');
  });

  it('returns 200 and the messages to the receiver', async () => {
    const { sender, receiver } = await makeUsers();
    const reportId = new mongoose.Types.ObjectId();

    await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      reportId,
      reportType: 'lost',
      content: 'Is this your bag?',
    });

    const res = await request(app)
      .get(`/api/messages/${reportId}`)
      .set('Authorization', `Bearer ${makeToken(receiver._id)}`);

    expect(res.status).toBe(200);
    expect(res.body.messages).toHaveLength(1);
  });

  it('returns 403 to an authenticated user who is not a participant', async () => {
    const { sender, receiver, outsider } = await makeUsers();
    const reportId = new mongoose.Types.ObjectId();

    await Message.create({
      sender: sender._id,
      receiver: receiver._id,
      reportId,
      reportType: 'lost',
      content: 'Is this your bag?',
    });

    const res = await request(app)
      .get(`/api/messages/${reportId}`)
      .set('Authorization', `Bearer ${makeToken(outsider._id)}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 to an unauthenticated request', async () => {
    const reportId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/messages/${reportId}`);

    expect(res.status).toBe(401);
  });

  it('returns 403 for a valid reportId that has no messages (empty conversation)', async () => {
    const { outsider } = await makeUsers();
    const reportId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/messages/${reportId}`)
      .set('Authorization', `Bearer ${makeToken(outsider._id)}`);

    expect(res.status).toBe(403);
  });
});
