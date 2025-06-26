/**
 * ProductListPage - Server Component
 * Based on dashboard ListPage but hardcoded for products
 */

import { getListItemsAction } from '../../utils/getListItemsAction'
import { getListByPath } from '../../../dashboard/actions/getListByPath'
import { getAdminMetaAction } from '../../../dashboard/actions'
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'
import { keystoneClient } from '../../../dashboard/lib/keystoneClient'
import { notFound } from 'next/navigation'
import { ProductListPageClient } from './ProductListPageClient'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function ProductListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Hardcode the list key for products
  const listKey = 'products';

  // Get the list by path using our cached function
  const list = await getListByPath(listKey);

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

  // Build search where clause using dashboard1's proper implementation
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

  // Build GraphQL variables - following the same pattern as existing code
  const variables = {
    where,
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
    orderBy
  }

  // Fetch list items data with cache options
  const cacheOptions = {
    next: {
      tags: [`list-${list.key}`],
      revalidate: 300, // 5 minutes
    },
  }

  // Hardcode selected fields for products
  const selectedFields = [
    'id',
    'title',
    'handle',
    'status',
    'description',
    'thumbnail',
    'createdAt',
    'updatedAt'
  ]

  // Custom GraphQL selection for products with correct schema fields
  const customGraphQLSelection = `
    id
    title
    handle
    status
    description {
      document
    }
    thumbnail
    createdAt
    updatedAt
  `

  // Use dashboard action with custom GraphQL selection
  const response = await getListItemsAction(listKey, variables, selectedFields, cacheOptions, customGraphQLSelection)

  let fetchedData: { items: any[], count: number } = { items: [], count: 0 }
  let error: string | null = null

  if (response.success) {
    fetchedData = response.data
  } else {
    console.error('Error fetching list items:', response.error)
    error = response.error
  }

  // Get adminMeta for the list structure
  const adminMetaResponse = await getAdminMetaAction(list.key)
  
  // Extract the list with proper field metadata if successful
  const adminMetaList = adminMetaResponse.success ? adminMetaResponse.data.list : null
  
  // Create enhanced list with validation data
  const enhancedList = adminMetaList || list

  // Get status counts using proper GraphQL count queries (like orders)
  const statusCountsQuery = `
    query GetProductStatusCounts {
      draft: productsCount(where: { status: { equals: draft } })
      proposed: productsCount(where: { status: { equals: proposed } })
      published: productsCount(where: { status: { equals: published } })
      rejected: productsCount(where: { status: { equals: rejected } })
      all: productsCount
    }
  `;

  const statusCountsResponse = await keystoneClient(statusCountsQuery, {}, cacheOptions);
  
  let statusCounts = {
    all: 0,
    draft: 0,
    proposed: 0,
    published: 0,
    rejected: 0
  }

  if (statusCountsResponse.success) {
    statusCounts = statusCountsResponse.data
  }

  return (
    <ProductListPageClient
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

export default ProductListPage