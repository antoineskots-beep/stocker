import { useQuery } from '@tanstack/react-query';

import { marketData } from '@/lib/market-data';
import type { Quote } from '@/lib/market-data/types';

export function useQuotes(symbols: string[]) {
  const normalized = [...symbols].map((symbol) => symbol.toUpperCase()).sort();

  return useQuery({
    queryKey: ['quotes', normalized] as const,
    enabled: normalized.length > 0,
    queryFn: (): Promise<Quote[]> => marketData.getQuotes(symbols),
  });
}

export function useQuote(symbol: string | undefined) {
  const normalized = symbol ? [symbol.toUpperCase()] : [];
  const quotes = useQuotes(normalized);

  return {
    ...quotes,
    data: quotes.data?.[0],
  };
}

