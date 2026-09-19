export type Exchange = 'TSX' | 'NEO' | 'NASDAQ' | 'NYSE';
export type Currency = 'CAD' | 'USD';
export type CandleRange = '1M' | '3M' | '1Y' | '5Y';
export type MarketEventType = 'earnings' | 'ex_dividend';

export type SearchResult = {
  symbol: string;
  name: string;
  exchange: Exchange;
  currency: Currency;
};

export type Quote = {
  symbol: string;
  name: string;
  exchange: Exchange;
  currency: Currency;
  price: number;
  prevClose: number;
  change: number;
  changePercent: number;
  high52w: number;
  sparkline: number[];
  updatedAt: string;
};

export type Candle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type MarketEvent = {
  symbol: string;
  type: MarketEventType;
  date: string;
};

export interface MarketDataProvider {
  search(query: string): Promise<SearchResult[]>;
  getQuotes(symbols: string[]): Promise<Quote[]>;
  getCandles(symbol: string, range: CandleRange): Promise<Candle[]>;
  getEvents(symbol: string): Promise<MarketEvent[]>;
}
