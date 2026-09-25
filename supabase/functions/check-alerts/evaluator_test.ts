import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { evaluateAlert } from './evaluator.ts';

Deno.test('evaluateAlert - price_above triggers when price reaches or exceeds target', () => {
  const quote = { symbol: 'AAPL', price: 230 };

  assertEquals(evaluateAlert({ type: 'price_above', rule: 'fixed_price', value: 220 }, quote), true);
  assertEquals(evaluateAlert({ type: 'price_above', rule: 'fixed_price', value: 230 }, quote), true);
  assertEquals(evaluateAlert({ type: 'price_above', rule: 'fixed_price', value: 240 }, quote), false);
});

Deno.test('evaluateAlert - price_below triggers when price drops to or below target', () => {
  const quote = { symbol: 'SHOP.TO', price: 140 };

  assertEquals(evaluateAlert({ type: 'price_below', rule: 'fixed_price', value: 145 }, quote), true);
  assertEquals(evaluateAlert({ type: 'price_below', rule: 'fixed_price', value: 140 }, quote), true);
  assertEquals(evaluateAlert({ type: 'price_below', rule: 'fixed_price', value: 135 }, quote), false);
});

Deno.test('evaluateAlert - buy_zone fixed_price triggers when price is at or below entry target', () => {
  const quote = { symbol: 'VFV.TO', price: 148 };

  assertEquals(evaluateAlert({ type: 'buy_zone', rule: 'fixed_price', value: 150 }, quote), true);
  assertEquals(evaluateAlert({ type: 'buy_zone', rule: 'fixed_price', value: 148 }, quote), true);
  assertEquals(evaluateAlert({ type: 'buy_zone', rule: 'fixed_price', value: 145 }, quote), false);
});

Deno.test('evaluateAlert - handles missing or invalid target value', () => {
  const quote = { symbol: 'AAPL', price: 200 };

  assertEquals(evaluateAlert({ type: 'price_above', rule: 'fixed_price', value: null }, quote), false);
  assertEquals(evaluateAlert({ type: 'price_above', rule: 'fixed_price', value: NaN }, quote), false);
});
