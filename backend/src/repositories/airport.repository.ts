import { z } from 'zod';
import { AppError } from '../errors/app-error.js';

const airportResponseSchema = z.object({
  data: z.array(z.object({
    iata: z.string().nullish(),
    name: z.string().min(1),
    municipality: z.string().nullish(),
    country_name: z.string().nullish(),
    country_code: z.string().nullish(),
  })),
});

type Airport = {
  iata: string;
  name: string;
  city: string;
  country: string;
};

class AirportRepository {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  async search(query: string): Promise<Airport[]> {
    const url = new URL('https://api.freeairportdb.com/v1/airports');
    // Fetch a small page, then remove airports without bookable IATA codes.
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '50');
    try {
      const response = await this.fetcher(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      if (response.status === 429) {
        throw new AppError(503, 'AIRPORT_SEARCH_RATE_LIMITED', 'Airport search is busy. Enter an IATA code or try again later.');
      }
      if (!response.ok) throw new Error('Airport provider failed');
      const payload = airportResponseSchema.parse(await response.json());
      const seen = new Set<string>();
      const airports: Airport[] = [];
      for (const item of payload.data) {
        const iata = item.iata?.trim().toUpperCase();
        if (!iata || !/^[A-Z]{3}$/.test(iata) || seen.has(iata)) continue;
        seen.add(iata);
        airports.push({
          iata,
          name: item.name,
          city: item.municipality ?? '',
          country: item.country_name ?? item.country_code ?? '',
        });
      }
      return airports
        .sort((a, b) => Number(b.iata.toLowerCase() === query.toLowerCase()) - Number(a.iata.toLowerCase() === query.toLowerCase()))
        .slice(0, 10);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;
      // Provider responses and connection details stay behind our API boundary.
      throw new AppError(503, 'AIRPORT_SEARCH_UNAVAILABLE', 'Airport search is unavailable. You can still enter an IATA code.');
    }
  }
}

export { AirportRepository };
export type { Airport };
