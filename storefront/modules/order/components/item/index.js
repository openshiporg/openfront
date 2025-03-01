import { Table, Text } from "@medusajs/ui"

import LineItemOptions from "@storefront/modules/common/components/line-item-options"
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
        {item.variantTitle && (
          <LineItemOptions variant={item.productVariant} variantTitle={item.variantTitle} />
        )}
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="!pr-0 flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1 ">
            <Text className="text-ui-fg-muted">{item.quantity}x </Text>
            <Text>{item.formattedUnitPrice}</Text>
          </span>

          <Text>{item.formattedTotal}</Text>
        </span>
      </Table.Cell>
    </Table.Row>
  );
}

export default Item
