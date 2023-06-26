import { formatAmount } from "medusa-react";

export const findCheapestRegionPrice = (variants, regionId) => {
  const regionPrices = variants.reduce((acc, v) => {
    const price = v.prices.find((p) => p.region_id === regionId);
    if (price) {
      acc.push(price);
    }

    return acc;
  }, []);

  if (!regionPrices.length) {
    return undefined;
  }

  //find the price with the lowest amount in regionPrices
  const cheapestPrice = regionPrices.reduce((acc, p) => {
    if (acc.amount > p.amount) {
      return p;
    }

    return acc;
  });

  return cheapestPrice;
};

export const findCheapestCurrencyPrice = (variants, currencyCode) => {
  const currencyPrices = variants.reduce((acc, v) => {
    const price = v.prices.find((p) => p.currency_code === currencyCode);
    if (price) {
      acc.push(price);
    }

    return acc;
  }, []);

  if (!currencyPrices.length) {
    return undefined;
  }

  //find the price with the lowest amount in currencyPrices
  const cheapestPrice = currencyPrices.reduce((acc, p) => {
    if (acc.amount > p.amount) {
      return p;
    }

    return acc;
  });

  return cheapestPrice;
};

export const findCheapestPrice = (variants, region) => {
  const { id, currency_code } = region;

  let cheapestPrice = findCheapestRegionPrice(variants, id);

  if (!cheapestPrice) {
    cheapestPrice = findCheapestCurrencyPrice(variants, currency_code);
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
  return "Not available in your region";
};
