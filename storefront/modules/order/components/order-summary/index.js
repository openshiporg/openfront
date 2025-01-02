import { formatAmount } from "@storefront/lib/util/prices"

const OrderSummary = ({
  order
}) => {
  return (
    <div>
      <h2 className="text-base-semi">Order Summary</h2>
      <div className="text-small-regular text-ui-fg-base my-2">
        <div
          className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>Subtotal</span>
          <span>{order.subtotal}</span>
        </div>
        <div className="flex flex-col gap-y-1">
          {order.discount && (
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>- {order.discount}</span>
            </div>
          )}
          {order.giftCard && (
            <div className="flex items-center justify-between">
              <span>Gift Card</span>
              <span>- {order.giftCard}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{order.shipping}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Taxes</span>
            <span>{order.tax}</span>
          </div>
        </div>
        <div className="h-px w-full border-b border-gray-200 border-dashed my-4" />
        <div
          className="flex items-center justify-between text-base-regular text-ui-fg-base mb-2">
          <span>Total</span>
          <span>{order.total}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary
