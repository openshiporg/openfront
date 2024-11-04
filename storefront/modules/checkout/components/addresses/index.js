"use client";
import {
  useSearchParams,
  useRouter,
  usePathname,
  useParams,
} from "next/navigation"
import { CheckCircleSolid } from "@medusajs/icons"
import { Heading, Text, useToggleState } from "@medusajs/ui"

import Divider from "@storefront/modules/common/components/divider"
import Spinner from "@storefront/modules/common/icons/spinner"

import BillingAddress from "../billing_address"
import ShippingAddress from "../shipping-address"
import { setAddresses } from "../../actions"
import { SubmitButton } from "../submit-button"
import { useFormState } from "react-dom"
import ErrorMessage from "../error-message"
import compareAddresses from "@storefront/lib/util/compare-addresses"

const Addresses = ({
  cart,
  customer
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const countryCode = params.countryCode

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsSBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shippingAddress && cart?.billingAddress
      ? compareAddresses(cart?.shippingAddress, cart?.billingAddress)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useFormState(setAddresses, null)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline">
          Shipping Address
          {!isOpen && <CheckCircleSolid />}
        </Heading>
        {!isOpen && cart?.shippingAddress && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover">
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              countryCode={countryCode}
              checked={sameAsSBilling}
              onChange={toggleSameAsBilling}
              cart={cart} />

            {!sameAsSBilling && (
              <div>
                <Heading level="h2" className="text-3xl-regular gap-x-4 pb-6 pt-8">
                  Billing address
                </Heading>

                <BillingAddress cart={cart} countryCode={countryCode} />
              </div>
            )}
            <SubmitButton className="mt-6">Continue to delivery</SubmitButton>
            <ErrorMessage error={message} />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shippingAddress ? (
              <div className="flex items-start gap-x-8">
                <div className="flex items-start gap-x-1 w-full">
                  <div className="flex flex-col w-1/3">
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Shipping Address
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shippingAddress.firstName}{" "}
                      {cart.shippingAddress.lastName}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shippingAddress.address1}{" "}
                      {cart.shippingAddress.address2}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shippingAddress.postalCode},{" "}
                      {cart.shippingAddress.city}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shippingAddress.countryCode?.toUpperCase()}
                    </Text>
                  </div>

                  <div className="flex flex-col w-1/3 ">
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Contact
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shippingAddress.phone}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.email}
                    </Text>
                  </div>

                  <div className="flex flex-col w-1/3">
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Billing Address
                    </Text>

                    {sameAsSBilling ? (
                      <Text className="txt-medium text-ui-fg-subtle">
                        Billing- and delivery address are the same.
                      </Text>
                    ) : (
                      <>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billingAddress.firstName}{" "}
                          {cart.billingAddress.lastName}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billingAddress.address1}{" "}
                          {cart.billingAddress.address2}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billingAddress.postalCode},{" "}
                          {cart.billingAddress.city}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billingAddress.countryCode?.toUpperCase()}
                        </Text>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  );
}

export default Addresses
