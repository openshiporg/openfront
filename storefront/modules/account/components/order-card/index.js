import { Button } from "@medusajs/ui"
import { useMemo } from "react"

import Thumbnail from "@storefront/modules/products/components/thumbnail"
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"

const OrderCard = ({
  order
}) => {
  const numberOfLines = useMemo(() => {
    return order.lineItems.reduce((acc, item) => {
      return acc + item.quantity
    }, 0);
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.lineItems.length
  }, [order])

  return (
    <div className="bg-white flex flex-col">
      <div className="uppercase text-large-semi mb-1">#{order.displayId}</div>
      <div
        className="flex items-center divide-x divide-gray-200 text-small-regular text-ui-fg-base">
        <span className="pr-2">
          {new Date(order.createdAt).toDateString()}
        </span>
        <span className="px-2">
          {order.formattedTotal}
        </span>
        <span className="pl-2">{`${numberOfLines} ${
          numberOfLines > 1 ? "items" : "item"
        }`}</span>
      </div>
      <div className="grid grid-cols-2 small:grid-cols-4 gap-4 my-4">
        {order.lineItems.slice(0, 3).map((i) => {
          return (
            <div key={i.id} className="flex flex-col gap-y-2">
              <Thumbnail thumbnail={i.thumbnail} images={[]} size="full" />
              <div className="flex items-center text-small-regular text-ui-fg-base">
                <span className="text-ui-fg-base font-semibold">{i.title}</span>
                <span className="ml-2">x</span>
                <span>{i.quantity}</span>
              </div>
            </div>
          );
        })}
        {numberOfProducts > 4 && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="text-small-regular text-ui-fg-base">
              + {numberOfLines - 4}
            </span>
            <span className="text-small-regular text-ui-fg-base">more</span>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <Button variant="secondary">See details</Button>
        </LocalizedClientLink>
      </div>
    </div>
  );
}

export default OrderCard
