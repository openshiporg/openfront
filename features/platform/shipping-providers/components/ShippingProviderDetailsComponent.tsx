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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";

const statusColors = {
  "active": "emerald",
  "inactive": "zinc"
} as const;

interface ShippingProvider {
  id: string;
  name: string;
  isActive?: boolean;
  accessToken?: string;
  metadata?: any;
  regions?: Array<{
    id: string;
    name: string;
    code: string;
    currency?: {
      code: string;
      symbol: string;
    };
    countries?: Array<{
      id: string;
      name: string;
      iso2: string;
    }>;
  }>;
  createdAt: string;
  updatedAt?: string;
  [key: string]: unknown;
}

interface ShippingProviderDetailsComponentProps {
  shippingprovider: ShippingProvider;
  list: any;
}

type TabType = 'regions';

export function ShippingProviderDetailsComponent({
  shippingprovider,
  list,
}: ShippingProviderDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('regions');
  const [currentPage, setCurrentPage] = useState(1);
  const [editRegionId, setEditRegionId] = useState('');
  const [editRegionOpen, setEditRegionOpen] = useState(false);
  
  const itemsPerPage = 5;
  const regions = shippingprovider.regions || [];
  
  const tabs = [
    {
      key: 'regions' as TabType,
      label: `${regions.length} Region${regions.length !== 1 ? 's' : ''}`,
      count: regions.length,
      data: regions
    }
  ];
  
  const activeTabData = tabs.find(tab => tab.key === activeTab);
  
  const resetPage = () => {
    setCurrentPage(1);
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={shippingprovider.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* ShippingProvider Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/shipping-providers/${shippingprovider.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {shippingprovider.name}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(shippingprovider.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                {/* Add more fields display here as needed */}
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                {shippingprovider.isActive !== undefined && (
                  <Badge
                    color={shippingprovider.isActive ? "emerald" : "zinc"}
                    className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                  >
                    {shippingprovider.isActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                )}
                
                {/* Action buttons */}
                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="border [&_svg]:size-3 h-6 w-6"
                      >
                        <MoreVertical className="stroke-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
                        Edit Shipping Provider
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            {/* Regions Tab Section */}
            {regions.length > 0 && (
              <div>
                {/* Responsive Tabs Navigation */}
                <div className="bg-muted/80 border-b">
                  {/* Tab Navigation - Desktop */}
                  <div className="hidden md:flex items-center gap-3 px-4 py-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.key);
                        resetPage();
                      }}
                      className={`relative z-10 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 border ${
                        activeTab === tab.key 
                          ? 'bg-background border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100' 
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-background/50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Regions</span>
                        <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px]">
                          {tab.count}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                  {/* Tab Navigation - Mobile */}
                  <div className="md:hidden px-4 py-2">
                    <div className="w-fit">
                    <Select value={activeTab} onValueChange={(value: TabType) => {
                      setActiveTab(value);
                      resetPage();
                    }}>
                      <SelectTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-auto w-auto">
                        <div className="flex items-center gap-1.5">
                          <SelectValue />
                          <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px]">
                            ({activeTabData?.count || 0})
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {tabs.map((tab) => (
                          <SelectItem key={tab.key} value={tab.key} className="text-xs">
                            Regions
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                  </div>
                </div>

                {/* Tab Content Area */}
                <div className="bg-muted/40">
                  {activeTabData && (
                    <>
                      {/* Pagination for active tab */}
                      {activeTabData.count > itemsPerPage && (
                        <div className="flex justify-between items-center px-4 py-3 border-b border-border/50">
                          <div className="text-xs text-muted-foreground">
                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, activeTabData.count)} to {Math.min(currentPage * itemsPerPage, activeTabData.count)} of {activeTabData.count} regions
                          </div>
                          <ItemPagination
                            currentPage={currentPage}
                            totalItems={activeTabData.count}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                          />
                        </div>
                      )}

                      {/* Tab Content */}
                      <div className="px-4 py-2">
                        {activeTab === 'regions' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {regions
                              .slice(
                                (currentPage - 1) * itemsPerPage,
                                currentPage * itemsPerPage
                              )
                              .map((region, index) => (
                                <div key={index} className="rounded-md border bg-background p-3 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium truncate">{region.name}</div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                          <span className="truncate">{region.code}</span>
                                          {region.currency && (
                                            <>
                                              <span>•</span>
                                              <span className="truncate">{region.currency.symbol} {region.currency.code}</span>
                                            </>
                                          )}
                                        </div>
                                        {region.countries && region.countries.length > 0 && (
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {region.countries.length} countr{region.countries.length === 1 ? 'y' : 'ies'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                          >
                                            <MoreVertical className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => {
                                            setEditRegionId(region.id);
                                            setEditRegionOpen(true);
                                          }}>
                                            Edit Region
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Edit Shipping Provider Drawer */}
      <EditItemDrawerClientWrapper
        listKey="shipping-providers"
        itemId={shippingprovider.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
      
      {/* Edit Region Drawer */}
      <EditItemDrawerClientWrapper
        listKey="regions"
        itemId={editRegionId}
        open={editRegionOpen}
        onClose={() => {
          setEditRegionOpen(false);
          setEditRegionId('');
        }}
      />
    </>
  );
}
