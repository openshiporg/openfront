'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose 
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import SingleSelect, { SingleSelectOption } from '@/components/ui/single-select'
import MultipleSelector, { Option } from '@/components/ui/multiselect'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createPaymentProvider } from '../../actions'
import { getRegions } from '../../../regions/actions'

interface CreatePaymentProviderDrawerProps {
  open: boolean
  onClose: () => void
  onCreate?: () => void
}

// Payment provider presets
const PAYMENT_PROVIDER_PRESETS = [
  { 
    id: 'manual', 
    name: 'Manual Payment', 
    description: 'Manual payment provider allows you to accept payments outside the platform (cash, check, bank transfer, etc.) and mark orders as paid manually.',
    icon: '👋',
    envVars: []
  },
  { 
    id: 'stripe', 
    name: 'Stripe', 
    description: 'For Stripe to work, you need to add these environment variables to your .env file:',
    icon: '💳',
    envVars: ['NEXT_PUBLIC_STRIPE_KEY', 'STRIPE_SECRET_KEY']
  },
  { 
    id: 'paypal', 
    name: 'PayPal', 
    description: 'For PayPal to work, you need to add these environment variables to your .env file:',
    icon: '🟦',
    envVars: ['NEXT_PUBLIC_PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET']
  }
]

export function CreatePaymentProviderDrawer({ 
  open, 
  onClose, 
  onCreate
}: CreatePaymentProviderDrawerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [providerName, setProviderName] = useState<string>('')
  const [selectedRegions, setSelectedRegions] = useState<Option[]>([])
  const [availableRegions, setAvailableRegions] = useState<Option[]>([])

  const selectedProvider = PAYMENT_PROVIDER_PRESETS.find(p => p.id === selectedPreset)

  // Get preset options for single select
  const getPresetOptions = (): SingleSelectOption[] => {
    return PAYMENT_PROVIDER_PRESETS.map(preset => ({
      value: preset.id,
      label: preset.name,
      flag: preset.icon,
      description: preset.description,
    }))
  }

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = PAYMENT_PROVIDER_PRESETS.find(p => p.id === presetId)
    if (preset) {
      setSelectedPreset(presetId)
      setProviderName(`${preset.name} Provider`)
    }
  }, [])

  // Load available regions when drawer opens
  useEffect(() => {
    const loadRegions = async () => {
      if (!open) return
      
      try {
        const result = await getRegions({}, 100, 0) // Get up to 100 regions
        if (result.success && result.data?.items) {
          const regionOptions = result.data.items.map((region: any) => ({
            value: region.id,
            label: region.name,
            flag: region.code // Use region code as flag
          }))
          setAvailableRegions(regionOptions)
        }
      } catch (error) {
        console.error('Failed to load regions:', error)
      }
    }

    loadRegions()
  }, [open])

  const validateForm = () => {
    if (!selectedPreset) {
      toast.error('Please select a payment provider')
      return false
    }
    
    if (!providerName.trim()) {
      toast.error('Please enter a provider name')
      return false
    }

    if (selectedRegions.length === 0) {
      toast.error('Please select at least one region')
      return false
    }
    
    return true
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      // Build provider data with function fields based on selection
      let providerData: any = {
        name: providerName,
        code: selectedPreset === 'manual' ? 'pp_system_default' : `pp_${selectedPreset}_${selectedPreset}`,
        isInstalled: true
      }

      // Add function fields based on provider type
      if (selectedPreset === 'stripe') {
        providerData = {
          ...providerData,
          createPaymentFunction: 'stripe',
          capturePaymentFunction: 'stripe',
          refundPaymentFunction: 'stripe',
          getPaymentStatusFunction: 'stripe',
          generatePaymentLinkFunction: 'stripe',
          handleWebhookFunction: 'stripe'
        }
      } else if (selectedPreset === 'paypal') {
        providerData = {
          ...providerData,
          createPaymentFunction: 'paypal',
          capturePaymentFunction: 'paypal',
          refundPaymentFunction: 'paypal',
          getPaymentStatusFunction: 'paypal',
          generatePaymentLinkFunction: 'paypal',
          handleWebhookFunction: 'paypal'
        }
      }

      // Add region IDs to provider data
      providerData.regionIds = selectedRegions.map(region => region.value)
      
      const result = await createPaymentProvider(providerData)
      
      if (result.success) {
        toast.success(`${providerName} created successfully`)
        onCreate?.()
        onClose()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to create payment provider')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment provider')
    } finally {
      setLoading(false)
    }
  }, [selectedPreset, providerName, selectedRegions, onCreate, onClose, router])

  const handleClose = useCallback(() => {
    if (!loading) {
      setSelectedPreset('')
      setProviderName('')
      setSelectedRegions([])
      onClose()
    }
  }, [loading, onClose])

  const isFormValid = () => {
    return selectedPreset && providerName.trim() && selectedRegions.length > 0
  }

  return (
    <Drawer open={open} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DrawerContent>
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Create Payment Provider</DrawerTitle>
          <DrawerDescription>
            Select a payment provider and configure your integration
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Provider Preset Selection */}
              <div>
                <SingleSelect
                  label="Payment Provider"
                  value={selectedPreset}
                  onChange={handlePresetSelect}
                  options={getPresetOptions()}
                  placeholder="Choose a payment provider"
                  searchPlaceholder="Search providers..."
                  emptyIndicator="No providers found"
                />
              </div>

              {selectedProvider && (
                <>
                  {/* Provider Name */}
                  <div>
                    <Label htmlFor="providerName" className="text-sm font-medium">
                      Provider Name
                    </Label>
                    <Input
                      id="providerName"
                      value={providerName}
                      onChange={(e) => setProviderName(e.target.value)}
                      placeholder="Enter provider name"
                      className="mt-1"
                    />
                  </div>

                  {/* Provider Info */}
                  {selectedProvider && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {selectedProvider.description}
                      </p>
                      {selectedProvider.envVars.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {selectedProvider.envVars.map((envVar, index) => (
                            <div key={index}>
                              <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono">
                                {envVar}
                              </code>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Regions Selection */}
                  <div>
                    <Label className="text-sm font-medium">
                      Available Regions
                    </Label>
                    <div className="mt-1">
                      <MultipleSelector
                        value={selectedRegions}
                        onChange={setSelectedRegions}
                        options={availableRegions}
                        placeholder="Select regions this provider will serve"
                        searchPlaceholder="Search regions..."
                        emptyIndicator={<p className="text-center">No regions found</p>}
                      />
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
                disabled={loading || !isFormValid()}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Provider'
                )}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}