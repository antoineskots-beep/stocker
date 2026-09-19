import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { marketData } from '@/lib/market-data';
import type { SearchResult } from '@/lib/market-data/types';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}

export function useSearch(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: ['search', trimmed] as const,
    enabled: trimmed.length > 0,
    queryFn: (): Promise<SearchResult[]> => marketData.search(trimmed),
  });
}
