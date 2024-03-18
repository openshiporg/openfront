import SearchResultsTemplate from "@storefront/modules/search/templates/search-results-template"

import { search } from "@storefront/modules/search/actions"

export const metadata = {
  title: "Search",
  description: "Explore all of our products.",
}

export default async function SearchResults({
  params,
  searchParams
}) {
  const { query } = params
  const { sortBy, page } = searchParams

  const hits = await search(query).then((data) => data)

  const ids = hits
    .map((h) => h.objectID || h.id)
    .filter(id => {
      return typeof id === "string"
    })

  return (
    <SearchResultsTemplate
      query={query}
      ids={ids}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode} />
  );
}
