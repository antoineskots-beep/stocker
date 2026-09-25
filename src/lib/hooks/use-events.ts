import { useQuery } from '@tanstack/react-query';

import { marketData } from '@/lib/market-data';
import type { MarketEvent } from '@/lib/market-data/types';

export function useEvents(symbol: string) {
  const normalized = symbol.trim().toUpperCase();

  return useQuery({
    queryKey: ['events', normalized] as const,
    enabled: normalized.length > 0,
    queryFn: (): Promise<MarketEvent[]> => marketData.getEvents(normalized),
  });
}
