"use client";
import { Table, TableBody } from "@/components/ui/table";
import { cn } from "@/lib/utils";

import Item from "@/features/storefront/modules/cart/components/item";
import SkeletonLineItem from "@/features/storefront/modules/skeletons/components/skeleton-line-item";

interface ItemsPreviewTemplateProps {
  items?: any[];
  region?: any;
}

const ItemsPreviewTemplate = ({ items, region }: ItemsPreviewTemplateProps) => {
  const hasOverflow = items && items.length > 4;

  return (
    <div
      className={cn({
        "pl-[1px] overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}
    >
      <Table>
        <TableBody>
          {items && region
            ? items
                .sort((a, b) => {
                  return a.createdAt > b.createdAt ? -1 : 1;
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      region={region}
                      type="preview"
                    />
                  );
                })
            : Array.from(Array(5).keys()).map((i) => {
                return <SkeletonLineItem key={i} />;
              })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsPreviewTemplate;
