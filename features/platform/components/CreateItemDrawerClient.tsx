'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Fields } from '../../dashboard/components/Fields'
import { useInvalidFields } from '../../dashboard/utils/useInvalidFields'
import { useHasChanges, serializeValueToOperationItem } from '../../dashboard/utils/useHasChanges'
import { enhanceFields } from '../../dashboard/utils/enhanceFields'
import { createItemAction } from '../../dashboard/actions/item-actions'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateItemDrawerClientProps {
  list: any
  onClose: () => void
  onCreate?: (newItem: any) => void
}

// Hook for event callbacks (copied from ItemPageClient)
function useEventCallback<Func extends (...args: any[]) => unknown>(callback: Func): Func {
  const callbackRef = useRef(callback)
  const cb = useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, [])
  useEffect(() => {
    callbackRef.current = callback
  })
  return cb as any
}

// Helper function to create initial values for creation (matches dashboard useCreateItem pattern)
function createInitialValue(enhancedFields: Record<string, any>) {
  const result: Record<string, any> = {}
  
  // Initialize each field with its default value from the controller (exact dashboard pattern)
  Object.entries(enhancedFields).forEach(([key, field]: [string, any]) => {
    if (field.controller?.defaultValue !== undefined) {
      result[key] = field.controller.defaultValue
    }
  })
  
  return result
}

export function CreateItemDrawerClient({ 
  list, 
  onClose, 
  onCreate 
}: CreateItemDrawerClientProps) {
  // Create enhanced fields exactly like ItemPageClient does
  const enhancedFields = useMemo(() => {
    return enhanceFields(list.fields || {}, list.key)
  }, [list.fields, list.key])

  // Create initial value for new item
  const initialValue = useMemo(() => {
    return createInitialValue(enhancedFields)
  }, [enhancedFields])

  // State exactly like ItemPageClient
  const [value, setValue] = useState(() => initialValue)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [forceValidation, setForceValidation] = useState(false)

  // Reset value when initialValue changes (like ItemPageClient)
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Create isRequireds object exactly like ItemPageClient
  const isRequireds = useMemo(() => {
    const result: Record<string, any> = {}
    
    Object.entries(enhancedFields).forEach(([fieldPath, field]) => {
      result[fieldPath] = field.itemView?.isRequired || false
    })
    
    // Override with dynamic adminMeta data if available
    if (list.adminMetaFields) {
      list.adminMetaFields.forEach((field: any) => {
        if (field.itemView && field.itemView.isRequired !== undefined) {
          result[field.path] = field.itemView.isRequired
        }
      })
    }
    
    return result
  }, [enhancedFields, list.adminMetaFields])

  // Validation exactly like ItemPageClient
  const invalidFields = useInvalidFields(
    enhancedFields,
    value,
    isRequireds,
    forceValidation
  )

  // Track changes (for create, we check if anything was entered)
  const hasChanges = useHasChanges('create', enhancedFields, value, initialValue)

  // Handle field changes exactly like ItemPageClient
  const onFieldChange = useEventCallback((fieldPath: string, newValue: any) => {
    setValue(prev => ({
      ...prev,
      [fieldPath]: newValue
    }))
  })

  // Handle save (create new item)
  const handleSave = useEventCallback(async () => {
    if (saveState !== 'idle') return

    // Force validation
    setForceValidation(true)
    
    // Check if we have validation errors
    if (invalidFields.size > 0) {
      toast.error('Please fix the validation errors before saving')
      return
    }

    try {
      setSaveState('saving')
      
      // Serialize data for creation
      const data = serializeValueToOperationItem('create', enhancedFields, value, initialValue)
      
      // Call create action
      const result = await createItemAction(list.key, data)
      
      if (result.errors && result.errors.length > 0) {
        // Handle GraphQL errors
        const error = result.errors.find(x => x.path === undefined || x.path?.length === 1)
        if (error) {
          toast.error('Unable to create item', {
            description: error.message
          })
          setSaveState('idle')
          return
        }
      }
      
      // Success
      setSaveState('saved')
      toast.success(`${list.singular} created successfully`)
      
      // Call onCreate callback if provided
      if (onCreate && result.data) {
        onCreate(result.data)
      }
      
      // Close drawer after short delay
      setTimeout(() => {
        onClose()
        setSaveState('idle')
      }, 1000)
      
    } catch (error) {
      console.error('Error creating item:', error)
      toast.error('Failed to create item')
      setSaveState('idle')
    }
  })

  // Render validation badge
  const renderValidationBadge = () => {
    if (invalidFields.size === 0) return null
    
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        {invalidFields.size} error{invalidFields.size === 1 ? '' : 's'}
      </Badge>
    )
  }

  // Render changes badge
  const renderChangesBadge = () => {
    if (!hasChanges) return null
    
    return (
      <Badge variant="secondary" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Unsaved changes
      </Badge>
    )
  }

  return (
    <>
      <DrawerHeader className="flex-shrink-0">
        <DrawerTitle>Create {list.singular}</DrawerTitle>
        <DrawerDescription>
          Create a new {list.singular.toLowerCase()} item
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Fields
            fields={enhancedFields}
            value={value}
            onChange={onFieldChange}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
            isRequireds={isRequireds}
            view="createView"
            groups={list.groups}
          />
        </div>
      </div>

      <DrawerFooter className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {renderValidationBadge()}
            {renderChangesBadge()}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saveState === 'saving'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveState === 'saving' || !hasChanges || invalidFields.size > 0}
              className="min-w-[120px]"
            >
              {saveState === 'saving' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : saveState === 'saved' ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Created!
                </>
              ) : (
                `Create ${list.singular}`
              )}
            </Button>
          </div>
        </div>
      </DrawerFooter>
    </>
  )
}