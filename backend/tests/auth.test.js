const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth', () => {
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'password123' });
    expect(res.statusCode).toBe(201);
  });

  it('should not register duplicate user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'password123' });
    expect(res.statusCode).toBe(409);
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
}); 