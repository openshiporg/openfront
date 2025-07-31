import type { StorefrontProductCategory } from '@/features/storefront/types'; // Corrected path with @ alias
import type { Metadata } from 'next';
import type { SortOptions } from '@/features/storefront/modules/store/components/refinement-list/sort-products'; // Corrected path with @ alias
import { notFound } from "next/navigation"

import { getCategoryByHandle } from "@/features/storefront/lib/data/categories" 
import CategoryTemplate from "@/features/storefront/modules/categories/templates" 

// Type alias for props
type Props = {
  params: Promise<{ category: string[]; countryCode: string }>; // Next.js 15 async params
  searchParams: Promise<{ sortBy?: SortOptions; page?: string }>; // Next.js 15 async searchParams
};

// TODO: Adapt generateStaticParams if needed. Requires fetching all category handles and country codes.
// export async function generateStaticParams() {
//   // Need a way to get all category handles (e.g., from listCategories or getCategoriesList)
//   // Need a way to get all country codes (e.g., from regions)
//   const categories = [{ handle: "category-1" }, { handle: "category-2" }] // Placeholder
//   const countryCodes = ["us"] // Placeholder
//
//   if (!categories || !countryCodes) {
//     return []
//   }
//
//   const categoryHandles = categories.map((category) => category.handle)
//
//   const staticParams = countryCodes
//     ?.map((countryCode) =>
//       categoryHandles.map((handle) => ({
//         countryCode,
//         // Assuming category paths are just the handle for now
//         category: [handle],
//       }))
//     )
//     .flat()
//
//   return staticParams
// }

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params // Await params in Next.js 15
  const handle = params.category[params.category.length - 1] // Get the last handle from the array

  try {
    // Fetch category using the new function and structure
    const { product_categories }: { product_categories: StorefrontProductCategory[] } = await getCategoryByHandle(handle)
    const category: StorefrontProductCategory | undefined = product_categories[0]

    if (!category) {
      notFound()
    }

    // Assuming 'title' exists on the category object from the new API
    const title = category.title

    // Assuming 'description' might exist, otherwise use title
    const description = category.description ?? `${category.title} category.`

    return {
      title: title,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    console.error("Error fetching category for metadata:", error) // Log error
    notFound()
  }
}

export async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams // Await searchParams in Next.js 15
  const params = await props.params // Await params in Next.js 15
  const { sortBy, page } = searchParams
  const handle = params.category[params.category.length - 1] // Get the last handle

  // Fetch category using the new function and structure
  const { product_categories }: { product_categories: StorefrontProductCategory[] } = await getCategoryByHandle(handle)
  const category: StorefrontProductCategory | undefined = product_categories[0]

  if (!category) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={category}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
    />
  )
}