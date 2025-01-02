import { Table } from "@medusajs/ui"

import Divider from "@storefront/modules/common/components/divider"
import Item from "@storefront/modules/order/components/item"
import SkeletonLineItem from "@storefront/modules/skeletons/components/skeleton-line-item"

const Items = ({
  items,
  region
}) => {
  return (
    <div className="flex flex-col">
      <Divider className="!mb-0" />
      <Table>
        <Table.Body>
          {items?.length && region
            ? items
                .sort((a, b) => {
                  return a.createdAt > b.createdAt ? -1 : 1
                })
                .map((item) => {
                  return <Item key={item.id} item={item} region={region} />;
                })
            : Array.from(Array(5).keys()).map((i) => {
                return <SkeletonLineItem key={i} />;
              })}
        </Table.Body>
      </Table>
    </div>
  );
}

export default Items
