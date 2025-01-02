import { getProductsListWithSort } from "@storefront/lib/data/products"
import { getRegion } from "@storefront/lib/data/regions"
import ProductPreview from "@storefront/modules/products/components/product-preview"
import { Pagination } from "@storefront/modules/store/components/pagination"

const PRODUCT_LIMIT = 12

export default async function PaginatedProducts({
  sortBy = "createdAt",
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode
}) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const queryParams = {
    limit: PRODUCT_LIMIT,
  }

  if (collectionId) {
    queryParams["collectionId"] = collectionId
  }

  if (categoryId) {
    queryParams["categoryId"] = categoryId
  }

  if (productsIds?.length > 0) {
    queryParams["productsIds"] = productsIds
  }

  // For price sorting, we need to fetch all products to sort them correctly
  const isPriceSort = sortBy === "priceAsc" || sortBy === "priceDesc"
  if (isPriceSort) {
    queryParams.limit = 1000 // Set a high limit to get all products
  }

  const {
    response: { products: allProducts, count },
  } = await getProductsListWithSort({
    page: isPriceSort ? 0 : page, // Start from first page when fetching all
    queryParams,
    sortBy: { createdAt: "desc" }, // Use a basic sort for the initial fetch
    countryCode,
  })

  // Sort and paginate products if needed
  let products = allProducts
  if (isPriceSort) {
    const getMinPrice = (product) => {
      const prices = product.productVariants
        ?.flatMap(v => v.prices)
        ?.map(p => p?.calculatedPrice?.calculatedAmount)
        ?.filter(Boolean) || []
      return prices.length > 0 ? Math.min(...prices) : Infinity
    }

    // Sort all products by price
    products = [...allProducts].sort((a, b) => {
      const aPrice = getMinPrice(a)
      const bPrice = getMinPrice(b)
      return sortBy === "priceAsc" 
        ? aPrice - bPrice 
        : bPrice - aPrice
    })

    // Manual pagination
    const startIndex = (page - 1) * PRODUCT_LIMIT
    products = products.slice(startIndex, startIndex + PRODUCT_LIMIT)
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return <>
    <ul
      className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-8">
      {products.map((p) => {
        return (
          <li key={p.id}>
            <ProductPreview productPreview={p} region={region} />
          </li>
        );
      })}
    </ul>
    {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
  </>;
}
