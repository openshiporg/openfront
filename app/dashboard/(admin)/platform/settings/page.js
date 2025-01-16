'use client';

import React from 'react';
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { StoreSettings } from './components/StoreSettings';
import { ShippingSettings } from './components/ShippingSettings';
import { PaymentSettings } from './components/PaymentSettings';
import { TaxSettings } from './components/TaxSettings';
import { RegionSettings } from './components/RegionSettings';
import { PermissionSettings } from './components/PermissionSettings';

const SETTINGS_QUERY = gql`
  query GetSettings {
    store {
      id
      name
      defaultCurrency {
        code
      }
      currencies {
        code
      }
      swapLinkTemplate
      paymentLinkTemplate
      inviteLinkTemplate
    }
    regions {
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
    paymentProviders {
      id
      isEnabled
      isInstalled
    }
    fulfillmentProviders {
      id
      isEnabled
      isInstalled
    }
    taxProviders {
      id
      isEnabled
      isInstalled
    }
  }
`;

export default function SettingsPage() {
  const { data, loading } = useQuery(SETTINGS_QUERY);

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-zinc-500">
          Configure your store settings and preferences
        </p>
      </div>

      <Tabs defaultValue="store" className="w-full">
        <TabsList>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-4">
          <StoreSettings data={data?.store} loading={loading} />
        </TabsContent>

        <TabsContent value="shipping" className="mt-4">
          <ShippingSettings 
            providers={data?.fulfillmentProviders} 
            regions={data?.regions}
            loading={loading} 
          />
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <PaymentSettings 
            providers={data?.paymentProviders} 
            regions={data?.regions}
            loading={loading} 
          />
        </TabsContent>

        <TabsContent value="tax" className="mt-4">
          <TaxSettings 
            providers={data?.taxProviders} 
            regions={data?.regions}
            loading={loading} 
          />
        </TabsContent>

        <TabsContent value="regions" className="mt-4">
          <RegionSettings 
            regions={data?.regions} 
            loading={loading} 
          />
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <PermissionSettings loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 