"use client";

import { setAddresses } from "@/features/storefront/lib/data/cart";
import compareAddresses from "@/features/storefront/lib/util/compare-addresses";
import { CircleCheck } from "lucide-react";
import Divider from "@/features/storefront/modules/common/components/divider";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation";
import { useActionState } from "react";
import BillingAddress from "../billing-address";
import ErrorMessage from "../error-message";
import ShippingAddress from "../shipping-address";
import { SubmitButton } from "../submit-button";
import { Button } from "@/components/ui/button";
import { RiLoader2Fill } from "@remixicon/react";

const Addresses = ({
  cart,
  customer,
}: {
  cart: any | null;
  customer: any | null;
}) => {
  console.log("🏠 [DEBUG] Addresses component rendered", {
    cartId: cart?.id,
    hasShippingAddress: !!cart?.shippingAddress,
    shippingAddress: cart?.shippingAddress,
    hasBillingAddress: !!cart?.billingAddress,
    customerEmail: customer?.email
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams?.get("step") === "address";
  console.log("🔍 [DEBUG] Current step:", searchParams?.get("step"), "isOpen:", isOpen);

  const [sameAsBilling, setSameAsBilling] = useState(
    cart?.shippingAddress && cart?.billingAddress
      ? compareAddresses(cart?.shippingAddress, cart?.billingAddress)
      : true
  );
  const toggleSameAsBilling = () => setSameAsBilling((prev) => !prev);

  const handleEdit = () => {
    router.push(pathname + "?step=address");
  };

  const params = useParams();

  // Custom form action handler that will handle client-side redirection
  const handleFormAction = async (prevState: any, formData: FormData) => {
    console.log("📝 [DEBUG] handleFormAction called");
    
    // Check for required fields before calling setAddresses
    if (!formData.get("shippingAddress.countryCode")) {
      console.log("❌ [DEBUG] Missing country code");
      return "Please select a country.";
    }

    if (!formData.get("shippingAddress.firstName")) {
      console.log("❌ [DEBUG] Missing first name");
      return "Please enter your first name.";
    }

    if (!formData.get("shippingAddress.lastName")) {
      console.log("❌ [DEBUG] Missing last name");
      return "Please enter your last name.";
    }

    if (!formData.get("shippingAddress.address1")) {
      console.log("❌ [DEBUG] Missing address");
      return "Please enter your address.";
    }

    if (!formData.get("shippingAddress.city")) {
      console.log("❌ [DEBUG] Missing city");
      return "Please enter your city.";
    }

    if (!formData.get("shippingAddress.postalCode")) {
      console.log("❌ [DEBUG] Missing postal code");
      return "Please enter your postal code.";
    }

    if (!formData.get("email")) {
      console.log("❌ [DEBUG] Missing email");
      return "Please enter your email address.";
    }

    console.log("✅ [DEBUG] All required fields present, calling setAddresses");
    const result = await setAddresses(null, formData);
    console.log("📋 [DEBUG] setAddresses result:", result);

    // If successful, redirect client-side
    if (result && typeof result === 'object' && 'success' in result && result.success === true) {
      const countryCode = params?.countryCode as string;
      console.log("🚀 [DEBUG] Success! Redirecting to delivery step:", `/${countryCode}/checkout?step=delivery`);
      router.push(`/${countryCode}/checkout?step=delivery`);
      return;
    }

    // Otherwise return the error message
    console.log("❌ [DEBUG] setAddresses failed with:", result);
    return result;
  };

  const [message, formAction] = useActionState(handleFormAction, null);

  return (
    <div className="bg-background">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2 className="flex flex-row text-3xl font-medium gap-x-2 items-baseline">
          Shipping Address
          {!isOpen && <CircleCheck className="h-5 w-5" />}
        </h2>
        {!isOpen && cart?.shippingAddress && (
          <p>
            <Button
              onClick={handleEdit}
              data-testid="edit-address-button"
              variant="outline"
              size="sm"
            >
              Update Address
            </Button>
          </p>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
              countryCode={params?.countryCode as string}
            />

            {!sameAsBilling && (
              <div>
                <h2 className="text-3xl font-medium gap-x-4 pb-6 pt-8">
                  Billing address
                </h2>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton size="lg" className="mt-6" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message as string | null} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-xs font-normal">
            {cart && cart.shippingAddress ? (
              <div className="flex items-start gap-x-8">
                <div className="flex items-start gap-x-1 w-full">
                  <div
                    className="flex flex-col w-1/3"
                    data-testid="shipping-address-summary"
                  >
                    <p className="text-sm font-medium text-foreground mb-1">
                      Shipping Address
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">
                      {cart.shippingAddress.firstName}{" "}
                      {cart.shippingAddress.lastName}
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">
                      {cart.shippingAddress.address1}{" "}
                      {cart.shippingAddress.address2}
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">
                      {cart.shippingAddress.city}
                      {cart.shippingAddress.province && `, ${cart.shippingAddress.province}`}
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">
                      {cart.shippingAddress.postalCode} {cart.shippingAddress.countryCode?.toUpperCase()}
                    </p>
                  </div>

                  <div
                    className="flex flex-col w-1/3 "
                    data-testid="shipping-contact-summary"
                  >
                    <p className="text-sm font-medium text-foreground mb-1">
                      Contact
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">
                      {cart.shippingAddress.phone}
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">
                      {cart.email}
                    </p>
                  </div>

                  <div
                    className="flex flex-col w-1/3"
                    data-testid="billing-address-summary"
                  >
                    <p className="text-sm font-medium text-foreground mb-1">
                      Billing Address
                    </p>

                    {sameAsBilling ? (
                      <p className="text-sm font-normal text-muted-foreground">
                        Billing and delivery address are the same.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-normal text-muted-foreground">
                          {cart.billingAddress?.firstName}{" "}
                          {cart.billingAddress?.lastName}
                        </p>
                        <p className="text-sm font-normal text-muted-foreground">
                          {cart.billingAddress?.address1}{" "}
                          {cart.billingAddress?.address2}
                        </p>
                        <p className="text-sm font-normal text-muted-foreground">
                          {cart.billingAddress?.city}
                          {cart.billingAddress?.province && `, ${cart.billingAddress.province}`}
                        </p>
                        <p className="text-sm font-normal text-muted-foreground">
                          {cart.billingAddress?.postalCode} {cart.billingAddress?.countryCode?.toUpperCase()}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <RiLoader2Fill className="animate-spin h-5 w-5" />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  );
};

export default Addresses;
