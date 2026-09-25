export type AlertRule = {
  type: string;
  rule?: string | null;
  value: number | null;
};

export type QuoteData = {
  symbol: string;
  price: number;
  prevClose?: number;
  high52w?: number;
};

/**
 * Pure evaluation function. Determines whether an alert should trigger
 * based on current market quote data.
 */
export function evaluateAlert(alert: AlertRule, quote: QuoteData): boolean {
  if (alert.value == null || isNaN(alert.value)) {
    return false;
  }

  const currentPrice = quote.price;

  switch (alert.type) {
    case 'price_above':
      return currentPrice >= alert.value;

    case 'price_below':
      return currentPrice <= alert.value;

    case 'buy_zone':
      // For fixed_price buy zone, price is attractive when at or below the target entry price
      if (!alert.rule || alert.rule === 'fixed_price') {
        return currentPrice <= alert.value;
      }
      return false;

    default:
      return false;
  }
}
