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
    // Access country code based on schema
    countryCode: region.countries?.[0]?.iso2 || "us", // Corrected property name
    queryParams: {
      collectionId: collection.id,
      // limit: 4 // Optional: You might want to limit the number of products shown
    },
    // sortBy: { createdAt: 'desc' } // Optional: Default sort is createdAt desc
  })
  const pricedProducts = products // Keep variable name consistent for rest of component

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="max-w-[1440px] w-full mx-auto px-6 py-12 sm:py-24">
      <div className="flex justify-between mb-8">
        {/* Replace Text with span */}
        <span className="text-lg leading-8 font-normal">{collection.title}</span>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-24 sm:gap-y-36">
        {pricedProducts &&
          pricedProducts.map((product: any) => ( // Added :any temporarily
            <li key={product.id}>
              <ProductPreview productPreview={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
