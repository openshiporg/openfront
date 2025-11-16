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
    <div className="flex flex-col items-end gap-0.5">
      {isOnSale && (
        <span
          className="text-xs line-through text-muted-foreground/60"
          data-testid="original-price"
        >
          {formattedOriginalPrice}
        </span>
      )}
      <span
        className={cn("text-base font-semibold text-foreground/70 whitespace-nowrap", {
          "text-primary": isOnSale,
        })}
        data-testid="price"
      >
        {formattedPrice}
      </span>
    </div>
  );
}
