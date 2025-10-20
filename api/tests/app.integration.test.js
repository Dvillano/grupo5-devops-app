import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db.js';

beforeAll(async () => {
  await pool.query('DELETE FROM app.tasks'); // limpiar tabla
});

afterEach(async () => {
  await pool.query('DELETE FROM app.tasks');
});

afterAll(async () => {
  await pool.end();
});

describe('API Integration Tests', () => {
  test('GET /healthz', async () => {
    const res = await request(app).get('/healthz');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /tasks', async () => {
    const res = await request(app).post('/tasks').send({
      title: 'Test task',
      description: 'Test desc',
      done: false
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.task.title).toBe('Test task');
  });
}); 