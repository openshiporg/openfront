"use server";
import { searchClient } from "@storefront/lib/search-client"

/**
 * Uses FlexSearch to search for products
 * @param {string} query - search query
 * @param {number} [limit=100] - maximum number of results to return
 */
export async function search(query, limit = 100) {
  if (!query?.trim()) {
    return []
  }

  try {
    const response = await searchClient.search([
      {
        params: {
          query: query.trim(),
          hitsPerPage: limit
        }
      }
    ])
    
    return response.results[0].hits || []
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}
