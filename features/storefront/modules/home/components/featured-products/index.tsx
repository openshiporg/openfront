import { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"
import ProductRail from "@/features/storefront/modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: StoreCollection[]
  region: StoreRegion
}) {
  return collections.map((collection) => (
    <li key={collection.id}>
      <ProductRail collection={collection} region={region} />
    </li>
  ))
}
