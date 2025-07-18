const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Form = require('../src/models/Form');
const Response = require('../src/models/Response');
let token, formId;

// Setup: connect to DB and create a test user
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany({});
  await Form.deleteMany({});
  await Response.deleteMany({});
  await request(app).post('/api/auth/register').send({ username: 'admin2', password: 'password123' });
  const res = await request(app).post('/api/auth/login').send({ username: 'admin2', password: 'password123' });
  token = res.body.token;
});
// Teardown: clean up DB and close connection
afterAll(async () => {
  await User.deleteMany({});
  await Form.deleteMany({});
  await Response.deleteMany({});
  await mongoose.connection.close();
});

describe('Forms', () => {
  // Test form creation
  it('should create a form', async () => {
    const res = await request(app)
      .post('/api/forms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Form',
        description: 'A test form',
        questions: [
          { text: 'Q1', type: 'text' },
          { text: 'Q2', type: 'mcq', options: ['A', 'B'] }
        ]
      });
    expect(res.statusCode).toBe(201);
    formId = res.body._id;
  });

  // Test getting all forms
  it('should get forms', async () => {
    const res = await request(app)
      .get('/api/forms')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test getting a form (public)
  it('should get a form (public)', async () => {
    const res = await request(app)
      .get(`/api/forms/${formId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Form');
  });

  // Test submitting a response (public)
  it('should submit a response (public)', async () => {
    const res = await request(app)
      .post(`/api/forms/${formId}/responses`)
      .send({
        answers: [
          { questionId: expect.anything(), answer: 'Hello' },
          { questionId: expect.anything(), answer: 'A' }
        ]
      });
    expect(res.statusCode).toBe(201);
  });

  // Test getting responses (protected)
  it('should get responses (protected)', async () => {
    const res = await request(app)
      .get(`/api/forms/${formId}/responses`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test getting summary (protected)
  it('should get summary (protected)', async () => {
    const res = await request(app)
      .get(`/api/forms/${formId}/summary`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Test exporting CSV (protected)
  it('should export CSV (protected)', async () => {
    const res = await request(app)
      .get(`/api/forms/${formId}/export`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/csv');
  });
}); 