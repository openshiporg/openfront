import React, { Suspense } from "react";

import ImageGallery from "@storefront/modules/products/components/image-gallery";
import ProductActions from "@storefront/modules/products/components/product-actions";
import ProductOnboardingCta from "@storefront/modules/products/components/product-onboarding-cta";
import ProductTabs from "@storefront/modules/products/components/product-tabs";
import RelatedProducts from "@storefront/modules/products/components/related-products";
import ProductInfo from "@storefront/modules/products/templates/product-info";
import SkeletonRelatedProducts from "@storefront/modules/skeletons/templates/skeleton-related-products";
import { notFound } from "next/navigation";
import ProductActionsWrapper from "./product-actions-wrapper";

const ProductTemplate = ({ product, region, countryCode }) => {
  if (!product || !product.id) {
    return notFound();
  }

  return (
    <>
      <div className="content-container flex flex-col small:flex-row small:items-start py-6 relative">
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery images={product?.productImages || []} />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
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
      <div className="content-container my-16 small:my-32">
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  );
};

export default ProductTemplate;
