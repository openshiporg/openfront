import { notFound } from "next/navigation";
import CollectionTemplate from "@storefront/modules/collections/templates";
import { getCollectionByHandle, getCollectionsList } from "@storefront/lib/data/collections";
import { listRegions } from "@storefront/lib/data/regions";

export const PRODUCT_LIMIT = 12;

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
