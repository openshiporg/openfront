import { Metadata } from "next"

import { SortOptions } from "@/features/storefront/modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@/features/storefront/modules/store/templates"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    q?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export async function StorePage(props: Params) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { sortBy, page, q } = searchParams

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      query={typeof q === "string" ? q : undefined}
      countryCode={params.countryCode}
    />
  )
}
