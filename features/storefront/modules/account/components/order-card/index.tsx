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

  return (
    <div className="space-y-4" data-testid="order-card">
      <div className="flex items-center justify-between py-4">
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground">
            #<span data-testid="order-display-id">{order.displayId}</span>
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span data-testid="order-created-at">
              {new Date(order.createdAt || "").toDateString()}
            </span>
            <span data-testid="order-amount">
              {order.total}
            </span>
            <span>{`${numberOfLines} ${numberOfLines > 1 ? "items" : "item"}`}</span>
          </div>
        </div>
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button data-testid="order-details-link" variant="outline" size="sm">
            See details
          </Button>
        </LocalizedClientLink>
      </div>

      {/* Order Items */}
      <div className="flex items-center gap-4 pl-4">
        {order.lineItems?.slice(0, 1).map((item) => (
          <div key={item.id} className="flex items-center gap-4" data-testid="order-item">
            <Thumbnail 
              thumbnail={item.thumbnail} 
              images={[]} 
              size="full" 
              className="w-15 h-15 object-cover bg-muted/30"
            />
            <div className="flex-1">
              <p className="font-medium text-foreground" data-testid="item-title">
                {item.title}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="item-quantity">
                x{item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;
