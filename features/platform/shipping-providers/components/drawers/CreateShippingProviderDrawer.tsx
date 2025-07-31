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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import MultipleSelector, { Option } from '@/components/ui/multiselect'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { AddressSelect } from '../../../orders/components/ShippingTabs/AddressSelect'
import { createShippingProvider } from '../../actions'
import { getRegions } from '../../../regions/actions'

interface CreateShippingProviderDrawerProps {
  open: boolean
  onClose: () => void
  onCreate?: () => void
}

export function CreateShippingProviderDrawer({ 
  open, 
  onClose, 
  onCreate
}: CreateShippingProviderDrawerProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [providerName, setProviderName] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null)
  const [selectedRegions, setSelectedRegions] = useState<Option[]>([])
  const [availableRegions, setAvailableRegions] = useState<Option[]>([])
  const [providerSelectOpen, setProviderSelectOpen] = useState(false)

  // Provider options
  const providerOptions = [
    { value: 'custom', label: 'Custom Provider' },
    { value: 'shippo', label: 'Shippo Provider' },
    { value: 'shipengine', label: 'ShipEngine Provider' },
  ]

  const handleProviderSelect = useCallback((providerId: string) => {
    setSelectedProvider(providerId)
    
    // Set default provider name
    switch (providerId) {
      case 'shippo':
        setProviderName('Shippo Provider')
        break
      case 'shipengine':
        setProviderName('ShipEngine Provider')
        break
      case 'custom':
        setProviderName('Custom Provider')
        break
      default:
        setProviderName('')
        break
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProvider) {
      toast.error('Please select a shipping provider')
      return
    }
    
    if (!providerName.trim()) {
      toast.error('Please enter a provider name')
      return
    }

    if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }

    if (!selectedAddress) {
      toast.error('Please select a shipping from address')
      return
    }

    if (selectedRegions.length === 0) {
      toast.error('Please select at least one region')
      return
    }

    setLoading(true)
    
    try {
      const providerData = {
        name: providerName,
        accessToken: apiKey,
        fromAddressId: selectedAddress,
        createLabelFunction: selectedProvider === 'custom' ? 'custom' : selectedProvider.toLowerCase(),
        getRatesFunction: selectedProvider === 'custom' ? 'custom' : selectedProvider.toLowerCase(),
        validateAddressFunction: selectedProvider === 'custom' ? 'custom' : selectedProvider.toLowerCase(),
        trackShipmentFunction: selectedProvider === 'custom' ? 'custom' : selectedProvider.toLowerCase(),
        cancelLabelFunction: selectedProvider === 'custom' ? 'custom' : selectedProvider.toLowerCase(),
        metadata: {
          source: 'preset',
          presetId: selectedProvider
        },
        regionIds: selectedRegions.map(region => region.value)
      }
      
      const result = await createShippingProvider(providerData)
      
      if (result.success) {
        toast.success(`${providerName} created successfully`)
        onCreate?.()
        onClose()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to create shipping provider')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shipping provider')
    } finally {
      setLoading(false)
    }
  }, [selectedProvider, providerName, apiKey, selectedAddress, selectedRegions, onCreate, onClose, router])

  const handleClose = useCallback(() => {
    if (!loading) {
      setSelectedProvider('')
      setProviderName('')
      setApiKey('')
      setSelectedAddress(null)
      setSelectedRegions([])
      onClose()
    }
  }, [loading, onClose])

  const isFormValid = () => {
    return selectedProvider && providerName.trim() && apiKey.trim() && selectedAddress && selectedRegions.length > 0
  }

  return (
    <Drawer open={open} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DrawerContent>
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>Create Shipping Provider</DrawerTitle>
          <DrawerDescription>
            Set up a new shipping provider for your store
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Shipping Method Selection */}
              <div>
                <Label htmlFor="shipping-method" className="text-sm font-medium">
                  Shipping Method
                </Label>
                <div className="mt-1.5">
                  <Popover open={providerSelectOpen} onOpenChange={setProviderSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={providerSelectOpen}
                        className={cn(
                          "bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
                        )}
                      >
                        <span className={cn(
                          "truncate text-left",
                          !selectedProvider && "text-muted-foreground"
                        )}>
                          {selectedProvider ? providerOptions.find(p => p.value === selectedProvider)?.label : "Select shipping method"}
                        </span>
                        <ChevronDownIcon
                          size={16}
                          className="text-muted-foreground/80 shrink-0"
                          aria-hidden="true"
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandList>
                          <CommandEmpty>No providers found.</CommandEmpty>
                          <CommandGroup heading="Add Provider">
                            {providerOptions.map((provider) => (
                              <CommandItem
                                key={provider.value}
                                value={provider.value}
                                onSelect={() => {
                                  handleProviderSelect(provider.value)
                                  setProviderSelectOpen(false)
                                }}
                              >
                                <CheckIcon
                                  size={16}
                                  className={cn(
                                    "mr-2",
                                    selectedProvider === provider.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {provider.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
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

                  {/* API Key */}
                  <div>
                    <Label htmlFor="apiKey" className="text-sm font-medium">
                      API Key
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter ${selectedProvider === 'custom' ? '' : selectedProvider + ' '}API key`}
                      className="mt-1"
                      autoComplete="off"
                    />
                  </div>

                  {/* Shipping From Address */}
                  <div>
                    <Label className="text-sm font-medium">
                      Shipping From Address
                    </Label>
                    <AddressSelect value={selectedAddress} onChange={setSelectedAddress} />
                  </div>

                  {/* Regions Selection */}
                  <div>
                    <Label className="text-sm font-medium">
                      Available Regions
                    </Label>
                    <div className="mt-1.5">
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