import { Metadata } from "next"

import FeaturedProducts from "@/features/storefront/modules/home/components/featured-products"
import Hero from "@/features/storefront/modules/home/components/hero"
import { getCollectionsListByRegion } from "@/features/storefront/lib/data/collections"
import { getRegion } from "@/features/storefront/lib/data/regions"
import { getStore } from "@/features/storefront/lib/data/store"
import type { StoreCollection, StoreRegion } from "@/features/storefront/types/storefront"

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStore()

  return {
    title: store?.homepageTitle || "Openfront Next.js Starter",
    description: store?.homepageDescription || "A performant frontend e-commerce starter template with Next.js 16 and Openfront.",
  }
}

export async function HomePage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region: StoreRegion | undefined = await getRegion(countryCode)
  const store = await getStore()

  const { collections }: { collections: StoreCollection[] } = region
    ? await getCollectionsListByRegion(0, 3, region.id)
    : { collections: [] }

  return (
    <>
      <section className="w-full bg-[#0A0A0F] py-24 px-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight max-w-4xl">
          AI Tools &amp; Systems for Bangladesh
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl">
          Premium AI subscriptions. AI implementation services. Built for students, freelancers, agencies, and businesses.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/us"
            className="px-8 py-4 rounded-full bg-[#6366F1] text-white font-semibold text-sm hover:bg-[#4f51d6] transition-colors duration-200"
          >
            Browse Shop
          </a>
          <a
            href="https://wa.me/8801865385348"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-full bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20b85a] transition-colors duration-200"
          >
            WhatsApp Us
          </a>
        </div>
      </section>
      {region && (
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
      )}
    </>
  )
}
