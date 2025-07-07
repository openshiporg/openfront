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
import { MoreVertical, ChevronsUpDown } from "lucide-react";
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
  createdAt: string;
  updatedAt?: string;
}

interface UserDetailsComponentProps {
  user: User;
  list: any;
}

export function UserDetailsComponent({
  user,
  list,
}: UserDetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={user.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
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
                
                {/* Add more fields display here as needed */}
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
              {/* Orders Collapsible Section - Always show even with 0 orders */}
              <OrdersCollapsibleSection
                userId={user.id}
                orders={user.orders || []}
                isOpen={isOrdersOpen}
                setIsOpen={setIsOrdersOpen}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                itemsPerPage={itemsPerPage}
              />
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
    </>
  );
}

// Orders Collapsible Section Component
interface OrdersCollapsibleSectionProps {
  userId: string;
  orders: Array<{
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
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const OrdersCollapsibleSection = ({
  userId,
  orders,
  isOpen,
  setIsOpen,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: OrdersCollapsibleSectionProps) => {
  const totalItems = orders.length;

  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const triggerClassName =
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-blue-500 bg-white border-blue-200 hover:bg-blue-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300 dark:hover:text-white dark:hover:bg-blue-700 dark:focus:ring-blue-500 dark:focus:text-white";

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2 py-3 px-4 md:px-6 bg-blue-50/30 dark:bg-blue-900/10 border-b"
    >
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <button type="button" className={triggerClassName}>
            {totalItems} Order{totalItems !== 1 ? "s" : ""}
            <ChevronsUpDown className="h-4 w-4" />
          </button>
        </CollapsibleTrigger>
        {isOpen && totalItems > 5 && (
          <ItemPagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      <CollapsibleContent className="space-y-2">
        {isOpen && (
          <>
            {totalItems > 5 && (
              <div className="text-xs text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
                {totalItems} orders
              </div>
            )}
            {paginatedOrders.map((order) => (
              <div key={order.id} className="border-0">
                <OrderDetailsComponent
                  order={order}
                  list={{ key: "Order" }}
                  removeEditItemButton={true}
                />
              </div>
            ))}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
