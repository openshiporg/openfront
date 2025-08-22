"use client";

import { setAddresses } from "@/features/storefront/lib/data/cart";
import compareAddresses from "@/features/storefront/lib/util/compare-addresses";
import { CircleCheck } from "lucide-react";
import Divider from "@/features/storefront/modules/common/components/divider";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation";
import BillingAddress from "../billing-address";
import ErrorMessage from "../error-message";
import ShippingAddress from "../shipping-address";
import { Button } from "@/components/ui/button";
import { RiLoader2Fill } from "@remixicon/react";

const Addresses = ({
  cart,
  customer,
}: {
  cart: any | null;
  customer: any | null;
}) => {

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams?.get("step") === "address";

  const [sameAsBilling, setSameAsBilling] = useState(
    cart?.shippingAddress && cart?.billingAddress
      ? compareAddresses(cart?.shippingAddress, cart?.billingAddress)
      : true
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toggleSameAsBilling = () => setSameAsBilling((prev) => !prev);

  const handleEdit = () => {
    router.push(pathname + "?step=address");
  };

  const params = useParams();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    
    // Check for required fields before calling setAddresses
    if (!formData.get("shippingAddress.countryCode")) {
      setError("Please select a country.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.firstName")) {
      setError("Please enter your first name.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.lastName")) {
      setError("Please enter your last name.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.address1")) {
      setError("Please enter your address.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.city")) {
      setError("Please enter your city.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("shippingAddress.postalCode")) {
      setError("Please enter your postal code.");
      setIsLoading(false);
      return;
    }

    if (!formData.get("email")) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await setAddresses(null, formData);

      // If successful, redirect client-side
      if (result && typeof result === 'object' && 'success' in result && result.success === true) {
        const countryCode = params?.countryCode as string;
        router.push(`/${countryCode}/checkout?step=delivery`);
        return;
      }

      // Otherwise set the error message
      if (typeof result === 'string') {
        setError(result);
      } else if (result && typeof result === 'object' && 'message' in result) {
        setError(result.message as string);
      } else {
        setError("An unexpected error occurred.");
      }
    } catch (err: any) {
      setError(err.message || err.toString());
    } finally {
      setIsLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit}>
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
            <Button 
              size="lg" 
              className="mt-6" 
              data-testid="submit-address-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />}
              Continue to delivery
            </Button>
            <ErrorMessage error={error} data-testid="address-error-message" />
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
