import { Suspense } from "react"

import SkeletonProductGrid from "@/features/storefront/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/features/storefront/modules/store/components/refinement-list"
import { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div data-testid="category-container">
      {/* Store Hero */}
      <div className="py-16 px-4 text-center border-b border-[#1E1E2E] bg-gradient-to-b from-[#0d0d1a] to-[#0A0A0F]">
        <div className="inline-flex items-center gap-2 bg-[#1E3A8A]/40 border border-[#2563EB]/30 text-[#60A5FA] text-xs font-medium px-3 py-1.5 rounded-full mb-5">
          🛒 AI Tools for Bangladesh
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Browse AI Tools
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Premium AI subscriptions — priced in BDT, paid via bKash or Nagad, delivered same day.
        </p>
      </div>

      {/* Store Content */}
      <div className="flex flex-col lg:flex-row lg:items-start py-6 max-w-[1440px] w-full mx-auto px-6">
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <div className="mb-8 text-3xl font-semibold">
            <h2 data-testid="store-page-title">All products</h2>
          </div>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
