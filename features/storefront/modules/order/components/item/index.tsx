import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

import LineItemOptions from "@/features/storefront/modules/common/components/line-item-options"
import Thumbnail from "@/features/storefront/modules/products/components/thumbnail"

import { OrderLineItem } from "@/features/storefront/modules/order/components/items";
import { StoreRegion } from "@/features/storefront/types/storefront";

type ItemProps = {
  item: OrderLineItem;
  region: StoreRegion;
};

const Item = ({ item, region }: ItemProps) => {
  return (
    <TableRow className="w-full">
      <TableCell className="!pl-0 p-4 w-24">
        <div className="flex w-16">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </TableCell>

      <TableCell className="text-left">
        <p className="font-medium">{item.title}</p>
        {item.variantTitle && (
        <LineItemOptions variant={item.productVariant} variantTitle={item.variantTitle} />
        )}
      </TableCell>

      <TableCell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 text-sm">
            <span className="text-muted-foreground">{item.quantity}x </span>
            <span>{item.formattedUnitPrice}</span>
          </span>

          <span>{item.formattedTotal}</span>
        </span>
      </TableCell>
    </TableRow>
  );
};

export default Item
