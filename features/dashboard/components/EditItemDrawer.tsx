'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fields } from './Fields'
import { useInvalidFields } from '../utils/useInvalidFields'
import { useHasChanges, serializeValueToOperationItem } from '../utils/useHasChanges'
import { enhanceFields } from '../utils/enhanceFields'
import { Button } from '@/components/ui/button'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Undo2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateItemAction, deleteItemAction, getItemAction } from '../actions/item-actions'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Skeleton } from '@/components/ui/skeleton'

interface EditItemDrawerProps {
  listKey: string
  itemId: string
  open: boolean
  onClose: () => void
  onSaved?: () => void
  fields?: string[]
}

interface EditItemDrawerClientProps {
  list: any
  item: Record<string, unknown>
  itemId: string
  open: boolean
  onClose: () => void
  onSaved?: () => void
  fields?: string[]
}

// Hook for event callbacks (from OpenFrontFinal2's ItemPage)
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

// Loading skeleton for the drawer
function LoadingSkeleton() {
  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          <Skeleton className="h-7 w-40" />
        </DrawerTitle>
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="px-2 py-1 bg-muted rounded text-xs h-6 w-60" />
          <div className="h-5 w-5 flex items-center justify-center">
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        </div>
      </DrawerHeader>

      <DrawerBody className="pt-6 space-y-8">
        {/* Form fields */}
        <div className="space-y-8">
          {[1, 2, 3].map((field) => (
            <div key={field} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
              {field === 2 && <Skeleton className="h-3 w-3/4 mt-1" />}
            </div>
          ))}
        </div>
      </DrawerBody>

      <DrawerFooter className="flex justify-between gap-2 pt-4 border-t">
        <Skeleton className="h-10 w-24 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </DrawerFooter>
    </>
  )
}

// Helper function to deserialize item data using enhanced fields (from OpenFrontFinal2's ItemPage)
function deserializeItemToValue(
  enhancedFields: Record<string, any>,
  item: Record<string, unknown | null>
) {
  const result: Record<string, unknown | null> = {}
  
  Object.entries(enhancedFields).forEach(([fieldPath, field]) => {
    try {
      const controller = field.controller
      const itemForField: Record<string, unknown> = {}
      itemForField[field.path] = item?.[field.path] ?? null
      result[fieldPath] = controller.deserialize(itemForField)
    } catch (error) {
      console.error(`Error deserializing field ${fieldPath}:`, error)
    }
  })
  
  return result
}

