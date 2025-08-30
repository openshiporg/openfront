// Currency conversion utility for business account credit limit calculations

type ConversionRates = {
  [fromCurrency: string]: {
    [toCurrency: string]: number;
  };
};

// Static exchange rates - admin configurable
// TODO: Replace with live exchange rates from external API (e.g., exchangerate-api.com, fixer.io)
// NOTE: These rates are ONLY used for credit limit calculations, not actual payments
// Payments are processed in the original region currency (EUR orders paid in EUR, etc.)
const STATIC_EXCHANGE_RATES: ConversionRates = {
  USD: {
    EUR: 0.85,
    GBP: 0.73,
    CAD: 1.35,
    AUD: 1.52,
    JPY: 110.0,
    USD: 1.0,
  },
  EUR: {
    USD: 1.18,
    GBP: 0.86,
    CAD: 1.59,
    AUD: 1.79,
    JPY: 129.5,
    EUR: 1.0,
  },
  GBP: {
    USD: 1.37,
    EUR: 1.16,
    CAD: 1.85,
    AUD: 2.08,
    JPY: 150.6,
    GBP: 1.0,
  },
  // Add more currencies as needed
};

/**
 * Convert an amount from one currency to another
 * @param amount - Amount in cents (or smallest currency unit)
 * @param fromCurrency - Source currency code (e.g., 'EUR')
 * @param toCurrency - Target currency code (e.g., 'USD')
 * @returns Converted amount in cents
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Normalize currency codes to uppercase
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  try {
    // Get conversion rate
    const rate = getConversionRate(from, to);
    
    if (!rate) {
      console.warn(`No conversion rate found for ${from} to ${to}, defaulting to 1:1`);
      return amount;
    }

    // Convert and round to avoid floating point precision issues
    const convertedAmount = Math.round(amount * rate);
    
    console.log(`Currency conversion: ${amount} ${from} = ${convertedAmount} ${to} (rate: ${rate})`);
    
    return convertedAmount;
  } catch (error) {
    console.error(`Error converting currency from ${from} to ${to}:`, error);
    // Fallback: return original amount
    return amount;
  }
}

/**
 * Get conversion rate between two currencies
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency  
 * @returns Conversion rate or null if not found
 */
function getConversionRate(fromCurrency: string, toCurrency: string): number | null {
  const rates = STATIC_EXCHANGE_RATES[fromCurrency];
  if (!rates) {
    return null;
  }
  
  return rates[toCurrency] || null;
}

/**
 * Get all supported currencies
 * @returns Array of supported currency codes
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(STATIC_EXCHANGE_RATES);
}

/**
 * Check if currency conversion is supported
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns True if conversion is supported
 */
export function isConversionSupported(fromCurrency: string, toCurrency: string): boolean {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  
  return Boolean(STATIC_EXCHANGE_RATES[from]?.[to]);
}

/**
 * Update exchange rates (for admin interface)
 * @param rates - New exchange rates
 */
export function updateExchangeRates(rates: ConversionRates): void {
  Object.assign(STATIC_EXCHANGE_RATES, rates);
}

/**
 * Get current exchange rates (for admin interface)
 * @returns Current exchange rates
 */
export function getCurrentExchangeRates(): ConversionRates {
  return { ...STATIC_EXCHANGE_RATES };
}

/**
 * Format currency amount for display
 * @param amount - Amount in cents
 * @param currencyCode - Currency code
 * @returns Formatted currency string
 */
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const currency = currencyCode.toUpperCase();
  
  // Handle no-division currencies (JPY, KRW, etc.)
  const noDivisionCurrencies = ['JPY', 'KRW', 'VND'];
  const divisor = noDivisionCurrencies.includes(currency) ? 1 : 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount / divisor);
}

// Export for mutations that need currency conversion
export default convertCurrency;