import { AppError } from '../errors/app-error.js';
import type { Airport, AirportRepository } from '../repositories/airport.repository.js';

type CacheEntry = { expiresAt: number; airports: Airport[] };
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 200;
const MAX_IN_FLIGHT = 8;

class AirportService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<Airport[]>>();

  constructor(private readonly airports: AirportRepository) {}

  async search(query: string): Promise<Airport[]> {
    const normalized = query.trim().replace(/\s+/g, ' ').toLowerCase();
    const cached = this.cache.get(normalized);
    if (cached && cached.expiresAt > Date.now()) return cached.airports;
    if (cached) this.cache.delete(normalized);

    const pending = this.inFlight.get(normalized);
    if (pending) return pending;
    if (this.inFlight.size >= MAX_IN_FLIGHT) {
      throw new AppError(503, 'AIRPORT_SEARCH_BUSY', 'Airport search is busy. Enter an IATA code or try again shortly.');
    }

    // Coalesce identical searches so concurrent users share one upstream call.
    const request = this.airports.search(normalized).then((airports) => {
      if (this.cache.size >= MAX_CACHE_ENTRIES) {
        const oldest = this.cache.keys().next().value;
        if (oldest !== undefined) this.cache.delete(oldest);
      }
      this.cache.set(normalized, { airports, expiresAt: Date.now() + CACHE_TTL_MS });
      return airports;
    }).finally(() => {
      // Failed lookups are not cached and can be retried later.
      this.inFlight.delete(normalized);
    });
    this.inFlight.set(normalized, request);
    return request;
  }
}

export { AirportService };
