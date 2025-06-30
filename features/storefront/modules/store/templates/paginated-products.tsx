import { getProductsListWithSort } from "../../../lib/data/products"
import { getRegion } from "../../../lib/data/regions"
import ProductPreview from "../../products/components/product-preview"
import { Pagination } from "../components/pagination"
import { SortOptions } from "../components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

// Define the expected queryParams structure for getProductsList
type GetProductsListParams = {
  limit: number
  collectionId?: string
  id?: string[]
  isGiftcard?: boolean
}

// Define the expected sortBy structure - createdAt is required
type SortParam = {
  'variants.prices.amount'?: 'asc' | 'desc'; // Price sorting is optional
  createdAt: 'asc' | 'desc'; // createdAt is now required
}

// Helper function to map SortOptions to SortParam
// Adjust the keys ('variants.prices.amount', 'createdAt') if needed based on the actual GraphQL schema.
const mapSortBy = (sortByOption?: SortOptions): SortParam => {
  switch (sortByOption) {
    case "price_asc":
      // Primary sort: price ascending, Secondary sort: createdAt descending
      return { 'variants.prices.amount': "asc", createdAt: "desc" }
    case "price_desc":
      // Primary sort: price descending, Secondary sort: createdAt descending
      return { 'variants.prices.amount': "desc", createdAt: "desc" }
    case "created_at":
    default:
      // Default sort: createdAt descending. Price key is omitted.
      return { createdAt: "desc" }
  }
}

export default async function PaginatedProducts({
  sortBy: sortByOption,
  page,
  collectionId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  productsIds?: string[]
  countryCode: string
}) {
  const sortBy = mapSortBy(sortByOption) // This object will always have createdAt

  const queryParams: GetProductsListParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collectionId"] = collectionId
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Call the updated data fetching function
  let {
    response: { products, count },
  } = await getProductsListWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-2 w-full lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8"
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
