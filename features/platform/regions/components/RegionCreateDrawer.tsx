'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerDescription,
  DrawerFooter 
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import SingleSelect, { SingleSelectOption } from '@/components/ui/single-select'
import MultipleSelector, { Option } from '@/components/ui/multiselect'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import predefinedRegions from '../lib/predefined-regions.json'
import { createRegion } from '../actions'

interface RegionCreateDrawerProps {
  open: boolean
  onClose: () => void
  onCreate?: (newRegion: any) => void
  existingRegions?: Array<{ code: string }>
}

// Extract all unique currencies from predefined regions
const getAllCurrencies = () => {
  const uniqueCurrencies = new Map()
  predefinedRegions.regions.forEach(region => {
    const currency = region.currency
    if (!uniqueCurrencies.has(currency.code)) {
      uniqueCurrencies.set(currency.code, {
        code: currency.code.toLowerCase(),
        symbol: currency.symbol,
        name: currency.name
      })
    }
  })
  return Array.from(uniqueCurrencies.values())
}

const ALL_CURRENCIES = getAllCurrencies()

// Available fulfillment providers from onboarding
const FULFILLMENT_PROVIDERS = [
  { code: 'fp_manual', name: 'Manual Fulfillment' },
  { code: 'standard_shipping', name: 'Standard Shipping' },
  { code: 'express_shipping', name: 'Express Shipping' },
  { code: 'return_shipping', name: 'Return Shipping' },
]

// Available payment providers
const PAYMENT_PROVIDERS = [
  { code: 'pp_stripe_stripe', name: 'Stripe' },
  { code: 'pp_paypal_paypal', name: 'PayPal' },
  { code: 'pp_system_default', name: 'Manual Payment' },
]

