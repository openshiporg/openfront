import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"

const ProductInfo = ({
  product
}) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.productCollections[0] && (
          <LocalizedClientLink
            href={`/collections/${product.productCollections[0].handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle">
            {product.productCollections[0].title}
          </LocalizedClientLink>
        )}
        <Heading level="h2" className="text-3xl leading-10 text-ui-fg-base">
          {product.title}
        </Heading>

        <Text className="text-medium text-ui-fg-subtle">
          {product.description}
        </Text>
      </div>
    </div>
  );
}

export default ProductInfo
