/**
 * ProductCreatePageClient for Platform Products
 * Client component with form functionality matching dashboard CreatePage layout
 * Adapted for platform navigation and breadcrumbs
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Package, Image, Box, Tag, Building, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CardContent, CardHeader } from '@/components/ui/card'
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

const Card = 'div'

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

function sanitizePriceInput(value: string, currencyCode: string) {
  const cleaned = value.replace(',', '.').replace(/[^\d.]/g, '')
  const isNoDivision = NO_DIVISION_CURRENCIES.includes(currencyCode.toLowerCase())

  if (isNoDivision) {
    return cleaned.replace(/\./g, '')
  }

  const firstDecimalIndex = cleaned.indexOf('.')
  if (firstDecimalIndex === -1) return cleaned

  const integerPart = cleaned.slice(0, firstDecimalIndex)
  const decimalPart = cleaned.slice(firstDecimalIndex + 1).replace(/\./g, '').slice(0, 2)

  return `${integerPart}.${decimalPart}`
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
  const STATUS_FIELDS = new Set(['status'])
  const ORGANIZATION_FIELDS = new Set(['productCollections', 'productCategories', 'productTags'])
  const HIDDEN_FIELDS = new Set(['metadata', 'externalId', 'shippingProfile', 'productType', 'productOptions'])

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

  const updateDefaultVariantPrice = useCallback((index: number, field: 'amount' | 'compareAmount', value: string, currencyCode: string) => {
    const nextValue = sanitizePriceInput(value, currencyCode)

    setDefaultVariant((prev) => ({
      ...prev,
      prices: prev.prices.map((entry, entryIndex) => {
        if (entryIndex !== index) return entry
        return field === 'amount'
          ? { ...entry, amount: nextValue }
          : { ...entry, compareAmount: nextValue }
      }),
    }))
  }, [])

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
    const statusFields: Record<string, any> = {}
    const mediaFields: Record<string, any> = {}
    const variantFields: Record<string, any> = {}
    const discountTaxFields: Record<string, any> = {}
    const organizationFields: Record<string, any> = {}
    
    Object.entries(enhancedFields).forEach(([key, field]) => {
      const fieldPath = field.path

      if (HIDDEN_FIELDS.has(fieldPath)) return
      
      // Distribute fields by tab
      if (GENERAL_FIELDS.has(fieldPath)) {
        generalFields[key] = field
      } else if (MEDIA_FIELDS.has(fieldPath)) {
        mediaFields[key] = field
      } else if (VARIANT_FIELDS.has(fieldPath)) {
        variantFields[key] = field
      } else if (DISCOUNT_TAX_FIELDS.has(fieldPath)) {
        discountTaxFields[key] = field
      } else if (STATUS_FIELDS.has(fieldPath)) {
        statusFields[key] = field
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
      statusFields,
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
      case 'status':
        fieldsToCheck = fieldsSplit.statusFields
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
      <div className="min-h-screen bg-muted/5 pb-20 font-sans selection:bg-indigo-500/30">
      {/* Premium Glassmorphic Header */}
      <div className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <PageBreadcrumbs 
            items={breadcrumbItems} 
            actions={
              <Button
                size="sm"
                onClick={prepareCreateDialog}
                disabled={isCreating}
              >
                <Check className="mr-1.5 size-3.5" />
                {isCreating ? 'Creating...' : `Create ${list.singular}`}
              </Button>
            }
          />
      </div>
      
      <main className="max-w-6xl p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create {list.singular}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new {list.singular.toLowerCase()} to your catalog.
          </p>
        </div>

        {/* GraphQL errors */}
        {(createItem.error?.networkError || createItem.error?.graphQLErrors?.length) && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {createItem.error.networkError?.message || 
               createItem.error.graphQLErrors?.[0]?.message ||
               'An error occurred while creating the item'
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content - Left Column */}
          <div className="flex-1 w-full space-y-8">
            
            {/* General Info */}
            {Object.keys(fieldsSplit.generalFields).length > 0 && (
              <Card className="relative rounded-xl border border-transparent bg-card shadow ring-1 ring-foreground/5 dark:ring-white/10 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 opacity-70 text-muted-foreground" />
                    <span className="font-medium uppercase text-xs tracking-wider text-muted-foreground">General Information</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Fields {...createItem.props} fields={fieldsSplit.generalFields} view="createView" groups={list.groups} />
                </CardContent>
              </Card>
            )}

            {/* Media */}
            {Object.keys(fieldsSplit.mediaFields).length > 0 && (
              <Card className="relative rounded-xl border border-transparent bg-card shadow ring-1 ring-foreground/5 dark:ring-white/10 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Image className="size-4 opacity-70 text-muted-foreground" />
                    <span className="font-medium uppercase text-xs tracking-wider text-muted-foreground">Media Gallery</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Fields {...createItem.props} fields={fieldsSplit.mediaFields} view="createView" groups={list.groups} />
                </CardContent>
              </Card>
            )}

            {/* Variants configuration */}
            <Card className="relative rounded-xl border border-transparent bg-card shadow ring-1 ring-foreground/5 dark:ring-white/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/40">
                <div className="flex items-center gap-2">
                  <Box className="size-4 opacity-70 text-muted-foreground" />
                  <span className="font-medium uppercase text-xs tracking-wider text-muted-foreground">Variants & Pricing</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 border-b border-border/40 bg-muted/10">
                  <div className="grid gap-4 sm:grid-cols-2 w-full">
                    <button
                      type="button"
                      onClick={() => setVariantMode('default')}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        variantMode === 'default'
                          ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20 shadow-sm'
                          : 'border-border bg-background hover:bg-muted/50 hover:border-border/80'
                      }`}
                    >
                      <div className="font-medium text-sm">Default Variant</div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Best for simple products with one price, one SKU, and no options.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVariantMode('multiple')}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        variantMode === 'multiple'
                          ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20 shadow-sm'
                          : 'border-border bg-background hover:bg-muted/50 hover:border-border/80'
                      }`}
                    >
                      <div className="font-medium text-sm">Multiple Variants</div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Use options like size or color and manage generated variant combinations.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {variantMode === 'default' ? (
                    <div className="space-y-8">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="default-variant-title" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Variant title</Label>
                          <Input
                            id="default-variant-title"
                            value={defaultVariant.title}
                            onChange={(e) => setDefaultVariant((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Default Title"
                            className="h-10 transition-colors focus-visible:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="default-variant-sku" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</Label>
                          <Input
                            id="default-variant-sku"
                            value={defaultVariant.sku}
                            onChange={(e) => setDefaultVariant((prev) => ({ ...prev, sku: e.target.value }))}
                            placeholder="SKU-001"
                            className="h-10 transition-colors focus-visible:ring-indigo-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="default-variant-stock" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inventory quantity</Label>
                          <Input
                            id="default-variant-stock"
                            type="number"
                            min="0"
                            value={defaultVariant.inventoryQuantity}
                            onChange={(e) => setDefaultVariant((prev) => ({ ...prev, inventoryQuantity: e.target.value }))}
                            className="h-10 transition-colors focus-visible:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4 ring-1 ring-foreground/5 transition-colors hover:bg-muted/40 dark:ring-white/10">
                          <div>
                            <div className="font-medium text-sm">Manage inventory</div>
                            <p className="text-xs text-muted-foreground mt-1">Track stock for this default variant.</p>
                          </div>
                          <Switch
                            checked={defaultVariant.manageInventory}
                            onCheckedChange={(checked) => setDefaultVariant((prev) => ({ ...prev, manageInventory: checked }))}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-muted/30 p-4 ring-1 ring-foreground/5 transition-colors hover:bg-muted/40 dark:ring-white/10">
                          <div>
                            <div className="font-medium text-sm">Allow backorders</div>
                            <p className="text-xs text-muted-foreground mt-1">Allow purchases when inventory reaches zero.</p>
                          </div>
                          <Switch
                            checked={defaultVariant.allowBackorder}
                            onCheckedChange={(checked) => setDefaultVariant((prev) => ({ ...prev, allowBackorder: checked }))}
                            className="data-[state=checked]:bg-indigo-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-border/40">
                        <div>
                          <h4 className="font-medium text-sm">Regional pricing</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Set prices for the regions you want to sell in. Leave blank to add later.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {regionsLoading ? (
                            <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                              Loading regions…
                            </div>
                          ) : regionsError ? (
                            <div className="rounded-xl border border-dashed border-destructive/50 bg-destructive/5 p-6 text-center text-sm text-destructive">
                              Failed to load regions. You can still create the product and add pricing later.
                            </div>
                          ) : defaultVariant.prices.length > 0 ? defaultVariant.prices.map((price, index) => {
                            const regionMeta = defaultVariantRegions.find((region: { regionCode: string; label: string; currencyCode: string; currencySymbol: string }) => region.regionCode === price.regionCode)
                            const currencySymbol = (regionMeta?.currencySymbol || '').trim() || price.currencyCode
                            const isNoDivisionCurrency = NO_DIVISION_CURRENCIES.includes(price.currencyCode.toLowerCase())

                            return (
                              <div key={`${price.regionCode}-${index}`} className="rounded-xl bg-muted/30 p-4 ring-1 ring-foreground/5 dark:ring-white/10">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">{regionMeta?.label || price.regionCode}</div>
                                    <p className="text-xs text-muted-foreground">
                                      Set the base and compare-at price for this region.
                                    </p>
                                  </div>
                                  <div className="inline-flex items-center gap-2 rounded-md bg-gradient-to-b from-muted to-muted/70 px-2.5 py-1.5 text-xs ring-1 ring-foreground/5 dark:from-muted/70 dark:to-muted/30 dark:ring-white/10">
                                    <span className="text-sm leading-none text-muted-foreground">{currencySymbol}</span>
                                    <span className="font-semibold tabular-nums">{price.currencyCode}</span>
                                  </div>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Price</Label>
                                    <div className="relative rounded-lg bg-background ring-1 ring-foreground/5 transition-[box-shadow] focus-within:ring-2 focus-within:ring-indigo-500/20 dark:ring-white/10 dark:focus-within:ring-indigo-500/30">
                                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
                                        {currencySymbol}
                                      </div>
                                      <Input
                                        type="text"
                                        inputMode={isNoDivisionCurrency ? 'numeric' : 'decimal'}
                                        autoComplete="off"
                                        value={price.amount}
                                        onChange={(e) => updateDefaultVariantPrice(index, 'amount', e.target.value, price.currencyCode)}
                                        placeholder={isNoDivisionCurrency ? '0' : '0.00'}
                                        className="h-11 border-0 bg-transparent pl-9 pr-16 text-sm tabular-nums shadow-none focus-visible:border-transparent focus-visible:ring-0"
                                      />
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="rounded-md bg-gradient-to-b from-muted to-muted/70 px-2 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-foreground/5 dark:from-muted/70 dark:to-muted/30 dark:ring-white/10">
                                          {price.currencyCode}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Compare-at price</Label>
                                    <div className="relative rounded-lg bg-background ring-1 ring-foreground/5 transition-[box-shadow] focus-within:ring-2 focus-within:ring-indigo-500/20 dark:ring-white/10 dark:focus-within:ring-indigo-500/30">
                                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
                                        {currencySymbol}
                                      </div>
                                      <Input
                                        type="text"
                                        inputMode={isNoDivisionCurrency ? 'numeric' : 'decimal'}
                                        autoComplete="off"
                                        value={price.compareAmount}
                                        onChange={(e) => updateDefaultVariantPrice(index, 'compareAmount', e.target.value, price.currencyCode)}
                                        placeholder="Optional"
                                        className="h-11 border-0 bg-transparent pl-9 pr-16 text-sm tabular-nums shadow-none focus-visible:border-transparent focus-visible:ring-0"
                                      />
                                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                        <span className="rounded-md bg-gradient-to-b from-muted to-muted/70 px-2 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-foreground/5 dark:from-muted/70 dark:to-muted/30 dark:ring-white/10">
                                          {price.currencyCode}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          }) : (
                            <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                              No regions found yet. You can still create the product and add pricing later.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <Alert className="mb-6 bg-indigo-500/5 text-indigo-700 border-indigo-500/20 dark:text-indigo-400">
                        <Info className="size-4" />
                        <AlertDescription>
                          Multiple variants use your existing options-and-combinations flow. Create the product first, then continue managing options, variants, and pricing on the product page.
                        </AlertDescription>
                      </Alert>
                      <div className="border border-border/40 rounded-xl bg-background overflow-hidden p-6">
                        <VariantsTab product={{}} />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar - Right Column */}
          <aside className="w-full lg:w-[320px] flex-shrink-0 space-y-6 lg:sticky lg:top-24">
            
            {/* Status & Pricing Info */}
            <Card className="relative rounded-xl border border-transparent bg-card shadow ring-1 ring-foreground/5 dark:ring-white/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/40">
                <div className="flex items-center gap-2">
                  <Tag className="size-4 opacity-70 text-muted-foreground" />
                  <span className="font-medium uppercase text-xs tracking-wider text-muted-foreground">Status & Display</span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {Object.keys(fieldsSplit.statusFields).length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Status</Label>
                    <div className="[&_label]:hidden">
                      <Fields {...createItem.props} fields={fieldsSplit.statusFields} view="createView" groups={list.groups} />
                    </div>
                  </div>
                )}

                {Object.keys(fieldsSplit.discountTaxFields).length > 0 && (
                  <div className="space-y-3 pt-5 border-t border-border/40">
                    <Fields {...createItem.props} fields={fieldsSplit.discountTaxFields} view="createView" groups={list.groups} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organization */}
            {Object.keys(fieldsSplit.organizationFields).length > 0 && (
              <Card className="relative rounded-xl border border-transparent bg-card shadow ring-1 ring-foreground/5 dark:ring-white/10 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/40">
                  <div className="flex items-center gap-2">
                    <Building className="size-4 opacity-70 text-muted-foreground" />
                    <span className="font-medium uppercase text-xs tracking-wider text-muted-foreground">Organization</span>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <Fields {...createItem.props} fields={fieldsSplit.organizationFields} view="createView" groups={list.groups} />
                </CardContent>
              </Card>
            )}

            {Object.keys(fieldsSplit.sidebarFields).length > 0 && (
              <Card className="relative rounded-xl border border-transparent bg-card shadow ring-1 ring-foreground/5 dark:ring-white/10 overflow-hidden">
                <CardContent className="p-5">
                  <Fields {...createItem.props} fields={fieldsSplit.sidebarFields} view="createView" groups={list.groups} />
                </CardContent>
              </Card>
            )}

          </aside>
        </div>
      </main>
    </div>

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
              <Check className="mr-1.5 size-3.5" />
              {isCreating ? 'Creating…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ProductCreatePageClient 