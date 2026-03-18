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
}

export default async function PaginatedProducts({
  sortBy: sortByOption,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
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
  if (sortByOption === "price_asc" || sortByOption === "price_desc") {
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

  return (
    <>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center col-span-full">
          <div className="text-7xl mb-6">🛒</div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Products Coming Soon
          </h3>
          <p className="text-slate-400 max-w-md mb-2 leading-relaxed">
            We are adding our full AI tools catalog shortly.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Need a specific tool right now? Message us — we can help you get access today.
          </p>
          <a href="https://wa.me/8801711638693?text=Hi%20SYSmoAI%2C%20I%20need%20an%20AI%20tool"
             target="_blank"
             rel="noopener noreferrer"
             className="inline-flex items-center gap-2 
                        bg-emerald-600 hover:bg-emerald-500 
                        text-white font-semibold px-8 py-4 
                        rounded-xl text-lg transition-colors">
            💬 Ask on WhatsApp
          </a>
        </div>
      ) : (
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
      )}
    </>
  )
}
