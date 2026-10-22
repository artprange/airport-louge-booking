import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AirportRepository } from '../dist/repositories/airport.repository.js';
import { AirportService } from '../dist/services/airport.service.js';
import { AppError } from '../dist/errors/app-error.js';

const airport = { iata: 'GRU', name: 'Guarulhos', city: 'São Paulo', country: 'Brazil' };
const providerAirport = { iata: 'GRU', name: 'Guarulhos', municipality: 'São Paulo', country_name: 'Brazil' };

describe('AirportRepository', () => {
  it('maps provider data, removes invalid IATA codes and duplicates, and ranks exact matches first', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { ...providerAirport, iata: 'GIG' }, providerAirport,
      { ...providerAirport, iata: 'gru' }, { ...providerAirport, iata: null },
      { ...providerAirport, iata: 'ABCD' },
    ] })));
    const result = await new AirportRepository(fetcher).search('gru');
    expect(result).toEqual([airport, { ...airport, iata: 'GIG' }]);
    const [url, options] = fetcher.mock.calls[0];
    expect(url.origin).toBe('https://api.freeairportdb.com');
    expect(url.searchParams.get('q')).toBe('gru');
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it('limits results to ten airports with IATA codes', async () => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      ...providerAirport, iata: `AA${String.fromCharCode(65 + i)}`,
    }));
    const fetcher = jest.fn().mockResolvedValue(new Response(JSON.stringify({ data })));
    expect(await new AirportRepository(fetcher).search('airport')).toHaveLength(10);
  });

  it('maps provider throttling to a standardized 503', async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response('', { status: 429 }));
    await expect(new AirportRepository(fetcher).search('gru')).rejects.toMatchObject({
      statusCode: 503, code: 'AIRPORT_SEARCH_RATE_LIMITED',
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each(['network', 'timeout', 'http', 'json', 'shape'])('handles %s failures without exposing provider details', async (failure) => {
    const fetcher = jest.fn();
    if (failure === 'network' || failure === 'timeout') fetcher.mockRejectedValue(new Error('Internal provider details'));
    if (failure === 'http') fetcher.mockResolvedValue(new Response('', { status: 500 }));
    if (failure === 'json') fetcher.mockResolvedValue(new Response('not-json'));
    if (failure === 'shape') fetcher.mockResolvedValue(new Response(JSON.stringify({ invalid: [] })));
    await expect(new AirportRepository(fetcher).search('gru')).rejects.toMatchObject({
      statusCode: 503, code: 'AIRPORT_SEARCH_UNAVAILABLE',
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('AirportService', () => {
  let repository;
  let service;
  beforeEach(() => {
    repository = { search: jest.fn().mockResolvedValue([airport]) };
    service = new AirportService(repository);
  });

  it('normalizes case and whitespace and caches successful results', async () => {
    await expect(service.search('  São   Paulo ')).resolves.toEqual([airport]);
    await expect(service.search('são paulo')).resolves.toEqual([airport]);
    expect(repository.search).toHaveBeenCalledTimes(1);
    expect(repository.search).toHaveBeenCalledWith('são paulo');
  });

  it('expires cached results after ten minutes', async () => {
    const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    await service.search('gru');
    now.mockReturnValue(1000 + 10 * 60 * 1000);
    await service.search('gru');
    expect(repository.search).toHaveBeenCalledTimes(2);
  });

  it('shares in-flight identical requests', async () => {
    let resolve;
    repository.search.mockReturnValue(new Promise((done) => { resolve = done; }));
    const a = service.search('GRU');
    const b = service.search('gru');
    expect(repository.search).toHaveBeenCalledTimes(1);
    resolve([airport]);
    expect(await Promise.all([a, b])).toEqual([[airport], [airport]]);
  });

  it('does not cache failures and releases in-flight requests', async () => {
    repository.search.mockRejectedValueOnce(new AppError(503, 'AIRPORT_SEARCH_UNAVAILABLE', 'Unavailable'));
    await expect(service.search('gru')).rejects.toBeInstanceOf(AppError);
    await expect(service.search('gru')).resolves.toEqual([airport]);
    expect(repository.search).toHaveBeenCalledTimes(2);
  });

  it('evicts older queries after reaching the bounded cache size', async () => {
    for (let i = 0; i < 201; i++) await service.search(`city ${i}`);
    await service.search('city 0');
    expect(repository.search).toHaveBeenCalledTimes(202);
  });

  it('bounds simultaneous distinct requests without blocking shared requests', async () => {
    const complete = [];
    repository.search.mockImplementation(() => new Promise((resolve) => complete.push(resolve)));
    const requests = Array.from({ length: 8 }, (_, i) => service.search(`city ${i}`));
    const duplicate = service.search('city 0');
    await expect(service.search('city 9')).rejects.toMatchObject({ statusCode: 503, code: 'AIRPORT_SEARCH_BUSY' });
    complete.forEach((resolve) => resolve([airport]));
    await Promise.all([...requests, duplicate]);
    expect(repository.search).toHaveBeenCalledTimes(8);
    await expect(service.search('city 0')).resolves.toEqual([airport]);
  });
});
