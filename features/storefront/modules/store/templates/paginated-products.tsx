import { getProductsListWithSort, getProductsListByPrice } from "../../../lib/data/products"
import { getRegion } from "../../../lib/data/regions"
import ProductPreview from "../../products/components/product-preview"
import { Pagination } from "../components/pagination"
import { SortOptions } from "../components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type GetProductsListParams = {
  limit: number
  collectionId?: string
  categoryId?: string
  id?: string[]
  isGiftcard?: boolean
  q?: string
}

export default async function PaginatedProducts({
  sortBy: sortByOption,
  page,
  collectionId,
  categoryId,
  productsIds,
  query,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  query?: string
  countryCode: string
}) {
  const queryParams: GetProductsListParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collectionId"] = collectionId
  }

  if (categoryId) {
    queryParams["categoryId"] = categoryId
  }

  if (query) {
    queryParams["q"] = query
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let products: any[] = []
  let count = 0

  // Use different queries based on sort option
  // The price-sorted query has no text filter, so a search keeps the standard listing.
  if (!query && (sortByOption === "price_asc" || sortByOption === "price_desc")) {
    // Use the custom price sorting query
    const priceOrder = sortByOption === "price_asc" ? "asc" : "desc"
    const result = await getProductsListByPrice({
      page,
      queryParams,
      priceOrder,
      countryCode,
    })
    products = result.response.products
    count = result.response.count
  } else {
    // Use standard sorting (created_at)
    const result = await getProductsListWithSort({
      page,
      queryParams,
      sortBy: { createdAt: "desc" },
      countryCode,
    })
    products = result.response.products
    count = result.response.count
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (query && products.length === 0) {
    return (
      <p className="py-12 text-base text-muted-foreground" data-testid="search-no-results">
        No products match “{query}”. Try a shorter word, or browse all products.
      </p>
    )
  }

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6"
        data-testid="products-list"
      >
        {products.map((p: any) => {
          return (
            <li key={p.id}>
              <ProductPreview productPreview={p as any} region={region as any} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
