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
import { MoreVertical, Users, DollarSign, Calendar, Clock, User, Group } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";

const statusColors = {
  "active": "emerald",
  "inactive": "zinc"
} as const;

interface PriceList {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  startsAt?: string;
  endsAt?: string;
  customerGroups?: Array<{
    id: string;
    name: string;
    metadata?: any;
  }>;
  prices?: Array<{
    id: string;
    amount: number;
    currency?: {
      id: string;
      code: string;
      symbol: string;
    };
    variant?: {
      id: string;
      title: string;
      product?: {
        id: string;
        title: string;
      };
    };
  }>;
  rules?: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
  }>;
  createdAt: string;
  updatedAt?: string;
}

interface PriceListDetailsComponentProps {
  pricelist: PriceList;
  list: any;
}

type TabType = 'customerGroups' | 'prices' | 'rules';

export function PriceListDetailsComponent({
  pricelist,
  list,
}: PriceListDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('customerGroups');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    customerGroups: 1,
    prices: 1,
    rules: 1
  });
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItemType, setEditItemType] = useState<string>('');
  const itemsPerPage = 5;

  // Prepare data for tabs
  const customerGroupsData = pricelist.customerGroups || [];
  const pricesData = pricelist.prices || [];
  const rulesData = pricelist.rules || [];

  const tabs = [
    { 
      key: 'customerGroups' as TabType, 
      label: `Customer Groups`,
      count: customerGroupsData.length,
      data: customerGroupsData
    },
    { 
      key: 'prices' as TabType, 
      label: `Prices`,
      count: pricesData.length,
      data: pricesData
    },
    { 
      key: 'rules' as TabType, 
      label: `Rules`,
      count: rulesData.length,
      data: rulesData
    }
  ].filter(tab => tab.count > 0);

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const handlePageChange = (tabKey: TabType, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabKey]: newPage
    }));
  };

  const formatCurrency = (amount: number, currency?: { code: string; symbol: string }) => {
    if (!currency) return `$${(amount / 100).toFixed(2)}`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
    }).format(amount / 100);
  };

  const handleEditItem = (itemId: string, itemType: string) => {
    setEditItemId(itemId);
    setEditItemType(itemType);
    setEditItemOpen(true);
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={pricelist.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[120px]">
            <div className="flex items-start gap-4">
              {/* PriceList Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/price-lists/${pricelist.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {pricelist.name}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(pricelist.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                {/* Enhanced Price List Details */}
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground">Type: {pricelist.type}</span>
                  {customerGroupsData.length > 0 && (
                    <>
                      <span className="text-muted-foreground">‧</span>
                      <span className="text-muted-foreground">
                        {customerGroupsData.length} {customerGroupsData.length === 1 ? 'group' : 'groups'}
                      </span>
                    </>
                  )}
                  {pricesData.length > 0 && (
                    <>
                      <span className="text-muted-foreground">‧</span>
                      <span className="text-muted-foreground">
                        {pricesData.length} {pricesData.length === 1 ? 'price' : 'prices'}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                {pricelist.description && (
                  <div className="text-sm text-muted-foreground">
                    {pricelist.description}
                  </div>
                )}

                {/* Date Range */}
                {(pricelist.startsAt || pricelist.endsAt) && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {pricelist.startsAt && `Starts: ${new Date(pricelist.startsAt).toLocaleDateString()}`}
                      {pricelist.startsAt && pricelist.endsAt && ' • '}
                      {pricelist.endsAt && `Ends: ${new Date(pricelist.endsAt).toLocaleDateString()}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                {pricelist.status && (
                  <Badge
                    color={
                      statusColors[pricelist.status as keyof typeof statusColors] ||
                      "zinc"
                    }
                    className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                  >
                    {pricelist.status.toUpperCase()}
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
                        Edit Price List
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
            {tabs.length > 0 ? (
              <>
                {/* Responsive Tabs Navigation */}
                <div className="bg-muted/40">
                  {/* Desktop: Horizontal Tab Buttons */}
                  <div className="hidden md:flex items-center gap-3 px-4 pt-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative z-10 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-300 border ${
                          activeTab === tab.key 
                            ? 'bg-background border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100' 
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-background/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>
                            {tab.key === 'customerGroups' && 'Customer Groups'}
                            {tab.key === 'prices' && 'Prices'}
                            {tab.key === 'rules' && 'Rules'}
                          </span>
                          <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px] -mr-1">
                            {tab.count}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Mobile: Select Dropdown */}
                  <div className="md:hidden px-4 py-2">
                    <div className="w-fit">
                      <Select value={activeTab} onValueChange={(value: TabType) => setActiveTab(value)}>
                        <SelectTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-background border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 h-auto w-auto">
                          <div className="flex items-center gap-1.5">
                            <SelectValue />
                            <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px] -mr-1">
                              ({activeTabData?.count || 0})
                            </span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {tabs.map((tab) => (
                            <SelectItem key={tab.key} value={tab.key} className="text-xs">
                              {tab.key === 'customerGroups' && 'Customer Groups'}
                              {tab.key === 'prices' && 'Prices'}
                              {tab.key === 'rules' && 'Rules'}
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

                      <div className="px-4 py-2">
                        {/* Customer Groups Tab */}
                        {activeTab === 'customerGroups' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {customerGroupsData.slice(
                              (currentPages.customerGroups - 1) * itemsPerPage,
                              currentPages.customerGroups * itemsPerPage
                            ).map((group, index) => (
                              <div key={group.id} className="rounded-md border bg-background p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Group className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium truncate">{group.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Customer group
                                      </div>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditItem(group.id, 'customer-groups')}>
                                        Edit Customer Group
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Prices Tab */}
                        {activeTab === 'prices' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {pricesData.slice(
                              (currentPages.prices - 1) * itemsPerPage,
                              currentPages.prices * itemsPerPage
                            ).map((price, index) => (
                              <div key={price.id} className="rounded-md border bg-background p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <DollarSign className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium truncate">
                                        {formatCurrency(price.amount, price.currency)}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {price.variant?.product?.title} - {price.variant?.title}
                                      </div>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditItem(price.id, 'prices')}>
                                        Edit Price
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Rules Tab */}
                        {activeTab === 'rules' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {rulesData.slice(
                              (currentPages.rules - 1) * itemsPerPage,
                              currentPages.rules * itemsPerPage
                            ).map((rule, index) => (
                              <div key={rule.id} className="rounded-md border bg-background p-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium truncate">{rule.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {rule.type} • Value: {rule.value}
                                      </div>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 shrink-0"
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditItem(rule.id, 'price-list-rules')}>
                                        Edit Rule
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="px-4 md:px-6 py-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No customer groups, prices, or rules configured for this price list
                  </p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="price-lists"
        itemId={pricelist.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />

      {/* Edit Item Drawer */}
      {editItemId && (
        <EditItemDrawerClientWrapper
          listKey={editItemType}
          itemId={editItemId}
          open={editItemOpen}
          onClose={() => {
            setEditItemOpen(false);
            setEditItemId('');
            setEditItemType('');
          }}
        />
      )}
    </>
  );
}
