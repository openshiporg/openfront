/**
 * OrderListPage - Server Component
 * Based on dashboard ListPage but hardcoded for orders
 */

import { getListItemsAction } from '../../utils/getListItemsAction'
import { getListByPath } from '../../../dashboard/actions/getListByPath'
import { getAdminMetaAction } from '../../../dashboard/actions'
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'
import { notFound } from 'next/navigation'
import { OrderListPageClient } from './OrderListPageClient'
import { getOrderStatusCounts } from '../actions'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function OrderListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Hardcode the list key for orders
  const listKeyPath = 'orders';

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

  // Hardcode selected fields for orders
  const selectedFields = [
    'id',
    'displayId', 
    'status',
    'email',
    'taxRate',
    'canceledAt',
    'createdAt',
    'updatedAt',
    'total',
    'subtotal',
    'shipping',
    'tax',
    'currency',
    'fulfillmentStatus',
    'user',
    'shippingAddress',
    'billingAddress',
    'lineItems'
  ]

  // Custom GraphQL selection for orders with all nested fields
  const customGraphQLSelection = `
    id
    displayId
    status
    email
    taxRate
    canceledAt
    createdAt
    updatedAt
    total
    subtotal
    shipping
    tax
    fulfillmentStatus
    currency {
      id
      code
      symbol
    }
    user {
      id
      name
      email
    }
    shippingAddress {
      id
      company
      firstName
      lastName
      address1
      address2
      city
      province
      postalCode
      phone
    }
    billingAddress {
      id
      company
      firstName
      lastName
      address1
      address2
      city
      province
      postalCode
      phone
    }
    lineItems {
      id
      title
      quantity
      sku
      thumbnail
      formattedUnitPrice
      formattedTotal
      variantTitle
      variantData
      productData
    }
  `

  // Use dashboard action with custom GraphQL selection
  const response = await getListItemsAction(listKeyPath, variables, selectedFields, cacheOptions, customGraphQLSelection)

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

  // Get status counts using Dasher 7 function
  const statusCountsResponse = await getOrderStatusCounts()
  let statusCounts = {
    pending: 0,
    requires_action: 0,
    completed: 0,
    archived: 0,
    canceled: 0,
    all: 0,
  }

  if (statusCountsResponse.success) {
    statusCounts = statusCountsResponse.data
  } else {
    console.error('Error fetching order status counts:', statusCountsResponse.error)
  }

  return (
    <OrderListPageClient
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

export default OrderListPage