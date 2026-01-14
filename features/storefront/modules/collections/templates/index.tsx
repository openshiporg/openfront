import { Suspense } from "react"

import SkeletonProductGrid from "@/features/storefront/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/features/storefront/modules/store/components/refinement-list"
import { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/features/storefront/modules/store/templates/paginated-products"
// Removed unused HttpTypes import
import type { StorefrontCollection } from "@/features/storefront/types" // Add import

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: StorefrontCollection // Update type here
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-6 max-w-[1440px] w-full mx-auto px-6 gap-8">
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-8 text-3xl font-semibold">
          <h1>{collection.title}</h1>
        </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
