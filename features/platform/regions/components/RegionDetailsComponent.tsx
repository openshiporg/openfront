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
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
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

type TabType = 'currency' | 'countries' | 'payment' | 'fulfillment';

// Get country flag from react-flags or fallback to emoji
function getCountryFlag(countryCode: string): string {
  const flagMap: Record<string, string> = {
    'us': '🇺🇸',
    'ca': '🇨🇦',
    'gb': '🇬🇧',
    'de': '🇩🇪',
    'fr': '🇫🇷',
    'es': '🇪🇸',
    'it': '🇮🇹',
    'nl': '🇳🇱',
    'be': '🇧🇪',
    'at': '🇦🇹',
    'pt': '🇵🇹',
    'dk': '🇩🇰',
    'se': '🇸🇪',
    'fi': '🇫🇮',
    'no': '🇳🇴',
    'ie': '🇮🇪',
    'lu': '🇱🇺',
    'ch': '🇨🇭',
    'au': '🇦🇺',
    'nz': '🇳🇿',
    'sg': '🇸🇬',
    'hk': '🇭🇰',
    'jp': '🇯🇵',
    'kr': '🇰🇷',
    'tw': '🇹🇼',
    'mx': '🇲🇽',
    'br': '🇧🇷',
    'ar': '🇦🇷',
    'cl': '🇨🇱',
    'co': '🇨🇴',
    'pe': '🇵🇪',
    'uy': '🇺🇾',
    'ec': '🇪🇨',
    'ae': '🇦🇪',
    'sa': '🇸🇦',
    'qa': '🇶🇦',
    'kw': '🇰🇼',
    'bh': '🇧🇭',
    'om': '🇴🇲',
    'il': '🇮🇱',
    'tr': '🇹🇷',
    'za': '🇿🇦',
    'ng': '🇳🇬',
    'ke': '🇰🇪',
    'eg': '🇪🇬',
    'ma': '🇲🇦',
    'gh': '🇬🇭',
    'in': '🇮🇳',
    'cn': '🇨🇳',
    'is': '🇮🇸'
  };
  
  return flagMap[countryCode.toLowerCase()] || '🏳️';
}

interface TabContentProps {
  items: any[];
  currentPage: number;
  itemsPerPage: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}

