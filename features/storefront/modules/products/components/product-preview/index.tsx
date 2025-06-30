import { getProductPrice } from "@/features/storefront/lib/util/get-product-price"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { retrievePricedProductById } from "@/features/storefront/lib/data/products"

import { StoreRegion } from "@/features/storefront/types/storefront";

interface ProductPreviewProps {
  productPreview: {
    id: string
    handle: string
    thumbnail: any // TODO: Define proper thumbnail type
    title: string
  }
  isFeatured?: boolean
  region: StoreRegion;
}

export default async function ProductPreview({
  productPreview,
  isFeatured,
  region
}: ProductPreviewProps) {
  const product = await retrievePricedProductById({
    id: productPreview.id,
    regionId: region.id,
  }).then((response) => response.product)

  if (!product) {
    return null
  }

  // Pass the first variant's ID if it exists, otherwise pass null
  const firstVariantId = product.productVariants?.[0]?.id || null
  const { cheapestPrice } = getProductPrice({
    product,
    variantId: firstVariantId,
    region,
  })

  return (
    <LocalizedClientLink href={`/products/${productPreview.handle}`} className="group">
      <div>
        <Thumbnail thumbnail={productPreview.thumbnail} size="full" isFeatured={isFeatured} />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <p className="text-muted-foreground">{productPreview.title}</p>
          <div className="flex items-center gap-x-2">
            {cheapestPrice ? (
              <PreviewPrice price={cheapestPrice} region={region} />
            ) : (
              <p className="text-muted-foreground">Price not available</p>
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
