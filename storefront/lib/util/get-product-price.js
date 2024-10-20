import { formatAmount } from "@storefront/lib/util/prices";

export function getProductPrice({ product, variantId, region }) {
  if (!product || !product.id) {
    throw new Error("No product provided");
  }

  const getPercentageDiff = (original, calculated) => {
    const diff = original - calculated;
    const decrease = (diff / original) * 100;
    return decrease.toFixed();
  };

  const variants = product.productVariants;

  const getCalculatedPrice = (variant) => {
    const price = variant.prices.find(
      (p) => p.currency.code === region.currency.code
    );
    return price ? price.calculatedPrice : null;
  };

  const variantPrice = variantId
    ? getCalculatedPrice(variants.find((v) => v.id === variantId))
    : null;

  const cheapestPrice = variants.reduce((cheapest, variant) => {
    const price = getCalculatedPrice(variant);
    if (
      !cheapest ||
      (price && price.calculatedAmount < cheapest.calculatedAmount)
    ) {
      return price;
    }
    return cheapest;
  }, null);

  return {
    variantPrice,
    cheapestPrice,
  };
}
