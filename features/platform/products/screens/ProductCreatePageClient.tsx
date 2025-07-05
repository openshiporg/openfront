/**
 * ProductCreatePageClient for Platform Products
 * Client component with form functionality matching dashboard CreatePage layout
 * Adapted for platform navigation and breadcrumbs
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, ArrowLeft, AlertTriangle, Loader2, Check, X, Package, Image, Box, Tag, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { PageBreadcrumbs } from '../../../dashboard/components/PageBreadcrumbs'
import { Fields } from '../../../dashboard/components/Fields'
import { useCreateItem } from '../../../dashboard/utils/useCreateItem'
import { enhanceFields } from '../../../dashboard/utils/enhanceFields'
import { VariantsTab } from '../components/VariantsTab'

interface ProductCreatePageClientProps {
  listKey: string
  list: any
}

// Cancel Button Component (matches dashboard ItemPage pattern)
function CancelButton({ 
  onCancel,
  isDesktop = true 
}: { 
  onCancel: () => void;
  isDesktop?: boolean;
}) {
  return (
    <Button variant="outline" size="sm" className="text-xs" onClick={onCancel}>
      <X className="size-3 shrink-0" />
      {isDesktop ? (
        'Cancel'
      ) : (
        <span className="hidden sm:inline">Cancel</span>
      )}
    </Button>
  )
}

export function ProductCreatePageClient({ listKey, list }: ProductCreatePageClientProps) {
  const router = useRouter()
  
  // Create enhanced fields like Keystone does - same pattern as dashboard
  const enhancedFields = useMemo(() => {
    return enhanceFields(list.fields || {}, list.key)
  }, [list.fields, list.key])
  
  // Use the create item hook with enhanced fields
  const createItem = useCreateItem(list, enhancedFields)

  // Tab configuration following the same pattern as ProductItemPageClient
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

  // Field distribution by tab following the same pattern as ProductItemPageClient
  const GENERAL_FIELDS = new Set(['title', 'handle', 'description', 'subtitle', 'isGiftcard'])
  const MEDIA_FIELDS = new Set(['productImages'])
  const VARIANT_FIELDS = new Set(['productVariants'])
  const DISCOUNT_TAX_FIELDS = new Set(['discountable', 'discountConditions', 'discountRules', 'taxRates'])
  const ORGANIZATION_FIELDS = new Set(['status', 'productCollections', 'productCategories', 'productTags'])

  // Tab state
  const [activeTab, setActiveTab] = useState('general')

  const handleSave = useCallback(async () => {
    if (!createItem) return
    
    const item = await createItem.create()
    if (item?.id) {
      router.push(`/dashboard/platform/products/${item.id}`)
    } else {
      console.error('No item.id in response:', item)
    }
  }, [createItem, router])

  const handleCancel = useCallback(() => {
    router.push('/dashboard/platform/products')
  }, [router])
  

  if (!list) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The requested list "{listKey}" was not found.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!createItem) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to initialize creation form for {list.label}.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Platform-specific breadcrumb items
  const breadcrumbItems = [
    { type: 'link' as const, label: 'Dashboard', href: '/dashboard' },
    { type: 'page' as const, label: 'Platform' },
    { type: 'link' as const, label: 'Products', href: '/dashboard/platform/products' },
    { type: 'page' as const, label: 'Create' }
  ]

  // Split fields by position for sidebar/main layout (same pattern as dashboard)
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

  // Get tab error count - check for invalid fields in each tab (same pattern as item page)
  const getTabErrorCount = useCallback((tabId: string) => {
    if (!createItem?.props?.invalidFields) return 0
    
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
      if (createItem.props.invalidFields.has(fieldKey)) {
        errorCount++
      }
    })
    
    return errorCount
  }, [fieldsSplit, createItem?.props?.invalidFields])

  return (
    <>
      {/* Platform Breadcrumbs */}
      <PageBreadcrumbs items={breadcrumbItems} />
      
      <main className="w-full max-w-5xl p-4 md:p-6 pb-16 lg:pb-6">
        <div className="grid lg:grid-cols-[minmax(240px,2fr)_3fr] gap-6 gap-y-8 min-h-[calc(100vh-8rem)]">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7.5rem)] flex flex-col h-full">
            <div className="space-y-6 flex-grow overflow-y-auto pb-2">
              <div>
                <h1
                  className="text-lg font-semibold md:text-2xl"
                  title={`Create ${list.singular}`}
                >
                  Create {list.singular}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Add a new {list.singular.toLowerCase()} to {list.label.toLowerCase()}
                </p>
              </div>

              {/* Sidebar Fields (if any) */}
              {Object.keys(fieldsSplit.sidebarFields).length > 0 && (
                <Fields {...createItem.props} fields={fieldsSplit.sidebarFields} view="createView" groups={list.groups} />
              )}
            </div>

            {/* Action buttons - visible only on larger screens */}
            <div className="hidden lg:flex flex-col mr-auto">
              {/* Status indicators above buttons */}
              <div className="flex justify-center mb-2">
                {createItem.state === 'loading' && (
                  <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                    <Loader2 className="animate-spin h-3.5 w-3.5" />
                    <span>Creating...</span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <CancelButton 
                  onCancel={handleCancel}
                  isDesktop={true}
                />
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={handleSave}
                  disabled={createItem.state === 'loading'}
                >
                  Create {list.singular}
                  <Check className="ml-1 stroke-[1.5px]" width="8" height="8" />
                </Button>
              </div>
            </div>
          </aside>

          {/* Floating action bar - visible only on smaller screens */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 lg:hidden flex flex-col items-center gap-1.5">
            {/* Status indicators above the button container */}
            <div className="flex justify-center">
              {createItem.state === 'loading' && (
                <div className="flex items-center gap-x-1.5 text-xs text-muted-foreground">
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                  <span>Creating...</span>
                </div>
              )}
            </div>

            {/* Button container */}
            <div className="bg-background border rounded-md px-3 py-2 shadow-md w-full">
              <div className="flex flex-wrap items-center gap-2">
                <CancelButton 
                  onCancel={handleCancel}
                  isDesktop={false}
                />
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={handleSave}
                  disabled={createItem.state === 'loading'}
                >
                  <span className="hidden sm:inline">Create {list.singular}</span>
                  <span className="sm:hidden">Create</span>
                  <Check className="ml-1 stroke-[1.5px]" width="8" height="8" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-6">
            {/* GraphQL errors */}
            {(createItem.error?.networkError || createItem.error?.graphQLErrors?.length) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {createItem.error.networkError?.message || 
                   createItem.error.graphQLErrors?.[0]?.message ||
                   'An error occurred while creating the item'
                  }
                </AlertDescription>
              </Alert>
            )}

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
                <Fields {...createItem.props} fields={fieldsSplit.generalFields} view="createView" groups={list.groups} />
              </div>
            )}

            {activeTab === 'media' && Object.keys(fieldsSplit.mediaFields).length > 0 && (
              <div className="space-y-6">
                <Fields {...createItem.props} fields={fieldsSplit.mediaFields} view="createView" groups={list.groups} />
              </div>
            )}

            {activeTab === 'variants' && (
              <div className="space-y-6">
                <VariantsTab product={{}} />
              </div>
            )}

            {activeTab === 'discounts' && Object.keys(fieldsSplit.discountTaxFields).length > 0 && (
              <div className="space-y-6">
                <Fields {...createItem.props} fields={fieldsSplit.discountTaxFields} view="createView" groups={list.groups} />
              </div>
            )}

            {activeTab === 'organization' && Object.keys(fieldsSplit.organizationFields).length > 0 && (
              <div className="space-y-6">
                <Fields {...createItem.props} fields={fieldsSplit.organizationFields} view="createView" groups={list.groups} />
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default ProductCreatePageClient 