
export async function calculatePrices(priceSetIds, currencyCode, quantity = 1, keystone) {
  if (!currencyCode) {
    throw new Error("Currency code is required for price calculation");
  }

  const priceSets = await keystone.query.PriceSet.findMany({
    where: { id: { in: priceSetIds } },
    query: `
      id
      prices {
        id
        amount
        currency { code }
        minQuantity
        maxQuantity
        priceList {
          id
          type
          status
          startsAt
          endsAt
        }
        priceRules {
          attribute
          value
        }
      }
    `
  });

  const now = new Date();

  const calculatedPrices = priceSets.flatMap(priceSet => 
    priceSet.prices
      .filter(price => 
        price.currency.code === currencyCode &&
        (!price.minQuantity || price.minQuantity <= quantity) &&
        (!price.maxQuantity || price.maxQuantity >= quantity)
      )
      .map(price => {
        const priceList = price.priceList;
        const isPriceListValid = priceList && 
          priceList.status === "active" &&
          (!priceList.startsAt || new Date(priceList.startsAt) <= now) &&
          (!priceList.endsAt || new Date(priceList.endsAt) >= now);

        const rulesMatch = price.priceRules.length === 0; // If no rules, consider it a match

        return {
          id: price.id,
          amount: price.amount,
          currencyCode: price.currency.code,
          priceListId: priceList?.id,
          priceListType: priceList?.type,
          minQuantity: price.minQuantity,
          maxQuantity: price.maxQuantity,
          calculatedPrice: {
            amount: price.amount,
            calculatedAmount: price.amount,
            originalAmount: price.amount,
            originalPrice: {
              id: price.id,
              priceListId: null,
              priceListType: null,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity,
            },
            calculatedPrice: {
              id: price.id,
              priceListId: isPriceListValid ? priceList?.id : null,
              priceListType: isPriceListValid ? priceList?.type : null,
              minQuantity: price.minQuantity,
              maxQuantity: price.maxQuantity,
            },
            isCalculatedPricePriceList: isPriceListValid,
          },
          isPriceListValid,
          rulesMatch,
          priceRules: price.priceRules,
        };
      })
  );

  // Sort and filter the prices based on price list validity and rules match
  return calculatedPrices
    .sort((a, b) => {
      if (a.isPriceListValid && !b.isPriceListValid) return -1;
      if (!a.isPriceListValid && b.isPriceListValid) return 1;
      if (a.rulesMatch && !b.rulesMatch) return -1;
      if (!a.rulesMatch && b.rulesMatch) return 1;
      return a.amount - b.amount;
    })
    .filter((price, index, self) => 
      index === self.findIndex((t) => t.id === price.id)
    );
}