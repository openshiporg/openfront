import {
  getCollectionsList,
  getProductsList,
  getRegion,
} from "@storefront/lib/data";
import FeaturedProducts from "@storefront/modules/home/components/featured-products";
import Hero from "@storefront/modules/home/components/hero";
import { cache } from "react";

export const metadata = {
  title: "Openfront",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Keystone.",
};

const getCollectionsWithProducts = cache(async (countryCode) => {
  const { collections } = await getCollectionsList(0, 3, countryCode);

  if (!collections) {
    return null;
  }

  const region = await getRegion(countryCode);

  return collections.map(collection => ({
    ...collection,
    products: collection.products.map(product => transformProductPreview(product, region))
  }));
});

export default async function Home({ params: { countryCode } }) {
  const collections = await getCollectionsWithProducts(countryCode);
  const region = await getRegion(countryCode);

  if (!collections || !region) {
    return null;
  }

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  );
}
