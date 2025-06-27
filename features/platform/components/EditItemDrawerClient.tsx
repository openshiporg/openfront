'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Fields } from '../../dashboard/components/Fields'
import { useInvalidFields } from '../../dashboard/utils/useInvalidFields'
import { useHasChanges, serializeValueToOperationItem } from '../../dashboard/utils/useHasChanges'
import { enhanceFields } from '../../dashboard/utils/enhanceFields'
import { updateItemAction } from '../../dashboard/actions/item-actions'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface EditItemDrawerClientProps {
  list: any
  item: Record<string, unknown>
  itemId: string
  onClose: () => void
  onSave?: (updatedItem: any) => void
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

// Helper function to deserialize item data using enhanced fields (copied from ItemPageClient)
function deserializeItemToValue(
  enhancedFields: Record<string, any>,
  item: Record<string, unknown | null>
) {
  const result: Record<string, unknown | null> = {}
  
  Object.entries(enhancedFields).forEach(([fieldPath, field]) => {
    try {
      // Enhanced fields already have controllers
      const controller = field.controller
      
      // Create itemForField with only the GraphQL fields this controller needs
      const itemForField: Record<string, unknown> = {}
      // For now, just use the field path as the GraphQL field
      itemForField[field.path] = item?.[field.path] ?? null
      
      // Call deserialize with the properly structured data
      result[fieldPath] = controller.deserialize(itemForField)
    } catch (error) {
      console.error(`Error deserializing field ${fieldPath}:`, error)
    }
  })
  
  return result
}

export function EditItemDrawerClient({ 
  list, 
  item, 
  itemId, 
  onClose, 
  onSave 
}: EditItemDrawerClientProps) {
  // Create enhanced fields exactly like ItemPageClient does
  const enhancedFields = useMemo(() => {
    return enhanceFields(list.fields || {}, list.key)
  }, [list.fields, list.key])

  // Deserialize the item data exactly like ItemPageClient
  const initialValue = useMemo(() => {
    return deserializeItemToValue(enhancedFields, item)
  }, [enhancedFields, item])

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

  // Use validation and change detection exactly like ItemPageClient
  const invalidFields = useInvalidFields(enhancedFields, value, isRequireds)
  const hasChanges = useHasChanges('update', enhancedFields, value, initialValue)

  // Save handler exactly like ItemPageClient
  const handleSave = useEventCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    // Check for invalid fields - exact ItemPageClient pattern
    const newForceValidation = invalidFields.size !== 0
    setForceValidation(newForceValidation)
    if (newForceValidation) {
      console.log('Validation failed, invalid fields:', Array.from(invalidFields))
      return
    }
    
    setSaveState('saving')
    
    try {
      // Serialize only changed fields - exact ItemPageClient pattern
      const changedData = serializeValueToOperationItem('update', enhancedFields, value, initialValue)
      
      console.log('Saving item with data:', {
        id: initialValue.id,
        data: changedData,
        hasChanges: Object.keys(changedData).length > 0
      })
      
      // Call server action - exactly like ItemPageClient
      const { errors } = await updateItemAction(list.key, initialValue.id as string, changedData)
      
      // Handle errors exactly like ItemPageClient
      const error = errors?.find(x => x.path === undefined || x.path?.length === 1)
      if (error) {
        toast.error('Unable to save item', {
          description: error.message
        })
        setSaveState('idle')
        return
      }
      
      toast.success(`Saved changes to ${list.singular.toLowerCase()}`)
      setSaveState('saved')
      
      // Reset validation state after successful save
      setForceValidation(false)
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(item)
      }
      
      // Reset to idle after showing saved state
      setTimeout(() => setSaveState('idle'), 2000)
      
      // Close drawer after successful save
      setTimeout(() => onClose(), 2500)
      
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error('Unable to save item', {
        description: error.message
      })
      setSaveState('idle')
    }
  })

  const handleCancel = () => {
    onClose()
  }

  return (
    <>
      <DrawerHeader className="flex-shrink-0">
        <DrawerTitle>Edit {list.singular}</DrawerTitle>
        <DrawerDescription>
          Make changes to this {list.singular.toLowerCase()}
        </DrawerDescription>
      </DrawerHeader>
      
      <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto px-4">
          <Fields
            list={list}
            fields={enhancedFields}
            value={value}
            onChange={setValue}
            forceValidation={forceValidation}
            invalidFields={invalidFields}
            isRequireds={isRequireds}
          />
        </div>

        <DrawerFooter className="flex-shrink-0 border-t">
          {/* Status indicators */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {saveState === 'saving' && (
                <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Saving...</span>
                </div>
              )}
              {saveState === 'saved' && (
                <div className="flex items-center gap-x-1.5 text-xs text-emerald-500">
                  <Check className="h-3.5 w-3.5" />
                  <span>Saved</span>
                </div>
              )}
              {invalidFields.size > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {invalidFields.size} invalid field{invalidFields.size === 1 ? '' : 's'}
                </Badge>
              )}
              {hasChanges && saveState !== 'saved' && (
                <Badge variant="outline" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saveState === 'saving' || !hasChanges}
              className="min-w-[100px]"
            >
              {saveState === 'saving' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : saveState === 'saved' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </>
  )
}
