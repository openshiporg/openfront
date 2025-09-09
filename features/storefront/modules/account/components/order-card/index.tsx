import { Button } from "@/components/ui/button"; 
import { useMemo } from "react";
import type { StorefrontOrderOverviewItem } from "@/features/storefront/types";

import Thumbnail from "@/features/storefront/modules/products/components/thumbnail"; 
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"; 

type OrderCardProps = {
  order: StorefrontOrderOverviewItem;
};

const OrderCard = ({ order }: OrderCardProps) => {
  const numberOfLines = useMemo(() => {
    return (
      order.lineItems?.reduce((acc: number, item) => {
        return acc + item.quantity;
      }, 0) ?? 0
    );
  }, [order]);

  const numberOfProducts = useMemo(() => {
    return order.lineItems?.length ?? 0;
  }, [order]);

  return (
    <div className="bg-background flex flex-col" data-testid="order-card">
      <div className="uppercase text-base leading-6 font-semibold mb-1">
        #<span data-testid="order-display-id">{order.displayId}</span>
      </div>
      <div className="flex items-center divide-x divide-gray-200 text-xs leading-5 font-normal text-foreground">
        <span className="pr-2" data-testid="order-created-at">
          {new Date(order.createdAt || "").toDateString()}
        </span>
        <span className="px-2" data-testid="order-amount">
          {order.total}
        </span>
        <span className="pl-2">{`${numberOfLines} ${
          numberOfLines > 1 ? "items" : "item"
        }`}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
        {order.lineItems?.slice(0, 3).map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col gap-y-2"
              data-testid="order-item"
            >
              <Thumbnail thumbnail={item.thumbnail} images={[]} size="full" />
              <div className="flex items-center text-xs leading-5 font-normal text-foreground">
                <span
                  className="text-foreground font-semibold"
                  data-testid="item-title"
                >
                  {item.title}
                </span>
                <span className="ml-2">x</span>
                <span data-testid="item-quantity">{item.quantity}</span>
              </div>
            </div>
          );
        })}
        {numberOfProducts > 4 && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-xs leading-5 font-normal text-foreground">
              + {numberOfLines - 4}
            </span>
            <span className="text-xs leading-5 font-normal text-foreground">
              more
            </span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button data-testid="order-details-link" variant="outline" size="sm">
            See details
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  );
};

export default OrderCard;