'use client';

import { useState } from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from '@/components/ui/select';
import { ProviderActionsInline } from './ProviderActionsInline';
import { ManualTabContent } from './ManualTabContent';
import { ProviderTabContent } from './ProviderTabContent';
import { PresetTabContent } from './PresetTabContent';
import { NewProviderTabContent } from './NewProviderTabContent';
import { StatusIndicator } from './StatusIndicator';
import { createProviderShippingLabel, createManualFulfillment } from '@/features/platform/orders/actions';
import type { Order, ShippingProvider, ShippingRate, Dimensions, Weight } from '../../lib/types';
import useSWR from 'swr';
import { getShippingProviders } from '@/features/platform/orders/actions';
import { toast } from 'sonner';

interface ShippingTabsProps {
  order: Order;
  onProviderToggle: (providerId: string) => Promise<void>;
  selectedQuantities: Record<string, string>;
  setSelectedQuantities: (quantities: Record<string, string>) => void;
}

export function ShippingTabs({
  order,
  onProviderToggle,
  selectedQuantities,
  setSelectedQuantities,
}: ShippingTabsProps) {
  const [selectedTab, setSelectedTab] = useState('manual');
  const [dimensions, setDimensions] = useState<Dimensions>({
    length: '5',
    width: '5',
    height: '5',
    unit: 'in',
  });
  const [weight, setWeight] = useState<Weight>({
    unit: 'oz',
    value: '5'
  });
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [noNotification, setNoNotification] = useState(false);

  // Use SWR to fetch shipping providers
  const { data: providers = [], mutate: refreshProviders } = useSWR(
    'shipping-providers',
    async () => {
      const response = await getShippingProviders();
      if (response.success) {
        return response.data?.shippingProviders ?? [];
      }
      console.error("Failed to fetch shipping providers:", response.error);
      return [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // Cache for 5 seconds
    }
  );

  const selectedItemsCount = Object.values(selectedQuantities).reduce(
    (sum, qty) => sum + (parseInt(qty) || 0),
    0
  );

  const hasSelectedItems = Object.values(selectedQuantities).some(
    (qty) => parseInt(qty) > 0
  );

  const handleCreateLabel = async () => {
    if (!selectedRate || !hasSelectedItems || !selectedProvider) return;
    setIsLoading(true);

    const response = await createProviderShippingLabel({
      orderId: order.id,
      providerId: selectedProvider.id,
      rateId: selectedRate.id,
      dimensions: {
        length: parseFloat(dimensions.length),
        width: parseFloat(dimensions.width),
        height: parseFloat(dimensions.height),
        weight: parseFloat(weight.value),
        unit: dimensions.unit,
        weightUnit: weight.unit,
      },
      lineItems: Object.entries(selectedQuantities)
        .filter(([_, qty]) => parseInt(qty) > 0)
        .map(([id, qty]) => ({
          lineItemId: id,
          quantity: parseInt(qty),
        })),
    });

    if (response.success) {
      setSelectedRate(null);
      toast.success('Shipping label created successfully');
    } else {
      console.error('Failed to create shipping label:', response.error, response.errors);
      
      // Get the detailed error message from response.errors if available
      const errorMessage = response.errors?.[0]?.message || response.error;
      const extensions = response.errors?.[0]?.extensions;
      const originalError = extensions?.originalError?.message;
      
      toast.error('Failed to create shipping label', {
        description: originalError || errorMessage || 'An unexpected error occurred'
      });
    }
    setIsLoading(false);
  };

  const handleManualFulfill = async () => {
    if (!hasSelectedItems) return;
    setIsLoading(true);

    const response = await createManualFulfillment({
      orderId: order.id,
      lineItems: Object.entries(selectedQuantities)
        .filter(([_, qty]) => parseInt(qty) > 0)
        .map(([id, qty]) => ({
          lineItemId: id,
          quantity: parseInt(qty),
        })),
      trackingNumber,
      carrier,
      noNotification,
    });

    if (response.success) {
      setSelectedQuantities({});
      setTrackingNumber('');
      setCarrier('');
      setNoNotification(false);
      toast.success('Fulfillment created successfully');
    } else {
      console.error('Failed to create fulfillment:', response.error, response.errors);
      toast.error('Failed to create fulfillment', {
        description: response.error
      });
    }
    setIsLoading(false);
  };

  // Get the preset if we're creating from a preset
  const presetProviders = [
    { id: 'shippo', name: 'Shippo' },
    { id: 'shipengine', name: 'ShipEngine' },
  ];
  const selectedPreset = presetProviders.find((p) => p.id === selectedTab);
  const isCreatingProvider = selectedTab === 'new' || selectedPreset;

  // Handler for dimensions updates
  const handleDimensionsUpdate = (newDimensions: Dimensions) => {
    setDimensions(newDimensions);
  };

  // Handler for weight updates
  const handleWeightUpdate = (newWeight: Weight) => {
    setWeight(newWeight);
  };

  // Handle provider deletion
  const handleProviderDelete = async (provider: ShippingProvider) => {
    // If the deleted provider was selected, find its preset equivalent
    if (selectedTab === provider.id) {
      const metadata = provider.metadata || {};
      if (metadata.source === 'preset' && metadata.presetId) {
        // Switch back to the preset version
        setSelectedTab(metadata.presetId);
      } else {
        // If it wasn't a preset or we can't determine the preset, go to manual
        setSelectedTab('manual');
      }
    }
  };

  // Handle provider creation success
  const handleProviderCreated = async (provider: ShippingProvider) => {
    // Select the newly created provider
    setSelectedTab(provider.id);
    // Refresh the providers list
    await refreshProviders();
  };

  // Find the selected provider
  const selectedProvider = providers.find((p: ShippingProvider) => p.id === selectedTab);

  if (selectedItemsCount === 0) {
    return (
      <Card className="bg-muted/10">
        <div className="m-2 flex h-44 items-center justify-center rounded-lg border bg-muted/40">
          <div className="text-center">
            <Package
              className="mx-auto h-7 w-7 text-muted-foreground/50"
              aria-hidden="true"
            />
            <p className="mt-2 text-sm font-medium">
              Please select at least 1 item to fulfill
            </p>
            <p className="text-sm text-muted-foreground">
              Select items from the list to begin fulfillment
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/10">
      <div className="space-y-1">
        <p className="px-4 py-3 font-medium uppercase text-xs tracking-wider text-muted-foreground border-b">
          Fulfilling {selectedItemsCount}{" "}
          {selectedItemsCount === 1 ? "item" : "items"}...
        </p>

        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
              Shipping Method
            </h3>
            <div className="flex items-start gap-2 mt-2">
              <div className="flex-1">
                <Select
                  value={selectedTab}
                  onValueChange={setSelectedTab}
                >
                  <SelectTrigger className="gap-6 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0 text-xs font-medium h-8 rounded-lg text-foreground">
                    <SelectValue placeholder="Select shipping method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-muted-foreground font-normal text-xs ps-2">
                        Shipping Providers
                      </SelectLabel>
                      <SelectItem value="manual" className="text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <Package className="opacity-60" size={10} strokeWidth={2} />
                          <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                            Manual
                          </span>
                        </span>
                      </SelectItem>
                      {providers.map((provider: ShippingProvider) => (
                        <SelectItem
                          key={provider.id}
                          value={provider.id}
                          className="text-xs font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <StatusIndicator provider={provider} />
                            <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                              {provider.name}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>

                    <SelectGroup>
                      <SelectLabel className="text-muted-foreground font-normal text-xs ps-2">
                        Add Provider
                      </SelectLabel>
                      <SelectItem value="new" className="text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                            Custom Provider
                          </span>
                        </span>
                      </SelectItem>
                      {presetProviders.map((preset) => (
                        <SelectItem
                          key={preset.id}
                          value={preset.id}
                          className="text-xs font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <StatusIndicator provider={preset} isPreset={true} />
                            <span className="truncate uppercase tracking-wide opacity-75 font-medium">
                              {preset.name} Provider
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {selectedTab !== 'manual' && !isCreatingProvider && selectedProvider && (
                <ProviderActionsInline
                  provider={selectedProvider}
                  onProviderToggle={onProviderToggle}
                  onDelete={handleProviderDelete}
                />
              )}
            </div>
          </div>

          <div>
            {isCreatingProvider ? (
              selectedPreset ? (
                <PresetTabContent
                  provider={selectedPreset}
                  onNameChange={() => {}}
                  onSuccess={handleProviderCreated}
                  refetchProviders={refreshProviders}
                />
              ) : (
                <NewProviderTabContent
                  onSuccess={handleProviderCreated}
                  refetchProviders={refreshProviders}
                />
              )
            ) : selectedTab === 'manual' ? (
              <ManualTabContent
                trackingNumber={trackingNumber}
                setTrackingNumber={setTrackingNumber}
                carrier={carrier}
                setCarrier={setCarrier}
                noNotification={noNotification}
                setNoNotification={setNoNotification}
                handleManualFulfill={handleManualFulfill}
                fulfillmentState={{ loading: isLoading, error: null }}
                hasSelectedItems={hasSelectedItems}
                dimensions={dimensions}
                setDimensions={handleDimensionsUpdate}
                weight={weight}
                setWeight={handleWeightUpdate}
              />
            ) : selectedProvider ? (
              <ProviderTabContent
                provider={selectedProvider}
                selectedRate={selectedRate}
                setSelectedRate={setSelectedRate}
                createLabelLoading={isLoading}
                createLabelError={null}
                handleCreateLabel={handleCreateLabel}
                hasSelectedItems={hasSelectedItems}
                order={order}
                onRateSelect={setSelectedRate}
                dimensions={dimensions}
                weight={weight}
                onDimensionsChange={handleDimensionsUpdate}
                onWeightChange={handleWeightUpdate}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}