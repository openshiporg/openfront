import { notFound } from "next/navigation";

import CollectionTemplate from "@storefront/modules/collections/templates";
import { getCollectionByHandle, getCollectionsList } from "@storefront/lib/data/collections";
import { listRegions } from "@storefront/lib/data/regions";

export const PRODUCT_LIMIT = 12;

export async function generateStaticParams() {
  if (process.env.ENABLE_SSG !== 'true') {
    return [];
  }
  const { collections } = await getCollectionsList()

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then((regions) =>
    regions?.map((r) => r.countries.map((c) => c.iso_2)).flat())

  const collectionHandles = collections.map((collection) => collection.handle)

  const staticParams = countryCodes
    ?.map((countryCode) =>
      collectionHandles.map((handle) => ({
        countryCode,
        handle,
      })))
    .flat()

  return staticParams
}

export async function generateMetadata({ params }) {
  const { productCollection } = await getCollectionByHandle(params.handle);

  if (!productCollection) {
    notFound();
  }

  return {
    title: `${productCollection.title} | Openfront Store`,
    description: `${productCollection.title} collection`,
    alternates: {
      canonical: `collections/${params.handle}`,
    },
  };
}

export default async function CollectionPage({ params, searchParams }) {
  const { sortBy, page } = searchParams;

  const collection = await getCollectionByHandle(params.handle).then(
    (collection) => collection
  );

  if (!collection) {
    notFound();
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  );
}
