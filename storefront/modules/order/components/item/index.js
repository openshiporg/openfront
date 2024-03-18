import { Table, Text } from "@medusajs/ui"

import LineItemOptions from "@storefront/modules/common/components/line-item-options"
import LineItemPrice from "@storefront/modules/common/components/line-item-price"
import LineItemUnitPrice from "@storefront/modules/common/components/line-item-unit-price"
import Thumbnail from "@storefront/modules/products/components/thumbnail"

const Item = ({
  item,
  region
}) => {
  return (
    <Table.Row className="w-full">
      <Table.Cell className="!pl-0 p-4 w-24">
        <div className="flex w-16">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text className="txt-medium-plus text-ui-fg-base">{item.title}</Text>
        <LineItemOptions variant={item.variant} />
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 ">
            <Text className="text-ui-fg-muted">{item.quantity}x </Text>
            <LineItemUnitPrice item={item} region={region} style="tight" />
          </span>

          <LineItemPrice item={item} region={region} style="tight" />
        </span>
      </Table.Cell>
    </Table.Row>
  );
}

export default Item
