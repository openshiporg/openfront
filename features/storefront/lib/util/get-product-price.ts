import {
  StoreProduct,
  ProductVariant,
  MoneyAmount,
  StoreRegion,
} from "../../types/storefront";

export function getProductPrice({
  product,
  variantId,
  region,
}: {
  product: StoreProduct;
  variantId?: string;
  region: StoreRegion;
}) {
  if (!product || !product.id) {
    throw new Error("No product provided");
  }

  const getPercentageDiff = (original: number, calculated: number) => {
    const diff = original - calculated;
    const decrease = (diff / original) * 100;
    return decrease.toFixed();
  };

  const variants = product.productVariants;

  const getCalculatedPrice = (variant: ProductVariant) => {
    const price = variant.prices?.find(
      (p: MoneyAmount) => p.currency.code === region.currency.code
    );
    return price ? price.calculatedPrice : null;
  };

  const variantPrice = variantId
    ? getCalculatedPrice(variants?.find((v) => v.id === variantId)!)
    : null;

  const cheapestPrice = variants?.reduce((cheapest, variant) => {
    const price = getCalculatedPrice(variant);
    if (
      !cheapest ||
      (price &&
        cheapest.calculatedAmount > 0 &&
        price.calculatedAmount < cheapest.calculatedAmount)
    ) {
      return price;
    }
    return cheapest;
  }, null as MoneyAmount["calculatedPrice"] | null);

  return {
    variantPrice,
    cheapestPrice,
  };
}
