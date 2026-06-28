// Set env vars before any module that reads them is required
process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.MONGO_URI = 'mongodb://placeholder';
process.env.NODE_ENV = 'test';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const LostReport = require('../src/models/LostReport');

jest.setTimeout(120000);

// Nouakchott coordinates (the correct default after Q1 fix)
const NOUAKCHOTT = { lat: 18.0735, lng: -15.9780 };
// Paris coordinates (the old wrong default before Q1 fix)
const PARIS = { lat: 48.8566, lng: 2.3522 };

let mongoServer;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { startupTimeout: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());
  // Ensure 2dsphere index exists before running geo queries
  await LostReport.createIndexes();

  testUser = await User.create({
    name: 'Tester',
    email: 'tester@test.com',
    password: 'password123',
  });
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await LostReport.deleteMany();
});

describe('GET /api/map/reports/nearby — Q1 default coordinates', () => {
  it('returns a report located in Nouakchott when called with no coordinates', async () => {
    // Place a report exactly at Nouakchott
    const report = await LostReport.create({
      user: testUser._id,
      title: 'Portefeuille perdu',
      description: 'Portefeuille noir avec documents',
      category: 'documents',
      city: 'Nouakchott',
      location: { type: 'Point', coordinates: [NOUAKCHOTT.lng, NOUAKCHOTT.lat] },
      lostDate: new Date(),
      status: 'active',
      images: [],
      reward: 0,
    });

    const res = await request(app).get('/api/map/reports/nearby');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const foundIds = res.body.nearby.lost.map((r) => r._id.toString());
    expect(foundIds).toContain(report._id.toString());
  });

  it('does NOT return a report located in Paris when called with no coordinates', async () => {
    // If the default were still Paris (old bug), this report would be found.
    // With the Nouakchott default (fix), it should NOT appear — Paris is ~5,000 km away.
    const parisReport = await LostReport.create({
      user: testUser._id,
      title: 'Clé perdue à Paris',
      description: 'Clé de voiture perdue',
      category: 'keys',
      city: 'Paris',
      location: { type: 'Point', coordinates: [PARIS.lng, PARIS.lat] },
      lostDate: new Date(),
      status: 'active',
      images: [],
      reward: 0,
    });

    const res = await request(app).get('/api/map/reports/nearby');

    expect(res.status).toBe(200);
    const foundIds = res.body.nearby.lost.map((r) => r._id.toString());
    expect(foundIds).not.toContain(parisReport._id.toString());
  });

  it('still returns a Nouakchott report when lat/lng are provided explicitly', async () => {
    const report = await LostReport.create({
      user: testUser._id,
      title: 'Téléphone perdu',
      description: 'Téléphone Samsung noir',
      category: 'electronics',
      city: 'Nouakchott',
      location: { type: 'Point', coordinates: [NOUAKCHOTT.lng, NOUAKCHOTT.lat] },
      lostDate: new Date(),
      status: 'active',
      images: [],
      reward: 0,
    });

    const res = await request(app)
      .get('/api/map/reports/nearby')
      .query({ lat: NOUAKCHOTT.lat, lng: NOUAKCHOTT.lng, radius: 5 });

    expect(res.status).toBe(200);
    const foundIds = res.body.nearby.lost.map((r) => r._id.toString());
    expect(foundIds).toContain(report._id.toString());
  });
});
