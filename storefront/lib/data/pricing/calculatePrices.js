import { getPercentageDiff } from "@storefront/lib/util/get-precentage-diff";

export function calculatePrices(products, quantity = 1) {
  return products.map(product => {
    const variants = product.productVariants;
    const prices = variants.flatMap(variant => 
      variant.prices.map(price => ({
        variantId: variant.id,
        price: price.amount,
        currencyCode: price.currency.code,
        minQuantity: price.minQuantity || 1,
        maxQuantity: price.maxQuantity || Infinity,
      }))
    );

    const applicablePrices = prices.filter(price => 
      price.minQuantity <= quantity && 
      price.maxQuantity >= quantity
    );

    const cheapestPrice = applicablePrices.reduce((min, price) => 
      price.price < min.price ? price : min
    , applicablePrices[0]);

    const originalPrice = variants.reduce((min, variant) => {
      const variantPrice = variant.prices[0]?.amount;
      return variantPrice < min ? variantPrice : min;
    }, Infinity);

    return {
      ...product,
      price: cheapestPrice ? {
        calculated_price: cheapestPrice.price,
        original_price: originalPrice,
        price_type: cheapestPrice.price < originalPrice ? 'sale' : 'default',
        percentage_diff: getPercentageDiff(originalPrice, cheapestPrice.price),
      } : null,
    };
  });
}