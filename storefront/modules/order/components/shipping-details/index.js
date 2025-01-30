import { Heading, Text } from "@medusajs/ui";
import { formatAmount } from "@storefront/lib/util/prices";

import Divider from "@storefront/modules/common/components/divider";

const ShippingDetails = ({ order }) => {
  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        Delivery
      </Heading>
      <div className="flex items-start gap-x-8">
        <div className="flex flex-col w-1/3">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">
            Shipping Address
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </Text>
          {order.shippingAddress.company && (
            <Text className="txt-medium text-ui-fg-subtle">
              {order.shippingAddress.company}
            </Text>
          )}
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shippingAddress.address1}
            {order.shippingAddress.address2 && (
              <span>, {order.shippingAddress.address2}</span>
            )}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shippingAddress.city}
            {order.shippingAddress.province && `, ${order.shippingAddress.province} `}
            {order.shippingAddress.postalCode}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shippingAddress.country?.name}
          </Text>
          {order.shippingAddress.phone && (
            <Text className="txt-medium text-ui-fg-subtle">
              {order.shippingAddress.phone}
            </Text>
          )}
        </div>

        <div className="flex flex-col w-1/3 ">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Contact</Text>
          <Text className="txt-medium text-ui-fg-subtle">{order.email}</Text>
        </div>

        <div className="flex flex-col w-1/3">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Method</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {order.shippingMethods[0].shippingOption?.name} ({order.shipping})
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  );
};

export default ShippingDetails;

