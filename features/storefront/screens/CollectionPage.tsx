import type { StorefrontCollection } from '@/features/storefront/types'; // Use @ alias
import type { Metadata } from 'next';
import type { SortOptions } from '@/features/storefront/modules/store/components/refinement-list/sort-products'; // Use @ alias
import { notFound } from "next/navigation"

import { getCollectionByHandle } from "@/features/storefront/lib/data/collections" 
import CollectionTemplate from "@/features/storefront/modules/collections/templates" 

// Type alias for props
type Props = {
  params: Promise<{ handle: string; countryCode: string }>; // Next.js 15 async params
  searchParams: Promise<{ page?: string; sortBy?: SortOptions }>; // Next.js 15 async searchParams
};

const PRODUCT_LIMIT = 12

// TODO: Adapt generateStaticParams if needed. Requires fetching all collection handles and country codes.
// export async function generateStaticParams() {
//   // Need a way to get all collection handles (e.g., from getCollectionsList)
//   // Need a way to get all country codes (e.g., from regions)
//   const collections = [{ handle: "collection-1" }, { handle: "collection-2" }] // Placeholder
//   const countryCodes = ["us"] // Placeholder
//
//   if (!collections || !countryCodes) {
//     return []
//   }
//
//   const collectionHandles = collections.map((collection) => collection.handle)
//
//   const staticParams = countryCodes
//     ?.map((countryCode) =>
//       collectionHandles.map((handle) => ({
//         countryCode,
//         handle,
//       }))
//     )
//     .flat()
//
//   return staticParams
// }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params // Await params in Next.js 15
  // Fetch collection using the new function and structure
  const { productCollection: collection }: { productCollection: StorefrontCollection | null } = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title}`, 
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams // Await searchParams in Next.js 15
  const params = await props.params // Await params in Next.js 15
  const { sortBy, page } = searchParams

  // Fetch collection using the new function and structure
  const { productCollection: collection }: { productCollection: StorefrontCollection | null } = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
    />
  )
}