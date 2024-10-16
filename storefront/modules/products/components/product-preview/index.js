import { Text } from "@medusajs/ui"

import { retrievePricedProductById } from "@storefront/lib/data"
import { getProductPrice } from "@storefront/lib/util/get-product-price"
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  productPreview,
  isFeatured,
  region
}) {
  const pricedProduct = await retrievePricedProductById({
    id: productPreview.id,
    regionId: region.id,
  }).then((product) => product)

  // if (!pricedProduct) {
  //   return null
  // }

  console.log(pricedProduct.product.productVariants[0].prices)
  console.log({ region })

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct.product,
    region,
  })

  console.log({ cheapestPrice })

  return (
    <LocalizedClientLink href={`/products/${productPreview.handle}`} className="group">
      {/* <div>
        <Thumbnail thumbnail={productPreview.thumbnail} size="full" isFeatured={isFeatured} />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle">{productPreview.title}</Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </div> */}
      hello
    </LocalizedClientLink>
  );
}
