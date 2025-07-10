"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, ChevronsUpDown, DollarSign, MapPin, CreditCard, Truck } from "lucide-react";
import Link from "next/link";
// Removed custom RegionEditDrawer - using standard edit drawers for individual components
import { ItemPagination } from "../../orders/components/ItemPagination";

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

interface CollapsibleSectionProps {
  title: string;
  count: number;
  items: any[];
  color: 'blue' | 'green' | 'purple' | 'orange';
  renderItem: (item: any) => React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}

function CollapsibleSection({ title, count, items, color, renderItem, icon: Icon }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const colorClasses = {
    blue: "text-blue-500 bg-white border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300 dark:hover:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:focus:text-white",
    green: "text-green-500 bg-white border-green-200 hover:bg-green-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 dark:bg-green-950 dark:border-green-900 dark:text-green-300 dark:hover:text-white dark:hover:bg-green-700 dark:focus:ring-green-500 dark:focus:text-white",
    purple: "text-purple-500 bg-white border-purple-200 hover:bg-purple-100 hover:text-purple-700 focus:z-10 focus:ring-2 focus:ring-purple-700 focus:text-purple-700 dark:bg-purple-950 dark:border-purple-900 dark:text-purple-300 dark:hover:text-white dark:hover:bg-purple-700 dark:focus:ring-purple-500 dark:focus:text-white",
    orange: "text-orange-500 bg-white border-orange-200 hover:bg-orange-100 hover:text-orange-700 focus:z-10 focus:ring-2 focus:ring-orange-700 focus:text-orange-700 dark:bg-orange-950 dark:border-orange-900 dark:text-orange-300 dark:hover:text-white dark:hover:bg-orange-700 dark:focus:ring-orange-500 dark:focus:text-white"
  };

  const backgroundClasses = {
    blue: "bg-blue-50/30 dark:bg-indigo-900/10",
    green: "bg-green-50/30 dark:bg-green-900/10", 
    purple: "bg-purple-50/30 dark:bg-purple-900/10",
    orange: "bg-orange-50/30 dark:bg-orange-900/10"
  };

  const triggerClassName = `flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium ${colorClasses[color]}`;

  if (count === 0) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`flex flex-col gap-2 py-3 px-4 md:px-6 ${backgroundClasses[color]} border-b`}
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <button type="button" className={triggerClassName}>
            <Icon className="h-4 w-4" />
            {count} {title}{count !== 1 ? "s" : ""}
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        </CollapsibleTrigger>
        {isOpen && count > 5 && (
          <ItemPagination
            currentPage={currentPage}
            totalItems={count}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      <CollapsibleContent className="space-y-2">
        {isOpen && (
          <>
            {count > 5 && (
              <div className="text-xs text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, count)} of{" "}
                {count} items
              </div>
            )}
            {paginatedItems.map((item, index) => (
              <div key={index} className="border p-2 bg-background rounded-sm">
                {renderItem(item)}
              </div>
            ))}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function RegionDetailsComponent({
  region,
  list,
}: RegionDetailsComponentProps) {
  
  // Determine if region is "active" based on whether it has countries
  const isActive = region.countries && region.countries.length > 0;

  // Prepare data for collapsible sections
  const currencyData = [{
    code: region.currency.code,
    symbol: region.currency.symbol,
    symbolNative: region.currency.symbolNative,
    taxRate: region.taxRate,
    automaticTaxes: region.automaticTaxes
  }];

  const paymentProviders = region.paymentProviders || [];
  const fulfillmentProviders = region.fulfillmentProviders || [];

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
                    onClick={() => {
                      // TODO: Add region overview edit functionality
                      // For now, users can edit individual components below
                    }}
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
              {/* Currency Section */}
              <CollapsibleSection
                title="Currency"
                count={1}
                items={currencyData}
                color="blue"
                icon={DollarSign}
                renderItem={(currency) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currency.symbol}</span>
                        <div>
                          <div className="text-sm font-medium">{currency.code.toUpperCase()}</div>
                          <div className="text-xs text-muted-foreground">
                            Tax Rate: {(currency.taxRate * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          Automatic Taxes: {currency.automaticTaxes ? 'Enabled' : 'Disabled'}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          // TODO: Open currency edit drawer
                        }}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              />

              {/* Countries Section */}
              <CollapsibleSection
                title="Country"
                count={region.countries.length}
                items={region.countries}
                color="green"
                icon={MapPin}
                renderItem={(country) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏴</span>
                      <div>
                        <div className="text-sm font-medium">{country.displayName}</div>
                        <div className="text-xs text-muted-foreground">
                          {country.iso2.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        // TODO: Open country edit drawer
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              />

              {/* Payment Providers Section */}
              {paymentProviders.length > 0 && (
                <CollapsibleSection
                  title="Payment Provider"
                  count={paymentProviders.length}
                  items={paymentProviders}
                  color="purple"
                  icon={CreditCard}
                  renderItem={(provider) => (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-600 text-lg">✓</span>
                        <div>
                          <div className="text-sm font-medium">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {provider.code}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={provider.isInstalled ? "default" : "secondary"} className="text-xs">
                          {provider.isInstalled ? "Installed" : "Available"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            // TODO: Open payment provider edit drawer
                          }}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                />
              )}

              {/* Fulfillment Providers Section */}
              {fulfillmentProviders.length > 0 && (
                <CollapsibleSection
                  title="Fulfillment Provider"
                  count={fulfillmentProviders.length}
                  items={fulfillmentProviders}
                  color="orange"
                  icon={Truck}
                  renderItem={(provider) => (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-600 text-lg">✓</span>
                        <div>
                          <div className="text-sm font-medium">{provider.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {provider.code}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          // TODO: Open fulfillment provider edit drawer
                        }}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Individual edit drawers will be added to each collapsible section */}
    </>
  );
}