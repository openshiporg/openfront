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
import { ProductDetailsCollapsible } from "./ProductDetailsCollapsible";
import { ArrowRight } from "lucide-react";
import { EditItemDrawer } from "../../components/EditItemDrawer";

const statusColors = {
  pending: "blue",
  completed: "emerald",
  archived: "zinc",
  canceled: "rose",
  requires_action: "orange",
} as const;

interface OrderDetailsComponentProps {
  order: any;
  list: any;
  loadingActions?: Record<string, Record<string, boolean>>;
  removeEditItemButton?: boolean;
  renderButtons?: () => React.ReactNode;
}

export const OrderDetailsComponent = ({
  order,
  list,
  loadingActions = {},
  removeEditItemButton,
  renderButtons,
}: OrderDetailsComponentProps) => {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const currentAction = Object.entries(loadingActions).find(
    ([_, value]) => value[order.id]
  )?.[0];

  const getLoadingText = (action: string) => {
    switch (action) {
      case "deleteOrder":
        return "Deleting Order";
      default:
        return "Loading";
    }
  };

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={order.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[120px]">
            <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Link
                  href={`/dashboard/platform/orders/${order.id}`}
                  className="uppercase font-medium text-sm hover:text-blue-600 dark:hover:text-blue-400"
                >
                  #{order.displayId}
                </Link>
                <span className="text-xs font-medium">
                  <span className="text-muted-foreground/75">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  {order.user && (
                    <>
                      <span className="mx-1.5">‧</span>
                      <Link
                        href={`/dashboard/platform/users/${order.user.id}`}
                        className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 group inline-flex items-center gap-1"
                      >
                        {order.user.name || order.user.email}
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                      </Link>
                    </>
                  )}
                </span>
              </div>

              {order.shippingAddress && (
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  <p>
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.province}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  {order.shippingAddress.phone && (
                    <p>{order.shippingAddress.phone}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <Badge
                  color={statusColors[order.status as keyof typeof statusColors] || "zinc"}
                  className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                >
                  {order.status.toUpperCase().replace("_", " ")}
                </Badge>
                {currentAction && (
                  <Badge
                    color="zinc"
                    className="uppercase tracking-wide font-medium text-xs flex items-center gap-1.5 border py-0.5"
                  >
                    <div className="size-3.5 shrink-0 animate-spin" />
                    {getLoadingText(currentAction)}
                  </Badge>
                )}
                {/* Single buttons container */}
                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  {!removeEditItemButton && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="border [&_svg]:size-3 h-6 w-6"
                      onClick={() => setIsEditDrawerOpen(true)}
                    >
                      <MoreVertical className="stroke-muted-foreground" />
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    asChild
                  >
                    <AccordionTrigger className="py-0" />
                  </Button>
                  {renderButtons && renderButtons()}
                </div>
              </div>
            </div>
          </div>
          <AccordionContent className="pb-0">
            <div className="divide-y">
              <ProductDetailsCollapsible
                orderId={order.id}
                title="Line Item"
                totalItems={order.lineItems?.length || 0}
                lineItems={order.lineItems || []}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawer
        list={list}
        item={order}
        itemId={order.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
};