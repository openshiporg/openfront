/**
 * ProductItemPageClient - Client Component  
 * Based on dashboard ItemPageClient implementation but adapted for platform products
 * Uses platform-specific breadcrumbs and navigation
 */

'use client'

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  AlertCircle,
  Check,
  Copy,
  Loader2,
  Undo2,
  X,
  Package,
  Image,
  Box,
  Tag,
  Building,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateItemAction, deleteItemAction } from '../../../dashboard/actions/item-actions'
import { VariantsTab } from '../components/VariantsTab'

interface ProductItemPageClientProps {
  list: any
  item: Record<string, unknown>
  itemId: string
}

// Hook for event callbacks (from Keystone)
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

// Delete Button Component (adapted from dashboard with responsive design)
function DeleteButton({ 
  list, 
  value, 
  onError,
  isDesktop = true 
}: { 
  list: any; 
  value: Record<string, unknown>; 
  onError: (error: Error) => void;
  isDesktop?: boolean;
}) {
  const itemId = ((value.id ?? '') as string | number).toString()
  const router = useRouter()

  const handleDelete = useEventCallback(async () => {
    try {
      // Call server action - following dashboard's pattern
      const { errors } = await deleteItemAction(list.key, itemId)
      
      // Handle errors exactly like dashboard does
      const error = errors?.find(x => x.path === undefined || x.path?.length === 1)
      if (error) {
        toast.error('Unable to delete product.', {
          action: {
            label: 'Details',
            onClick: () => onError(new Error(error.message))
          }
        })
        return
      }
      
      toast.success(`${list.singular} deleted successfully.`)
      
      // Navigate back to platform products list
      router.push('/dashboard/platform/products')
    } catch (err: any) {
      toast.error("Unable to delete product.", {
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
          {isDesktop ? (
            'Delete'
          ) : (
            <span className="hidden sm:inline">Delete</span>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{' '}
            <strong>
              {list.singular}
              {` ${itemId}`}
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

// Reset Button Component (adapted from dashboard with responsive design)
function ResetButton(props: { onReset: () => void; hasChanges?: boolean; isDesktop?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs" disabled={!props.hasChanges}>
          <Undo2 className="size-3 shrink-0" />
          {props.isDesktop ? (
            'Reset'
          ) : (
            <span className="hidden sm:inline">Reset</span>
          )}
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

// Product Not Found Component (adapted from dashboard)
function ProductNotFound({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 bg-gray-50 rounded-lg p-8">
      <div className="text-gray-400">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold">Not found</h2>
      <div className="text-center max-w-md text-gray-600">
        {children}
      </div>
    </div>
  )
}

// Error Dialog Component (adapted from dashboard)
function ErrorDialog({ error, onClose }: { error: Error; onClose: () => void }) {
  return (
    <AlertDialog open={true} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Error Details</AlertDialogTitle>
          <AlertDialogDescription>
            {error.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Helper function to deserialize item data using enhanced fields - EXACTLY like dashboard
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

// Main ProductItemPageClient component
export function ProductItemPageClient({ list, item, itemId }: ProductItemPageClientProps) {
  const router = useRouter()
  
  // Create enhanced fields like dashboard does
  const enhancedFields = useMemo(() => {
    return enhanceFields(list.fields || {}, list.key)
  }, [list.fields, list.key])
  
  // Deserialize the item data once - following dashboard pattern
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

  // Create isRequireds object from enhanced fields - exactly like dashboard
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

  // Use dashboard's useInvalidFields hook with enhanced fields
  const invalidFields = useInvalidFields(enhancedFields, value, isRequireds)
  
  // Check if we have changes using dashboard's exact pattern with enhanced fields
  const hasChanges = useHasChanges('update', enhancedFields, value, initialValue)

  // Save handler - following dashboard pattern
  const handleSave = useCallback(async () => {
    if (!hasChanges || loading) return

    setLoading(true)
    setSaveState('saving')
    setForceValidation(true)

    // Check for validation errors
    if (invalidFields.size > 0) {
      setLoading(false)
      setSaveState('idle')
      toast.error('Please fix validation errors before saving')
      return
    }

    try {
      // Serialize the value for GraphQL mutation using enhanced fields
      const data = serializeValueToOperationItem('update', enhancedFields, value, initialValue)
      
      // Call the server action to update the item
      const result = await updateItemAction(list.key, itemId, data)
      
      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors[0]?.message || 'Update failed'
        toast.error('Failed to save changes', {
          action: {
            label: 'Details',
            onClick: () => setErrorDialogValue(new Error(errorMessage))
          }
        })
        setLoading(false)
        setSaveState('idle')
        return
      }
      
      toast.success('Changes saved successfully')
      setSaveState('saved')
      
      // Reset form state
      setForceValidation(false)
      
      // Auto-hide saved state after 2 seconds
      setTimeout(() => setSaveState('idle'), 2000)
      
    } catch (error: any) {
      toast.error('Failed to save changes', {
        action: {
          label: 'Details',
          onClick: () => setErrorDialogValue(error)
        }
      })
      setSaveState('idle')
    } finally {
      setLoading(false)
    }
  }, [hasChanges, loading, invalidFields, enhancedFields, value, initialValue, list.key, itemId])

  // Reset handler
  const handleReset = useCallback(() => {
    setValue(initialValue)
    setForceValidation(false)
  }, [initialValue])

  const pageLabel = (item[list.labelField] || item.id || itemId) as string
  const pageTitle = list.isSingleton || typeof pageLabel !== 'string' ? list.label : pageLabel

  // Copy ID to clipboard handler
  const handleCopyId = useCallback(() => {
    navigator.clipboard.writeText(itemId)
    toast.success('ID copied to clipboard')
  }, [itemId])

  // Tab configuration following Dasher7 pattern
  const tabs = [
    {
      id: "general",
      label: "General", 
      icon: Package,
      description: "Basic product information like title, description, and handle",
    },
    {
      id: "media",
      label: "Media",
      icon: Image, 
      description: "Product images and gallery",
    },
    {
      id: "variants",
      label: "Variants",
      icon: Box,
      description: "Product variations, options, and inventory", 
    },
    {
      id: "discounts",
      label: "Discounts & Taxes",
      icon: Tag,
      description: "Pricing rules, discounts, and tax settings",
    },
    {
      id: "organization", 
      label: "Organization",
      icon: Building,
      description: "Categories, collections, tags, and status",
    }
  ]

  // Field distribution by tab following Dasher7 pattern
  const GENERAL_FIELDS = new Set(['title', 'handle', 'description', 'subtitle', 'isGiftcard'])
  const MEDIA_FIELDS = new Set(['productImages'])
  const VARIANT_FIELDS = new Set(['productVariants'])
  const DISCOUNT_TAX_FIELDS = new Set(['discountable', 'discountConditions', 'discountRules', 'taxRates'])
  const ORGANIZATION_FIELDS = new Set(['status', 'productCollections', 'productCategories', 'productTags'])

  // Tab state
  const [activeTab, setActiveTab] = useState('general')

  // Split fields by tab and position
  const fieldsSplit = useMemo(() => {
    const sidebarFields: Record<string, any> = {}
    const generalFields: Record<string, any> = {}
    const mediaFields: Record<string, any> = {}
    const variantFields: Record<string, any> = {}
    const discountTaxFields: Record<string, any> = {}
    const organizationFields: Record<string, any> = {}
    
    Object.entries(enhancedFields).forEach(([key, field]) => {
      const fieldPath = field.path
      
      // Distribute fields by tab
      if (GENERAL_FIELDS.has(fieldPath)) {
        generalFields[key] = field
      } else if (MEDIA_FIELDS.has(fieldPath)) {
        mediaFields[key] = field
      } else if (VARIANT_FIELDS.has(fieldPath)) {
        variantFields[key] = field
      } else if (DISCOUNT_TAX_FIELDS.has(fieldPath)) {
        discountTaxFields[key] = field
      } else if (ORGANIZATION_FIELDS.has(fieldPath)) {
        organizationFields[key] = field
      } else {
        // Default to general tab for unknown fields
        generalFields[key] = field
      }
    })
    
    return { 
      sidebarFields, 
      generalFields, 
      mediaFields, 
      variantFields, 
      discountTaxFields, 
      organizationFields 
    }
  }, [enhancedFields])

  // Get tab error count - check for invalid fields in each tab
  const getTabErrorCount = useCallback((tabId: string) => {
    let fieldsToCheck: Record<string, any> = {}
    
    switch (tabId) {
      case 'general':
        fieldsToCheck = fieldsSplit.generalFields
        break
      case 'media':
        fieldsToCheck = fieldsSplit.mediaFields
        break
      case 'variants':
        fieldsToCheck = fieldsSplit.variantFields
        break
      case 'discounts':
        fieldsToCheck = fieldsSplit.discountTaxFields
        break
      case 'organization':
        fieldsToCheck = fieldsSplit.organizationFields
        break
      default:
        return 0
    }

    let errorCount = 0
    Object.keys(fieldsToCheck).forEach(fieldKey => {
      if (invalidFields.has(fieldKey)) {
        errorCount++
      }
    })
    
    return errorCount
  }, [fieldsSplit, invalidFields])

  // Platform-specific breadcrumb items
  const breadcrumbItems = [
    { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
    { type: 'page' as const, label: 'Platform' },
    { type: 'link' as const, label: 'Products', href: '/dashboard/platform/products' },
    { type: 'page' as const, label: pageLabel }
  ]

  // If product doesn't exist
  if (!item || Object.keys(item).length === 0) {
    return (
      <div className="container mx-auto py-6">
        <ProductNotFound>
          <p>
            The product with ID <strong>"{itemId}"</strong> doesn't exist, or you don't have access to it.
          </p>
        </ProductNotFound>
      </div>
    )
  }

  return (
    <>
      {/* Platform Breadcrumbs */}
      <PageBreadcrumbs items={breadcrumbItems} />
      
      <main className="w-full max-w-5xl p-4 md:p-6 pb-16 lg:pb-6">
        <div className="grid lg:grid-cols-[minmax(240px,2fr)_3fr] gap-6 lg:min-h-[calc(100vh-8rem)]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] flex flex-col">
            <div className="space-y-6 flex-grow overflow-y-auto pb-2">
              <div>
                <h1
                  className="text-lg font-semibold md:text-2xl"
                  title={pageLabel}
                >
                  {pageLabel}
                </h1>
                <div className="mt-6">
                  <div className="relative border rounded-md bg-muted/40 transition-all">
                    <div className="p-1 flex items-center gap-3">
                      <div className="flex gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="bg-background shadow-xs border rounded-sm py-0.5 px-1 text-[.65rem] text-muted-foreground">
                            ID
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono truncate">
                            {itemId}
                          </div>
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
                </div>
              </div>

              {/* Sidebar Fields */}
              {Object.keys(fieldsSplit.sidebarFields).length > 0 && (
                <Fields
                  list={list}
                  fields={fieldsSplit.sidebarFields}
                  value={value}
                  onChange={setValue}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  isRequireds={isRequireds}
                />
              )}
            </div>

            {/* Action buttons - visible only on larger screens */}
            <div className="hidden lg:flex flex-col mr-auto">
              {/* Status indicators above buttons */}
              <div className="flex justify-center mb-2">
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

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {!list.hideDelete && (
                  <DeleteButton 
                    list={list} 
                    value={value} 
                    onError={setErrorDialogValue}
                    isDesktop={true}
                  />
                )}
                {hasChanges && (
                  <ResetButton 
                    hasChanges={hasChanges} 
                    onReset={handleReset}
                    isDesktop={true}
                  />
                )}
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={handleSave}
                  disabled={!hasChanges || loading || saveState === 'saving'}
                >
                  Save Changes
                  <Check className="ml-1 stroke-[1.5px]" width="8" height="8" />
                </Button>
              </div>
            </div>
          </aside>

          {/* Floating action bar - visible only on smaller screens */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 lg:hidden flex flex-col items-center gap-1.5">
            {/* Status indicators above the button container */}
            <div className="flex justify-center">
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

            {/* Button container */}
            <div className="bg-background border rounded-md px-3 py-2 shadow-md w-full">
              <div className="flex flex-wrap items-center gap-2">
                {!list.hideDelete && (
                  <DeleteButton 
                    list={list} 
                    value={value} 
                    onError={setErrorDialogValue}
                    isDesktop={false}
                  />
                )}
                {hasChanges && (
                  <ResetButton 
                    hasChanges={hasChanges} 
                    onReset={handleReset}
                    isDesktop={false}
                  />
                )}
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={handleSave}
                  disabled={!hasChanges || loading || saveState === 'saving'}
                >
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                  <Check className="ml-1 stroke-[1.5px]" width="8" height="8" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main content with tabs */}
          <div className="space-y-6">
            {/* Section Select Dropdown */}
            <div className="mb-4">
              <Label htmlFor="section-select" className="text-sm font-medium mb-2 block">
                Product Section
              </Label>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger
                  id="section-select"
                  className="h-auto ps-3 text-left [&>span]:flex [&>span]:items-center [&>span]:gap-3 [&>span_svg]:shrink-0"
                >
                  <SelectValue placeholder="Choose a section" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-3 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const errorCount = getTabErrorCount(tab.id)
                    const hasError = errorCount > 0

                    return (
                      <SelectItem key={tab.id} value={tab.id}>
                        <span className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg border ${
                            hasError 
                              ? 'border-red-300 bg-red-50 dark:bg-red-950/30' 
                              : 'border-blue-300 bg-blue-50 dark:bg-blue-950/30'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              hasError ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          </div>
                          <span>
                            <span className={`block font-medium ${
                              hasError ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {tab.label}
                              {hasError && (
                                <span className="ml-2 text-xs text-red-600 font-normal">
                                  ({errorCount} ERROR{errorCount > 1 ? 'S' : ''})
                                </span>
                              )}
                            </span>
                            <span className={`text-muted-foreground mt-0.5 block text-xs ${
                              hasError ? 'text-red-700 dark:text-red-300' : ''
                            }`}>
                              {tab.description}
                            </span>
                          </span>
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Section Content */}
            {activeTab === 'general' && Object.keys(fieldsSplit.generalFields).length > 0 && (
              <div className="space-y-6">
                <Fields
                  list={list}
                  fields={fieldsSplit.generalFields}
                  value={value}
                  onChange={setValue}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  isRequireds={isRequireds}
                />
              </div>
            )}

            {activeTab === 'media' && Object.keys(fieldsSplit.mediaFields).length > 0 && (
              <div className="space-y-6">
                <Fields
                  list={list}
                  fields={fieldsSplit.mediaFields}
                  value={value}
                  onChange={setValue}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  isRequireds={isRequireds}
                />
              </div>
            )}

            {activeTab === 'variants' && (
              <div className="space-y-6">
                <VariantsTab product={item} />
              </div>
            )}

            {activeTab === 'discounts' && Object.keys(fieldsSplit.discountTaxFields).length > 0 && (
              <div className="space-y-6">
                <Fields
                  list={list}
                  fields={fieldsSplit.discountTaxFields}
                  value={value}
                  onChange={setValue}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  isRequireds={isRequireds}
                />
              </div>
            )}

            {activeTab === 'organization' && Object.keys(fieldsSplit.organizationFields).length > 0 && (
              <div className="space-y-6">
                <Fields
                  list={list}
                  fields={fieldsSplit.organizationFields}
                  value={value}
                  onChange={setValue}
                  forceValidation={forceValidation}
                  invalidFields={invalidFields}
                  isRequireds={isRequireds}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Error Dialog */}
      {errorDialogValue && (
        <ErrorDialog
          error={errorDialogValue}
          onClose={() => setErrorDialogValue(null)}
        />
      )}
    </>
  )
}

export default ProductItemPageClient
