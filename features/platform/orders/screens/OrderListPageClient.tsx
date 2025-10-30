/**
 * OrderListPageClient - Client Component  
 * Based on dashboard ListPageClient but hardcoded for orders
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  SearchX,
  Triangle,
  Square,
  Circle,
  Search
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { PageContainer } from '../../../dashboard/components/PageContainer'
import { PlatformFilterBar } from '../../components/PlatformFilterBar'
import { StatusTabs } from '../components/StatusTabs'
import { OrderDetailsComponent } from '../components/OrderDetailsComponent'
import { Pagination } from '../../../dashboard/components/Pagination'
import { FilterList } from '../../../dashboard/components/FilterList'
import { useDashboard } from '../../../dashboard/context/DashboardProvider'
import { useSelectedFields } from '../../../dashboard/hooks/useSelectedFields'
import { useSort } from '../../../dashboard/hooks/useSort'
import { useListItemsQuery } from '../../../dashboard/hooks/useListItems.query'
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'

interface OrderListPageClientProps {
  list: any
  initialData: { items: any[], count: number }
  initialError: string | null
  initialSearchParams: {
    page: number
    pageSize: number  
    search: string
  }
  statusCounts?: {
    pending: number
    requires_action: number
    completed: number
    archived: number
    canceled: number
    all: number
  }
}

function EmptyStateDefault() {
  return (
    <EmptyState
      title="No Orders Created"
      description="You can create a new order to get started."
      icons={[Triangle, Square, Circle]}
    />
  )
}

function EmptyStateSearch({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <EmptyState
      title="No Results Found"
      description="Try adjusting your search filters."
      icons={[Search]}
      action={{
        label: "Reset Filters",
        onClick: onResetFilters
      }}
    />
  )
}


export function OrderListPageClient({
  list,
  initialData,
  initialError,
  initialSearchParams,
  statusCounts
}: OrderListPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { basePath } = useDashboard()
  // Hooks for sorting and field selection
  const selectedFields = useSelectedFields(list)
  const sort = useSort(list)

  // Extract current search params (reactive to URL changes)
  const currentSearchParams = useMemo(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])

  const currentPage = parseInt(currentSearchParams.page || '1', 10) || 1
  const pageSize = parseInt(currentSearchParams.pageSize || list.pageSize?.toString() || '50', 10)
  const searchString = currentSearchParams.search || ''

  // Build query variables from current search params
  const variables = useMemo(() => {
    const orderBy = buildOrderByClause(list, currentSearchParams)
    const filterWhere = buildWhereClause(list, currentSearchParams)
    const searchParameters = searchString ? { search: searchString } : {}
    const searchWhere = buildWhereClause(list, searchParameters)

    // Combine search and filters
    const whereConditions = []
    if (Object.keys(searchWhere).length > 0) {
      whereConditions.push(searchWhere)
    }
    if (Object.keys(filterWhere).length > 0) {
      whereConditions.push(filterWhere)
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

    return {
      where,
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy
    }
  }, [list, currentSearchParams, currentPage, pageSize, searchString])

  // For orders, use raw GraphQL string to include relationship fields (same as server)
  const querySelectedFields = `
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
      moneyAmount {
        id
        amount
        originalAmount
      }
    }
    returns {
      id
      status
      refundAmount
      receivedAt
      createdAt
      updatedAt
      returnItems {
        id
        quantity
        note
        lineItem {
          id
          title
        }
        returnReason {
          id
          label
          value
        }
      }
    }
    claimOrders {
      id
      type
      paymentStatus
      fulfillmentStatus
      refundAmount
      canceledAt
      createdAt
      updatedAt
      claimItems {
        id
        reason
        quantity
        note
        lineItem {
          id
          title
        }
        claimImages {
          id
          url
          altText
        }
        claimTags {
          id
          value
          description
        }
      }
    }
  `

  // Use React Query hook with server-side initial data
  const { data: queryData, error: queryError, isLoading, isFetching } = useListItemsQuery(
    {
      listKey: list.key,
      variables,
      selectedFields: querySelectedFields
    },
    {
      initialData: initialError ? undefined : initialData,
    }
  )

  // Use query data, fallback to initial data
  const data = queryData || initialData
  const error = queryError ? queryError.message : initialError

  // Handle page change - simplified since FilterBar handles search/filters
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(window.location.search)
    
    if (newPage && newPage > 1) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.push(newUrl)
  }, [router])

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    router.push(window.location.pathname)
  }, [router])

  if (!list) {
    return (
      <PageContainer title="List not found">
        <Alert variant="destructive">
          <AlertDescription>
            The requested list was not found.
          </AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  const breadcrumbs = [
    { type: 'link' as const, label: 'Dashboard', href: basePath },
    { type: 'page' as const, label: 'Platform' },
    { type: 'page' as const, label: 'Orders' }
  ]

  const header = (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Orders
      </h1>
      <p className="text-muted-foreground">
        Create and manage orders
      </p>
    </div>
  )

  // Check if we have any active filters (search or actual filters)
  const hasFilters = !!searchString
  const isFiltered = hasFilters
  const isEmpty = data?.count === 0 && !isFiltered

  return (
    <PageContainer title="Orders" header={header} breadcrumbs={breadcrumbs}>
      {/* Filter Bar - includes search, filters, sorting, field selection, and create button */}
      <div className="px-4 md:px-6">
        <PlatformFilterBar list={list} />
      </div>

      {/* Status Tabs - abstracted status filtering */}
      {statusCounts && (
        <div className="border-b">
          <StatusTabs 
            statusCounts={statusCounts} 
            statusConfig={{
              pending: { label: "Pending", color: "blue" },
              completed: { label: "Completed", color: "emerald" },
              archived: { label: "Archived", color: "zinc" },
              canceled: { label: "Canceled", color: "rose" },
              requires_action: { label: "Requires Action", color: "orange" },
            }}
            entityName="Orders"
          />
        </div>
      )}

      {/* Active Filters */}
      <div className="px-4 md:px-6 border-b">
        <FilterList list={list} />
      </div>

      {/* Data table - full width */}
      {error ? (
        <div className="px-4 md:px-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load items: {error}
            </AlertDescription>
          </Alert>
        </div>
      ) : isEmpty ? (
        <div className="px-4 md:px-6">
          <EmptyStateDefault />
        </div>
      ) : data?.count === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyStateSearch onResetFilters={handleResetFilters} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 divide-y">
            {data?.items?.map((order: any) => (
              <OrderDetailsComponent key={order.id} order={order} list={list} />
            ))}
          </div>
          
          {/* Pagination */}
          {data && data.count > pageSize && (
            <div className="px-4 md:px-6 py-4">
              <Pagination
                currentPage={currentPage}
                total={data.count}
                pageSize={pageSize}
                list={{ singular: 'order', plural: 'orders' }}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}