import { useQuery } from '@tanstack/react-query';

import { fetchLounges } from '../api/lounges';

function useLounges(airportCode?: string) {
	const normalizedCode = airportCode?.trim().toUpperCase() || undefined;

	return useQuery({
		queryKey: ['lounges', normalizedCode ?? 'all'],

		queryFn: ({ signal }) => fetchLounges(normalizedCode, signal),

		retry: false,
	});
}

export { useLounges };
