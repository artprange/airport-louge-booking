import { describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { logger } from '../dist/lib/logger.js';
import { openapiDocument } from '../dist/docs/openapi.js';

jest.unstable_mockModule('../dist/container.js', () => ({
  bookingService: { create: jest.fn() },
  loungeService: { list: jest.fn().mockResolvedValue([]), getById: jest.fn() },
  airportService: { search: jest.fn() },
}));
const { app } = await import('../dist/app.js');

describe('Delivery and observability', () => {
  it('generates a request ID and removes the framework header', async () => {
    const response = await request(app).get('/health');
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('preserves valid incoming correlation IDs', async () => {
    const response = await request(app).get('/health').set('X-Request-ID', 'client-request_123');
    expect(response.headers['x-request-id']).toBe('client-request_123');
  });

  it('replaces malformed correlation IDs rather than copying arbitrary text', async () => {
    const response = await request(app).get('/health').set('X-Request-ID', 'not a valid id');
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('attaches a request ID even when JSON parsing fails', async () => {
    const response = await request(app).post('/bookings')
      .set('Content-Type', 'application/json').send('{');
    expect(response.status).toBe(400);
    expect(response.headers['x-request-id']).toBeDefined();
  });

  it('logs structured success metadata', async () => {
    const log = jest.spyOn(logger, 'info').mockImplementation(() => {});
    const response = await request(app).get('/health');
    expect(log).toHaveBeenCalledWith({
      requestId: response.headers['x-request-id'], method: 'GET', path: '/health',
      statusCode: 200, durationMs: expect.any(Number),
    }, 'Request completed');
  });

  it('does not put query strings, bodies or authorization in request logs', async () => {
    const log = jest.spyOn(logger, 'warn').mockImplementation(() => {});
    const response = await request(app).post('/missing?token=private-query')
      .set('Authorization', 'Bearer private-token').send({ customerName: 'private-name' });
    expect(response.status).toBe(404);
    expect(log).toHaveBeenCalledWith({
      requestId: response.headers['x-request-id'], method: 'POST', path: '/missing',
      statusCode: 404, durationMs: expect.any(Number),
    }, 'Request completed');
    expect(JSON.stringify(log.mock.calls)).not.toMatch(/private-query|private-token|private-name/);
  });

  it('keeps the full original path when a mounted router handles the request', async () => {
    const log = jest.spyOn(logger, 'info').mockImplementation(() => {});
    const response = await request(app).get('/lounges?airportCode=GRU');
    expect(response.status).toBe(200);
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ path: '/lounges' }), 'Request completed');
  });

  it('documents every implemented business endpoint', () => {
    expect(openapiDocument.openapi).toBe('3.0.3');
    expect(Object.keys(openapiDocument.paths)).toEqual(expect.arrayContaining([
      '/health', '/lounges', '/lounges/{id}', '/bookings', '/airports',
    ]));
  });

  it('serves a specification suitable for the direct API', async () => {
    const response = await request(app).get('/openapi.json');
    expect(response.status).toBe(200);
    expect(response.body.servers).toEqual([{ url: '/' }]);
  });

  it('serves the proxy prefix without accepting arbitrary external servers', async () => {
    const proxied = await request(app).get('/openapi.json').set('X-Forwarded-Prefix', '/api');
    expect(proxied.body.servers).toEqual([{ url: '/api' }]);
    const invalid = await request(app).get('/openapi.json').set('X-Forwarded-Prefix', 'https://example.com');
    expect(invalid.body.servers).toEqual([{ url: '/' }]);
  });

  it('serves Swagger UI and its assets locally', async () => {
    const html = await request(app).get('/docs/');
    expect(html.status).toBe(200);
    expect(html.text).toContain('swagger-ui');
    const css = await request(app).get('/docs/swagger-ui.css');
    expect(css.status).toBe(200);
    expect(css.headers['content-type']).toMatch(/css/);
    const init = await request(app).get('/docs/swagger-ui-init.js');
    expect(init.status).toBe(200);
    expect(init.text).toContain('../openapi.json');
  });
});
