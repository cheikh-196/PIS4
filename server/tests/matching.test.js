// Set env vars before any module that reads them is required
process.env.JWT_SECRET = 'test-secret-for-jest';
process.env.MONGO_URI = 'mongodb://placeholder';
process.env.NODE_ENV = 'test';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const LostReport = require('../src/models/LostReport');
const FoundReport = require('../src/models/FoundReport');
const Match = require('../src/models/Match');
const Notification = require('../src/models/Notification');
const matchingService = require('../src/services/matchingService');

jest.setTimeout(120000);

// Coordinates within 5 km of each other (same spot — score +25)
const COORDS = [-15.9780, 18.0735]; // [lng, lat] Nouakchott

let mongoServer;
let lostUser;
let foundUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { startupTimeout: 60000 },
  });
  await mongoose.connect(mongoServer.getUri());

  lostUser = await User.create({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
  foundUser = await User.create({ name: 'Bob', email: 'bob@test.com', password: 'password123' });
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await LostReport.deleteMany();
  await FoundReport.deleteMany();
  await Match.deleteMany();
  await Notification.deleteMany();
});

// Helper: create a matching pair (score = 35+20+25+8 = 88, well above threshold of 60)
const makeMatchingPair = async () => {
  const now = new Date();

  const lost = await LostReport.create({
    user: lostUser._id,
    title: 'Laptop Dell noir',
    description: 'Ordinateur portable Dell noir avec chargeur',
    category: 'electronics',
    city: 'Nouakchott',
    location: { type: 'Point', coordinates: COORDS },
    lostDate: now,
    status: 'active',
    images: [],
    reward: 0,
  });

  const found = await FoundReport.create({
    user: foundUser._id,
    title: 'Laptop Dell trouvé',
    description: 'Ordinateur portable Dell trouvé près du marché',
    category: 'electronics',
    city: 'Nouakchott',
    location: { type: 'Point', coordinates: COORDS },
    foundDate: now,
    status: 'active',
    images: [],
  });

  return { lost, found };
};

describe('matchingService.findMatches — P1 no-duplicate fix', () => {
  it('creates exactly one match for a qualifying lost/found pair', async () => {
    const { lost } = await makeMatchingPair();

    const matches = await matchingService.findMatches(lost._id.toString(), 'lost');

    expect(matches.length).toBe(1);
    expect(matches[0].score).toBeGreaterThanOrEqual(60);

    const total = await Match.countDocuments();
    expect(total).toBe(1);
  });

  it('does not create a duplicate match when findMatches is called twice (lost branch)', async () => {
    const { lost } = await makeMatchingPair();

    // First call — creates the match
    await matchingService.findMatches(lost._id.toString(), 'lost');
    const afterFirst = await Match.countDocuments();
    expect(afterFirst).toBe(1);

    // Second call — must reuse the existing match, not create a second one
    const matches2 = await matchingService.findMatches(lost._id.toString(), 'lost');
    const afterSecond = await Match.countDocuments();
    expect(afterSecond).toBe(1);

    // The returned match from the second call should have all fields (not a partial document)
    expect(matches2[0].score).toBeDefined();
    expect(matches2[0].status).toBeDefined();
    expect(matches2[0].notifiedUsers).toBeDefined();
  });

  it('does not create a duplicate match when findMatches is called twice (found branch)', async () => {
    const { found } = await makeMatchingPair();

    await matchingService.findMatches(found._id.toString(), 'found');
    expect(await Match.countDocuments()).toBe(1);

    await matchingService.findMatches(found._id.toString(), 'found');
    expect(await Match.countDocuments()).toBe(1);
  });

  it('returns empty array when no found reports match the category', async () => {
    const lost = await LostReport.create({
      user: lostUser._id,
      title: 'Clé de voiture',
      description: 'Clé avec porte-clés rouge',
      category: 'keys',
      city: 'Nouakchott',
      location: { type: 'Point', coordinates: COORDS },
      lostDate: new Date(),
      status: 'active',
      images: [],
      reward: 0,
    });

    // No found reports in 'keys' category
    const matches = await matchingService.findMatches(lost._id.toString(), 'lost');
    expect(matches).toEqual([]);
    expect(await Match.countDocuments()).toBe(0);
  });

  it('returns empty array for a non-existent reportId', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const matches = await matchingService.findMatches(fakeId.toString(), 'lost');
    expect(matches).toEqual([]);
  });
});
