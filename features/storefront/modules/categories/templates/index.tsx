import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"
import SkeletonProductGrid from "@/features/storefront/modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/features/storefront/modules/store/components/refinement-list"
import { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@/features/storefront/modules/store/templates/paginated-products"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import type { StorefrontProductCategory } from "@/features/storefront/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: StorefrontProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
if (!category || !countryCode) notFound()

const parents = [] as StorefrontProductCategory[]

const getParents = (category: StorefrontProductCategory) => {
  if (category.parent_category) {
    parents.push(category.parent_category)
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-start py-6 max-w-[1440px] w-full mx-auto px-6 gap-8"
      data-testid="category-container"
    >
      <RefinementList sortBy={sort} data-testid="sort-by-container" />
      <div className="w-full">
        <div className="flex flex-row mb-8 text-3xl font-semibold gap-4">
          {parents &&
            parents.map((parent) => (
              <span key={parent.id} className="text-muted-foreground">
                <LocalizedClientLink
                  className="mr-4 hover:text-black"
                  href={`/categories/${parent.handle}`}
                  data-testid="sort-by-link"
                >
                  {parent.title}
                </LocalizedClientLink>
                /
              </span>
            ))}
          <h1 data-testid="category-page-title">{category.title}</h1>
        </div>
        {category.category_children && (
          <div className="mb-8 text-base-large">
            <ul className="grid grid-cols-1 gap-2">
              {category.category_children?.map((c: StorefrontProductCategory) => (
                <li key={c.id}>
                  <InteractiveLink href={`/categories/${c.handle}`}>
                    {c.title}
                  </InteractiveLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
