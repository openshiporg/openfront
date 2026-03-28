/**
 * ProductCreatePageClient for Platform Products
 * Client component with form functionality matching dashboard CreatePage layout
 * Adapted for platform navigation and breadcrumbs
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Package, Image, Box, Tag, Building } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageBreadcrumbs } from '../../../dashboard/components/PageBreadcrumbs'
import { Fields } from '../../../dashboard/components/Fields'
import { useCreateItem } from '../../../dashboard/utils/useCreateItem'
import { enhanceFields } from '../../../dashboard/utils/enhanceFields'
import { serializeValueToOperationItem } from '../../../dashboard/utils/useHasChanges'
import { createItemAction } from '../../../dashboard/actions/item-actions'
import { VariantsTab } from '../components/VariantsTab'
import { createProductVariant } from '../actions/variants'
import { generateUniqueProductHandle } from '../actions'
import { useRegions } from '../hooks/useProductData'

interface ProductCreatePageClientProps {
  listKey: string
  list: any
}

type VariantMode = 'default' | 'multiple'
type ProductStatus = 'draft' | 'proposed' | 'published' | 'rejected'

type DefaultVariantState = {
  title: string
  sku: string
  inventoryQuantity: string
  manageInventory: boolean
  allowBackorder: boolean
  prices: Array<{
    regionCode: string
    currencyCode: string
    amount: string
    compareAmount: string
  }>
}

type CreateDialogState = {
  status: ProductStatus
  handle: string
}

const NO_DIVISION_CURRENCIES = ['jpy', 'krw', 'vnd']

function toStorageAmount(displayAmount: string, currencyCode: string) {
  const numericAmount = parseFloat(displayAmount)
  if (Number.isNaN(numericAmount)) return null

  const isNoDivision = NO_DIVISION_CURRENCIES.includes(currencyCode.toLowerCase())
  return isNoDivision ? Math.round(numericAmount) : Math.round(numericAmount * 100)
}

export function ProductCreatePageClient({ listKey, list }: ProductCreatePageClientProps) {
  const router = useRouter()
  
  // Create enhanced fields like Keystone does - same pattern as dashboard
  const enhancedFields = useMemo(() => {
    return enhanceFields(list.fields || {}, list.key)
  }, [list.fields, list.key])
  
  // Use the create item hook with enhanced fields
  const createItem = useCreateItem(list, enhancedFields)
  const { regions, loading: regionsLoading, error: regionsError } = useRegions()

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
  const [variantMode, setVariantMode] = useState<VariantMode>('default')
  const [defaultVariant, setDefaultVariant] = useState<DefaultVariantState>({
    title: 'Default Title',
    sku: '',
    inventoryQuantity: '100',
    manageInventory: false,
    allowBackorder: false,
    prices: [],
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [createDialogError, setCreateDialogError] = useState<string | null>(null)
  const [createDialogState, setCreateDialogState] = useState<CreateDialogState>({
    status: 'draft',
    handle: '',
  })

  const getStringFieldValue = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>
      if (typeof record.value === 'string') return record.value
      if (record.value && typeof record.value === 'object') {
        const nested = record.value as Record<string, unknown>
        if (typeof nested.value === 'string') return nested.value
      }
      if (record.inner && typeof record.inner === 'object') {
        const inner = record.inner as Record<string, unknown>
        if (typeof inner.value === 'string') return inner.value
      }
    }
    return ''
  }

  const getCurrentCreateValues = useCallback(() => {
    const currentValue = (createItem?.props.value || {}) as Record<string, unknown>

    const currentTitle = getStringFieldValue(currentValue.title)
    const currentHandle = getStringFieldValue(currentValue.handle)
    const currentStatus = (getStringFieldValue(currentValue.status) || 'draft') as ProductStatus

    return {
      currentValue,
      currentTitle,
      currentHandle,
      currentStatus,
    }
  }, [createItem])

  const prepareCreateDialog = useCallback(async () => {
    if (!createItem) return

    const { currentTitle, currentHandle, currentStatus } = getCurrentCreateValues()
    let resolvedHandle = currentHandle.trim()

    if (!resolvedHandle && currentTitle.trim()) {
      const handleResponse = await generateUniqueProductHandle(currentTitle)
      if (handleResponse.success) {
        resolvedHandle = handleResponse.data.handle
      }
    }

    setCreateDialogState({
      status: currentStatus || 'draft',
      handle: resolvedHandle,
    })
    setCreateDialogError(null)
    setIsCreateDialogOpen(true)
  }, [createItem, getCurrentCreateValues])

  const handleHandleBlur = useCallback(async () => {
    const { currentTitle } = getCurrentCreateValues()
    const source = createDialogState.handle.trim() || currentTitle.trim()

    if (!source) {
      setCreateDialogState((prev) => ({ ...prev, handle: '' }))
      return
    }

    const handleResponse = await generateUniqueProductHandle(source)

    if (handleResponse.success) {
      setCreateDialogState((prev) => ({ ...prev, handle: handleResponse.data.handle }))
    }
  }, [createDialogState.handle, getCurrentCreateValues])

  const handleSave = useCallback(async () => {
    if (!createItem) return

    if (createItem.props.invalidFields.size > 0) {
      toast.error('Please complete the required product fields before creating it.')
      setCreateDialogError('Please complete the required product fields before creating the product.')
      return
    }

    setIsCreating(true)
    setCreateDialogError(null)

    try {
      const { currentValue, currentTitle } = getCurrentCreateValues()
      const handleSource = createDialogState.handle.trim() || currentTitle.trim()
      const handleResponse = await generateUniqueProductHandle(handleSource)

      if (!handleResponse.success) {
        setCreateDialogError(handleResponse.error || 'Failed to generate a unique handle.')
        setIsCreating(false)
        return
      }

      const data = serializeValueToOperationItem('create', enhancedFields, currentValue)

      data.status = createDialogState.status
      if (handleResponse.data.handle) {
        data.handle = handleResponse.data.handle
      }
      const selectedFields = `id ${list.labelField || ''}`
      const result = await createItemAction(list.key, data, selectedFields)

      if (result.errors && result.errors.length > 0) {
        setCreateDialogError(result.errors[0]?.message || 'Failed to create product.')
        setIsCreating(false)
        return
      }

      const item = result.data?.item

      if (!item?.id) {
        setCreateDialogError('Product was created without a valid ID response.')
        setIsCreating(false)
        return
      }

      if (variantMode === 'default') {
        const prices: Array<{
          amount: number
          compareAmount?: number
          currencyCode: string
          regionCode?: string
        }> = []

        defaultVariant.prices.forEach((price) => {
          if (price.amount.trim() === '') return

          const amount = toStorageAmount(price.amount, price.currencyCode)
          const compareAmount = price.compareAmount.trim() !== ''
            ? toStorageAmount(price.compareAmount, price.currencyCode)
            : null

          if (amount === null) return

          prices.push({
            amount,
            compareAmount: compareAmount ?? undefined,
            currencyCode: price.currencyCode,
            regionCode: price.regionCode,
          })
        })

        const defaultVariantResponse = await createProductVariant({
          title: defaultVariant.title || 'Default Title',
          sku: defaultVariant.sku,
          inventoryQuantity: Number.parseInt(defaultVariant.inventoryQuantity || '0', 10) || 0,
          manageInventory: defaultVariant.manageInventory,
          allowBackorder: defaultVariant.allowBackorder,
          productId: item.id,
          optionValueIds: [],
          prices,
        })

        if (!defaultVariantResponse.success) {
          toast.error('Product created, but the default variant could not be created.')
        }
      }

      router.push(`/dashboard/platform/products/${item.id}`)
    } catch (error) {
      setCreateDialogError(error instanceof Error ? error.message : 'Failed to create product.')
    } finally {
      setIsCreating(false)
    }
  }, [createItem, createDialogState, defaultVariant, enhancedFields, getCurrentCreateValues, list.key, list.labelField, router, variantMode])

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
    { type: 'link' as const, label: 'Dashboard', href: '' },
    { type: 'page' as const, label: 'Platform' },
    { type: 'link' as const, label: 'Products', href: '/platform/products' },
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

  const defaultVariantRegions = useMemo(() => {
    return (regions || []).map((region: any) => ({
      regionCode: region.code,
      label: region.name,
      currencyCode: (region.currency?.code || 'usd').toUpperCase(),
      currencySymbol: region.currency?.symbolNative || region.currency?.symbol || '',
    }))
  }, [regions])

  React.useEffect(() => {
    if (variantMode !== 'default') return

    setDefaultVariant((prev) => {
      if (prev.prices.length > 0) return prev

      return {
        ...prev,
        prices: defaultVariantRegions.map((region: any) => ({
          regionCode: region.regionCode,
          currencyCode: region.currencyCode,
          amount: '',
          compareAmount: '',
        })),
      }
    })
  }, [variantMode, defaultVariantRegions])

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
      <PageBreadcrumbs 
        items={breadcrumbItems} 
        actions={
          <Button
            size="sm"
            className="sm:text-sm text-xs"
            onClick={prepareCreateDialog}
            disabled={isCreating}
          >
            Create {list.singular}
            <Check className="ml-1 stroke-[1.5px]" width="8" height="8" />
          </Button>
        }
      />
      
      <main className="w-full max-w-5xl p-4 md:p-6">
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

          </aside>


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
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">Variant setup</h2>
                    <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
                      <button
                        type="button"
                        onClick={() => setVariantMode('default')}
                        className={`rounded-xl border p-4 text-left transition ${
                          variantMode === 'default'
                            ? 'border-foreground bg-accent/40'
                            : 'border-border bg-background hover:bg-accent/20'
                        }`}
                      >
                        <div className="font-medium">Default variant</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Best for simple products with one price, one SKU, and no options.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVariantMode('multiple')}
                        className={`rounded-xl border p-4 text-left transition ${
                          variantMode === 'multiple'
                            ? 'border-foreground bg-accent/40'
                            : 'border-border bg-background hover:bg-accent/20'
                        }`}
                      >
                        <div className="font-medium">Multiple variants</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Use options like size or color and manage generated variant combinations.
                        </p>
                      </button>
                    </div>
                  </div>

                  {variantMode === 'default' ? (
                    <Card className="max-w-2xl">
                      <CardContent className="p-6 space-y-6">
                        <div>
                          <h3 className="font-medium">Default variant</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            This product will be created with a single default variant so pricing works immediately.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="default-variant-title">Variant title</Label>
                            <Input
                              id="default-variant-title"
                              value={defaultVariant.title}
                              onChange={(e) => setDefaultVariant((prev) => ({ ...prev, title: e.target.value }))}
                              placeholder="Default Title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="default-variant-sku">SKU</Label>
                            <Input
                              id="default-variant-sku"
                              value={defaultVariant.sku}
                              onChange={(e) => setDefaultVariant((prev) => ({ ...prev, sku: e.target.value }))}
                              placeholder="SKU-001"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="default-variant-stock">Inventory quantity</Label>
                            <Input
                              id="default-variant-stock"
                              type="number"
                              min="0"
                              value={defaultVariant.inventoryQuantity}
                              onChange={(e) => setDefaultVariant((prev) => ({ ...prev, inventoryQuantity: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <div className="font-medium text-sm">Manage inventory</div>
                              <p className="text-xs text-muted-foreground mt-1">Track stock for this default variant.</p>
                            </div>
                            <Switch
                              checked={defaultVariant.manageInventory}
                              onCheckedChange={(checked) => setDefaultVariant((prev) => ({ ...prev, manageInventory: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <div className="font-medium text-sm">Allow backorders</div>
                              <p className="text-xs text-muted-foreground mt-1">Allow purchases when inventory reaches zero.</p>
                            </div>
                            <Switch
                              checked={defaultVariant.allowBackorder}
                              onCheckedChange={(checked) => setDefaultVariant((prev) => ({ ...prev, allowBackorder: checked }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">Regional pricing</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Set prices for the regions you want to sell in. Leave blank to add later.
                            </p>
                          </div>

                          <div className="space-y-3">
                            {regionsLoading ? (
                              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                Loading regions…
                              </div>
                            ) : regionsError ? (
                              <div className="rounded-lg border border-dashed p-4 text-sm text-destructive">
                                Failed to load regions. You can still create the product and add pricing later.
                              </div>
                            ) : defaultVariant.prices.length > 0 ? defaultVariant.prices.map((price, index) => {
                              const regionMeta = defaultVariantRegions.find((region: { regionCode: string; label: string; currencyCode: string; currencySymbol: string }) => region.regionCode === price.regionCode)

                              return (
                                <div key={`${price.regionCode}-${index}`} className="rounded-lg border p-4 space-y-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <div className="font-medium text-sm">{regionMeta?.label || price.regionCode}</div>
                                      <div className="text-xs text-muted-foreground">{price.regionCode}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {(regionMeta?.currencySymbol || '').trim()} {price.currencyCode}
                                    </div>
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label>Price</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price.amount}
                                        onChange={(e) => setDefaultVariant((prev) => ({
                                          ...prev,
                                          prices: prev.prices.map((entry, entryIndex) =>
                                            entryIndex === index ? { ...entry, amount: e.target.value } : entry
                                          ),
                                        }))}
                                        placeholder="0.00"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Compare at price</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price.compareAmount}
                                        onChange={(e) => setDefaultVariant((prev) => ({
                                          ...prev,
                                          prices: prev.prices.map((entry, entryIndex) =>
                                            entryIndex === index ? { ...entry, compareAmount: e.target.value } : entry
                                          ),
                                        }))}
                                        placeholder="Optional"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )
                            }) : (
                              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                No regions found yet. You can still create the product and add pricing later.
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4 max-w-2xl">
                      <Alert>
                        <AlertDescription>
                          Multiple variants use your existing options-and-combinations flow. Create the product first, then continue managing options, variants, and pricing on the product page.
                        </AlertDescription>
                      </Alert>
                      <VariantsTab product={{}} />
                    </div>
                  )}
                </div>
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create</DialogTitle>
            <DialogDescription>
              Choose a status and confirm the handle before creating it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-product-status">Status</Label>
              <Select
                value={createDialogState.status}
                onValueChange={(value) => setCreateDialogState((prev) => ({ ...prev, status: value as ProductStatus }))}
              >
                <SelectTrigger id="create-product-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="proposed">Proposed</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                New items default to draft unless you choose a different status here.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-product-handle">Handle</Label>
              <Input
                id="create-product-handle"
                value={createDialogState.handle}
                onChange={(e) => setCreateDialogState((prev) => ({ ...prev, handle: e.target.value }))}
                onBlur={handleHandleBlur}
                placeholder="auto-generated-from-title"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  If left blank, we’ll generate a unique handle from the title.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleHandleBlur}
                >
                  Generate
                </Button>
              </div>
            </div>

            {createDialogError && (
              <Alert variant="destructive">
                <AlertDescription>{createDialogError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isCreating}>
              {isCreating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductCreatePageClient 