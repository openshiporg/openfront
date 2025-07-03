'use client'

import React, { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateItemDrawerClient } from './CreateItemDrawerClient'
import { getListByPath } from '@/features/dashboard/actions/getListByPath'
import { toast } from 'sonner'

interface CreateItemDrawerClientWrapperProps {
  listKey: string
  open: boolean
  onClose: () => void
  onCreate?: (newItem: any) => void
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-6 border-b">
        <Skeleton className="h-6 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex-1 p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex-shrink-0 p-6 border-t">
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

// Client Component Wrapper - handles data fetching on client side
export function CreateItemDrawerClientWrapper({
  listKey,
  open,
  onClose,
  onCreate
}: CreateItemDrawerClientWrapperProps) {
  const [list, setList] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!open) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch list metadata
        const listData = await getListByPath(listKey)
        if (!listData) {
          setError(`List not found: ${listKey}`)
          return
        }
        setList(listData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        toast.error('Failed to load list data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [listKey, open])

  // If not open, render empty drawer
  if (!open) {
    return (
      <Drawer open={false} onOpenChange={onClose}>
        <DrawerContent />
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="flex flex-col">
        {isLoading ? (
          <>
            <DrawerHeader className="flex-shrink-0">
              <DrawerTitle>Loading...</DrawerTitle>
            </DrawerHeader>
            <LoadingSkeleton />
          </>
        ) : error ? (
          <>
            <DrawerHeader className="flex-shrink-0">
              <DrawerTitle>Error</DrawerTitle>
            </DrawerHeader>
            <div className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          </>
        ) : list ? (
          <CreateItemDrawerClient
            list={list}
            onClose={onClose}
            onCreate={onCreate}
          />
        ) : (
          <>
            <DrawerHeader className="flex-shrink-0">
              <DrawerTitle>Error</DrawerTitle>
            </DrawerHeader>
            <div className="p-6 text-center">
              <p className="text-destructive">Failed to load data</p>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}