'use client';

import React from 'react';
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

const UPDATE_PROVIDER = gql`
  mutation UpdateFulfillmentProvider($id: ID!, $data: FulfillmentProviderUpdateInput!) {
    updateFulfillmentProvider(where: { id: $id }, data: $data) {
      id
      isEnabled
    }
  }
`;

export function ShippingSettings({ providers = [], regions = [], loading }) {
  const [updateProvider] = useMutation(UPDATE_PROVIDER);

  const handleToggleProvider = async (providerId, isEnabled) => {
    try {
      await updateProvider({
        variables: {
          id: providerId,
          data: { isEnabled },
        },
      });
    } catch (error) {
      console.error('Failed to update provider:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{provider.id}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={provider.isInstalled ? 'success' : 'secondary'}>
                      {provider.isInstalled ? 'Installed' : 'Not Installed'}
                    </Badge>
                    {provider.isEnabled && (
                      <Badge variant="success">Active</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={provider.isEnabled}
                    onCheckedChange={(checked) => handleToggleProvider(provider.id, checked)}
                    disabled={!provider.isInstalled}
                  />
                  <Button variant="outline" disabled={!provider.isInstalled}>
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regions.map((region) => (
              <div key={region.id} className="p-4 border rounded-lg">
                <h3 className="font-medium">{region.name}</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {region.countries?.length || 0} countries
                </p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Active Providers</h4>
                  <div className="flex flex-wrap gap-2">
                    {region.fulfillmentProviders?.map((provider) => (
                      provider.isEnabled && (
                        <Badge key={provider.id} variant="outline">
                          {provider.id}
                        </Badge>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 