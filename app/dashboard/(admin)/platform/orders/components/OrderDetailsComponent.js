import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@ui/accordion";
import { Badge } from "@ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@ui/dropdown-menu";
import { Button } from "@ui/button";
import { RiLoader2Fill } from "@remixicon/react";
import { ProductDetailsCollapsible } from "./ProductDetailsCollapsible";
import { TrashIcon } from "@heroicons/react/16/solid";
import { ChevronDown, MoreVertical, PenSquare, Trash2 } from "lucide-react";
import { DeleteButton } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { useList } from "@keystone/keystoneProvider";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";
import { useDrawer } from "@keystone/themes/Tailwind/orion/components/Modals/drawer-context";
import { ArrowRight } from "lucide-react";

const statusColors = {
  pending: "amber",
  completed: "emerald",
  archived: "gray",
  canceled: "red",
  requires_action: "blue",
};

export const OrderDetailsComponent = ({
  order,
  loadingActions,
  removeEditItemButton,
  renderButtons,
}) => {
  const list = useList("Order");
  const { openEditDrawer } = useDrawer();
  const orderButtons = [
    {
      buttonText: "EDIT ORDER",
      color: "blue",
      icon: <PenSquare className="w-4 h-4" />,
      onClick: () => openEditDrawer(order.id, "Order"),
    },
  ];

  const currentAction = Object.entries(loadingActions).find(
    ([_, value]) => value[order.id]
  )?.[0];

  const getLoadingText = (action) => {
    switch (action) {
      case "deleteOrder":
        return "Deleting Order";
      default:
        return "Loading";
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value={order.id} className="border-0">
        <div className="px-5 py-3 sm:py-4 flex flex-col sm:flex-row justify-between w-full border-b">
          <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <AdminLink
                href={`/platform/orders/${order.id}`}
                className="uppercase font-medium text-sm hover:text-blue-600 dark:hover:text-blue-400"
              >
                #{order.displayId}
              </AdminLink>
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
                    <AdminLink
                      href={`/platform/users/${order.user.id}`}
                      className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 group inline-flex items-center gap-1"
                    >
                      {order.user.name}
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </AdminLink>
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
          <div className="flex flex-col sm:items-end mt-4 sm:mt-0">
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge
                color={statusColors[order.status]}
                className="py-1 text-xs tracking-wide font-medium rounded-full px-3"
              >
                {order.status.toUpperCase().replace("_", " ")}
              </Badge>
              {currentAction && (
                <Badge
                  color="zinc"
                  className="uppercase tracking-wide font-medium text-xs flex items-center gap-1.5 border py-0.5"
                >
                  <RiLoader2Fill className="size-3.5 shrink-0 animate-spin" />
                  {getLoadingText(currentAction)}
                </Badge>
              )}
              {!removeEditItemButton && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="border [&_svg]:size-3 h-6 w-6"
                  onClick={() => openEditDrawer(order.id, "Order")}
                >
                  <MoreVertical className="stroke-muted-foreground" />
                </Button>
              )}
              <AccordionTrigger hideArrow className="py-0">
                <Button
                  variant="secondary"
                  size="icon"
                  className="border [&_svg]:size-3 h-6 w-6"
                >
                  <ChevronDown />
                </Button>
              </AccordionTrigger>
              {renderButtons && renderButtons()}
            </div>
          </div>
        </div>
        <AccordionContent>
          <div className="divide-y">
            <ProductDetailsCollapsible
              orderId={order.id}
              title="Line Item"
              openEditDrawer={openEditDrawer}
              totalItems={order.lineItems?.length || 0}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
