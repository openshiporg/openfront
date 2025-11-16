import { formatAmount } from "@/features/storefront/lib/util/prices";
// Removed HttpTypes, Heading, Text imports

import Divider from "@/features/storefront/modules/common/components/divider";

// Define inline types based on GraphQL schema and component usage
type CountryInfoForShipping = {
  iso2?: string | null;
};

type AddressInfoForShipping = {
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  postalCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: CountryInfoForShipping | null;
  phone?: string | null;
};

type ShippingOptionInfo = {
  name?: string | null;
};

type ShippingMethodInfo = {
  shippingOption?: ShippingOptionInfo | null;
};

import { StoreRegion } from "@/features/storefront/types/storefront";

type OrderWithShipping = {
  id: string;
  email?: string | null;
  currencyCode?: string | null; // Correct field name
  shippingAddress?: AddressInfoForShipping | null; // Correct field name
  shippingMethods?: ShippingMethodInfo[] | null; // Correct field name
  shippingTotal?: number | null; // Correct field name
  region?: StoreRegion | null;
  shipping: number;
};

type ShippingDetailsProps = {
  order: OrderWithShipping;
};

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div>
      <h2 className="flex flex-row text-3xl font-medium my-6">Delivery</h2>
      <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-x-8">
        <div
          className="flex flex-col w-full sm:w-1/3"
          data-testid="shipping-address-summary"
        >
          <p className="text-sm font-medium text-foreground mb-1">
            Shipping Address
          </p>
          <p className="text-sm font-normal text-muted-foreground">
            {order.shippingAddress?.firstName} {/* Corrected field names */}
            {order.shippingAddress?.lastName}
          </p>
          <p className="text-sm font-normal text-muted-foreground">
            {order.shippingAddress?.address1} {/* Corrected field names */}
            {order.shippingAddress?.address2}
          </p>
          <p className="text-sm font-normal text-muted-foreground">
            {order.shippingAddress?.city}
            {order.shippingAddress?.province
              ? `, ${order.shippingAddress.province}`
              : ""}
          </p>
          <p className="text-sm font-normal text-muted-foreground">
            {order.shippingAddress?.postalCode}{" "}
            {order.shippingAddress?.country?.iso2?.toUpperCase()}{" "}
            {/* Updated to American style */}
          </p>
        </div>

        <div
          className="flex flex-col w-full sm:w-1/3"
          data-testid="shipping-contact-summary"
        >
          <p className="text-sm font-medium text-foreground mb-1">Contact</p>
          <p className="text-sm font-normal text-muted-foreground">
            {order.shippingAddress?.phone} {/* Corrected field name */}
          </p>
          <p className="text-sm font-normal text-muted-foreground">
            {order.email}
          </p>
        </div>

        <div
          className="flex flex-col w-full sm:w-1/3"
          data-testid="shipping-method-summary"
        >
          <p className="text-sm font-medium text-foreground mb-1">Method</p>
          <p className="text-sm font-normal text-muted-foreground">
            {order.shippingMethods?.[0]?.shippingOption?.name} ({order.shipping}
            )
          </p>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  );
};

export default ShippingDetails;
