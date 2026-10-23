import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Requirement } from '../src/models/Requirement.js';

const future = (days) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);

const basics = {
  eventName: 'Riya & Arjun Sangeet',
  eventType: 'wedding',
  startDate: future(30),
  endDate: future(31),
  location: 'Pune',
  venue: 'Hotel Orchid',
};

const payloads = {
  planner: {
    ...basics,
    category: 'planner',
    details: {
      services: ['decor', 'catering'],
      guestCount: 250,
      theme: 'Rajasthani',
      budget: { min: 200000, max: 400000 },
    },
  },
  performer: {
    ...basics,
    category: 'performer',
    details: {
      performerType: 'dj',
      genre: 'Bollywood',
      performersCount: 1,
      durationMinutes: 180,
      soundSystemProvided: false,
      budget: { min: 30000, max: 50000 },
    },
  },
  crew: {
    ...basics,
    category: 'crew',
    details: {
      roles: [
        { role: 'photographer', count: 2 },
        { role: 'security', count: 4 },
      ],
      shiftStart: '18:00',
      shiftEnd: '02:00',
      experienceLevel: 'experienced',
      ratePerPersonPerDay: 3000,
    },
  },
};

let mongo;
const app = createApp();

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(() => Requirement.deleteMany({}));

describe('POST /api/requirements', () => {
  for (const [category, body] of Object.entries(payloads)) {
    it(`saves a ${category} requirement tagged with its category`, async () => {
      const res = await request(app).post('/api/requirements').send(body).expect(201);
      assert.equal(res.body.data.category, category);

      const saved = await mongoose.connection.collection('requirements').findOne({
        _id: new mongoose.Types.ObjectId(res.body.data._id),
      });
      assert.equal(saved.category, category);
      assert.ok(saved.details);
    });
  }

  it('rejects an unknown category', async () => {
    const res = await request(app)
      .post('/api/requirements')
      .send({ ...payloads.planner, category: 'caterer' })
      .expect(400);
    assert.equal(res.body.error, 'Validation failed');
  });

  it('rejects planner details sent under the performer category', async () => {
    const res = await request(app)
      .post('/api/requirements')
      .send({ ...payloads.planner, category: 'performer' })
      .expect(400);
    assert.ok(res.body.fields['details.performerType']);
  });

  it('rejects end date before start date', async () => {
    const res = await request(app)
      .post('/api/requirements')
      .send({ ...payloads.crew, startDate: future(10), endDate: future(5) })
      .expect(400);
    assert.ok(res.body.fields.endDate);
  });

  it('rejects a past event date', async () => {
    const res = await request(app)
      .post('/api/requirements')
      .send({ ...payloads.crew, startDate: '2020-01-01', endDate: undefined })
      .expect(400);
    assert.ok(res.body.fields.startDate);
  });

  it('rejects budget max below min', async () => {
    const body = structuredClone(payloads.planner);
    body.details.budget = { min: 5000, max: 1000 };
    const res = await request(app).post('/api/requirements').send(body).expect(400);
    assert.ok(res.body.fields['details.budget.max']);
  });

  it('rejects duplicate crew roles', async () => {
    const body = structuredClone(payloads.crew);
    body.details.roles.push({ role: 'photographer', count: 1 });
    const res = await request(app).post('/api/requirements').send(body).expect(400);
    assert.ok(res.body.fields['details.roles']);
  });

  it('drops unknown fields instead of storing them', async () => {
    const res = await request(app)
      .post('/api/requirements')
      .send({ ...payloads.performer, isAdmin: true })
      .expect(201);
    assert.equal(res.body.data.isAdmin, undefined);
  });

  it('returns 400 for malformed JSON', async () => {
    await request(app)
      .post('/api/requirements')
      .set('Content-Type', 'application/json')
      .send('{"eventName":')
      .expect(400);
  });
});

describe('GET /api/requirements', () => {
  beforeEach(async () => {
    for (const body of Object.values(payloads)) {
      await request(app).post('/api/requirements').send(body);
    }
  });

  it('filters by category', async () => {
    const res = await request(app).get('/api/requirements?category=crew').expect(200);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.data[0].category, 'crew');
  });

  it('lists everything without a filter', async () => {
    const res = await request(app).get('/api/requirements').expect(200);
    assert.equal(res.body.total, 3);
  });

  it('rejects an invalid category filter', async () => {
    await request(app).get('/api/requirements?category=nope').expect(400);
  });

  it('returns 400 for a bad id and 404 for a missing one', async () => {
    await request(app).get('/api/requirements/abc').expect(400);
    await request(app).get(`/api/requirements/${new mongoose.Types.ObjectId()}`).expect(404);
  });
});
