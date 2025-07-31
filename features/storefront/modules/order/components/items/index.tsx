import repeat from "@/features/storefront/lib/util/repeat"
// Removed HttpTypes and Table imports from Medusa
import {
  Table,
  TableBody,
  // Import other Table parts if needed (e.g., TableRow, TableCell)
} from "@/components/ui/table"; 

import Divider from "@/features/storefront/modules/common/components/divider"
import Item from "@/features/storefront/modules/order/components/item"
import SkeletonLineItem from "@/features/storefront/modules/skeletons/components/skeleton-line-item"

// Define inline types based on GraphQL schema and component usage
export type OrderLineItem = {
  id: string;
  quantity: number;
  title: string;
  sku?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
  productData?: Record<string, any>;
  variantData?: Record<string, any>;
  variantTitle?: string;
  formattedUnitPrice?: string;
  formattedTotal?: string;
  productVariant?: any;
  originalLineItem?: any;
  fulfillmentItems?: any[];
  createdAt?: string;
  updatedAt?: string;
};

import { StoreRegion } from "@/features/storefront/types/storefront";

export type ItemsProps = {
  items: OrderLineItem[];
  region: StoreRegion;
};

const Items = ({ items, region }: ItemsProps) => {

  return (
    <div className="flex flex-col">
      <Divider className="!mb-0" />
      <Table>
        <TableBody data-testid="products-table"> 
          {items?.length
            ? items
                .sort((a: OrderLineItem, b: OrderLineItem) => { // Use OrderLineItem type
                  // Use correct property name
                  return (a.createdAt ?? "") > (b.createdAt ?? "") ? -1 : 1; // Corrected field name
                })
                .map((item: OrderLineItem) => { // Use OrderLineItem type
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      region={region}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </TableBody>
      </Table>
    </div>
  )
}

export default Items
