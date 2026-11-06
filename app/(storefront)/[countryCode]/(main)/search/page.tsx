import { redirect } from "next/navigation"

/** /search?q= is the conventional storefront search URL; results live on the store page. */
export default async function SearchPage(props: { params: Promise<{ countryCode: string }>; searchParams: Promise<{ q?: string }> }) {
  const { countryCode } = await props.params
  const { q } = await props.searchParams
  const query = typeof q === "string" ? q.trim().slice(0, 100) : ""
  redirect(`/${countryCode}/store${query ? `?q=${encodeURIComponent(query)}` : ""}`)
}
