/**
 * UserListPageClient - Client Component  
 * Based on dashboard ListPageClient but hardcoded for users
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  SearchX,
  CirclePlus,
  Triangle,
  Square,
  Circle,
  Search
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { PageContainer } from '../../../dashboard/components/PageContainer'
import { PlatformFilterBar } from '../../components/PlatformFilterBar'
import { StatusTabs } from '../components/StatusTabs'
import { UserDetailsComponent } from '../components/UserDetailsComponent'
import { Pagination } from '../../../dashboard/components/Pagination'
import { FilterList } from '../../../dashboard/components/FilterList'
import { CreateItemDrawerClientWrapper } from '@/features/platform/components/CreateItemDrawerClientWrapper'
import { useDashboard } from '../../../dashboard/context/DashboardProvider'
import { useSelectedFields } from '../../../dashboard/hooks/useSelectedFields'
import { useSort } from '../../../dashboard/hooks/useSort'
import { useListItemsQuery } from '../../../dashboard/hooks/useListItems.query'
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause'
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause'

interface UserListPageClientProps {
  list: any
  initialData: { items: any[], count: number }
  initialError: string | null
  initialSearchParams: {
    page: number
    pageSize: number  
    search: string
  }
  statusCounts: {
    withAccount: number
    all: number
    withoutAccount: number
  } | null
}

function EmptyStateDefault() {
  return (
    <EmptyState
      title="No Users Created"
      description="You can create a new user to get started."
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

export function UserListPageClient({
  list,
  initialData,
  initialError,
  initialSearchParams,
  statusCounts
}: UserListPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { basePath } = useDashboard()
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)

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

  // For users, use raw GraphQL string to include relationship fields (from working repomix)
  const querySelectedFields = `
    id
    name
    email
    firstName
    lastName
    hasAccount
    role {
      id
      name
    }
    orders {
      id
      displayId
      status
      email
      taxRate
      canceledAt
      createdAt
      updatedAt
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
        variantData
        productData
      }
      total
    }
    createdAt
    updatedAt
  `

  // Use React Query hook with server-side initial data
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
    { type: 'page' as const, label: 'Users' }
  ]

  const header = (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Users
      </h1>
      <p className="text-muted-foreground">
        Create and manage users
      </p>
    </div>
  )

  // Check if we have any active filters (search or actual filters)
  const hasFilters = !!searchString
  const isFiltered = hasFilters
  const isEmpty = data?.count === 0 && !isFiltered

  return (
    <PageContainer title="Users" header={header} breadcrumbs={breadcrumbs}>
      {/* Filter Bar - includes search, filters, sorting, and create button */}
      <div className="px-4 md:px-6">
        <PlatformFilterBar 
          list={list}
          customCreateButton={
            <Button 
              onClick={() => setIsCreateDrawerOpen(true)}
              size="icon"
              className="lg:px-4 lg:py-2 lg:w-auto rounded-lg"
            >
              <CirclePlus />
              <span className="hidden lg:inline">Create {list.singular}</span>
            </Button>
          }
        />
      </div>

      {/* Status Tabs */}
      {statusCounts && (
        <div className="border-b">
          <StatusTabs statusCounts={statusCounts} />
        </div>
      )}

      {/* Active Filters */}
      <div className="px-4 md:px-6 border-b">
        <FilterList list={list} />
      </div>

      {/* Users list */}
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
          {/* Data grid - full width */}
          <div className="grid grid-cols-1 divide-y">
            {data?.items?.map((user: any) => (
              <UserDetailsComponent key={user.id} user={user} list={list} />
            ))}
          </div>
          
          {/* Pagination */}
          {data && data.count > pageSize && (
            <div className="px-4 md:px-6 py-4">
              <Pagination
                currentPage={currentPage}
                total={data.count}
                pageSize={pageSize}
                list={{ singular: 'user', plural: 'users' }}
              />
            </div>
          )}
        </>
      )}

      {/* Create Item Drawer */}
      <CreateItemDrawerClientWrapper
        listKey="users"
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreate={() => {
          window.location.reload();
        }}
      />
    </PageContainer>
  )
}
