'use client';

import React from 'react';
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

const UPDATE_REGION = gql`
  mutation UpdateRegion($id: ID!, $data: RegionUpdateInput!) {
    updateRegion(where: { id: $id }, data: $data) {
      id
      name
      currency {
        code
      }
      countries {
        id
        name
        iso2
      }
      taxRate
      paymentProviders {
        id
        isEnabled
      }
      fulfillmentProviders {
        id
        isEnabled
      }
    }
  }
`;

const CREATE_REGION = gql`
  mutation CreateRegion($data: RegionCreateInput!) {
    createRegion(data: $data) {
      id
      name
      currency {
        code
      }
      countries {
        id
        name
        iso2
      }
      taxRate
      paymentProviders {
        id
        isEnabled
      }
      fulfillmentProviders {
        id
        isEnabled
      }
    }
  }
`;

export function RegionSettings({ regions = [], loading }) {
  const [updateRegion] = useMutation(UPDATE_REGION);
  const [createRegion] = useMutation(CREATE_REGION);
  const [isCreating, setIsCreating] = React.useState(false);
  const [newRegion, setNewRegion] = React.useState({
    name: '',
    currencyCode: '',
    countries: [],
  });

  const handleCreateRegion = async (e) => {
    e.preventDefault();
    try {
      await createRegion({
        variables: {
          data: {
            name: newRegion.name,
            currency: { connect: { code: newRegion.currencyCode } },
            countries: { connect: newRegion.countries.map(id => ({ id })) },
          },
        },
      });
      setIsCreating(false);
      setNewRegion({ name: '', currencyCode: '', countries: [] });
    } catch (error) {
      console.error('Failed to create region:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Regions</CardTitle>
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              Add Region
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isCreating && (
              <form onSubmit={handleCreateRegion} className="p-4 border rounded-lg space-y-4">
                <div>
                  <label className="text-sm font-medium">Region Name</label>
                  <Input
                    value={newRegion.name}
                    onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                    placeholder="Enter region name"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Select
                    value={newRegion.currencyCode}
                    onValueChange={(value) => setNewRegion({ ...newRegion, currencyCode: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Region</Button>
                </div>
              </form>
            )}

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
                  <Button variant="outline">Edit</Button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Payment Providers</h4>
                    <div className="flex flex-wrap gap-2">
                      {region.paymentProviders?.map((provider) => (
                        provider.isEnabled && (
                          <Badge key={provider.id} variant="outline">
                            {provider.id}
                          </Badge>
                        )
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Shipping Providers</h4>
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

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {region.countries?.map((country) => (
                      <Badge key={country.id} variant="secondary">
                        {country.name} ({country.iso2})
                      </Badge>
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