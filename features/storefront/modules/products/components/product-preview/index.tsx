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
    thumbnail: any
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

  const firstVariantId = product.productVariants?.[0]?.id || null
  const { cheapestPrice } = getProductPrice({
    product,
    variantId: firstVariantId,
    region,
  })

  return (
    <LocalizedClientLink href={`/products/${productPreview.handle}`} className="group">
      <div className="flex flex-col gap-3">
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <Thumbnail thumbnail={productPreview.thumbnail} size="square" isFeatured={isFeatured} />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-medium text-foreground">
            {productPreview.title}
          </h3>
          {cheapestPrice ? (
            <PreviewPrice price={cheapestPrice} region={region} />
          ) : (
            <p className="text-sm text-muted-foreground/60">N/A</p>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