function TabContent({ items, currentPage, itemsPerPage, renderItem }: TabContentProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return (
    <div className="space-y-2 py-4">
      {items.length > itemsPerPage && (
        <div className="text-xs text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, items.length)} of{" "}
          {items.length} items
        </div>
      )}
      {paginatedItems.map((item, index) => (
        <div key={index} className="border p-3 bg-background rounded-sm">
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export function RegionDetailsComponent({
  region,
  list,
}: RegionDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('currency');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    currency: 1,
    countries: 1,
    payment: 1,
    fulfillment: 1
  });
  
  // Individual edit drawers
  const [editCurrencyOpen, setEditCurrencyOpen] = useState(false);
  const [editCountryOpen, setEditCountryOpen] = useState(false);
  const [editCountryId, setEditCountryId] = useState<string>('');
  const [editPaymentOpen, setEditPaymentOpen] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<string>('');
  const [editFulfillmentOpen, setEditFulfillmentOpen] = useState(false);
  const [editFulfillmentId, setEditFulfillmentId] = useState<string>('');
  
  const itemsPerPage = 5;
  
  // Determine if region is "active" based on whether it has countries
  const isActive = region.countries && region.countries.length > 0;

  // Prepare data for tabs
  const currencyData = [{
    id: region.currency.id,
    code: region.currency.code,
    symbol: region.currency.symbol,
    symbolNative: region.currency.symbolNative,
    taxRate: region.taxRate,
    automaticTaxes: region.automaticTaxes
  }];

  const paymentProviders = region.paymentProviders || [];
  const fulfillmentProviders = region.fulfillmentProviders || [];

  const tabs = [
    { 
      key: 'currency' as TabType, 
      label: `${currencyData.length} Currency${currencyData.length !== 1 ? 's' : ''}`,
      count: currencyData.length,
      data: currencyData
    },
    { 
      key: 'countries' as TabType, 
      label: `${region.countries.length} Countr${region.countries.length !== 1 ? 'ies' : 'y'}`,
      count: region.countries.length,
      data: region.countries
    },
    { 
      key: 'payment' as TabType, 
      label: `${paymentProviders.length} Payment Provider${paymentProviders.length !== 1 ? 's' : ''}`,
      count: paymentProviders.length,
      data: paymentProviders
    },
    { 
      key: 'fulfillment' as TabType, 
      label: `${fulfillmentProviders.length} Fulfillment Provider${fulfillmentProviders.length !== 1 ? 's' : ''}`,
      count: fulfillmentProviders.length,
      data: fulfillmentProviders
    }
  ].filter(tab => tab.count > 0);

  const handlePageChange = (tabKey: TabType, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabKey]: newPage
    }));
  };

  const activeTabData = tabs.find(tab => tab.key === activeTab);

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
            {/* Horizontal Tabs Navigation */}
            <div className="bg-muted/80 border-b">
              {/* Horizontal Tab Buttons */}
              <div className="flex items-center gap-3 px-4 py-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                      activeTab === tab.key 
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    {activeTab === tab.key && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-in fade-in zoom-in duration-200"></div>
                    )}
                    <span>
                      {tab.key === 'currency' && 'Currency'}
                      {tab.key === 'countries' && 'Countries'}
                      {tab.key === 'payment' && 'Payment Providers'}
                      {tab.key === 'fulfillment' && 'Fulfillment Providers'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content Area */}
            <div className="bg-muted/40">
              {activeTabData && (
                <>
                  {/* Pagination for active tab */}
                  {activeTabData.count > itemsPerPage && (
                    <div className="flex justify-between items-center p-4 pb-2">
                      <div />
                      <ItemPagination
                        currentPage={currentPages[activeTab]}
                        totalItems={activeTabData.count}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(newPage) => handlePageChange(activeTab, newPage)}
                      />
                    </div>
                  )}

                  <div className="p-4 pt-2 space-y-2">
                    {/* Currency Tab */}
                    {activeTab === 'currency' && 
                      currencyData.slice(
                        (currentPages.currency - 1) * itemsPerPage,
                        currentPages.currency * itemsPerPage
                      ).map((currency, index) => (
                        <div key={index} className="rounded-md border bg-background p-2 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{currency.symbol}</span>
                              <div>
                                <div className="text-sm font-medium">{currency.code.toUpperCase()}</div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>Tax Rate: {(currency.taxRate * 100).toFixed(1)}%</span>
                                  <span>‧</span>
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      currency.automaticTaxes ? 'bg-green-500' : 'bg-red-500'
                                    }`}></div>
                                    <span>{currency.automaticTaxes ? 'automatic taxes' : 'no automatic taxes'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => setEditCurrencyOpen(true)}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    }

                    {/* Countries Tab */}
                    {activeTab === 'countries' && 
                      region.countries.slice(
                        (currentPages.countries - 1) * itemsPerPage,
                        currentPages.countries * itemsPerPage
                      ).map((country, index) => (
                        <div key={index} className="rounded-md border bg-background p-2 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{getCountryFlag(country.iso2)}</span>
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
                                setEditCountryId(country.id);
                                setEditCountryOpen(true);
                              }}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    }

                    {/* Payment Providers Tab */}
                    {activeTab === 'payment' && 
                      paymentProviders.slice(
                        (currentPages.payment - 1) * itemsPerPage,
                        currentPages.payment * itemsPerPage
                      ).map((provider, index) => (
                        <div key={index} className="rounded-md border bg-background p-2 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
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
                                  setEditPaymentId(provider.id);
                                  setEditPaymentOpen(true);
                                }}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    }

                    {/* Fulfillment Providers Tab */}
                    {activeTab === 'fulfillment' && 
                      fulfillmentProviders.slice(
                        (currentPages.fulfillment - 1) * itemsPerPage,
                        currentPages.fulfillment * itemsPerPage
                      ).map((provider, index) => (
                        <div key={index} className="rounded-md border bg-background p-2 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
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
                                setEditFulfillmentId(provider.id);
                                setEditFulfillmentOpen(true);
                              }}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Edit Region Drawer */}
      <EditItemDrawerClientWrapper
        listKey="regions"
        itemId={region.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        onSave={() => {
          // Refresh will be handled by the parent component
        }}
      />

      {/* Edit Currency Drawer */}
      <EditItemDrawerClientWrapper
        listKey="currencies"
        itemId={region.currency.id}
        open={editCurrencyOpen}
        onClose={() => setEditCurrencyOpen(false)}
      />

      {/* Edit Country Drawer */}
      {editCountryId && (
        <EditItemDrawerClientWrapper
          listKey="countries"
          itemId={editCountryId}
          open={editCountryOpen}
          onClose={() => {
            setEditCountryOpen(false);
            setEditCountryId('');
          }}
        />
      )}

      {/* Edit Payment Provider Drawer */}
      {editPaymentId && (
        <EditItemDrawerClientWrapper
          listKey="payment-providers"
          itemId={editPaymentId}
          open={editPaymentOpen}
          onClose={() => {
            setEditPaymentOpen(false);
            setEditPaymentId('');
          }}
        />
      )}

      {/* Edit Fulfillment Provider Drawer */}
      {editFulfillmentId && (
        <EditItemDrawerClientWrapper
          listKey="fulfillment-providers"
          itemId={editFulfillmentId}
          open={editFulfillmentOpen}
          onClose={() => {
            setEditFulfillmentOpen(false);
            setEditFulfillmentId('');
          }}
        />
      )}
    </>
  );
}