import { Metadata } from "next"

import FeaturedProducts from "@/features/storefront/modules/home/components/featured-products"
import Hero from "@/features/storefront/modules/home/components/hero"
import { getCollectionsListByRegion } from "@/features/storefront/lib/data/collections" // Assuming this function exists and takes regionId
import { getRegion } from "@/features/storefront/lib/data/regions"
import { getStore } from "@/features/storefront/lib/data/store"
import type { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"
 
export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()
  
  return {
    title: store?.homepageTitle || "Openfront Next.js Starter",
    description: store?.homepageDescription || "A performant frontend e-commerce starter template with Next.js 15 and Openfront.",
  }
}

export async function HomePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region: StoreRegion | undefined = await getRegion(countryCode)
  const store = await getStore()

  // Assuming getCollectionsListByRegion takes offset, limit, regionId and returns { collections: [...] }
  const { collections }: { collections: StoreCollection[] } = region
    ? await getCollectionsListByRegion(0, 3, region.id)
    : { collections: [] }

  if (!collections || !region) {
    // Handle case where region might be null/undefined if getRegion fails
    // Or if collections fetch fails based on region
    return null // Or show an error/empty state
  }

  return (
    <>
      <Hero
        title={store?.homepageTitle}
        description={store?.homepageDescription}
        logoColor={store?.logoColor}
      />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </>
  )
}