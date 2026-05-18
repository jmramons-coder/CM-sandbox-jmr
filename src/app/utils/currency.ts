export type DisplayCurrency = 'GBP' | 'USD';

export const DISPLAY_CURRENCIES: DisplayCurrency[] = ['GBP', 'USD'];

/** Fixed demo conversion rate (GBP base in UK mock data). */
export const GBP_TO_USD_RATE = 1.27;

const USD_TO_GBP_RATE = 1 / GBP_TO_USD_RATE;

const CURRENCY_AMOUNT_PATTERN = /([£$])\s*([\d,]+(?:\.\d+)?)(\s*[kK])?/g;

export function detectCurrencyInValue(value: string): DisplayCurrency | null {
  if (/£/.test(value)) return 'GBP';
  if (/\$/.test(value)) return 'USD';
  return null;
}

export function parseCurrencyAmount(value?: string | null): number {
  if (!value) return 0;
  return Number(value.replace(/[^\d.]/g, '')) || 0;
}

export function convertCurrencyAmount(
  amount: number,
  from: DisplayCurrency,
  to: DisplayCurrency,
): number {
  if (!amount || from === to) return amount;
  if (from === 'GBP' && to === 'USD') return Math.round(amount * GBP_TO_USD_RATE);
  return Math.round(amount * USD_TO_GBP_RATE);
}

function currencyLocale(currency: DisplayCurrency): string {
  return currency === 'GBP' ? 'en-GB' : 'en-US';
}

function currencySymbol(currency: DisplayCurrency): string {
  return currency === 'GBP' ? '£' : '$';
}

export function formatCurrencyAmount(
  amount: number,
  currency: DisplayCurrency,
  options?: { compact?: boolean; maximumFractionDigits?: number },
): string {
  const symbol = currencySymbol(currency);
  const locale = currencyLocale(currency);
  const maximumFractionDigits = options?.maximumFractionDigits ?? 0;

  if (options?.compact && amount >= 1000) {
    const compact = amount / 1000;
    const decimals = amount >= 10000 ? 0 : 1;
    return `${symbol}${compact.toFixed(decimals)}K`;
  }

  return `${symbol}${amount.toLocaleString(locale, { maximumFractionDigits })}`;
}

export function localizeCurrencyInText(value: string, displayCurrency: DisplayCurrency): string {
  return value.replace(CURRENCY_AMOUNT_PATTERN, (match, sym, numStr, kPart) => {
    const from: DisplayCurrency = sym === '£' ? 'GBP' : 'USD';
    let amount = parseCurrencyAmount(numStr);
    if (kPart?.trim()) amount *= 1000;
    const converted = convertCurrencyAmount(amount, from, displayCurrency);
    const useCompact = Boolean(kPart?.trim());
    return formatCurrencyAmount(converted, displayCurrency, useCompact ? { compact: true } : undefined);
  });
}

export function localizeCurrencyDisplay(
  value: string | undefined | null,
  displayCurrency: DisplayCurrency,
): string {
  if (!value) return value ?? '';
  if (value === 'N/A' || value === '—') return value;
  if (!detectCurrencyInValue(value)) return value;
  return localizeCurrencyInText(value, displayCurrency);
}

export function parseDisplayCurrencyAmount(
  value: string | undefined | null,
  displayCurrency: DisplayCurrency,
): number {
  const parsed = parseCurrencyAmount(value);
  const source = detectCurrencyInValue(value ?? '') ?? 'GBP';
  return convertCurrencyAmount(parsed, source, displayCurrency);
}
