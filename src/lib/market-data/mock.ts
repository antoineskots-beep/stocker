import type {
  Candle,
  CandleRange,
  MarketDataProvider,
  MarketEvent,
  Quote,
  SearchResult,
} from '@/lib/market-data/types';

type Instrument = SearchResult & {
  price: number;
  prevClose: number;
  high52w: number;
};

const UNIVERSE: Instrument[] = [
  {
    symbol: 'RY.TO',
    name: 'Banque Royale du Canada',
    exchange: 'TSX',
    currency: 'CAD',
    price: 168.42,
    prevClose: 167.1,
    high52w: 181.2,
  },
  {
    symbol: 'SHOP.TO',
    name: 'Shopify',
    exchange: 'TSX',
    currency: 'CAD',
    price: 142.55,
    prevClose: 145.8,
    high52w: 178.4,
  },
  {
    symbol: 'VFV.TO',
    name: 'Vanguard S&P 500 Index ETF',
    exchange: 'TSX',
    currency: 'CAD',
    price: 149.12,
    prevClose: 148.4,
    high52w: 155.0,
  },
  {
    symbol: 'ENB.TO',
    name: 'Enbridge',
    exchange: 'TSX',
    currency: 'CAD',
    price: 62.18,
    prevClose: 61.9,
    high52w: 65.4,
  },
  {
    symbol: 'CNR.TO',
    name: 'Canadien National',
    exchange: 'TSX',
    currency: 'CAD',
    price: 154.3,
    prevClose: 155.02,
    high52w: 172.1,
  },
  {
    symbol: 'HIVE.NE',
    name: 'HIVE Digital Technologies',
    exchange: 'NEO',
    currency: 'CAD',
    price: 4.12,
    prevClose: 3.98,
    high52w: 7.45,
  },
  {
    symbol: 'GLXY.NE',
    name: 'Galaxy Digital',
    exchange: 'NEO',
    currency: 'CAD',
    price: 28.6,
    prevClose: 29.1,
    high52w: 42.0,
  },
  {
    symbol: 'AAPL',
    name: 'Apple',
    exchange: 'NASDAQ',
    currency: 'USD',
    price: 227.15,
    prevClose: 225.4,
    high52w: 260.1,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    exchange: 'NASDAQ',
    currency: 'USD',
    price: 418.9,
    prevClose: 421.2,
    high52w: 468.35,
  },
  {
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    exchange: 'NYSE',
    currency: 'USD',
    price: 562.4,
    prevClose: 559.8,
    high52w: 580.0,
  },
];

function sparklineFrom(price: number): number[] {
  return Array.from({ length: 24 }, (_, i) => {
    const wave = Math.sin(i / 3) * (price * 0.012);
    const drift = (i - 12) * (price * 0.0008);
    return Math.round((price + wave + drift) * 100) / 100;
  });
}

function candlesFrom(price: number, range: CandleRange): Candle[] {
  const days = range === '1M' ? 22 : range === '3M' ? 66 : range === '1Y' ? 252 : 1260;
  const start = Date.now() - days * 24 * 60 * 60 * 1000;
  return Array.from({ length: days }, (_, i) => {
    const close = price * (0.92 + (i / days) * 0.1 + Math.sin(i / 9) * 0.015);
    const open = close * (1 - Math.sin(i / 7) * 0.004);
    const high = Math.max(open, close) * 1.008;
    const low = Math.min(open, close) * 0.992;
    const date = new Date(start + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return { date, open, high, low, close };
  });
}

export const mockMarketDataProvider: MarketDataProvider = {
  async search(query: string): Promise<SearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) {
      return UNIVERSE.map(({ symbol, name, exchange, currency }) => ({
        symbol,
        name,
        exchange,
        currency,
      }));
    }
    return UNIVERSE.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q),
    ).map(({ symbol, name, exchange, currency }) => ({
      symbol,
      name,
      exchange,
      currency,
    }));
  },

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    const wanted = new Set(symbols.map((s) => s.toUpperCase()));
    return UNIVERSE.filter((item) => wanted.has(item.symbol.toUpperCase())).map((item) => {
      const change = item.price - item.prevClose;
      return {
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchange,
        currency: item.currency,
        price: item.price,
        prevClose: item.prevClose,
        change,
        changePercent: (change / item.prevClose) * 100,
        high52w: item.high52w,
        sparkline: sparklineFrom(item.price),
        updatedAt: new Date().toISOString(),
      };
    });
  },

  async getCandles(symbol: string, range: CandleRange): Promise<Candle[]> {
    const item = UNIVERSE.find((row) => row.symbol.toUpperCase() === symbol.toUpperCase());
    if (!item) {
      return [];
    }
    return candlesFrom(item.price, range);
  },

  async getEvents(symbol: string): Promise<MarketEvent[]> {
    const item = UNIVERSE.find((row) => row.symbol.toUpperCase() === symbol.toUpperCase());
    if (!item) {
      return [];
    }
    const inDays = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };
    return [
      { symbol: item.symbol, type: 'ex_dividend', date: inDays(18) },
      { symbol: item.symbol, type: 'earnings', date: inDays(42) },
    ];
  },
};
