/**
 * Get List Counts - dashboard server action to fetch item counts for all lists
 * Matches Dashboard1 implementation but uses dashboard's keystoneClient
 */

'use server'

import { keystonePartialQuery } from '../lib/keystoneClient'

export async function getListCounts(
  lists: Array<{
    key: string;
    isSingleton?: boolean;
    graphql?: {
      names: {
        listQueryCountName: string;
      };
    };
  }>
) {
  try {
    // Skip counting for singleton lists
    const listsToCount = lists.filter((list) => !list.isSingleton)

    if (listsToCount.length === 0) return { success: true, data: {} }

    // Build a query to get counts for all non-singleton lists at once
    const countQueries = listsToCount.map((list) => {
      const countName = list.graphql?.names?.listQueryCountName
      return `${list.key}: ${countName}`
    })

    const query = `query GetListCounts { ${countQueries.join('\n')} }`
    
    // Each count is independent: a list this role cannot read, or a transient failure on one list, leaves that
    // card without a count and keeps every other count.
    const response = await keystonePartialQuery<Record<string, any>>(query)
    if (!response.success) return response
    const data: Record<string, any> = {}
    for (const [key, value] of Object.entries(response.data)) if (value !== null && value !== undefined) data[key] = value
    return { success: true as const, data }
  } catch (error: unknown) {
    console.error("Dashboard operation failed (details redacted).")
    const errorMessage =
      "Could not load list counts"
    return { success: false, error: errorMessage }
  }
}