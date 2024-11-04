"use client";
import { Table, Text, clx } from "@medusajs/ui"

import CartItemSelect from "@storefront/modules/cart/components/cart-item-select"
import DeleteButton from "@storefront/modules/common/components/delete-button"
import LineItemOptions from "@storefront/modules/common/components/line-item-options"
import LineItemPrice from "@storefront/modules/common/components/line-item-price"
import LineItemUnitPrice from "@storefront/modules/common/components/line-item-unit-price"
import Thumbnail from "@storefront/modules/products/components/thumbnail"
import { updateLineItem } from "@storefront/modules/cart/actions"
import Spinner from "@storefront/modules/common/icons/spinner"
import { useState } from "react"
import ErrorMessage from "@storefront/modules/checkout/components/error-message"
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"

const Item = ({
  item,
  region,
  type = "full"
}) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  const { handle } = item.productVariant.product

  const maxQuantity = Math.min(
    item.productVariant.inventoryQuantity > 0 
      ? item.productVariant.inventoryQuantity 
      : 10,
    10
  )

  const changeQuantity = async (quantity) => {
    setError(null)
    setUpdating(true)

    const message = await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        return err.message
      })
      .finally(() => {
        setUpdating(false)
      })

    message && setError(message)
  }

  return (
    <Table.Row className="w-full">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}>
          <Thumbnail thumbnail={item.productVariant.product.thumbnail} size="square" />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text className="txt-medium-plus text-ui-fg-base">{item.title}</Text>
        <LineItemOptions variant={item.productVariant} />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4">
              {Array.from({
                length: maxQuantity,
              }, (_, i) => (
                <option value={i + 1} key={i}>
                  {i + 1}
                </option>
              ))}
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice item={item} region={region} style="tight" />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}>
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice item={item} region={region} style="tight" />
            </span>
          )}
          <LineItemPrice item={item} region={region} style="tight" />
        </span>
      </Table.Cell>
    </Table.Row>
  );
}

export default Item
