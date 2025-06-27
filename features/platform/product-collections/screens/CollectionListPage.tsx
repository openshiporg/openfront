/**
 * CollectionListPage - Server Component
 * Uses dedicated Collections actions for consistent data fetching
 */

import { getListByPath } from '../../../dashboard/actions/getListByPath'
import { getAdminMetaAction } from '../../../dashboard/actions'
import { notFound } from 'next/navigation'
import { CollectionListPageClient } from './CollectionListPageClient'
import { getFilteredCollections, getCollectionStatusCounts } from '../actions'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function CollectionListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Hardcode the list key for collections
  const listKeyPath = 'product-collections';

  // Get the list by path using our cached function
  const list = await getListByPath(listKeyPath);

  if (!list) {
    notFound()
  }

  // Parse search params
  const currentPage = parseInt(searchParamsObj.page?.toString() || '1', 10) || 1
  const pageSize = parseInt(searchParamsObj.pageSize?.toString() || list.pageSize?.toString() || '50', 10)
  const searchString = searchParamsObj.search?.toString() || ''

  // Extract sort parameter and convert to Dasher7 format
  const sortBy = searchParamsObj.sortBy?.toString()
  let sort: { field: string; direction: string } | undefined
  if (sortBy) {
    if (sortBy.startsWith('-')) {
      sort = { field: sortBy.substring(1), direction: 'DESC' }
    } else {
      sort = { field: sortBy, direction: 'ASC' }
    }
  }

  // Use dedicated Collections actions (matching Dasher7 signature)
  const response = await getFilteredCollections(
    searchString || undefined,
    currentPage,
    pageSize,
    sort
  )

  let fetchedData: { items: any[], count: number } = { items: [], count: 0 }
  let error: string | null = null

  if (response.success) {
    fetchedData = { items: response.data.items || [], count: response.data.count || 0 }
  } else {
    console.error('Error fetching collections:', response.error)
    error = response.error
  }

  // Get adminMeta for the list structure
  const adminMetaResponse = await getAdminMetaAction(list.key)
  
  // Extract the list with proper field metadata if successful
  const adminMetaList = adminMetaResponse.success ? adminMetaResponse.data.list : null
  
  // Create enhanced list with validation data
  const enhancedList = adminMetaList || list

  // Get status counts using dedicated action (collections only have total count)
  const statusCountsResponse = await getCollectionStatusCounts()
  
  let statusCounts = { all: 0 }

  if (statusCountsResponse.success) {
    statusCounts = { all: statusCountsResponse.data.all || 0 }
  }

  return (
    <CollectionListPageClient
      list={enhancedList}
      initialData={fetchedData}
      initialError={error}
      initialSearchParams={{
        page: currentPage,
        pageSize,
        search: searchString
      }}
      statusCounts={statusCounts}
    />
  )
}

export default CollectionListPage
