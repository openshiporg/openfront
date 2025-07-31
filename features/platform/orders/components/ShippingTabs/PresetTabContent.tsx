'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddressSelect } from './AddressSelect';
import type { ShippingProvider } from '../../types';
import { createShippingProvider } from "@/features/platform/orders/actions";

interface PresetTabContentProps {
  provider: { id: string; name: string };
  onNameChange: (name: string) => void;
  onSuccess: (provider: ShippingProvider) => void;
  refetchProviders: () => Promise<void>;
}

export function PresetTabContent({
  provider,
  onNameChange,
  onSuccess,
  refetchProviders,
}: PresetTabContentProps) {
  const [name, setName] = useState(`${provider.name} Provider`);
  const [apiKey, setApiKey] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !apiKey.trim() || !selectedAddress) {
      setError(new Error('Please fill in all fields and select an address'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create the provider using the server action
      const response = await createShippingProvider({
        name,
        accessToken: apiKey,
        fromAddressId: selectedAddress,
        createLabelFunction: provider.id.toLowerCase(),
        getRatesFunction: provider.id.toLowerCase(),
        validateAddressFunction: provider.id.toLowerCase(),
        trackShipmentFunction: provider.id.toLowerCase(),
        cancelLabelFunction: provider.id.toLowerCase(),
        metadata: {
          source: 'preset',
          presetId: provider.id
        }
      });

      if (response.success) {
        const createdProviderData = response.data?.createShippingProvider;
        if (!createdProviderData) {
          // Handle case where success is true but data is unexpectedly missing
          throw new Error('Provider creation succeeded but no data returned.');
        }
        // Refresh providers list
        await refetchProviders();
        // Notify success
        toast.success(`${name} provider created successfully`);
        // Call success callback
        onSuccess(createdProviderData);
      } else {
        // Handle failure
        throw new Error(response.error || 'Failed to create provider');
      }
    } catch (error) {
      console.error('Error creating provider:', error);
      setError(error instanceof Error ? error : new Error('Failed to create provider'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="provider-name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Provider Name
        </Label>
        <Input
          id="provider-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onNameChange(e.target.value);
          }}
          placeholder="Enter provider name"
          className="h-8 text-sm mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="api-key" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          API Key
        </Label>
        <Input
          id="api-key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={`Enter ${provider.name} API key`}
          className="h-8 text-sm mt-1.5"
          type="text"
          autoComplete="off"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="text-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="address" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Shipping From Address
        </Label>
        <AddressSelect value={selectedAddress} onChange={setSelectedAddress} />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !name.trim() || !apiKey.trim() || !selectedAddress}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Provider...
          </>
        ) : (
          'Create Provider'
        )}
      </Button>
    </form>
  );
}
