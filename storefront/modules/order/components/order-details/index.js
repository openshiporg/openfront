import { Text } from "@medusajs/ui";

const OrderDetails = ({ order, showStatus }) => {
  const formatStatus = (str) => {
    const formatted = str?.split("_").join(" ");

    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1);
  };

  return (
    <div>
      <Text>
        We have sent the order confirmation details to{" "}
        <span className="text-ui-fg-medium-plus font-semibold">
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Order date: {new Date(order.createdAt).toDateString()}
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Order number: {order.displayId}
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              Order status:{" "}
              <span className="text-ui-fg-subtle">
                {formatStatus(order.fulfillmentStatus.status)}
              </span>
            </Text>
            <Text>
              Fulfillment status:{" "}
              <span className="text-ui-fg-subtle">{formatStatus(order.fulfillmentStatus.shippingStatus)}</span>
            </Text>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
