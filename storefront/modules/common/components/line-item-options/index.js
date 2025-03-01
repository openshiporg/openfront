import { Text } from "@medusajs/ui"

const LineItemOptions = ({
  variant,
  variantTitle
}) => {
  return (
    <div className="text-ui-fg-subtle">
      {variantTitle && (
        <Text className="inline-block txt-medium w-full overflow-hidden text-ellipsis">
          {variantTitle}
        </Text>
      )}
      {variant?.sku && (
        <Text className="inline-block txt-medium w-full overflow-hidden text-ellipsis">
          SKU: {variant.sku}
        </Text>
      )}
    </div>
  );
}

export default LineItemOptions
