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
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { ChevronDown, MoreVertical } from "lucide-react";
import { DeleteButton } from "@keystone/themes/Tailwind/orion/components/EditItemDrawer";
import { useList } from "@keystone/keystoneProvider";
import { AdminLink } from "@keystone/themes/Tailwind/orion/components/AdminLink";

export const OrderDetailsComponent = ({
  order,
  openEditDrawer,
  loadingActions,
  removeEditItemButton,
  renderButtons,
}) => {
  const list = useList("Order");

  const orderButtons = [
    {
      buttonText: "EDIT ORDER",
      color: "blue",
      icon: <PencilSquareIcon className="w-4 h-4" />,
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
        <div className="px-4 py-2 flex justify-between w-full border-b">
          <div className="flex flex-col items-start text-left gap-1.5">
            <div className="flex items-center space-x-4">
              <AdminLink
                href={`/platform/orders/${order.id}`}
                className="uppercase font-medium text-sm hover:text-blue-600 dark:hover:text-blue-400"
              >
                #{order.displayId}
              </AdminLink>
              <span className="text-xs font-medium opacity-65">
                {new Date(order.createdAt).toLocaleString()}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {order.email}
              </span>
            </div>
            {order.shippingAddress && (
              <div className="text-sm opacity-75">
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
          <div className="flex flex-col justify-between items-end">
            <div className="flex items-center justify-end space-x-2">
              <Badge
                color={
                  order.status === "pending"
                    ? "zinc"
                    : order.status === "completed"
                      ? "green"
                      : order.status === "canceled"
                        ? "red"
                        : "blue"
                }
                className="text-xs border font-medium py-1"
              >
                {order.status.toUpperCase()}
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="border [&_svg]:size-3 h-6 w-6"
                    >
                      <MoreVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {orderButtons.map((button) => (
                      <DropdownMenuItem
                        key={button.buttonText}
                        onClick={button.onClick}
                        className="gap-2 font-medium tracking-wide"
                        disabled={loadingActions[button.buttonText]?.[order.id]}
                      >
                        {button.icon}
                        {button.buttonText}
                      </DropdownMenuItem>
                    ))}
                    <DeleteButton
                      itemLabel={`#${order.displayId}`}
                      itemId={order.id}
                      list={list}
                    >
                      <DropdownMenuItem className="gap-2 font-medium tracking-wide">
                        <TrashIcon className="h-4 w-4" />
                        DELETE ORDER
                      </DropdownMenuItem>
                    </DeleteButton>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              title="Line Items"
              openEditDrawer={openEditDrawer}
              totalItems={order.lineItems?.length || 0}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
