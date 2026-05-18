import { describe, expect, it } from 'vitest';
import {
  convertCurrencyAmount,
  formatCurrencyAmount,
  localizeCurrencyDisplay,
  parseCurrencyAmount,
  parseDisplayCurrencyAmount,
} from './currency';

describe('currency utils', () => {
  it('parses formatted currency strings', () => {
    expect(parseCurrencyAmount('£6,250/mo')).toBe(6250);
    expect(parseCurrencyAmount('$500,000')).toBe(500000);
  });

  it('converts GBP amounts to USD for display', () => {
    expect(localizeCurrencyDisplay('£6,250/mo', 'USD')).toBe('$7,938/mo');
    expect(formatCurrencyAmount(convertCurrencyAmount(6250, 'GBP', 'USD'), 'USD')).toBe('$7,938');
  });

  it('converts USD amounts to GBP for display', () => {
    expect(localizeCurrencyDisplay('$500,000', 'GBP')).toBe('£393,701');
  });

  it('leaves values without currency symbols unchanged', () => {
    expect(localizeCurrencyDisplay('Pending review', 'USD')).toBe('Pending review');
  });

  it('normalizes parsed amounts into the active display currency', () => {
    expect(parseDisplayCurrencyAmount('£6,250/mo', 'USD')).toBe(7938);
    expect(parseDisplayCurrencyAmount('$500,000', 'GBP')).toBe(convertCurrencyAmount(500000, 'USD', 'GBP'));
  });
});
