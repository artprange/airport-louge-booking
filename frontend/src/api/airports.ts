import type { Airport } from '../types/airport';

async function fetchAirports(query: string, signal?: AbortSignal): Promise<Airport[]> {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/airports?${params}`, { signal });
  if (!response.ok) throw new Error('Airport search is unavailable. Enter a three-letter IATA code instead.');
  return response.json();
}

export { fetchAirports };
