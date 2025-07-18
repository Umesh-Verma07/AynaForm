const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Form = require('../src/models/Form');
const Response = require('../src/models/Response');
let token, formId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany({});
  await Form.deleteMany({});
  await Response.deleteMany({});
  await request(app).post('/api/auth/register').send({ username: 'admin2', password: 'password123' });
  const res = await request(app).post('/api/auth/login').send({ username: 'admin2', password: 'password123' });
  token = res.body.token;
});
afterAll(async () => {
  await User.deleteMany({});
  await Form.deleteMany({});
  await Response.deleteMany({});
  await mongoose.connection.close();
});

describe('Forms', () => {
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

  it('should get forms', async () => {
    const res = await request(app)
      .get('/api/forms')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a form (public)', async () => {
    const res = await request(app)
      .get(`/api/forms/${formId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Form');
  });

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

  it('should get responses (protected)', async () => {
    const res = await request(app)
      .get(`/api/forms/${formId}/responses`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get summary (protected)', async () => {
    const res = await request(app)
      .get(`/api/forms/${formId}/summary`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should export CSV (protected)', async () => {
    const res = await request(app)
      .get(`/api/forms/${formId}/export`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/csv');
  });
}); 