"use client";
import { RadioGroup } from "@headlessui/react"
import { CheckCircleSolid } from "@medusajs/icons"
import { Button, Heading, Text, clx } from "@medusajs/ui";

import Divider from "@storefront/modules/common/components/divider"
import Radio from "@storefront/modules/common/components/radio"
import Spinner from "@storefront/modules/common/icons/spinner"
import ErrorMessage from "@storefront/modules/checkout/components/error-message"
import { setShippingMethod } from "@storefront/lib/data/cart"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const Shipping = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "delivery"

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = () => {
    setIsLoading(true)
    router.push(pathname + "?step=payment", { scroll: false })
  }

  const set = async (id) => {
    setIsLoading(true)
    await setShippingMethod(id)
      .then(() => {
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.toString())
        setIsLoading(false)
      })
  }

  const handleChange = (value) => {
    set(value)
  }

  useEffect(() => {
    setIsLoading(false)
    setError(null)
  }, [isOpen])

  // Get the currently selected shipping method's option ID
  const selectedOptionId = cart?.shippingMethods?.[0]?.shippingOption?.id;

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx("flex flex-row text-3xl-regular gap-x-2 items-baseline", {
            "opacity-50 pointer-events-none select-none":
              !isOpen && cart.shippingMethods.length === 0,
          })}>
          Delivery
          {!isOpen && cart.shippingMethods.length > 0 && <CheckCircleSolid />}
        </Heading>
        {!isOpen &&
          cart?.shippingAddress &&
          cart?.billingAddress &&
          cart?.email && (
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
        <div>
          <div className="pb-8">
            <RadioGroup
              value={cart.shippingMethods[0]?.shippingOption.id}
              onChange={(value) => handleChange(value)}>
              {availableShippingMethods ? (
                (availableShippingMethods.map((option) => {
                  return (
                    <RadioGroup.Option
                      key={option.id}
                      value={option.id}
                      className={clx(
                        "flex items-center justify-between text-small-regular cursor-pointer py-4 border rounded-rounded px-8 mb-2 hover:shadow-borders-interactive-with-active",
                        {
                          "border-ui-border-interactive":
                            option.id ===
                            cart.shippingMethods[0]?.shippingOption.id,
                        }
                      )}>
                      <div className="flex items-center gap-x-4">
                        <Radio
                          checked={
                            option.id ===
                            cart.shippingMethods[0]?.shippingOption.id
                          } />
                        <span className="text-base-regular">{option.name}</span>
                      </div>
                      <span className="justify-self-end text-ui-fg-base">
                        {option.calculatedAmount}
                      </span>
                    </RadioGroup.Option>
                  );
                }))
              ) : (
                <div
                  className="flex flex-col items-center justify-center px-4 py-8 text-ui-fg-base">
                  <Spinner />
                </div>
              )}
            </RadioGroup>
          </div>

          <ErrorMessage error={error} />

          <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!cart.shippingMethods[0]}>
            Continue to payment
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shippingMethods.length > 0 && (
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Method
                </Text>
                <Text className="txt-medium text-ui-fg-subtle">
                  {cart.shippingMethods[0].shippingOption.name} ({cart.shipping})
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  );
}

export default Shipping
