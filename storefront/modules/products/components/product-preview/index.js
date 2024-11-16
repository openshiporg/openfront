import { Text } from "@medusajs/ui"

import { getProductPrice } from "@storefront/lib/util/get-product-price"
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { retrievePricedProductById } from "@storefront/lib/data/products"

export default async function ProductPreview({
  productPreview,
  isFeatured,
  region
}) {
  const product = await retrievePricedProductById({
    id: productPreview.id,
    regionId: region.id,
  }).then((response) => response.product)

  if (!product) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product,
    region,
  })

  return (
    <LocalizedClientLink href={`/products/${productPreview.handle}`} className="group">
      <div>
        <Thumbnail thumbnail={productPreview.thumbnail} size="full" isFeatured={isFeatured} />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle">{productPreview.title}</Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice ? (
              <PreviewPrice price={cheapestPrice} region={region} />
            ) : (
              <Text>Price not available</Text>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  );
}
