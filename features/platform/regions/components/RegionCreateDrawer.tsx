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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Globe, DollarSign, CreditCard, Truck, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import predefinedRegions from '../lib/predefined-regions.json'

interface RegionCreateDrawerProps {
  open: boolean
  onClose: () => void
  onCreate?: (newRegion: any) => void
}

export function RegionCreateDrawer({ 
  open, 
  onClose, 
  onCreate 
}: RegionCreateDrawerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    taxRate: 0,
    currencyCode: '',
    currencySymbol: '',
    currencyName: '',
    selectedCountries: [] as string[],
    selectedPaymentProviders: [] as string[],
    selectedFulfillmentProviders: [] as string[]
  })

  const selectedRegion = predefinedRegions.regions.find(r => r.code === selectedPreset)

  const handlePresetSelect = useCallback((presetCode: string) => {
    const preset = predefinedRegions.regions.find(r => r.code === presetCode)
    if (preset) {
      setSelectedPreset(presetCode)
      setFormData({
        name: preset.name,
        code: preset.code,
        taxRate: preset.defaultTaxRate * 100, // Convert to percentage
        currencyCode: preset.currency.code,
        currencySymbol: preset.currency.symbol,
        currencyName: preset.currency.name,
        selectedCountries: preset.countries.map(c => c.iso2),
        selectedPaymentProviders: preset.defaultPaymentProviders.map(p => p.code),
        selectedFulfillmentProviders: preset.defaultFulfillmentProviders.map(f => f.code)
      })
    }
  }, [])

  const handleCountryToggle = useCallback((countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCountries: prev.selectedCountries.includes(countryCode)
        ? prev.selectedCountries.filter(c => c !== countryCode)
        : [...prev.selectedCountries, countryCode]
    }))
  }, [])

  const handlePaymentProviderToggle = useCallback((providerCode: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPaymentProviders: prev.selectedPaymentProviders.includes(providerCode)
        ? prev.selectedPaymentProviders.filter(p => p !== providerCode)
        : [...prev.selectedPaymentProviders, providerCode]
    }))
  }, [])

  const handleFulfillmentProviderToggle = useCallback((providerCode: string) => {
    setFormData(prev => ({
      ...prev,
      selectedFulfillmentProviders: prev.selectedFulfillmentProviders.includes(providerCode)
        ? prev.selectedFulfillmentProviders.filter(f => f !== providerCode)
        : [...prev.selectedFulfillmentProviders, providerCode]
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedRegion) {
      toast.error('Please select a region preset')
      return
    }
    
    if (formData.selectedCountries.length === 0) {
      toast.error('Please select at least one country')
      return
    }

    setLoading(true)
    
    try {
      // Here you would call your region creation API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Region "${formData.name}" created successfully`)
      onCreate?.(formData)
      onClose()
      router.refresh()
    } catch (error) {
      toast.error('Failed to create region')
    } finally {
      setLoading(false)
    }
  }, [formData, selectedRegion, onCreate, onClose, router])

  const handleClose = useCallback(() => {
    if (!loading) {
      setSelectedPreset('')
      setFormData({
        name: '',
        code: '',
        taxRate: 0,
        currencyCode: '',
        currencySymbol: '',
        currencyName: '',
        selectedCountries: [],
        selectedPaymentProviders: [],
        selectedFulfillmentProviders: []
      })
      onClose()
    }
  }, [loading, onClose])

  const hasChanges = selectedPreset !== '' || formData.selectedCountries.length > 0

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Create New Region
          </DrawerTitle>
          <DrawerDescription>
            Select a region preset and customize countries for your market expansion
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Region Preset Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Select Region Preset</Label>
                <RadioGroup value={selectedPreset} onValueChange={handlePresetSelect}>
                  <div className="grid grid-cols-1 gap-3">
                    {predefinedRegions.regions.map(region => (
                      <div key={region.code} className="flex items-center space-x-3">
                        <RadioGroupItem value={region.code} id={region.code} />
                        <Label 
                          htmlFor={region.code} 
                          className="flex-1 cursor-pointer p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{region.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {region.description}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs">
                                  {region.countries.map(c => c.flag).join(' ')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {region.currency.symbol} {region.currency.code}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {region.countries.length} {region.countries.length === 1 ? 'country' : 'countries'}
                            </Badge>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {selectedRegion && (
                <>
                  <Separator />
                  
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Basic Information</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm">Region Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Region name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="code" className="text-sm">Region Code</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          placeholder="Region code"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="taxRate" className="text-sm">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                        placeholder="Tax rate"
                        required
                      />
                    </div>
                  </div>

                  {/* Currency Configuration */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Currency Configuration
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="currencyCode" className="text-sm">Currency Code</Label>
                        <Input
                          id="currencyCode"
                          value={formData.currencyCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, currencyCode: e.target.value }))}
                          placeholder="USD"
                          required
                          readOnly
                        />
                      </div>
                      <div>
                        <Label htmlFor="currencySymbol" className="text-sm">Symbol</Label>
                        <Input
                          id="currencySymbol"
                          value={formData.currencySymbol}
                          onChange={(e) => setFormData(prev => ({ ...prev, currencySymbol: e.target.value }))}
                          placeholder="$"
                          required
                          readOnly
                        />
                      </div>
                      <div>
                        <Label htmlFor="currencyName" className="text-sm">Currency Name</Label>
                        <Input
                          id="currencyName"
                          value={formData.currencyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, currencyName: e.target.value }))}
                          placeholder="US Dollar"
                          required
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* Country Selection */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Select Countries</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedRegion.countries.map(country => (
                        <div key={country.iso2} className="flex items-center space-x-3">
                          <Checkbox
                            id={country.iso2}
                            checked={formData.selectedCountries.includes(country.iso2)}
                            onCheckedChange={() => handleCountryToggle(country.iso2)}
                          />
                          <Label htmlFor={country.iso2} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{country.flag}</span>
                              <span>{country.displayName}</span>
                              <span className="text-sm text-muted-foreground">({country.iso2.toUpperCase()})</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Providers */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Providers
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedRegion.defaultPaymentProviders.map(provider => (
                        <div key={provider.code} className="flex items-center space-x-3">
                          <Checkbox
                            id={provider.code}
                            checked={formData.selectedPaymentProviders.includes(provider.code)}
                            onCheckedChange={() => handlePaymentProviderToggle(provider.code)}
                          />
                          <Label htmlFor={provider.code} className="flex-1 cursor-pointer">
                            {provider.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fulfillment Providers */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Fulfillment Providers
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedRegion.defaultFulfillmentProviders.map(provider => (
                        <div key={provider.code} className="flex items-center space-x-3">
                          <Checkbox
                            id={provider.code}
                            checked={formData.selectedFulfillmentProviders.includes(provider.code)}
                            onCheckedChange={() => handleFulfillmentProviderToggle(provider.code)}
                          />
                          <Label htmlFor={provider.code} className="flex-1 cursor-pointer">
                            {provider.name}
                          </Label>
                        </div>
                      ))}
                    </div>
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
                disabled={loading || !selectedRegion || formData.selectedCountries.length === 0}
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