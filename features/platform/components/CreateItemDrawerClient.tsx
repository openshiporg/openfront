'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Fields } from '../../dashboard/components/Fields'
import { enhanceFields } from '../../dashboard/utils/enhanceFields'
import { useCreateItem } from '../../dashboard/utils/useCreateItem'
import { AlertCircle, Check, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreateItemDrawerClientProps {
  list: any
  onClose: () => void
  onCreate?: (newItem: any) => void
}

export function CreateItemDrawerClient({ 
  list, 
  onClose, 
  onCreate 
}: CreateItemDrawerClientProps) {
  // Create enhanced fields exactly like CreatePageClient does
  const enhancedFields = useMemo(() => {
    return enhanceFields(list.fields || {}, list.key)
  }, [list.fields, list.key])
  
  // Use the create item hook with enhanced fields (same as CreatePageClient)
  const createItem = useCreateItem(list, enhancedFields)

  // Create handler exactly like CreatePageClient but adapted for drawer
  const handleCreate = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!createItem) return
    
    try {
      const item = await createItem.create()
      if (item?.id) {
        toast.success(`Created ${list.singular.toLowerCase()} successfully`)
        
        // Call onCreate callback if provided
        if (onCreate) {
          onCreate(item)
        }
        
        // Close drawer after successful creation
        onClose()
      } else {
        console.error('No item.id in response:', item)
        toast.error('Failed to create item - no ID returned')
      }
    } catch (error: any) {
      console.error('Create error:', error)
      toast.error('Unable to create item', {
        description: error.message
      })
    }
  }, [createItem, list, onCreate, onClose])

  const handleCancel = () => {
    onClose()
  }

  if (!list) {
    return (
      <>
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Error</DrawerTitle>
        </DrawerHeader>
        <div className="p-6 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The requested list was not found.
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  if (!createItem) {
    return (
      <>
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Error</DrawerTitle>
        </DrawerHeader>
        <div className="p-6 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to initialize creation form for {list.label}.
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  return (
    <>
      <DrawerHeader className="flex-shrink-0">
        <DrawerTitle>Create {list.singular}</DrawerTitle>
        <DrawerDescription>
          Add a new {list.singular.toLowerCase()}
        </DrawerDescription>
      </DrawerHeader>
      
      <form onSubmit={handleCreate} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-4">
          {/* GraphQL errors (same pattern as CreatePageClient) */}
          {(createItem.error?.networkError || createItem.error?.graphQLErrors?.length) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {createItem.error.networkError?.message || 
                 createItem.error.graphQLErrors?.[0]?.message ||
                 'An error occurred while creating the item'
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Fields using same pattern as CreatePageClient */}
          <Fields
            {...createItem.props}
            fields={enhancedFields}
            view="createView"
            groups={list.groups}
          />
        </div>

        <DrawerFooter className="flex-shrink-0 border-t">
          {/* Status indicators */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {createItem.state === 'loading' && (
                <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Creating...</span>
                </div>
              )}
              {createItem.invalidFields.size > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {createItem.invalidFields.size} invalid field{createItem.invalidFields.size === 1 ? '' : 's'}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createItem.state === 'loading'}
              className="min-w-[120px]"
            >
              {createItem.state === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  Create {list.singular}
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </>
  )
}