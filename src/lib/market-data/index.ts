import { mockMarketDataProvider } from '@/lib/market-data/mock';
import type { MarketDataProvider } from '@/lib/market-data/types';

/**
 * Client-side factory. The mobile app must not call a live vendor.
 * Live quotes will be read from Supabase cache in later milestones.
 */
export function createMarketDataProvider(
  name: string | undefined = process.env.EXPO_PUBLIC_MARKET_DATA_PROVIDER,
): MarketDataProvider {
  if (!name || name === 'mock') {
    return mockMarketDataProvider;
  }
  throw new Error(`Unknown market data provider: ${name}`);
}

export const marketData = createMarketDataProvider();
