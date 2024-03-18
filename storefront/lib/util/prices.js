import { isEmpty } from "./isEmpty"
import { noDivisionCurrencies } from "@storefront/lib/constants"

export const findCheapestRegionPrice = (
  variants,
  regionId
) => {
  const regionPrices = variants.reduce((acc, v) => {
    if (!v.prices) {
      return acc
    }

    const price = v.prices.find((p) => p.region_id === regionId)
    if (price) {
      acc.push(price)
    }

    return acc
  }, [])

  if (!regionPrices.length) {
    return undefined
  }

  //find the price with the lowest amount in regionPrices
  const cheapestPrice = regionPrices.reduce((acc, p) => {
    if (acc.amount > p.amount) {
      return p
    }

    return acc
  })

  return cheapestPrice
}

export const findCheapestCurrencyPrice = (
  variants,
  currencyCode
) => {
  const currencyPrices = variants.reduce((acc, v) => {
    if (!v.prices) {
      return acc
    }

    const price = v.prices.find((p) => p.currency_code === currencyCode)
    if (price) {
      acc.push(price)
    }

    return acc
  }, [])

  if (!currencyPrices.length) {
    return undefined
  }

  //find the price with the lowest amount in currencyPrices
  const cheapestPrice = currencyPrices.reduce((acc, p) => {
    if (acc.amount > p.amount) {
      return p
    }

    return acc
  })

  return cheapestPrice
}

export const findCheapestPrice = (variants, region) => {
  const { id, currency_code } = region

  let cheapestPrice = findCheapestRegionPrice(variants, id)

  if (!cheapestPrice) {
    cheapestPrice = findCheapestCurrencyPrice(variants, currency_code)
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
 */
export const formatVariantPrice = ({
  variant,
  region,
  includeTaxes = true,
  ...rest
}) => {
  const amount = computeVariantPrice({ variant, region, includeTaxes })

  return convertToLocale({
    amount,
    currency_code: region?.currency_code,
    ...rest,
  });
}

/**
 * Takes a product variant and region, and returns the variant price as a decimal number
 * @param params.variant - product variant
 * @param params.region - region
 * @param params.includeTaxes - whether to include taxes or not
 */
export const computeVariantPrice = ({
  variant,
  region,
  includeTaxes = true
}) => {
  const amount = getVariantPrice(variant, region)

  return computeAmount({
    amount,
    region,
    includeTaxes,
  });
}

/**
 * Finds the price amount correspoding to the region selected
 * @param variant - the product variant
 * @param region - the region
 * @returns - the price's amount
 */
export const getVariantPrice = (
  variant,
  region
) => {
  const price = variant?.prices?.find((p) =>
    p.currency_code.toLowerCase() === region?.currency_code?.toLowerCase())

  return price?.amount || 0
}

/**
 * Takes an amount, a region, and returns the amount as a decimal including or excluding taxes
 */
export const computeAmount = ({
  amount,
  region,
  includeTaxes = true
}) => {
  const toDecimal = convertToDecimal(amount, region)

  const taxRate = includeTaxes ? getTaxRate(region) : 0

  const amountWithTaxes = toDecimal * (1 + taxRate)

  return amountWithTaxes
}

/**
 * Takes an amount and a region, and converts the amount to a localized decimal format
 */
export const formatAmount = ({
  amount,
  region,
  includeTaxes = true,
  ...rest
}) => {
  const taxAwareAmount = computeAmount({
    amount,
    region,
    includeTaxes,
  })

  return convertToLocale({
    amount: taxAwareAmount,
    currency_code: region.currency_code,
    ...rest,
  });
}

const convertToDecimal = (amount, region) => {
  const divisor = noDivisionCurrencies.includes(region?.currency_code?.toLowerCase())
    ? 1
    : 100

  return Math.floor(amount) / divisor;
}

const getTaxRate = (region) => {
  return region && !isEmpty(region) ? region?.tax_rate / 100 : 0;
}

const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US"
}) => {
  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : amount.toString();
}
