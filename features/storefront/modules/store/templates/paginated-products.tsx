import { getProductsListWithSort } from "../../../lib/data/products"
import { getRegion } from "../../../lib/data/regions"
import ProductPreview from "../../products/components/product-preview"
import { Pagination } from "../components/pagination"
import { SortOptions } from "../components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type GetProductsListParams = {
  limit: number
  collectionId?: string
  id?: string[]
  isGiftcard?: boolean
}

type SortParam = {
  'variants.prices.amount'?: 'asc' | 'desc';
  createdAt: 'asc' | 'desc';
}

const mapSortBy = (sortByOption?: SortOptions): SortParam => {
  switch (sortByOption) {
    case "price_asc":
      return { 'variants.prices.amount': "asc", createdAt: "desc" }
    case "price_desc":
      return { 'variants.prices.amount': "desc", createdAt: "desc" }
    case "created_at":
    default:
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
  const sortBy = mapSortBy(sortByOption)

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
