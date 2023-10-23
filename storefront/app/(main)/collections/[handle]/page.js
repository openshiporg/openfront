import { getCollectionByHandle } from "@lib/data"
import CollectionTemplate from "@modules/collections/templates"
import { notFound } from "next/navigation"

export async function generateMetadata(
  {
    params
  }
) {
  const { collections } = await getCollectionByHandle(params.handle)

  const collection = collections[0]

  if (!collection) {
    notFound()
  }

  return {
    title: `${collection.title} | Acme Store`,
    description: `${collection.title} collection`,
  }
}

export default async function CollectionPage({
  params
}) {
  const { collections } = await getCollectionByHandle(params.handle)

  const collection = collections[0]

  return <CollectionTemplate collection={collection} />;
}
