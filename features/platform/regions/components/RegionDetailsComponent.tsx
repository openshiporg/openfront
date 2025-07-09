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
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { RegionEditDrawer } from "./RegionEditDrawer";

const statusColors = {
  "active": "emerald",
  "inactive": "zinc"
} as const;

interface Region {
  id: string;
  name: string;
  code: string;
  taxRate: number;
  createdAt: string;
  updatedAt?: string;
  automaticTaxes: boolean;
  currency: {
    id: string;
    code: string;
    symbol: string;
    symbolNative: string;
  };
  countries: Array<{
    id: string;
    iso2: string;
    displayName: string;
  }>;
  paymentProviders?: Array<{
    id: string;
    name: string;
    code: string;
    isInstalled: boolean;
  }>;
  fulfillmentProviders?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface RegionDetailsComponentProps {
  region: Region;
  list: any;
}

export function RegionDetailsComponent({
  region,
  list,
}: RegionDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  
  // Determine if region is "active" based on whether it has countries
  const isActive = region.countries && region.countries.length > 0;

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={region.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* Region Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/regions/${region.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {region.name} ({region.code})
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(region.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                {/* Region Summary */}
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="flex items-center gap-1">
                    {region.countries.map(country => '🏴').join(' ')}
                  </span>
                  <span>‧</span>
                  <span className="font-medium">{region.currency.symbol} {region.currency.code.toUpperCase()}</span>
                  <span>‧</span>
                  <span className="text-muted-foreground">{region.countries.length} {region.countries.length === 1 ? 'country' : 'countries'}</span>
                  <span>‧</span>
                  <span className="text-muted-foreground">Tax Rate: {(region.taxRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={isActive ? "emerald" : "zinc"}
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {isActive ? "ACTIVE" : "INACTIVE"}
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
            <div className="divide-y">
              {/* Currency Configuration */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Currency Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="ml-2 font-medium">{region.currency.symbol} {region.currency.code.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tax Rate:</span>
                    <span className="ml-2 font-medium">{(region.taxRate * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Automatic Taxes:</span>
                    <span className="ml-2 font-medium">{region.automaticTaxes ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              {/* Countries */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Countries</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {region.countries.map(country => (
                    <div key={country.iso2} className="flex items-center gap-2">
                      <span className="text-lg">🏴</span>
                      <span className="font-medium">{country.displayName}</span>
                      <span className="text-muted-foreground">({country.iso2.toUpperCase()})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Providers */}
              {region.paymentProviders && region.paymentProviders.length > 0 && (
                <div className="px-4 md:px-6 py-4">
                  <h4 className="text-sm font-medium mb-3">Payment Providers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {region.paymentProviders.map(provider => (
                      <div key={provider.code} className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span className="font-medium">{provider.name}</span>
                        <span className="text-muted-foreground">({provider.code})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fulfillment Providers */}
              {region.fulfillmentProviders && region.fulfillmentProviders.length > 0 && (
                <div className="px-4 md:px-6 py-4">
                  <h4 className="text-sm font-medium mb-3">Shipping & Fulfillment</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {region.fulfillmentProviders.map(provider => (
                      <div key={provider.code} className="flex items-center gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span className="font-medium">{provider.name}</span>
                        <span className="text-muted-foreground">({provider.code})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <RegionEditDrawer
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        region={region}
      />
    </>
  );
}
