import { getProductsListWithSort } from "@storefront/lib/data/products"
import { getRegion } from "@storefront/lib/data/regions"
import ProductPreview from "@storefront/modules/products/components/product-preview"
import { Pagination } from "@storefront/modules/store/components/pagination"

const PRODUCT_LIMIT = 12

export default async function PaginatedProducts({
  sortBy,
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
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  const {
    response: { products, count },
  } = await getProductsListWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

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
