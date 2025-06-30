import { cn } from "@/lib/utils";
import { useMemo } from "react"

import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"

import { StoreProduct, StoreRegion } from "@/features/storefront/types/storefront";

export default function ProductPrice({
  product,
  variant,
  region,
}: {
  product: StoreProduct;
  variant?: any;
  region: StoreRegion;
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
    region,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice
  
  // Check if product has only one variant
  const hasOnlyOneVariant = useMemo(() => {
    return (product.productVariants?.length || 0) === 1
  }, [product])

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />;
  }

  const formattedPrice = new Intl.NumberFormat(region.locale, {
    style: 'currency',
    currency: selectedPrice.currencyCode,
  }).format(selectedPrice.calculatedAmount / 100);

  const isOnSale = selectedPrice.calculatedAmount < selectedPrice.originalAmount;

  return (
    <div className="flex flex-col text-foreground">
      <span
        className={cn("text-lg font-medium", {
          "text-primary": isOnSale,
        })}>
        {!variant && !hasOnlyOneVariant && "From "}
        {formattedPrice}
      </span>
      {isOnSale && (
        <>
          <p>
            <span className="text-muted-foreground">Original: </span>
            <span className="line-through">
              {new Intl.NumberFormat(region.locale, {
                style: 'currency',
                currency: selectedPrice.currencyCode,
              }).format(selectedPrice.originalAmount / 100)}
            </span>
          </p>
          <span className="text-primary">
            -{Math.round((1 - selectedPrice.calculatedAmount / selectedPrice.originalAmount) * 100)}%
          </span>
        </>
      )}
    </div>
  );
}
