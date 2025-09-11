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
import { MoreVertical, FileText, Mail, Phone, DollarSign, Calendar, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { OrderDetailsComponent } from "../../orders/components/OrderDetailsComponent";

const statusColors = {
  "active": "emerald",
  "suspended": "red",
  "pending": "yellow"
} as const;

interface Account {
  id: string;
  accountNumber: string;
  title: string;
  description?: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  creditLimit: number;
  balanceDue: number;
  formattedTotal: string;
  formattedBalance: string;
  formattedCreditLimit: string;
  availableCredit: number;
  formattedAvailableCredit: string;
  currency: {
    id: string;
    code: string;
    symbol: string;
  };
  dueDate?: string;
  paidAt?: string;
  suspendedAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orders: Array<{
    id: string;
    displayId: string;
    total: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

interface AccountDetailsComponentProps {
  account: Account;
  list: any;
}

type TabType = 'orders';

export function InvoiceDetailsComponent({
  invoice,
  list,
}: any) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    orders: 1
  });
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItemType, setEditItemType] = useState<string>('');
  const itemsPerPage = 5;

  // Prepare data for tabs
  const ordersData = invoice.orders || [];

  const tabs = [
    { 
      key: 'orders' as TabType, 
      label: `Orders`,
      count: ordersData.length,
      data: ordersData
    }
  ].filter(tab => tab.count > 0);

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  const handlePageChange = (tabKey: TabType, newPage: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabKey]: newPage
    }));
  };

  const handleEditItem = (itemId: string, itemType: string) => {
    setEditItemId(itemId);
    setEditItemType(itemType);
    setEditItemOpen(true);
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={invoice.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[120px]">
            <div className="flex items-start gap-4">
              {/* Invoice Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/accounts/${invoice.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {invoice.invoiceNumber || invoice.accountNumber}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                {/* Enhanced Invoice Details */}
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  {invoice.user.email && (
                    <>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{invoice.user.name} ({invoice.user.email})</span>
                      </div>
                      <span className="text-muted-foreground">‧</span>
                    </>
                  )}
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{invoice.formattedBalance || invoice.formattedTotal}</span>
                  </div>
                  <span className="text-muted-foreground">‧</span>
                  <span className="text-muted-foreground">
                    {ordersData.length} {ordersData.length === 1 ? 'order' : 'orders'}
                  </span>
                  {invoice.dueDate && (
                    <>
                      <span className="text-muted-foreground">‧</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Due {new Date(invoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={
                    statusColors[invoice.status as keyof typeof statusColors] || "zinc"
                  }
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {invoice.status.toUpperCase()}
                </Badge>
                
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
                        Edit Account
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
                        {tab.key === 'orders' && 'Orders'}
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
                          {tab.key === 'orders' && 'Orders'}
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
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {ordersData.slice(
                          (currentPages.orders - 1) * itemsPerPage,
                          currentPages.orders * itemsPerPage
                        ).map((order, index) => (
                          <div key={order.id} className="rounded-md border bg-background p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">
                                    Order #{order.displayId}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {order.total}
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
                                  <DropdownMenuItem onClick={() => handleEditItem(order.id, 'orders')}>
                                    Edit Order
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="accounts"
        itemId={invoice.id}
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
