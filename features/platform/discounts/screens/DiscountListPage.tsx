/**
 * DiscountListPage - Server Component
 * Uses dedicated Discounts actions for consistent data fetching
 */

import { getListByPath } from '../../../dashboard/actions/getListByPath'
import { getAdminMetaAction } from '../../../dashboard/actions'
import { notFound } from 'next/navigation'
import { DiscountListPageClient } from './DiscountListPageClient'
import { getFilteredDiscounts, getDiscountStatusCounts } from '../actions'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function DiscountListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Hardcode the list key for discounts
  const listKeyPath = 'discounts';

  // Get the list by path using our cached function
  const list = await getListByPath(listKeyPath);

  if (!list) {
    notFound()
  }

  // Parse search params
  const currentPage = parseInt(searchParamsObj.page?.toString() || '1', 10) || 1
  const pageSize = parseInt(searchParamsObj.pageSize?.toString() || list.pageSize?.toString() || '50', 10)
  const searchString = searchParamsObj.search?.toString() || ''
  
  // Extract status filter from URL params
  const statusFilter = searchParamsObj['!status_matches']
  let status = 'all'
  if (statusFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(statusFilter.toString()))
      if (Array.isArray(parsed) && parsed.length > 0) {
        status = typeof parsed[0] === 'string' ? parsed[0] : parsed[0].value
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  }

  // Extract sort parameter
  const sortBy = searchParamsObj.sortBy?.toString()

  // Use dedicated Discounts actions
  const response = await getFilteredDiscounts(
    status === 'all' ? undefined : status,
    searchString || undefined,
    currentPage,
    pageSize,
    sortBy
  )

  let fetchedData: { items: any[], count: number } = { items: [], count: 0 }
  let error: string | null = null

  if (response.success) {
    fetchedData = response.data
  } else {
    console.error('Error fetching discounts:', response.error)
    error = response.error
  }

  // Get adminMeta for the list structure
  const adminMetaResponse = await getAdminMetaAction(list.key)
  
  // Extract the list with proper field metadata if successful
  const adminMetaList = adminMetaResponse.success ? adminMetaResponse.data.list : null
  
  // Create enhanced list with validation data
  const enhancedList = adminMetaList || list

  // Get status counts using dedicated action
  const statusCountsResponse = await getDiscountStatusCounts()
  
  let statusCounts = {"active":0,"all":0,"inactive":0}

  if (statusCountsResponse.success) {
    statusCounts = statusCountsResponse.data
  }

  return (
    <DiscountListPageClient
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

export default DiscountListPage
