const request = require('supertest');
const app = require('../src/app');

describe('API health endpoints', () => {
  test('GET /health returns a JSON health payload', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        environment: 'test'
      }
    });
    expect(response.body.data.name).toEqual(expect.any(String));
    expect(response.body.data.version).toEqual(expect.any(String));
    expect(response.body.data.uptime).toEqual(expect.any(Number));
    expect(new Date(response.body.data.timestamp).toString()).not.toBe('Invalid Date');
  });

  test('GET /api/v1/status returns API metadata through JSON', async () => {
    const response = await request(app)
      .get('/api/v1/status')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        apiPrefix: '/api/v1',
        environment: 'test'
      }
    });
    expect(response.body.data.name).toEqual(expect.any(String));
    expect(response.body.data.timestamp).toEqual(expect.any(String));
  });

  test('unknown routes return a JSON 404 response', async () => {
    const response = await request(app)
      .get('/missing-route')
      .expect(404)
      .expect('Content-Type', /json/);

    expect(response.body).toEqual({
      success: false,
      error: {
        message: 'Route not found',
        path: '/missing-route'
      }
    });
  });
});
