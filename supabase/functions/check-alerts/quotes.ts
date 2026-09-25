import type { QuoteData } from './evaluator.ts';

const MOCK_PRICES: Record<string, number> = {
  'RY.TO': 168.42,
  'SHOP.TO': 142.55,
  'VFV.TO': 149.12,
  'ENB.TO': 62.18,
  'CNR.TO': 154.3,
  'HIVE.NE': 4.12,
  'GLXY.NE': 28.6,
  'AAPL': 227.15,
  'MSFT': 418.9,
  'VOO': 562.4,
};

/**
 * Server-side quote fetcher. In Milestone 3, this returns prices from the mock universe
 * or custom overrides provided during testing.
 * When a real market provider is introduced in later milestones, this function will query
 * the provider or read from quotes_cache.
 */
export async function fetchServerQuotes(
  symbols: string[],
  overrides?: Record<string, number>,
): Promise<Map<string, QuoteData>> {
  const result = new Map<string, QuoteData>();

  for (const s of symbols) {
    const symbol = s.toUpperCase();
    const price = overrides?.[symbol] ?? overrides?.[s] ?? MOCK_PRICES[symbol] ?? 100.0;
    result.set(symbol, {
      symbol,
      price,
      prevClose: price * 0.99,
      high52w: price * 1.15,
    });
  }

  return result;
}
