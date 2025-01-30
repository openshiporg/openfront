'use client';

import React from 'react';
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";

const UPDATE_PROVIDER = gql`
  mutation UpdateTaxProvider($id: ID!, $data: TaxProviderUpdateInput!) {
    updateTaxProvider(where: { id: $id }, data: $data) {
      id
      isEnabled
    }
  }
`;

const UPDATE_REGION = gql`
  mutation UpdateRegion($id: ID!, $data: RegionUpdateInput!) {
    updateRegion(where: { id: $id }, data: $data) {
      id
      taxRate
    }
  }
`;

export function TaxSettings({ providers = [], regions = [], loading }) {
  const [updateProvider] = useMutation(UPDATE_PROVIDER);
  const [updateRegion] = useMutation(UPDATE_REGION);

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

  const handleUpdateTaxRate = async (regionId, taxRate) => {
    try {
      await updateRegion({
        variables: {
          id: regionId,
          data: { taxRate: parseFloat(taxRate) },
        },
      });
    } catch (error) {
      console.error('Failed to update tax rate:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tax Providers</CardTitle>
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
          <CardTitle>Regional Tax Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regions.map((region) => (
              <div key={region.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{region.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {region.currency?.code}
                      </Badge>
                      <span className="text-sm text-zinc-500">
                        {region.countries?.length || 0} countries
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Tax Rate (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-24"
                      value={region.taxRate || 0}
                      onChange={(e) => handleUpdateTaxRate(region.id, e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Active Tax Providers</h4>
                  <div className="flex flex-wrap gap-2">
                    {providers.map((provider) => (
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