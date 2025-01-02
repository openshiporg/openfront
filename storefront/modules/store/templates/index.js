import { Suspense } from "react"

import SkeletonProductGrid from "@storefront/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@storefront/modules/store/components/refinement-list"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode
}) => {
  const pageNumber = page ? parseInt(page) : 1

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container">
      <RefinementList sortBy={sortBy || "createdAt"} />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1>All products</h1>
        </div>
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sortBy || "createdAt"}
            page={pageNumber}
            countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  );
}

export default StoreTemplate
