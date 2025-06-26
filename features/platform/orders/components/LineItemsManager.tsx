"use client";

import { useState } from "react";
import { PackageIcon, ShoppingCartIcon, EditIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartDialog } from "./CartDialog";

type ProductVariant = {
  id: string;
  title: string;
  sku?: string;
  product: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  prices: {
    id: string;
    amount: number;
    currency: { code: string };
    calculatedPrice: {
      calculatedAmount: number;
      originalAmount: number;
      currencyCode: string;
    };
  }[];
};

type LineItem = {
  id: string;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  total: number;
};

interface LineItemsManagerProps {
  lineItems: LineItem[];
  onLineItemsChange: (lineItems: LineItem[]) => void;
  className?: string;
}

export function LineItemsManager({
  lineItems,
  onLineItemsChange,
  className,
}: LineItemsManagerProps) {
  const [cartDialogOpen, setCartDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <>
      <Card className={`bg-muted/10 ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
          <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
            Line Items
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCartDialogOpen(true)}
            className="h-7 px-2 text-xs"
          >
            {lineItems.length === 0 ? (
              <>
                <ShoppingCartIcon size={14} className="mr-1" />
                Add Items
              </>
            ) : (
              <>
                <EditIcon size={14} className="mr-1" />
                Edit Cart
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="py-2 px-3 divide-y">
            {lineItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <PackageIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">No items added yet</p>
                <p className="text-xs mt-1">Click "Add Items" to start building your order</p>
              </div>
            ) : (
              lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 py-3 p-2"
                >
                  <div className="h-16 w-16 bg-muted/10 rounded-md flex-shrink-0 flex items-center justify-center">
                    {item.variant.product.thumbnail ? (
                      <img
                        src={item.variant.product.thumbnail}
                        alt={item.variant.product.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">
                        <PackageIcon size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col">
                      <div className="flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-sm">
                                {item.variant.product.title}
                              </span>
                              {item.variant.title && (
                                <div className="text-xs text-muted-foreground">
                                  {item.variant.title}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {item.variant.sku && (
                                <p className="text-xs text-muted-foreground">
                                  SKU: {item.variant.sku}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {item.quantity} × {formatPrice(item.unitPrice)}
                            </div>
                            <div className="text-sm font-medium whitespace-nowrap">
                              {formatPrice(item.total)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Subtotal */}
          {lineItems.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatPrice(getSubtotal())}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cart Dialog */}
      <CartDialog
        open={cartDialogOpen}
        onOpenChange={setCartDialogOpen}
        lineItems={lineItems}
        onLineItemsChange={onLineItemsChange}
      />
    </>
  );
}