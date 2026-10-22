import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { Prisma } from '../dist/generated/prisma/client.js';
import { CapacityExceededError } from '../dist/errors/capacity-exceeded.error.js';
import { InvalidBookingDateError } from '../dist/errors/invalid-booking-date.error.js';
import { LoungeNotFoundError } from '../dist/errors/lounge-not-found.error.js';
import { BookingConflictError } from '../dist/errors/booking-conflict.error.js';
import { AppError } from '../dist/errors/app-error.js';
import { logger } from '../dist/lib/logger.js';

const loungeId = '11111111-1111-4111-8111-111111111111';
const bookingService = { create: jest.fn() };
const loungeService = { list: jest.fn(), getById: jest.fn() };
const airportService = { search: jest.fn() };

// Registrar antes do import evita carregar o container e conectar ao banco.
jest.unstable_mockModule('../dist/container.js', () => ({ bookingService, loungeService, airportService }));
const { app } = await import('../dist/app.js');

const payload = {
  loungeId, customerName: 'Arthur', guests: 2, bookingDate: '2099-12-20',
};
const lounge = {
  id: loungeId, name: 'Guarulhos Lounge', airportCode: 'GRU',
  capacity: 30, price: new Prisma.Decimal('150.00'),
};
const loungeResponse = { ...lounge, price: '150.00' };

describe('HTTP API', () => {
  beforeEach(() => {
    bookingService.create.mockReset();
    loungeService.list.mockReset();
    loungeService.getById.mockReset();
    airportService.search.mockReset();
  });

  it('GET /airports returns normalized airport search results', async () => {
    const airport = { iata: 'GRU', name: 'Guarulhos', city: 'São Paulo', country: 'Brazil' };
    airportService.search.mockResolvedValue([airport]);
    const response = await request(app).get('/airports').query({ q: ' São Paulo ' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([airport]);
    expect(airportService.search).toHaveBeenCalledWith('São Paulo');
  });

  it.each([undefined, '', 'a', 'x'.repeat(81), ['GRU', 'JFK'], 'bad\u0000query'])('rejects invalid airport query %#', async (q) => {
    const response = await request(app).get('/airports').query(q === undefined ? {} : { q });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(airportService.search).not.toHaveBeenCalled();
  });

  it('GET /airports returns an empty list when nothing matches', async () => {
    airportService.search.mockResolvedValue([]);
    const response = await request(app).get('/airports?q=nowhere');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /airports forwards provider failures as standardized 503 responses', async () => {
    airportService.search.mockRejectedValue(new AppError(503, 'AIRPORT_SEARCH_UNAVAILABLE', 'Unavailable'));
    const response = await request(app).get('/airports?q=GRU');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ error: { code: 'AIRPORT_SEARCH_UNAVAILABLE', message: 'Unavailable' } });
  });

  it('GET /health returns the API status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('GET /lounges forwards the filter and serializes prices', async () => {
    loungeService.list.mockResolvedValue([lounge]);
    const response = await request(app).get('/lounges').query({ airportCode: 'GRU' });
    expect(response.status).toBe(200);
    expect(loungeService.list).toHaveBeenCalledWith('GRU');
    expect(response.body).toEqual([loungeResponse]);
  });

  it('GET /lounges returns an empty array when no lounges match', async () => {
    loungeService.list.mockResolvedValue([]);
    const response = await request(app).get('/lounges?airportCode=ZZZ');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('GET /lounges/:id returns lounge details', async () => {
    loungeService.getById.mockResolvedValue(lounge);
    const response = await request(app).get(`/lounges/${loungeId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(loungeResponse);
    expect(loungeService.getById).toHaveBeenCalledWith(loungeId);
  });

  it('GET /lounges/:id rejects malformed IDs before calling the service', async () => {
    const response = await request(app).get('/lounges/abc');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(loungeService.getById).not.toHaveBeenCalled();
  });

  it('GET /lounges/:id returns 404 for a missing lounge', async () => {
    loungeService.getById.mockRejectedValue(new LoungeNotFoundError());
    const response = await request(app).get(`/lounges/${loungeId}`);
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('LOUNGE_NOT_FOUND');
  });

  it('POST /bookings returns 201 and converts dates at the HTTP boundary', async () => {
    bookingService.create.mockResolvedValue({
      ...payload, id: 'booking-id',
      bookingDate: new Date('2099-12-20T00:00:00.000Z'),
      createdAt: new Date('2026-01-01T12:00:00.000Z'),
    });
    const response = await request(app).post('/bookings').send(payload);
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...payload, id: 'booking-id', createdAt: '2026-01-01T12:00:00.000Z',
    });
    expect(bookingService.create).toHaveBeenCalledWith({
      ...payload, bookingDate: new Date('2099-12-20T00:00:00.000Z'),
    });
  });

  it.each([
    ['zero guests', { guests: 0 }],
    ['negative guests', { guests: -1 }],
    ['fractional guests', { guests: 1.5 }],
    ['guests as text', { guests: '2' }],
    ['invalid calendar date', { bookingDate: '2099-02-30' }],
    ['invalid lounge ID', { loungeId: 'abc' }],
    ['blank customer name', { customerName: '  ' }],
  ])('rejects %s before calling the service', async (_label, change) => {
    const response = await request(app).post('/bookings').send({ ...payload, ...change });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(bookingService.create).not.toHaveBeenCalled();
  });

  it.each([
    [new CapacityExceededError(), 409, 'CAPACITY_EXCEEDED'],
    [new InvalidBookingDateError(), 422, 'INVALID_BOOKING_DATE'],
    [new LoungeNotFoundError(), 404, 'LOUNGE_NOT_FOUND'],
    [new BookingConflictError(), 409, 'BOOKING_CONFLICT'],
  ])('serializes domain error %#', async (error, status, code) => {
    bookingService.create.mockRejectedValue(error);
    const response = await request(app).post('/bookings').send(payload);
    expect(response.status).toBe(status);
    expect(response.body).toEqual({ error: { code, message: error.message } });
  });

  it('rejects malformed JSON', async () => {
    const response = await request(app).post('/bookings')
      .set('Content-Type', 'application/json').send('{"guests":');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
    expect(bookingService.create).not.toHaveBeenCalled();
  });

  it('rejects oversized JSON', async () => {
    const response = await request(app).post('/bookings')
      .send({ content: 'x'.repeat(110 * 1024) });
    expect(response.status).toBe(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    expect(bookingService.create).not.toHaveBeenCalled();
  });

  it('returns standardized errors for unknown routes', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' },
    });
  });

  it('hides unexpected error details and logs the original failure', async () => {
    const failure = new Error('Sensitive internal details');
    const log = jest.spyOn(logger, 'error').mockImplementation(() => {});
    bookingService.create.mockRejectedValue(failure);
    const response = await request(app).post('/bookings').send(payload);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
    });
    expect(log).toHaveBeenCalledWith(
      { err: failure, requestId: response.headers['x-request-id'] },
      'Unhandled application error',
    );
  });
});
