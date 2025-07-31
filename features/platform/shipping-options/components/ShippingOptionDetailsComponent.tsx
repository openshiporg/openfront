"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Package, MapPin, Building2 } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";

interface ShippingOption {
  id: string;
  name: string;
  uniqueKey: string;
  priceType: 'flat_rate' | 'calculated' | 'free';
  amount?: number;
  isReturn: boolean;
  adminOnly: boolean;
  region?: {
    id: string;
    name: string;
    code: string;
    currency: {
      code: string;
      symbol: string;
    };
  };
  fulfillmentProvider?: {
    id: string;
    name: string;
    code: string;
  };
  shippingProfile?: {
    id: string;
    name: string;
  };
  calculatedAmount?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ShippingOptionDetailsComponentProps {
  shippingOption: ShippingOption;
  list: any;
}

export function ShippingOptionDetailsComponent({
  shippingOption,
  list,
}: ShippingOptionDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Format price display
  const formatPrice = () => {
    if (shippingOption.priceType === 'free') {
      return 'Free';
    }
    
    if (shippingOption.calculatedAmount) {
      return shippingOption.calculatedAmount;
    }
    
    if (shippingOption.amount && shippingOption.region?.currency) {
      const { symbol, code } = shippingOption.region.currency;
      const amount = shippingOption.amount / 100; // Convert from cents
      return `${symbol}${amount.toFixed(2)} ${code}`;
    }
    
    return shippingOption.priceType === 'calculated' ? 'Calculated' : 'N/A';
  };

  // Determine status
  const getStatus = () => {
    if (shippingOption.isReturn) return { label: 'RETURN', color: 'blue' };
    if (shippingOption.adminOnly) return { label: 'ADMIN ONLY', color: 'orange' };
    return { label: 'ACTIVE', color: 'emerald' };
  };

  const status = getStatus();

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={shippingOption.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Shipping Option Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/platform/shipping-options/${shippingOption.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {shippingOption.name}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {formatPrice()}
                  </span>
                </div>
                
                {/* Shipping Option Details */}
                <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    {shippingOption.uniqueKey}
                  </span>
                  <span>‧</span>
                  <span className="capitalize">{shippingOption.priceType.replace('_', ' ')}</span>
                  
                  {shippingOption.region && (
                    <>
                      <span>‧</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{shippingOption.region.name} ({shippingOption.region.code})</span>
                      </div>
                    </>
                  )}
                  
                  {shippingOption.fulfillmentProvider && (
                    <>
                      <span>‧</span>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        <span>{shippingOption.fulfillmentProvider.name}</span>
                      </div>
                    </>
                  )}
                  
                  {shippingOption.shippingProfile && (
                    <>
                      <span>‧</span>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{shippingOption.shippingProfile.name}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={status.color}
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {status.label}
                </Badge>
                
                {/* Action buttons */}
                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    onClick={() => setIsEditDrawerOpen(true)}
                  >
                    <MoreVertical className="stroke-muted-foreground" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    asChild
                  >
                    <AccordionTrigger className="py-0" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <AccordionContent className="pb-0">
            <div className="p-4 space-y-4 bg-muted/40">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Pricing Details */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Pricing</h4>
                  <div className="space-y-1 text-sm">
                    <div>Type: <span className="font-medium capitalize">{shippingOption.priceType.replace('_', ' ')}</span></div>
                    {shippingOption.amount && (
                      <div>Base Amount: <span className="font-medium">{formatPrice()}</span></div>
                    )}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Configuration</h4>
                  <div className="space-y-1 text-sm">
                    <div>Return Option: <span className="font-medium">{shippingOption.isReturn ? 'Yes' : 'No'}</span></div>
                    <div>Admin Only: <span className="font-medium">{shippingOption.adminOnly ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>

                {/* Relationships */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Relationships</h4>
                  <div className="space-y-1 text-sm">
                    {shippingOption.region && (
                      <div>Region: <span className="font-medium">{shippingOption.region.name}</span></div>
                    )}
                    {shippingOption.fulfillmentProvider && (
                      <div>Provider: <span className="font-medium">{shippingOption.fulfillmentProvider.name}</span></div>
                    )}
                    {shippingOption.shippingProfile && (
                      <div>Profile: <span className="font-medium">{shippingOption.shippingProfile.name}</span></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Edit Shipping Option Drawer */}
      <EditItemDrawerClientWrapper
        listKey="shipping-options"
        itemId={shippingOption.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        onSave={() => {
          // Refresh will be handled by the parent component
        }}
      />
    </>
  );
}