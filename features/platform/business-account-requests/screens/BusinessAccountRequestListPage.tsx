/**
 * BusinessAccountRequestListPage - Server Component
 * Uses dedicated BusinessAccountRequest actions for consistent data fetching
 */

import { getListByPath } from '../../../dashboard/actions/getListByPath'
import { getAdminMetaAction } from '../../../dashboard/actions'
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'
import { notFound } from 'next/navigation'
import { BusinessAccountRequestListPageClient } from './BusinessAccountRequestListPageClient'
import { getBusinessAccountRequests, getBusinessAccountRequestStatusCounts } from '../actions'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function BusinessAccountRequestListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Hardcode the list key for business account requests
  const listKeyPath = 'business-account-requests';

  // Get the list by path using our cached function
  const list = await getListByPath(listKeyPath);

  if (!list) {
    notFound()
  }

  // Parse search params
  const currentPage = parseInt(searchParamsObj.page?.toString() || '1', 10) || 1
  const pageSize = parseInt(searchParamsObj.pageSize?.toString() || list.pageSize?.toString() || '50', 10)
  const searchString = searchParamsObj.search?.toString() || ''

  // Build dynamic orderBy clause using Keystone's defaults
  const orderBy = buildOrderByClause(list, searchParamsObj)

  // Build filters from URL params using Keystone's approach
  const filterWhere = buildWhereClause(list, searchParamsObj)

  // Build search where clause
  const searchParameters = searchString ? { search: searchString } : {}
  const searchWhere = buildWhereClause(list, searchParameters)

  // Combine search and filters - following Keystone's pattern
  const whereConditions = []
  if (Object.keys(searchWhere).length > 0) {
    whereConditions.push(searchWhere)
  }
  if (Object.keys(filterWhere).length > 0) {
    whereConditions.push(filterWhere)
  }

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

  // Use BusinessAccountRequest actions with where clause
  const response = await getBusinessAccountRequests(
    where,
    pageSize,
    (currentPage - 1) * pageSize,
    orderBy
  )

  let fetchedData: { items: any[], count: number } = { items: [], count: 0 }
  let error: string | null = null

  if (response.success) {
    fetchedData = response.data
  } else {
    console.error('Error fetching business account requests:', response.error)
    error = response.error
  }

  // Get adminMeta for the list structure
  const adminMetaResponse = await getAdminMetaAction(list.key)
  
  // Extract the list with proper field metadata if successful
  const adminMetaList = adminMetaResponse.success ? adminMetaResponse.data.list : null
  
  // Create enhanced list with validation data
  const enhancedList = adminMetaList || list

  // Get status counts using dedicated action
  const statusCountsResponse = await getBusinessAccountRequestStatusCounts()
  
  let statusCounts = {"pending":0,"all":0,"approved":0,"not_approved":0,"requires_info":0}

  if (statusCountsResponse.success) {
    // Map the backend keys to frontend keys
    statusCounts = {
      all: statusCountsResponse.data.all || 0,
      pending: statusCountsResponse.data.pending || 0,
      approved: statusCountsResponse.data.approved || 0,
      not_approved: statusCountsResponse.data.not_approved || 0,
      requires_info: statusCountsResponse.data.requires_info || 0
    }
  }

  return (
    <BusinessAccountRequestListPageClient
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

export default BusinessAccountRequestListPage
