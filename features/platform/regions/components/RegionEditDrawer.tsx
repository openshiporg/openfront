'use client'

import React, { useState, useCallback, useEffect } from 'react'
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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Globe, DollarSign, CreditCard, Truck, X, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import predefinedRegions from '../lib/predefined-regions.json'

interface RegionEditDrawerProps {
  open: boolean
  onClose: () => void
  region: {
    id: string
    name: string
    code: string
    taxRate: number
    currency: {
      id: string
      code: string
      symbol: string
      symbolNative: string
    }
    countries: Array<{
      id: string
      iso2: string
      displayName: string
    }>
  }
  onSave?: (updatedRegion: any) => void
}

export function RegionEditDrawer({ 
  open, 
  onClose, 
  region,
  onSave
}: RegionEditDrawerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
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

  // Find the matching preset region based on the region code
  const matchingPreset = predefinedRegions.regions.find(r => r.code === region.code)

  useEffect(() => {
    if (region && open) {
      setFormData({
        name: region.name,
        code: region.code,
        taxRate: region.taxRate * 100, // Convert to percentage for display
        currencyCode: region.currency.code,
        currencySymbol: region.currency.symbol,
        currencyName: region.currency.name,
        selectedCountries: region.countries.map(c => c.iso2),
        selectedPaymentProviders: region.paymentProviders.map(p => p.code),
        selectedFulfillmentProviders: region.fulfillmentProviders.map(f => f.code)
      })
    }
  }, [region, open])

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
    
    if (formData.selectedCountries.length === 0) {
      toast.error('Please select at least one country')
      return
    }

    setLoading(true)
    
    try {
      // Here you would call your region update API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Region "${formData.name}" updated successfully`)
      onSave?.(formData)
      onClose()
      router.refresh()
    } catch (error) {
      toast.error('Failed to update region')
    } finally {
      setLoading(false)
    }
  }, [formData, onSave, onClose, router])

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose()
    }
  }, [loading, onClose])

  if (!matchingPreset) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="border-b">
            <DrawerTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Edit Region
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This region does not match any predefined region templates. Please contact support for assistance.
              </AlertDescription>
            </Alert>
          </div>
          <DrawerFooter className="border-t">
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Edit Region
              </DrawerTitle>
              <DrawerDescription>
                Update region configuration and country selection
              </DrawerDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-6">
              {/* Region Template Info */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Region Template</Label>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{matchingPreset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {matchingPreset.description}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs">
                          {matchingPreset.countries.map(c => c.flag).join(' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {matchingPreset.currency.symbol} {matchingPreset.currency.code}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Template
                    </Badge>
                  </div>
                </div>
              </div>

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
                      disabled // Region code shouldn't be editable
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
                      placeholder="USD"
                      required
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="currencySymbol" className="text-sm">Symbol</Label>
                    <Input
                      id="currencySymbol"
                      value={formData.currencySymbol}
                      placeholder="$"
                      required
                      readOnly
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="currencyName" className="text-sm">Currency Name</Label>
                    <Input
                      id="currencyName"
                      value={formData.currencyName}
                      placeholder="US Dollar"
                      required
                      readOnly
                      disabled
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Currency settings cannot be changed after region creation
                </div>
              </div>

              {/* Country Selection */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Select Countries</Label>
                <div className="grid grid-cols-1 gap-2">
                  {matchingPreset.countries.map(country => (
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
                  {matchingPreset.defaultPaymentProviders.map(provider => (
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
                  {matchingPreset.defaultFulfillmentProviders.map(provider => (
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
            </div>
          </ScrollArea>

          <DrawerFooter className="border-t">
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || formData.selectedCountries.length === 0}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}