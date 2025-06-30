import { StoreOrder } from "@/features/storefront/types/storefront"

type OrderSummaryProps = {
  order: StoreOrder
}

const OrderSummary = ({ order }: OrderSummaryProps) => {
  return (
    <div>
      <h2 className="text-sm leading-6 font-semibold">Order Summary</h2>
      <div className="text-xs leading-5 font-normal text-foreground my-2">
        <div className="flex items-center justify-between text-sm leading-6 font-normal text-foreground mb-2">
          <span>Subtotal</span>
          <span>{order.subtotal}</span>
        </div>
        <div className="flex flex-col gap-y-1">
          {order.discount > 0 && (
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
        <div className="h-px w-full border-b border-dashed my-4" />
        <div className="flex items-center justify-between text-sm leading-6 font-normal text-foreground mb-2">
          <span>Total</span>
          <span>{order.total}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
