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
import { MoreVertical, User, Mail, Phone, MapPin, ShoppingCart, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { EditItemDrawerClientWrapper } from "../../components/EditItemDrawerClientWrapper";
import { ItemPagination } from "../../orders/components/ItemPagination";
import { OrderDetailsComponent } from "../../orders/components/OrderDetailsComponent";

const statusColors = {
  "has_account": "emerald",
  "no_account": "zinc"
} as const;

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  hasAccount: boolean;
  role?: {
    id: string;
    name: string;
  };
  orders?: Array<{
    id: string;
    displayId: string;
    status: string;
    email: string;
    taxRate?: number;
    canceledAt?: string;
    createdAt: string;
    updatedAt?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
    shippingAddress?: {
      id: string;
      company?: string;
      firstName?: string;
      lastName?: string;
      address1?: string;
      address2?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      phone?: string;
    };
    billingAddress?: {
      id: string;
      company?: string;
      firstName?: string;
      lastName?: string;
      address1?: string;
      address2?: string;
      city?: string;
      province?: string;
      postalCode?: string;
      phone?: string;
    };
    lineItems?: Array<{
      id: string;
      title: string;
      quantity: number;
      sku?: string;
      thumbnail?: string;
      formattedUnitPrice?: string;
      formattedTotal?: string;
      variantData?: any;
      productData?: any;
    }>;
    total?: string;
  }>;
  addresses?: Array<{
    id: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    phone?: string;
    metadata?: any;
  }>;
  carts?: Array<{
    id: string;
    status: string;
    completedAt?: string;
    createdAt: string;
    totalPrice?: string;
    lineItems?: Array<{
      id: string;
      title: string;
      quantity: number;
    }>;
  }>;
  customerGroups?: Array<{
    id: string;
    name: string;
    metadata?: any;
  }>;
  createdAt: string;
  updatedAt?: string;
}

interface UserDetailsComponentProps {
  user: User;
  list: any;
}

type TabType = 'orders' | 'addresses' | 'carts' | 'customerGroups';

export function UserDetailsComponent({
  user,
  list,
}: UserDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [currentPages, setCurrentPages] = useState<Record<TabType, number>>({
    orders: 1,
    addresses: 1,
    carts: 1,
    customerGroups: 1
  });
  const [editItemId, setEditItemId] = useState<string>('');
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItemType, setEditItemType] = useState<string>('');
  const itemsPerPage = 5;

  // Prepare data for tabs
  const ordersData = user.orders || [];
  const addressesData = user.addresses || [];
  const cartsData = user.carts || [];
  const customerGroupsData = user.customerGroups || [];

  const tabs = [
    { 
      key: 'orders' as TabType, 
      label: `Orders`,
      count: ordersData.length,
      data: ordersData
    },
    { 
      key: 'addresses' as TabType, 
      label: `Addresses`,
      count: addressesData.length,
      data: addressesData
    },
    { 
      key: 'carts' as TabType, 
      label: `Carts`,
      count: cartsData.length,
      data: cartsData
    },
    { 
      key: 'customerGroups' as TabType, 
      label: `Customer Groups`,
      count: customerGroupsData.length,
      data: customerGroupsData
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
        <AccordionItem value={user.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[120px]">
            <div className="flex items-start gap-4">
              {/* User Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/platform/users/${user.id}`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {user.name || `${user.firstName} ${user.lastName}`.trim() || user.email}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                {/* Enhanced User Details */}
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  {user.email && (
                    <>
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{user.email}</span>
                      </div>
                      <span className="text-muted-foreground">‧</span>
                    </>
                  )}
                  {user.phone && (
                    <>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{user.phone}</span>
                      </div>
                      <span className="text-muted-foreground">‧</span>
                    </>
                  )}
                  <span className="text-muted-foreground">
                    {ordersData.length} {ordersData.length === 1 ? 'order' : 'orders'}
                  </span>
                  {addressesData.length > 0 && (
                    <>
                      <span className="text-muted-foreground">‧</span>
                      <span className="text-muted-foreground">
                        {addressesData.length} {addressesData.length === 1 ? 'address' : 'addresses'}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Role Display */}
                {user.role && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Role: {user.role.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={
                    user.hasAccount ? "emerald" : "zinc"
                  }
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {user.hasAccount ? "HAS ACCOUNT" : "NO ACCOUNT"}
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
                        Edit User
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
            <div className="bg-muted/80 border-b">
              {/* Desktop: Horizontal Tab Buttons */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2">
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
                        {tab.key === 'addresses' && 'Addresses'}
                        {tab.key === 'carts' && 'Carts'}
                        {tab.key === 'customerGroups' && 'Customer Groups'}
                      </span>
                      <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px]">
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
                        <span className="rounded-sm bg-muted border px-1.5 py-0 text-[10px] leading-[14px] font-medium text-muted-foreground inline-flex items-center h-[18px]">
                          ({activeTabData?.count || 0})
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {tabs.map((tab) => (
                        <SelectItem key={tab.key} value={tab.key} className="text-xs">
                          {tab.key === 'orders' && 'Orders'}
                          {tab.key === 'addresses' && 'Addresses'}
                          {tab.key === 'carts' && 'Carts'}
                          {tab.key === 'customerGroups' && 'Customer Groups'}
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
                      <div className="space-y-2">
                        {ordersData.slice(
                          (currentPages.orders - 1) * itemsPerPage,
                          currentPages.orders * itemsPerPage
                        ).map((order) => (
                          <div key={order.id} className="border-0">
                            <OrderDetailsComponent
                              order={order}
                              list={{ key: "Order" }}
                              removeEditItemButton={true}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Addresses Tab */}
                    {activeTab === 'addresses' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {addressesData.slice(
                          (currentPages.addresses - 1) * itemsPerPage,
                          currentPages.addresses * itemsPerPage
                        ).map((address, index) => (
                          <div key={address.id} className="rounded-md border bg-background p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">
                                    {address.firstName} {address.lastName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {address.address1}
                                    {address.city && `, ${address.city}`}
                                    {address.province && `, ${address.province}`}
                                  </div>
                                  {address.phone && (
                                    <div className="text-xs text-muted-foreground">
                                      {address.phone}
                                    </div>
                                  )}
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
                                  <DropdownMenuItem onClick={() => handleEditItem(address.id, 'addresses')}>
                                    Edit Address
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Carts Tab */}
                    {activeTab === 'carts' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {cartsData.slice(
                          (currentPages.carts - 1) * itemsPerPage,
                          currentPages.carts * itemsPerPage
                        ).map((cart, index) => (
                          <div key={cart.id} className="rounded-md border bg-background p-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <ShoppingCart className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">
                                    Cart #{cart.id.slice(-8)}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                      cart.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'
                                    }`}></div>
                                    <span className="truncate">
                                      {cart.status.toLowerCase()}
                                    </span>
                                    {cart.totalPrice && (
                                      <>
                                        <span>‧</span>
                                        <span>{cart.totalPrice}</span>
                                      </>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(cart.createdAt).toLocaleDateString()}
                                    {cart.lineItems && (
                                      <> • {cart.lineItems.length} items</>
                                    )}
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
                                  <DropdownMenuItem onClick={() => handleEditItem(cart.id, 'carts')}>
                                    Edit Cart
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

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
                                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-medium truncate">{group.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Customer group membership
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
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawerClientWrapper
        listKey="users"
        itemId={user.id}
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
