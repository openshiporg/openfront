"use client";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import CartItemSelect from "@/features/storefront/modules/cart/components/cart-item-select";
import DeleteButton from "@/features/storefront/modules/common/components/delete-button";
import LineItemOptions from "@/features/storefront/modules/common/components/line-item-options";
import LineItemPrice from "@/features/storefront/modules/common/components/line-item-price";
import LineItemUnitPrice from "@/features/storefront/modules/common/components/line-item-unit-price";
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail";
import { updateLineItem } from "@/features/storefront/lib/data/cart";
import { useState } from "react";
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message";
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link";
import { RiLoader2Fill } from "@remixicon/react";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: any;
  region: any;
  type?: "full" | "preview";
}

const Item = ({ item, region, type = "full" }: CartItemProps) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const { handle } = item.productVariant.product;

  const maxQuantity = Math.min(
    item.productVariant.inventoryQuantity > 0
      ? item.productVariant.inventoryQuantity
      : 10,
    10
  );

  const changeQuantity = async (quantity: number) => {
    setError(null);
    setUpdating(true);

    const message = await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        return err.message;
      })
      .finally(() => {
        setUpdating(false);
      });

    message && setError(message);
  };

  return (
    <TableRow className="w-full">
      <TableCell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${handle}`}
          className={cn("flex", {
            "w-16": type === "preview",
            "sm:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.productVariant.product.thumbnail}
            size="square"
          />
        </LocalizedClientLink>
      </TableCell>

      <TableCell className="text-left">
        <p className="text-base font-semibold">
          {item.title}
        </p>
        <LineItemOptions
          variant={{ sku: item.productVariant?.sku || "" }}
          variantTitle={item.productVariant?.title}
        />
      </TableCell>

      {type === "full" && (
        <TableCell>
          <div className="flex gap-2 items-center w-28">
            <CartItemSelect
              value={item.quantity}
              onChange={(e) => changeQuantity(parseInt(e.target.value))}
              min={1}
              max={maxQuantity}
              step={1}
              className="w-20 h-10"
            />
            {updating ? (
              <Button size="icon" variant="outline" disabled>
                <RiLoader2Fill className="animate-spin" />
              </Button>
            ) : (
              <DeleteButton id={item.id} />
            )}
          </div>
          <ErrorMessage error={error} />
        </TableCell>
      )}

      {type === "full" && (
        <TableCell className="hidden sm:table-cell">
          <LineItemUnitPrice item={item} style="tight" />
        </TableCell>
      )}

      <TableCell className="!pr-0">
        <span
          className={cn("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 text-sm">
              <span className="text-gray-400">{item.quantity}x </span>
              <LineItemUnitPrice item={item} style="tight" />
            </span>
          )}
          <LineItemPrice item={item} style="tight" />
        </span>
      </TableCell>
    </TableRow>
  );
};

export default Item;
