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
    email: string;
    total?: string;
    status: string;
    lineItems?: Array<{ id: string }>;
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
              {/* Expanded content - customize based on your entity fields */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{user.email}</span>
                  </div>
                  {user.role && (
                    <div>
                      <span className="text-muted-foreground">Role:</span>
                      <span className="ml-2 font-medium">{user.role.name}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">ID:</span>
                    <span className="ml-2 font-medium">{user.id}</span>
                  </div>
                  {user.updatedAt && (
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Orders Collapsible Section */}
              {user.orders && user.orders.length > 0 && (
                <OrdersCollapsibleSection
                  userId={user.id}
                  orders={user.orders}
                  isOpen={isOrdersOpen}
                  setIsOpen={setIsOrdersOpen}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                />
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
    </>
  );
}

// Orders Collapsible Section Component
interface OrdersCollapsibleSectionProps {
  userId: string;
  orders: Array<{
    id: string;
    displayId: string;
    email: string;
    total?: string;
    status: string;
    lineItems?: Array<{ id: string }>;
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
    "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-purple-500 bg-white border-purple-200 hover:bg-purple-100 hover:text-purple-700 focus:z-10 focus:ring-2 focus:ring-purple-700 focus:text-purple-700 dark:bg-purple-950 dark:border-purple-900 dark:text-purple-300 dark:hover:text-white dark:hover:bg-purple-700 dark:focus:ring-purple-500 dark:focus:text-white";

  const statusColors = {
    pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
    processing: "bg-blue-50 text-blue-800 border-blue-200",
    shipped: "bg-purple-50 text-purple-800 border-purple-200",
    delivered: "bg-green-50 text-green-800 border-green-200",
    cancelled: "bg-red-50 text-red-800 border-red-200",
  } as const;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col gap-2 py-3 px-4 md:px-6 bg-purple-50/30 dark:bg-purple-900/10 border-b"
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
              <div
                key={order.id}
                className="border p-2 bg-background rounded-sm flex flex-col sm:flex-row gap-4 relative"
              >
                <div className="grid flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/dashboard/platform/orders/${order.id}`}
                      className="text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      #{order.displayId}
                    </Link>
                    <Badge
                      className={`text-[.6rem] py-0 px-2 tracking-wide font-medium rounded-md border h-5 ${
                        statusColors[order.status as keyof typeof statusColors] ||
                        "bg-gray-50 text-gray-800 border-gray-200"
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Customer: {order.email}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    {order.total && (
                      <span className="font-medium">Total: {order.total}</span>
                    )}
                    {order.lineItems && (
                      <span className="text-muted-foreground">
                        {order.lineItems.length} item{order.lineItems.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};
