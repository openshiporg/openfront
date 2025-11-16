import { getProductsList } from "@/features/storefront/lib/data/products"
import { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"

import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"
import ProductPreview from "@/features/storefront/modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: StoreCollection
  region: StoreRegion
}) {
  const {
    response: { products },
  } = await getProductsList({
    countryCode: region.countries?.[0]?.iso2 || "us",
    queryParams: {
      collectionId: collection.id,
    },
  })
  const pricedProducts = products

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="max-w-[1440px] w-full mx-auto px-6 py-12 sm:py-24">
      <div className="flex justify-between mb-8">
        <span className="text-lg leading-8 font-normal">{collection.title}</span>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
        {pricedProducts &&
          pricedProducts.map((product: any) => (
            <li key={product.id}>
              <ProductPreview productPreview={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
