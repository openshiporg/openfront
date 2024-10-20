import { Text, clx } from "@medusajs/ui"

export default function PreviewPrice({ price, region }) {
  if (!price || !price.calculatedAmount) {
    return <Text>Price not available</Text>;
  }

  const formattedPrice = new Intl.NumberFormat(region.locale, {
    style: 'currency',
    currency: price.currencyCode,
  }).format(price.calculatedAmount / 100);

  const formattedOriginalPrice = new Intl.NumberFormat(region.locale, {
    style: 'currency',
    currency: price.currencyCode,
  }).format(price.originalAmount / 100);

  const isOnSale = price.calculatedAmount < price.originalAmount;

  return (
    <>
      {isOnSale && (
        <Text className="line-through text-ui-fg-muted">
          {formattedOriginalPrice}
        </Text>
      )}
      <Text
        className={clx("text-ui-fg-muted", {
          "text-ui-fg-interactive": isOnSale,
        })}>
        {formattedPrice}
      </Text>
    </>
  );
}
