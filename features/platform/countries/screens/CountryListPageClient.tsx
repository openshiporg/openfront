/**
 * CountryListPageClient - Client Component  
 * Based on dashboard ListPageClient but hardcoded for countries
 */

'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SearchX,
  Table as TableIcon 
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageContainer } from '../../../dashboard/components/PageContainer'
import { PlatformFilterBar } from '../../components/PlatformFilterBar'
import { CountryDetailsComponent } from '../components/CountryDetailsComponent'
import { Pagination } from '../../../dashboard/components/Pagination'
import { FilterList } from '../../../dashboard/components/FilterList'
import { useDashboard } from '../../../dashboard/context/DashboardProvider'
import { useSelectedFields } from '../../../dashboard/hooks/useSelectedFields'
import { useSort } from '../../../dashboard/hooks/useSort'

interface CountryListPageClientProps {
  list: any
  initialData: { items: any[], count: number }
  initialError: string | null
  initialSearchParams: {
    page: number
    pageSize: number  
    search: string
  }
  statusCounts?: null
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {isFiltered ? (
        <>
          <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            No items found. Try adjusting your search or filters.
          </p>
        </>
      ) : (
        <>
          <TableIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items yet</h3>
          <p className="text-muted-foreground">
            Add the first item to see it here.
          </p>
        </>
      )}
    </div>
  )
}

export function CountryListPageClient({ 
  list, 
  initialData, 
  initialError, 
  initialSearchParams,
}: CountryListPageClientProps) {
  const router = useRouter()
  const { basePath } = useDashboard()
  // Hooks for sorting and field selection
  const selectedFields = useSelectedFields(list)
  const sort = useSort(list)

  // Extract data from props
  const data = initialData
  const error = initialError
  const currentPage = initialSearchParams.page
  const pageSize = initialSearchParams.pageSize
  const searchString = initialSearchParams.search

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
    { type: 'page' as const, label: 'Countries' }
  ]

  const header = (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
        Countries
      </h1>
      <p className="text-muted-foreground">
        Create and manage countries
      </p>
    </div>
  )

  // Check if we have any active filters (search or actual filters)
  const hasFilters = !!searchString
  const isFiltered = hasFilters
  const isEmpty = data?.count === 0 && !isFiltered

  return (
    <PageContainer title="Countries" header={header} breadcrumbs={breadcrumbs}>
      {/* Filter Bar - includes search, filters, sorting, and create button */}
      <div className="px-4 md:px-6">
        <PlatformFilterBar list={list} />
      </div>


      {/* Active Filters */}
      <div className="px-4 md:px-6 border-b">
        <FilterList list={list} />
      </div>

      {/* Countries list */}
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
          <EmptyState isFiltered={false} />
        </div>
      ) : data?.count === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyState isFiltered={isFiltered} />
        </div>
      ) : (
        <>
          {/* Data grid - full width */}
          <div className="grid grid-cols-1 divide-y">
            {data?.items?.map((country: any) => (
              <CountryDetailsComponent key={country.id} country={country} list={list} />
            ))}
          </div>
          
          {/* Pagination */}
          {data && data.count > pageSize && (
            <div className="px-4 md:px-6 py-4">
              <Pagination
                currentPage={currentPage}
                total={data.count}
                pageSize={pageSize}
                list={{ singular: 'country', plural: 'countries' }}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
