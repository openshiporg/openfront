'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Dimensions, Weight } from '../../types';
import { useEffect, useState } from 'react'

interface ManualTabContentProps {
  trackingNumber: string;
  setTrackingNumber: (value: string) => void;
  carrier: string;
  setCarrier: (value: string) => void;
  noNotification: boolean;
  setNoNotification: (value: boolean) => void;
  handleManualFulfill: () => Promise<void>;
  fulfillmentState: { loading: boolean; error: Error | string | null };
  hasSelectedItems: boolean;
  // Note: keeping unused props in interface but omitting them from function params
  dimensions: Dimensions;
  setDimensions: (dimensions: Dimensions) => void;
  weight: Weight;
  setWeight: (weight: Weight) => void;
}

export function ManualTabContent({
  trackingNumber,
  setTrackingNumber,
  carrier,
  setCarrier,
  noNotification,
  setNoNotification,
  handleManualFulfill,
  fulfillmentState,
  hasSelectedItems,
}: ManualTabContentProps) {

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="w-[120px]">
          <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground mb-1.5">
            Carrier
          </h3>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger className="h-8 rounded-lg text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ups">UPS</SelectItem>
              <SelectItem value="usps">USPS</SelectItem>
              <SelectItem value="fedex">FedEx</SelectItem>
              <SelectItem value="dhl">DHL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground mb-1.5">
            Tracking Number
          </h3>
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="h-8 rounded-lg text-sm"
            placeholder="Enter tracking number"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="send-notification"
              checked={!noNotification}
              onCheckedChange={(checked) => setNoNotification(!checked)}
            />
            <Label htmlFor="send-notification" asChild>
              <h3 className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
                Notify Customer
              </h3>
            </Label>
          </div>
        </div>

        <Button
          onClick={handleManualFulfill}
          size="sm"
          disabled={fulfillmentState.loading || !hasSelectedItems}
          className="h-8 rounded-lg"
        >
          {fulfillmentState.loading ? 'Fulfilling...' : 'Fulfill Items'}
        </Button>
      </div>
    </div>
  );
}