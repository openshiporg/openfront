import { Suspense } from "react"

import SkeletonProductGrid from "@/features/storefront/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/features/storefront/modules/store/components/refinement-list"
import { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"
import StoreSearch from "../components/store-search"

const StoreTemplate = ({
  sortBy,
  page,
  query,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  query?: string
  countryCode: string
}) => {
  const search = query?.trim().slice(0, 100) || ""
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div
      className="flex flex-col lg:flex-row lg:items-start py-6 max-w-[1440px] w-full mx-auto px-6"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} />
      <div className="w-full">
        <div className="mb-6 text-3xl font-semibold">
          <h1 data-testid="store-page-title">{search ? `Results for “${search}”` : "All products"}</h1>
        </div>
        <StoreSearch initialQuery={search} />
        <Suspense key={search} fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            query={search}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
