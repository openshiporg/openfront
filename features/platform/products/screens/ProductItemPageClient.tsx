/**
 * ProductItemPageClient - Modern product edit page
 */

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fields } from '../../../dashboard/components/Fields'
import { PageBreadcrumbs } from '../../../dashboard/components/PageBreadcrumbs'
import { useInvalidFields } from '../../../dashboard/utils/useInvalidFields'
import { useHasChanges, serializeValueToOperationItem } from '../../../dashboard/utils/useHasChanges'
import { enhanceFields } from '../../../dashboard/utils/enhanceFields'
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
import { 
  Check,
  Copy,
  Trash2,
  RotateCcw,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateItemAction, deleteItemAction } from '../../../dashboard/actions/item-actions'
import { VariantsTab } from '../components/VariantsTab'
import { MediaTab } from '../components/MediaTab'

interface ProductItemPageClientProps {
  list: any
  item: Record<string, unknown>
  itemId: string
}

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

function DeleteButton({ list, value, onError }: { list: any; value: Record<string, unknown>; onError: (error: Error) => void }) {
  const itemId = ((value.id ?? '') as string | number).toString()
  const router = useRouter()

  const handleDelete = useEventCallback(async () => {
    try {
      const { errors } = await deleteItemAction(list.key, itemId)
      const error = errors?.find(x => x.path === undefined || x.path?.length === 1)
      if (error) {
        toast.error('Unable to delete product.', { action: { label: 'Details', onClick: () => onError(new Error(error.message)) } })
        return
      }
      toast.success(`${list.singular} deleted successfully.`)
      router.push('/dashboard/platform/products')
    } catch (err: any) {
      toast.error("Unable to delete product.", { action: { label: "Details", onClick: () => onError(err) } })
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function deserializeItemToValue(enhancedFields: Record<string, any>, item: Record<string, unknown | null>) {
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

export function ProductItemPageClient({ list, item, itemId }: ProductItemPageClientProps) {
  const router = useRouter()
  
  const enhancedFields = useMemo(() => enhanceFields(list.fields || {}, list.key), [list.fields, list.key])
  const initialValue = useMemo(() => deserializeItemToValue(enhancedFields, item), [enhancedFields, item])
  
  const [value, setValue] = useState(() => initialValue)
  const [loading, setLoading] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [forceValidation, setForceValidation] = useState(false)
  const [errorDialogValue, setErrorDialogValue] = useState<Error | null>(null)
  
  useEffect(() => { setValue(initialValue) }, [initialValue])

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

  const invalidFields = useInvalidFields(enhancedFields, value, isRequireds)
  const hasChanges = useHasChanges('update', enhancedFields, value, initialValue)

  const handleSave = useCallback(async () => {
    if (!hasChanges || loading) return
    setLoading(true)
    setSaveState('saving')
    setForceValidation(true)

    if (invalidFields.size > 0) {
      setLoading(false)
      setSaveState('idle')
      toast.error('Please fix validation errors before saving')
      return
    }

    try {
      const data = serializeValueToOperationItem('update', enhancedFields, value, initialValue)
      const result = await updateItemAction(list.key, itemId, data)
      
      if (result.errors && result.errors.length > 0) {
        toast.error('Failed to save changes', { action: { label: 'Details', onClick: () => setErrorDialogValue(new Error(result.errors[0]?.message || 'Update failed')) } })
        setLoading(false)
        setSaveState('idle')
        return
      }
      
      toast.success('Saved')
      setSaveState('saved')
      setForceValidation(false)
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (error: any) {
      toast.error('Failed to save changes', { action: { label: 'Details', onClick: () => setErrorDialogValue(error) } })
      setSaveState('idle')
    } finally {
      setLoading(false)
    }
  }, [hasChanges, loading, invalidFields, enhancedFields, value, initialValue, list.key, itemId])

  const handleReset = useCallback(() => {
    setValue(initialValue)
    setForceValidation(false)
  }, [initialValue])

  const pageLabel = (item[list.labelField] || item.id || itemId) as string

  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(itemId)
    toast.success('Copied')
  }, [itemId])

  const GENERAL_FIELDS = new Set(['title', 'handle', 'description', 'subtitle', 'isGiftcard'])
  const STATUS_FIELDS = new Set(['status'])
  const ORGANIZATION_FIELDS = new Set(['productCollections', 'productCategories', 'productTags'])
  const DISCOUNT_TAX_FIELDS = new Set(['discountable', 'taxRates'])

  const fieldsSplit = useMemo(() => {
    const generalFields: Record<string, any> = {}
    const statusFields: Record<string, any> = {}
    const organizationFields: Record<string, any> = {}
    const discountTaxFields: Record<string, any> = {}
    
    Object.entries(enhancedFields).forEach(([key, field]) => {
      const fieldPath = field.path
      if (GENERAL_FIELDS.has(fieldPath)) generalFields[key] = field
      else if (STATUS_FIELDS.has(fieldPath)) statusFields[key] = field
      else if (ORGANIZATION_FIELDS.has(fieldPath)) organizationFields[key] = field
      else if (DISCOUNT_TAX_FIELDS.has(fieldPath)) discountTaxFields[key] = field
    })
    
    return { generalFields, statusFields, organizationFields, discountTaxFields }
  }, [enhancedFields])

  const breadcrumbItems = [
    { type: 'link' as const, label: 'Platform', href: '/platform' },
    { type: 'link' as const, label: 'Products', href: '/platform/products' },
    { type: 'page' as const, label: pageLabel }
  ]

  if (!item || Object.keys(item).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-muted-foreground/50 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">Product not found</p>
      </div>
    )
  }

  return (
    <>
      <PageBreadcrumbs 
        items={breadcrumbItems} 
        actions={
          <div className="flex items-center gap-1">
            {!list.hideDelete && <DeleteButton list={list} value={value} onError={setErrorDialogValue} />}
            {hasChanges && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground">
                <RotateCcw className="size-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || loading}
              className="ml-2"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              <span className="ml-1.5">{loading ? 'Saving' : 'Save'}</span>
            </Button>
          </div>
        }
      />
      
      <main className="w-full max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          {/* Main Content */}
          <div className="space-y-12">
            {/* General */}
            {Object.keys(fieldsSplit.generalFields).length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-6">General</h2>
                <Fields
                  list={list}
                  fields={fieldsSplit.generalFields}
                  value={value}
                  onChange={setValue}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  isRequireds={isRequireds}
                />
              </section>
            )}

            {/* Media */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-6">Media</h2>
              <MediaTab product={item} />
            </section>

            {/* Variants */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-6">Variants</h2>
              <VariantsTab product={item} />
            </section>

            {/* Pricing */}
            {Object.keys(fieldsSplit.discountTaxFields).length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-muted-foreground mb-6">Pricing & Discounts</h2>
                <Fields
                  list={list}
                  fields={fieldsSplit.discountTaxFields}
                  value={value}
                  onChange={setValue}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  isRequireds={isRequireds}
                />
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {/* ID */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Product ID</h3>
              <button
                onClick={handleCopyId}
                className="group flex items-center gap-2 w-full text-left"
              >
                <code className="text-xs font-mono text-muted-foreground truncate flex-1">
                  {itemId}
                </code>
                <Copy className="size-3 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
              </button>
            </div>

            {/* Status */}
            {Object.keys(fieldsSplit.statusFields).length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Status</h3>
                <Fields
                  list={list}
                  fields={fieldsSplit.statusFields}
                  value={value}
                  onChange={setValue}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  isRequireds={isRequireds}
                />
              </div>
            )}
          </aside>
        </div>
      </main>

      {errorDialogValue && (
        <AlertDialog open={true} onOpenChange={() => setErrorDialogValue(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{errorDialogValue.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorDialogValue(null)}>Close</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

export default ProductItemPageClient
