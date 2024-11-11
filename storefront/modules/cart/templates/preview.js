"use client";
import { Table, clx } from "@medusajs/ui"

import Item from "@storefront/modules/cart/components/item"
import SkeletonLineItem from "@storefront/modules/skeletons/components/skeleton-line-item"

const ItemsPreviewTemplate = ({
  items,
  region
}) => {
  const hasOverflow = items && items.length > 4

  return (
    <div
      className={clx({
        "pl-[1px] overflow-y-scroll overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}>
      <Table>
        <Table.Body>
          {items && region
            ? items
                .sort((a, b) => {
                  return a.createdAt > b.createdAt ? -1 : 1
                })
                .map((item) => {
                  return <Item key={item.id} item={item} region={region} type="preview" />;
                })
            : Array.from(Array(5).keys()).map((i) => {
                return <SkeletonLineItem key={i} />;
              })}
        </Table.Body>
      </Table>
    </div>
  );
}

export default ItemsPreviewTemplate
