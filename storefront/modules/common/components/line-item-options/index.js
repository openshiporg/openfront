import { Text } from "@medusajs/ui"

const LineItemOptions = ({
  variant
}) => {
  return (
    <div className="text-ui-fg-subtle">
      <Text className="inline-block txt-medium w-full overflow-hidden text-ellipsis">
        Variant: {variant.title}
      </Text>
      {variant.sku && (
        <Text className="inline-block txt-medium w-full overflow-hidden text-ellipsis">
          SKU: {variant.sku}
        </Text>
      )}
    </div>
  );
}

export default LineItemOptions
