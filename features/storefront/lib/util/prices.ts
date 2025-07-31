import { isEmpty } from "./isEmpty"
import { noDivisionCurrencies } from "../constants"

/**
 * Finds the cheapest price for a product in a specific region
 * @param variants - Product variants
 * @param regionId - Region ID
 * @returns The cheapest price or undefined
 */
export const findCheapestRegionPrice = (
  variants: any[],
  regionId: string
): any | undefined => {
  const regionPrices = variants.reduce((acc: any[], v: any) => {
    if (!v.prices) {
      return acc
    }

    const price = v.prices.find((p: any) => p.region_id === regionId)
    if (price) {
      acc.push(price)
    }

    return acc
  }, [])

  if (!regionPrices.length) {
    return undefined
  }

  //find the price with the lowest amount in regionPrices
  const cheapestPrice = regionPrices.reduce((acc: any, p: any) => {
    if (acc.amount > p.amount) {
      return p
    }

    return acc
  })

  return cheapestPrice
}

/**
 * Finds the cheapest price for a product in a specific currency
 * @param variants - Product variants
 * @param currencyCode - Currency code
 * @returns The cheapest price or undefined
 */
export const findCheapestCurrencyPrice = (
  variants: any[],
  currencyCode: string
): any | undefined => {
  const currencyPrices = variants.reduce((acc: any[], v: any) => {
    if (!v.prices) {
      return acc
    }

    const price = v.prices.find((p: any) => p.currencyCode === currencyCode)
    if (price) {
      acc.push(price)
    }

    return acc
  }, [])

  if (!currencyPrices.length) {
    return undefined
  }

  //find the price with the lowest amount in currencyPrices
  const cheapestPrice = currencyPrices.reduce((acc: any, p: any) => {
    if (acc.amount > p.amount) {
      return p
    }

    return acc
  })

  return cheapestPrice
}

/**
 * Finds the cheapest price for a product in a region
 * @param variants - Product variants
 * @param region - Region object
 * @returns Formatted price string
 */
export const findCheapestPrice = (variants: any[], region: any): string => {
  const { id, currencyCode } = region

  let cheapestPrice = findCheapestRegionPrice(variants, id)

  if (!cheapestPrice) {
    cheapestPrice = findCheapestCurrencyPrice(variants, currencyCode)
  }

  if (cheapestPrice) {
    return formatAmount({
      amount: cheapestPrice.amount,
      region: region,
    });
  }

  // if we can't find any price that matches the current region,
  // either by id or currency, then the product is not available in
  // the current region
  return "Not available in your region"
}

/**
 * Takes a product variant and a region, and converts the variant's price to a localized decimal format
 * @param params - Parameters object
 * @returns Formatted price string
 */
export const formatVariantPrice = ({
  variant,
  region,
  includeTaxes = true,
  ...rest
}: {
  variant: any;
  region: any;
  includeTaxes?: boolean;
  [key: string]: any;
}): string => {
  const amount = computeVariantPrice({ variant, region, includeTaxes })

  return convertToLocale({
    amount,
    currencyCode: region?.currencyCode,
    ...rest,
  });
}

/**
 * Takes a product variant and region, and returns the variant price as a decimal number
 * @param params - Parameters object
 * @returns Computed price as a number
 */
export const computeVariantPrice = ({
  variant,
  region,
  includeTaxes = true
}: {
  variant: any;
  region: any;
  includeTaxes?: boolean;
}): number => {
  const amount = getVariantPrice(variant, region)

  return computeAmount({
    amount,
    region,
    includeTaxes,
  });
}

/**
 * Finds the price amount corresponding to the region selected
 * @param variant - The product variant
 * @param region - The region
 * @returns The price's amount
 */
export const getVariantPrice = (
  variant: any,
  region: any
): number => {
  const price = variant?.prices?.find((p: any) =>
    p.currencyCode.toLowerCase() === region?.currencyCode?.toLowerCase())

  return price?.amount || 0
}

/**
 * Takes an amount, a region, and returns the amount as a decimal including or excluding taxes
 * @param params - Parameters object
 * @returns Computed amount as a number
 */
export const computeAmount = ({
  amount,
  region,
  includeTaxes = true
}: {
  amount: number;
  region: any;
  includeTaxes?: boolean;
}): number => {
  const toDecimal = convertToDecimal(amount, region)

  const taxRate = includeTaxes ? getTaxRate(region) : 0

  const amountWithTaxes = toDecimal * (1 + taxRate)

  return amountWithTaxes
}

/**
 * Takes an amount and a region, and converts the amount to a localized decimal format
 * @param params - Parameters object
 * @returns Formatted amount string
 */
export const formatAmount = ({
  amount,
  region,
  includeTaxes = true,
  ...rest
}: {
  amount: number;
  region: any;
  includeTaxes?: boolean;
  [key: string]: any;
}): string => {
  const taxAwareAmount = computeAmount({
    amount,
    region,
    includeTaxes,
  })

  return convertToLocale({
    amount: taxAwareAmount,
    currencyCode: region.currency.code,
    ...rest,
  });
}

/**
 * Converts an amount to a decimal based on currency
 * @param amount - Amount to convert
 * @param region - Region object
 * @returns Decimal amount
 */
const convertToDecimal = (amount: number, region: any): number => {
  const divisor = noDivisionCurrencies.includes(region?.currencyCode?.toLowerCase())
    ? 1
    : 100

  return Math.floor(amount) / divisor;
}

/**
 * Gets the tax rate from a region
 * @param region - Region object
 * @returns Tax rate as a decimal
 */
const getTaxRate = (region: any): number => {
  return region && !isEmpty(region) ? region?.tax_rate / 100 : 0;
}

/**
 * Converts an amount to a localized string format
 * @param params - Parameters object
 * @returns Formatted amount string
 */
export const convertToLocale = ({
  amount,
  currencyCode,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US"
}: {
  amount: number;
  currencyCode?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  locale?: string;
}): string => {
  return currencyCode && !isEmpty(currencyCode)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString();
}