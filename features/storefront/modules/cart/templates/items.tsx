import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

import Item from "@/features/storefront/modules/cart/components/item"
import SkeletonLineItem from "@/features/storefront/modules/skeletons/components/skeleton-line-item"

interface ItemsTemplateProps {
  items?: any[];
  region?: any;
}

const ItemsTemplate = ({
  items,
  region
}: ItemsTemplateProps) => {
  return (
    <div>
      <div className="pb-3 flex items-center">
        <h1 className="text-[2rem] leading-[2.75rem] font-medium">Cart</h1>
      </div>
      <Table>
        <TableHeader className="border-t-0">
          <TableRow className="text-muted-foreground text-base font-semibold">
            <TableHead className="!pl-0">Item</TableHead>
            <TableHead></TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead className="hidden sm:table-cell">
              Price
            </TableHead>
            <TableHead className="!pr-0 text-right">
              Total
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items && region
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
        </TableBody>
      </Table>
    </div>
  );
}

export default ItemsTemplate
