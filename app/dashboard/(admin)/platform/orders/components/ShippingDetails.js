import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";

export function ShippingDetails({ shipping }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500">Status</span>
            <Badge variant={shipping.status === 'shipped' ? 'success' : 'secondary'}>
              {shipping.status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm text-zinc-500">Shipping Address</span>
            <div className="rounded-md border p-3">
              <p>{shipping.address.address1}</p>
              {shipping.address.address2 && <p>{shipping.address.address2}</p>}
              <p>{shipping.address.city}, {shipping.address.state} {shipping.address.postalCode}</p>
              <p>{shipping.address.country}</p>
            </div>
          </div>

          {shipping.trackingNumber && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Tracking Number</span>
              <span className="font-mono">{shipping.trackingNumber}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 