// Delete Button Component (adapted from OpenFrontFinal2's ItemPage)
function DeleteButton({ 
  list, 
  value, 
  onError,
  onClose
}: { 
  list: any; 
  value: Record<string, unknown>; 
  onError: (error: Error) => void;
  onClose: () => void;
}) {
  const itemId = ((value.id ?? '') as string | number).toString()
  const router = useRouter()

  const handleDelete = useEventCallback(async () => {
    try {
      const { errors } = await deleteItemAction(list.key, itemId)
      
      const error = errors?.find(x => x.path === undefined || x.path?.length === 1)
      if (error) {
        toast.error('Unable to delete item.', {
          action: {
            label: 'Details',
            onClick: () => onError(new Error(error.message))
          }
        })
        return
      }
      
      toast.success(`${list.singular} deleted successfully.`)
      onClose()
      router.push(list.isSingleton ? '/' : `/${list.path}`)
    } catch (err: any) {
      toast.error("Unable to delete item.", {
        action: {
          label: "Details",
          onClick: () => onError(err)
        }
      })
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="text-xs">
          <X className="size-3 shrink-0" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <strong>
              {list.singular}
              {!list.isSingleton && ` ${itemId}`}
            </strong>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Yes, delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Reset Button Component (adapted from OpenFrontFinal2's ItemPage)
function ResetButton(props: { onReset: () => void; hasChanges?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs" disabled={!props.hasChanges}>
          <Undo2 className="size-3 shrink-0" />
          Reset
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset changes</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? Lost changes cannot be recovered.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={props.onReset}>
            Yes, reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Client component that handles the form UI and logic (based on OpenFrontFinal2's ItemPage)
export function EditItemDrawerClient({
  list,
  item,
  itemId,
  open,
  onClose,
  onSaved,
  fields,
}: EditItemDrawerClientProps) {
  // Create enhanced fields like OpenFrontFinal2's ItemPage does
  const enhancedFields = useMemo(() => {
    const allFields = enhanceFields(list.fields || {}, list.key)
    
    // Filter fields if specified
    if (fields) {
      return Object.fromEntries(
        Object.entries(allFields).filter(([path]) => fields.includes(path))
      )
    }
    
    return allFields
  }, [list.fields, list.key, fields])

  // Deserialize the item data once - following OpenFrontFinal2's pattern
  const initialValue = useMemo(() => {
    return deserializeItemToValue(enhancedFields, item)
  }, [enhancedFields, item])

  // State for form values - initialized with deserialized data
  const [value, setValue] = useState(() => initialValue)
  const [loading, setLoading] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [forceValidation, setForceValidation] = useState(false)
  const [errorDialogValue, setErrorDialogValue] = useState<Error | null>(null)

  // Reset value when initialValue changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Create isRequireds object from enhanced fields - exactly like OpenFrontFinal2's ItemPage
  const isRequireds = useMemo(() => {
    const result: Record<string, any> = {}
    
    Object.entries(enhancedFields).forEach(([fieldPath, field]) => {
      result[fieldPath] = field.itemView?.isRequired || false
    })
    
    if (list.adminMetaFields) {
      list.adminMetaFields.forEach((field: any) => {
        if (field.itemView && field.itemView.isRequired !== undefined) {
          result[field.path] = field.itemView.isRequired
        }
      })
    }
    
    return result
  }, [enhancedFields, list.adminMetaFields])

  // Use OpenFrontFinal2's useInvalidFields hook with enhanced fields
  const invalidFields = useInvalidFields(enhancedFields, value, isRequireds)
  
  // Check if we have changes using OpenFrontFinal2's exact pattern with enhanced fields
  const hasChanges = useHasChanges('update', enhancedFields, value, initialValue)

  // Save handler following OpenFrontFinal2's exact pattern with save state
  const handleSave = useEventCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    // Check for invalid fields - exact OpenFrontFinal2 pattern
    const newForceValidation = invalidFields.size !== 0
    setForceValidation(newForceValidation)
    if (newForceValidation) {
      console.log('Validation failed, invalid fields:', Array.from(invalidFields))
      return
    }
    
    setSaveState('saving')
    setLoading(true)
    
    try {
      // Serialize only changed fields - exact OpenFrontFinal2 pattern
      const changedData = serializeValueToOperationItem('update', enhancedFields, value, initialValue)
      
      // Call server action - following OpenFrontFinal2's pattern
      const { errors } = await updateItemAction(list.key, initialValue.id as string, changedData)
      
      // Handle errors exactly like OpenFrontFinal2 does
      const error = errors?.find(x => x.path === undefined || x.path?.length === 1)
      if (error) {
        toast.error('Unable to save item', {
          action: {
            label: 'Details',
            onClick: () => setErrorDialogValue(new Error(error.message))
          }
        })
        setSaveState('idle')
        return
      }
      
      toast.success(`Saved changes to ${list.singular.toLowerCase()}`)
      setSaveState('saved')
      
      // Reset validation state after successful save
      setForceValidation(false)
      
      // Call onSaved callback and close drawer
      if (onSaved) {
        onSaved()
      }
      onClose()
      
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error("Unable to save item", {
        action: {
          label: "Details",
          onClick: () => setErrorDialogValue(error)
        }
      })
      setSaveState('idle')
    } finally {
      setLoading(false)
    }
  })

  // Reset handler
  const handleReset = useCallback(() => {
    setValue(initialValue)
    setForceValidation(false)
  }, [initialValue])

  // Copy ID to clipboard handler
  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(itemId)
    toast.success('ID copied to clipboard')
  }, [itemId])

  if (!item || Object.keys(item).length === 0) {
    return (
      <div className="p-4">
        <Badge
          variant="outline"
          className="items-start gap-4 border p-4 text-destructive"
        >
          <AlertCircle className="h-5 w-5" />
          <div className="flex flex-col">
            <h2 className="uppercase tracking-wide font-medium">
              Item Not Found
            </h2>
            <span>
              The item could not be found or you do not have access to it.
            </span>
          </div>
        </Badge>
      </div>
    )
  }

  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="text-lg">Edit {list.singular}</DrawerTitle>

        <div className="relative border rounded-md bg-muted/40 transition-all">
          <div className="p-1 flex items-center gap-3">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="bg-background shadow-xs border rounded-sm py-0.5 px-1 text-[.65rem] text-muted-foreground">
                  ID
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono truncate">{itemId}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-sm h-6 w-6 flex-shrink-0"
              onClick={handleCopyId}
            >
              <Copy className="size-3" />
              <span className="sr-only">Copy ID</span>
            </Button>
          </div>
        </div>
      </DrawerHeader>

      <DrawerBody className="pt-6">
        {/* Error display */}
        {errorDialogValue && (
          <Badge className="border border-red-200 bg-red-50 text-red-700 items-start gap-4 p-4 mb-6">
            <AlertCircle className="h-5 w-5" />
            <div>
              <h2 className="font-medium">Error</h2>
              <p>{errorDialogValue.message}</p>
            </div>
          </Badge>
        )}

        {/* Status indicators */}
        <div className="flex justify-center mb-4">
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
        </div>

        <Fields
          list={list}
          fields={enhancedFields}
          value={value}
          onChange={setValue}
          forceValidation={forceValidation}
          invalidFields={invalidFields}
          isRequireds={isRequireds}
        />
      </DrawerBody>

      <DrawerFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        {!list.hideDelete && (
          <DeleteButton 
            list={list} 
            value={value} 
            onError={setErrorDialogValue}
            onClose={onClose}
          />
        )}
        {hasChanges && (
          <ResetButton 
            hasChanges={hasChanges} 
            onReset={handleReset}
          />
        )}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || loading || saveState === 'saving'}
        >
          Save Changes
          <Check className="ml-1 stroke-[1.5px]" width="8" height="8" />
        </Button>
      </DrawerFooter>
    </>
  )
}

// Outer component that handles list loading (similar to Dasher 7 but adapted for OpenFrontFinal2)
export function EditItemDrawer({
  listKey,
  itemId,
  open,
  onClose,
  onSaved,
  fields,
}: EditItemDrawerProps) {
  const [list, setList] = useState<any>(null)
  const [item, setItem] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!open) return

      try {
        setIsLoading(true)
        
        // Use OpenFrontFinal2's getItemAction to fetch both list and item data
        const response = await getItemAction({ key: listKey } as any, itemId)

        if (response.success && response.data?.item && response.data?.list) {
          setItem(response.data.item as Record<string, unknown>)
          setList(response.data.list)
        } else {
          console.error('Error fetching item:', response.error || 'Unknown error')
          toast.error('Failed to load item')
          setItem(null)
          setList(null)
        }
      } catch (err) {
        console.error('Error fetching item:', err)
        toast.error('Failed to load item')
        setItem(null)
        setList(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      fetchData()
    }
  }, [listKey, itemId, open])

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <EditItemDrawerClient
            list={list}
            item={item || { id: itemId }}
            itemId={itemId}
            open={open}
            onClose={onClose}
            onSaved={onSaved}
            fields={fields}
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}

export default EditItemDrawer