export function RegionCreateDrawer({ 
  open, 
  onClose, 
  onCreate,
  existingRegions = []
}: RegionCreateDrawerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('')
  
  // Multi-select states
  const [selectedCountries, setSelectedCountries] = useState<Option[]>([])
  const [selectedPaymentProviders, setSelectedPaymentProviders] = useState<Option[]>([])
  const [selectedFulfillmentProviders, setSelectedFulfillmentProviders] = useState<Option[]>([])

  // Filter out existing regions from presets
  const availablePresets = predefinedRegions.regions.filter(
    region => !existingRegions.some(existing => existing.code === region.code)
  )

  const selectedRegion = predefinedRegions.regions.find(r => r.code === selectedPreset)

  // Get region options for single select
  const getRegionOptions = (): SingleSelectOption[] => {
    return availablePresets.map(region => ({
      value: region.code,
      label: region.name,
      flag: getRegionIcon(region.code),
    }))
  }

  // Get currency options for single select
  const getCurrencyOptions = (): SingleSelectOption[] => {
    return ALL_CURRENCIES.map(currency => ({
      value: currency.code,
      label: currency.name,
      square: currency.symbol,
    }))
  }

  // Convert preset data to Option format for multi-selects
  const getCountryOptions = (region: any): Option[] => {
    return region?.countries.map((country: any) => ({
      value: country.iso2,
      label: country.displayName,
      flag: country.flag,
    })) || []
  }

  const getPaymentProviderOptions = (): Option[] => {
    return PAYMENT_PROVIDERS.map((provider) => ({
      value: provider.code,
      label: provider.name,
    }))
  }

  const getFulfillmentProviderOptions = (): Option[] => {
    return FULFILLMENT_PROVIDERS.map((provider) => ({
      value: provider.code,
      label: provider.name,
    }))
  }

  const handlePresetSelect = useCallback((presetCode: string) => {
    const preset = predefinedRegions.regions.find(r => r.code === presetCode)
    if (preset) {
      setSelectedPreset(presetCode)
      setSelectedCurrency(preset.currency.code.toLowerCase())
      
      // Pre-select all options from the preset
      setSelectedCountries(getCountryOptions(preset))
      setSelectedPaymentProviders(getPaymentProviderOptions()) // Default to all
      setSelectedFulfillmentProviders(getFulfillmentProviderOptions()) // Default to all
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedPreset) {
      toast.error('Please select a region preset')
      return
    }
    
    if (!selectedCurrency) {
      toast.error('Please select a currency')
      return
    }
    
    if (selectedCountries.length === 0) {
      toast.error('Please select at least one country')
      return
    }

    setLoading(true)
    
    try {
      const regionData = {
        preset: selectedPreset,
        currency: selectedCurrency,
        selectedCountries: selectedCountries.map(c => c.value),
        selectedPaymentProviders: selectedPaymentProviders.map(p => p.value),
        selectedFulfillmentProviders: selectedFulfillmentProviders.map(f => f.value)
      }
      
      // Call the actual createRegion server action
      const result = await createRegion(regionData)
      
      if (result.success) {
        const regionName = selectedRegion?.name || 'New Region'
        toast.success(`Region "${regionName}" created successfully`)
        onCreate?.(result.data)
        onClose()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to create region')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create region')
    } finally {
      setLoading(false)
    }
  }, [selectedPreset, selectedCurrency, selectedCountries, selectedPaymentProviders, selectedFulfillmentProviders, selectedRegion, onCreate, onClose, router])

  const handleClose = useCallback(() => {
    if (!loading) {
      setSelectedPreset('')
      setSelectedCurrency('')
      setSelectedCountries([])
      setSelectedPaymentProviders([])
      setSelectedFulfillmentProviders([])
      onClose()
    }
  }, [loading, onClose])

  // Get region icons/emojis
  const getRegionIcon = (regionCode: string) => {
    const iconMap: Record<string, string> = {
      'us': '🇺🇸',
      'na': '🇺🇸',
      'eu': '🇪🇺', 
      'uk': '🇬🇧',
      'ca': '🇨🇦',
      'au': '🇦🇺',
      'apac': '🇦🇺',
      'jp': '🇯🇵',
      'japan': '🇯🇵',
      'kr': '🇰🇷',
      'south_korea': '🇰🇷',
      'sg': '🇸🇬',
      'singapore': '🇸🇬',
      'in': '🇮🇳',
      'india': '🇮🇳',
      'br': '🇧🇷',
      'latam': '🇧🇷',
      'mx': '🇲🇽',
      'nordics': '🇸🇪',
      'mena': '🇦🇪',
      'africa': '🇿🇦',
      'china': '🇨🇳'
    }
    return iconMap[regionCode] || '🌍'
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Create New Region</DrawerTitle>
          <DrawerDescription>
            Select a region preset and customize the configuration for your market
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Region Preset Selection */}
              <div>
                <SingleSelect
                  label="Region Preset"
                  value={selectedPreset}
                  onChange={handlePresetSelect}
                  options={getRegionOptions()}
                  placeholder="Choose a region preset"
                  searchPlaceholder="Search regions..."
                  emptyIndicator="No regions found"
                />
              </div>

              {selectedRegion && (
                <>
                  {/* Currency Selection */}
                  <div>
                    <SingleSelect
                      label="Currency"
                      value={selectedCurrency}
                      onChange={setSelectedCurrency}
                      options={getCurrencyOptions()}
                      placeholder="Choose a currency"
                      searchPlaceholder="Search currencies..."
                      emptyIndicator="No currencies found"
                      showSquare={true}
                    />
                  </div>

                  {/* Countries Multi-Select */}
                  <div>
                    <MultipleSelector
                      label="Countries"
                      value={selectedCountries}
                      onChange={setSelectedCountries}
                      options={getCountryOptions(selectedRegion)}
                      placeholder="Select countries"
                      searchPlaceholder="Search countries..."
                      emptyIndicator={<p className="text-center text-sm">No countries found</p>}
                    />
                  </div>

                  {/* Payment Providers Multi-Select */}
                  <div>
                    <MultipleSelector
                      label="Payment Providers"
                      value={selectedPaymentProviders}
                      onChange={setSelectedPaymentProviders}
                      options={getPaymentProviderOptions()}
                      placeholder="Select payment providers"
                      searchPlaceholder="Search payment providers..."
                      emptyIndicator={<p className="text-center text-sm">No payment providers found</p>}
                    />
                  </div>

                  {/* Fulfillment Providers Multi-Select */}
                  <div>
                    <MultipleSelector
                      label="Fulfillment & Shipping"
                      value={selectedFulfillmentProviders}
                      onChange={setSelectedFulfillmentProviders}
                      options={getFulfillmentProviderOptions()}
                      placeholder="Select fulfillment and shipping options"
                      searchPlaceholder="Search fulfillment options..."
                      emptyIndicator={<p className="text-center text-sm">No fulfillment options found</p>}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <DrawerFooter className="flex-shrink-0 border-t">
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !selectedPreset || !selectedCurrency || selectedCountries.length === 0}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Region'
                )}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}