import type { Lounge } from '../types/lounge';

async function fetchLounges(
	airportCode?: string,
	signal?: AbortSignal,
): Promise<Lounge[]> {
	const params = new URLSearchParams();

	if (airportCode) {
		params.set('airportCode', airportCode);
	}

	const query = params.toString();
	const url = `/api/lounges${query ? `?${query}` : ''}`;
	const response = await fetch(url, { signal });

	if (!response.ok) {
		throw new Error('Unable to load lounges.');
	}

	return response.json();
}

export { fetchLounges };
