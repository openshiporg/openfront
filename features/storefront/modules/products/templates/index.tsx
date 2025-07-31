import React, { Suspense } from "react"

import ImageGallery from "@/features/storefront/modules/products/components/image-gallery"
import ProductActions from "@/features/storefront/modules/products/components/product-actions"
import ProductOnboardingCta from "@/features/storefront/modules/products/components/product-onboarding-cta"
import ProductTabs from "@/features/storefront/modules/products/components/product-tabs"
import RelatedProducts from "@/features/storefront/modules/products/components/related-products"
import ProductInfo from "@/features/storefront/modules/products/templates/product-info"
import SkeletonRelatedProducts from "@/features/storefront/modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { StoreProduct, StoreRegion } from "@/features/storefront/types/storefront"

type ProductTemplateProps = {
  product: StoreProduct
  region: StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="max-w-[1440px] w-full mx-auto px-6 flex flex-col sm:flex-row sm:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col sm:sticky sm:top-48 sm:py-0 sm:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery images={product?.productImages || []} />
        </div>
        <div className="flex flex-col sm:sticky sm:top-48 sm:py-0 sm:max-w-[300px] w-full py-8 gap-y-12">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper handle={product.handle} region={region} />
          </Suspense>
        </div>
      </div>
      <div
        className="max-w-[1440px] w-full mx-auto px-6 my-16 sm:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
