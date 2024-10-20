import { getCollectionsListByRegion, getRegion } from "@storefront/lib/data";
import transformProductPreview from "@storefront/lib/util/transform-product-preview";
import FeaturedProducts from "@storefront/modules/home/components/featured-products";
import Hero from "@storefront/modules/home/components/hero";
import { cache } from "react";

export const metadata = {
  title: "Openfront",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Keystone.",
};

const getCollectionsWithProducts = cache(async (countryCode) => {
  const region = await getRegion(countryCode);

  if (!region) {
    return null;
  }

  const { collections } = await getCollectionsListByRegion(0, 3, region.id);


  if (!collections) {
    return null;
  }

  const collectionsWithTransformedProducts = collections.map((collection) => ({
    ...collection,
    products: collection.products.map((product) =>
      transformProductPreview(product, region)
    ),
  }));

  return {
    collections: collectionsWithTransformedProducts,
    region,
  };
});

export default async function Home({ params: { countryCode } }) {
  const result = await getCollectionsWithProducts(countryCode.toUpperCase());

  if (!result) {
    return null;
  }

  const { collections, region } = result;

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
