// Removed HttpTypes and Text imports

// Define inline types based on GraphQL schema and component usage
type OrderDetailsType = {
  email?: string | null;
  createdAt?: string | null; // Correct field name
  displayId?: string | null; // Correct field name
  fulfillmentStatus?: string | null; // Correct field name (enum as string)
  paymentStatus?: string | null; // Correct field name (enum as string)
};

type OrderDetailsProps = {
  order: any;
  showStatus?: boolean;
};

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string | null | undefined) => {
    if (!str) return "N/A" // Handle null/undefined status
    // Ensure str is a string before calling split
    if (typeof str !== 'string') return String(str)
    const formatted = str.split("_").join(" ")
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  return (
    <div>
      <p>
        We have sent the order confirmation details to{" "}
        <span
          className="text-foreground font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </p>
      <p className="mt-2 text-sm">
        Order date:{" "}
        <span data-testid="order-date">
          {new Date(order.createdAt ?? "").toDateString()} {/* Corrected field name */}
        </span>
      </p>
      <p className="mt-2 text-sm">
        Order number: <span data-testid="order-id">{order.displayId}</span> {/* Corrected field name */}
      </p>

      <div className="flex items-center text-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <p className="text-sm">
              Order status:{" "}
              <span className="text-muted-foreground " data-testid="order-status">
              {formatStatus(order.fulfillmentStatus?.status)}
              </span>
            </p>
            <p className="text-sm">
              Payment status:{" "}
              <span
                className="text-muted-foreground "
                data-testid="order-payment-status"
              >
               {formatStatus(order.fulfillmentStatus?.shippingStatus)}
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
