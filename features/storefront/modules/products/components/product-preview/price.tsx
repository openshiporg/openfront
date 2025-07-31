import { cn } from "@/lib/utils";

interface PreviewPriceProps {
  price: any;
  region: any;
}

export default function PreviewPrice({ price, region }: PreviewPriceProps) {
  if (!price || !price.calculatedAmount) {
    return <span>Price not available</span>;
  }

  const formattedPrice = new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: price.currencyCode,
  }).format(price.calculatedAmount / 100);

  const formattedOriginalPrice = new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: price.currencyCode,
  }).format(price.originalAmount / 100);

  const isOnSale = price.calculatedAmount < price.originalAmount;

  return (
    <>
      {isOnSale && (
        <span
          className="line-through text-muted-foreground"
          data-testid="original-price"
        >
          {" "}
          {formattedOriginalPrice}
        </span>
      )}
      <span
        className={cn("text-muted-foreground", {
          "text-primary": isOnSale,
        })}
        data-testid="price"
      >
        {formattedPrice}
      </span>
    </>
  );
}
