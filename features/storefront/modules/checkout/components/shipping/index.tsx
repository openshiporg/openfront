"use client"

import { setShippingMethod } from "@/features/storefront/lib/data/cart" 
import { CircleCheck } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message"
import Divider from "@/features/storefront/modules/common/components/divider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { RiLoader2Fill } from "@remixicon/react";

interface ShippingOption {
  id: string;
  name: string;
  calculatedAmount: string;
}

interface ShippingProps {
  cart: {
    id: string;
    shippingMethods: {
      shippingOption: {
        id: string;
        name: string;
      };
    }[];
    shippingAddress: any;
    billingAddress: any;
    email: string;
    shipping: string;
  };
  availableShippingMethods: ShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(
    cart?.shippingMethods?.[0]?.shippingOption?.id || null
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams?.get("step") === "delivery"

  const handleEdit = () => {
    router.push(pathname + "?step=delivery", { scroll: false })
  }

  const handleSubmit = async () => {
    if (!selectedOption) return

    setIsLoading(true)
    try {
      await setShippingMethod(selectedOption)
      router.push(pathname + "?step=payment", { scroll: false })
    } catch (err: any) {
      setError(err.message || err.toString())
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (value: string) => {
    setSelectedOption(value)
  }

  useEffect(() => {
    setIsLoading(false)
    setError(null)
    setSelectedOption(cart?.shippingMethods?.[0]?.shippingOption?.id || null)
  }, [isOpen, cart?.shippingMethods])

  return (
    <div className="bg-background">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2
          className={cn(
            "flex flex-row text-3xl font-medium gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart?.shippingMethods?.length === 0, 
            }
          )}
        >
          Delivery
          {!isOpen && (cart?.shippingMethods?.length ?? 0) > 0 && ( 
            <CircleCheck className="h-5 w-5" /> 
          )}
        </h2>
        {!isOpen &&
          cart?.shippingAddress && 
          cart?.billingAddress && 
          cart?.email && (
            <p>
              <Button
                onClick={handleEdit}
                data-testid="edit-delivery-button"
                variant="outline"
                size="sm"
              >
                Update Delivery
              </Button>
            </p>
          )}
      </div>
      {isOpen ? (
        <>
          <div className="grid">
            <div className="flex flex-col">
              <span className="font-medium text-sm text-foreground">
                Shipping method
              </span>
              <span className="mb-4 text-muted-foreground text-sm font-normal">
                How would you like your order delivered
              </span>
            </div>
            <div data-testid="delivery-options-container">
              <div className="pb-6 md:pt-0 pt-2">
                <RadioGroup
                  value={selectedOption || ""}
                  onValueChange={handleChange}
                  className="space-y-2"
                >
                  {availableShippingMethods?.map((option) => {
                    const isDisabled = false

                    return (
                      <div
                        key={option.id}
                        data-testid="delivery-option-radio"
                        className="relative"
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={option.id}
                          disabled={isDisabled}
                          className="sr-only"
                        />
                        <Label 
                          htmlFor={option.id}
                          className={cn(
                            "flex items-center justify-between text-xs font-normal cursor-pointer py-4 border rounded-md px-8 transition-colors",
                            {
                              "border-primary bg-primary/5": option.id === selectedOption,
                              "border-border hover:border-primary/50": option.id !== selectedOption && !isDisabled,
                              "cursor-not-allowed opacity-50": isDisabled,
                            }
                          )}
                        >
                          <div className="flex items-center gap-x-4">
                            <div className={cn(
                              "w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors",
                              {
                                "border-primary": option.id === selectedOption,
                                "border-border": option.id !== selectedOption,
                                "opacity-50": isDisabled,
                              }
                            )}>
                              {option.id === selectedOption && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <span className="text-sm font-normal">
                              {option.name}
                            </span>
                          </div>
                          <span className="justify-self-end text-foreground">
                            {option.calculatedAmount}
                          </span>
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
              </div>
            </div>
          </div>

          <div>
            <ErrorMessage
              error={error}
              data-testid="delivery-option-error-message"
            />
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedOption || isLoading}
              data-testid="submit-delivery-option-button"
            >
              {isLoading && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />} 
              Continue to payment
            </Button>
          </div>
        </>
      ) : (
        <div>
          <div className="text-xs font-normal"> 
            {cart && (cart?.shippingMethods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-1/3">
                <p className="text-sm font-medium text-foreground mb-1"> 
                  Method
                </p>
                <p className="text-sm font-normal text-muted-foreground"> 
                {cart.shippingMethods[0].shippingOption.name} ({cart.shipping})
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Shipping