import { Text } from "@medusajs/ui"

const LineItemOptions = ({
  variant
}) => {
  return (
    <Text
      className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis">
      Variant: {variant.title}
    </Text>
  );
}

export default LineItemOptions
