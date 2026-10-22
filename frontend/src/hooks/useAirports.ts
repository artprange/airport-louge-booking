import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAirports } from '../api/airports';

function useAirports(value: string, enabled: boolean) {
  const query = value.trim().replace(/\s+/g, ' ').toLowerCase();
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const ready = query === debouncedQuery;
  const canSearch = enabled && query.length >= 2 && query.length <= 80;
  const result = useQuery({
    queryKey: ['airports', debouncedQuery],
    queryFn: ({ signal }) => fetchAirports(debouncedQuery, signal),
    enabled: canSearch && ready,
    staleTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    airports: ready ? result.data ?? [] : [],
    isLoading: canSearch && (!ready || result.isPending),
    isError: canSearch && ready && result.isError,
  };
}

export { useAirports };
