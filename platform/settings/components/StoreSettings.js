'use client';

import React from 'react';
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

const UPDATE_STORE = gql`
  mutation UpdateStore($id: ID!, $data: StoreUpdateInput!) {
    updateStore(where: { id: $id }, data: $data) {
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
  }
`;

export function StoreSettings({ data, loading }) {
  const [updateStore] = useMutation(UPDATE_STORE);
  const [formData, setFormData] = React.useState({
    name: data?.name || '',
    defaultCurrencyCode: data?.defaultCurrency?.code || '',
    swapLinkTemplate: data?.swapLinkTemplate || '',
    paymentLinkTemplate: data?.paymentLinkTemplate || '',
    inviteLinkTemplate: data?.inviteLinkTemplate || '',
  });

  React.useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        defaultCurrencyCode: data.defaultCurrency?.code || '',
        swapLinkTemplate: data.swapLinkTemplate || '',
        paymentLinkTemplate: data.paymentLinkTemplate || '',
        inviteLinkTemplate: data.inviteLinkTemplate || '',
      });
    }
  }, [data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateStore({
        variables: {
          id: data.id,
          data: {
            name: formData.name,
            defaultCurrency: { connect: { code: formData.defaultCurrencyCode } },
            swapLinkTemplate: formData.swapLinkTemplate,
            paymentLinkTemplate: formData.paymentLinkTemplate,
            inviteLinkTemplate: formData.inviteLinkTemplate,
          },
        },
      });
    } catch (error) {
      console.error('Failed to update store settings:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Store Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter store name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Default Currency</label>
            <Select
              value={formData.defaultCurrencyCode}
              onValueChange={(value) => setFormData({ ...formData, defaultCurrencyCode: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {data?.currencies?.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Swap Link Template</label>
            <Input
              value={formData.swapLinkTemplate}
              onChange={(e) => setFormData({ ...formData, swapLinkTemplate: e.target.value })}
              placeholder="Enter swap link template"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Use {'{swap_id}'} as a placeholder for the swap ID
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Payment Link Template</label>
            <Input
              value={formData.paymentLinkTemplate}
              onChange={(e) => setFormData({ ...formData, paymentLinkTemplate: e.target.value })}
              placeholder="Enter payment link template"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Use {'{payment_id}'} as a placeholder for the payment ID
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Invite Link Template</label>
            <Input
              value={formData.inviteLinkTemplate}
              onChange={(e) => setFormData({ ...formData, inviteLinkTemplate: e.target.value })}
              placeholder="Enter invite link template"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Use {'{invite_id}'} as a placeholder for the invite ID
            </p>
          </div>

          <Button type="submit">Save Changes</Button>
        </CardContent>
      </Card>
    </form>
  );
} 