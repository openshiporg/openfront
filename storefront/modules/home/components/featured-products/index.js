import ProductRail from "@storefront/modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region
}) {
  return collections.map((collection) => (
    <li key={collection.id}>
      <ProductRail collection={collection} region={region} />
    </li>
  ));
}
