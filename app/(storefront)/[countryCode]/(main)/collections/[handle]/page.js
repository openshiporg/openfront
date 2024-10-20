import { notFound } from "next/navigation";

import {
  getCollectionByHandle,
  getCollectionsList,
  listRegions,
} from "@storefront/lib/data";
import CollectionTemplate from "@storefront/modules/collections/templates";

export const PRODUCT_LIMIT = 12;

export async function generateStaticParams() {
  // const { collections } = await getCollectionsList()

  // if (!collections) {
  //   return []
  // }

  // const countryCodes = await listRegions().then((regions) =>
  //   regions?.map((r) => r.countries.map((c) => c.iso_2)).flat())

  // const collectionHandles = collections.map((collection) => collection.handle)

  // const staticParams = countryCodes
  //   ?.map((countryCode) =>
  //     collectionHandles.map((handle) => ({
  //       countryCode,
  //       handle,
  //     })))
  //   .flat()

  // return staticParams
  return [];
}

export async function generateMetadata({ params }) {
  const collection = await getCollectionByHandle(params.handle);

  if (!collection) {
    notFound();
  }

  const metadata = {
    title: `${collection.title} | Openfront Store`,
    description: `${collection.title} collection`,
  };

  return metadata;
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
