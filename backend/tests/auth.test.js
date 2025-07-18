const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Setup: connect to DB before tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});
// Teardown: clean up users and close connection
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth', () => {
  // Test user registration
  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'password123' });
    expect(res.statusCode).toBe(201);
  });

  // Test duplicate registration
  it('should not register duplicate user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'password123' });
    expect(res.statusCode).toBe(409);
  });

  // Test user login
  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
}); 