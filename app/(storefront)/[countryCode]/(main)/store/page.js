import StoreTemplate from "@storefront/modules/store/templates"

export const metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

export default async function StorePage({
  searchParams,
  params
}) {
  const { sortBy, page } = searchParams

  return <StoreTemplate sortBy={sortBy} page={page} countryCode={params.countryCode} />;
}
