"use client";
import { isStripe, paymentInfoMap } from "@/features/storefront/lib/constants";
import { initiatePaymentSession } from "@/features/storefront/lib/data/payment";
import { CircleCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ErrorMessage from "../error-message";
// PaymentContainer is not used in this component
import { StripeContext } from "../payment-wrapper/stripe-wrapper";
import Divider from "@/features/storefront/modules/common/components/divider";
import { CardElement } from "@stripe/react-stripe-js";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { RiLoader2Fill } from "@remixicon/react";
import { cn } from "@/lib/utils";

interface PaymentProps {
  cart: {
    id: string;
    total: number;
    paymentCollection?: {
      paymentSessions?: Array<{
        isSelected: boolean;
        status?: string;
        paymentProvider: {
          code: string;
        };
      }>;
    };
    shippingMethods: any[];
    giftCards?: any[];
  };
  availablePaymentMethods: Array<{
    id: string;
    code: string;
  }>;
}

const Payment = ({ cart, availablePaymentMethods }: PaymentProps) => {
  const activeSession = cart.paymentCollection?.paymentSessions?.find(
    (session) => session.isSelected
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.paymentProvider?.code ?? ""
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams?.get("step") === "payment";

  const isStripePayment = isStripe(selectedPaymentMethod);
  const stripeReady = useContext(StripeContext);

  const paidByGiftcard =
    cart?.giftCards && cart?.giftCards?.length > 0 && cart?.total === 0;

  const paymentReady =
    (activeSession && cart?.shippingMethods.length !== 0) || paidByGiftcard;

  const useOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          color: "#424270",
          "::placeholder": {
            color: "rgb(107 114 128)",
          },
        },
      },
      classes: {
        base: "pt-3 pb-1 block w-full h-12 px-4 mt-0 bg-background border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-border hover:bg-muted transition-all duration-300 ease-in-out text-[50px]",
      },
    };
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const shouldInputCard = isStripe(selectedPaymentMethod) && !cardComplete;

      const hasExistingSelectedSession =
        cart.paymentCollection?.paymentSessions?.some(
          (session) =>
            session.isSelected &&
            session.paymentProvider.code === selectedPaymentMethod &&
            session.status !== "error"
        );

      if (!hasExistingSelectedSession) {
        await initiatePaymentSession(cart.id, selectedPaymentMethod);
      }

      if (!shouldInputCard) {
        return router.push(
          pathname + "?" + createQueryString("step", "review"),
          {
            scroll: false,
          }
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
  }, [isOpen]);

  return (
    <div className="bg-background">
      <div className="flex flex-row items-center justify-between mb-6">
        <h2
          className={cn(
            "flex flex-row text-3xl font-medium gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CircleCheck className="hidden sm:block h-5 w-5" />}
        </h2>
        {!isOpen && paymentReady && (
          <span>
            <Button
              onClick={handleEdit}
              data-testid="edit-payment-button"
              variant="outline"
              size="sm"
            >
              Update Payment
            </Button>
          </span>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length > 0 && (
            <>
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
                className="space-y-2"
              >
                {availablePaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="relative"
                  >
                    <RadioGroupItem
                      value={method.code}
                      id={method.id}
                      className="sr-only" // Hide the radio button visually but keep it accessible
                    />
                    <Label
                      htmlFor={method.id}
                      className={cn(
                        "flex items-center justify-between text-sm font-normal cursor-pointer py-4 border rounded-md px-8 transition-colors",
                        {
                          "border-primary bg-primary/5": selectedPaymentMethod === method.code,
                          "border-border hover:border-primary/50": selectedPaymentMethod !== method.code,
                        }
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <div className={cn(
                          "w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors",
                          {
                            "border-primary": selectedPaymentMethod === method.code,
                            "border-border": selectedPaymentMethod !== method.code,
                          }
                        )}>
                          {selectedPaymentMethod === method.code && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <span className="text-sm font-normal">
                          {paymentInfoMap[method.code]?.title || method.code}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {paymentInfoMap[method.code]?.icon}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {isStripePayment && stripeReady && (
                <div className="mt-5 transition-all duration-150 ease-in-out">
                  <p className="text-base font-semibold mb-1">
                    Enter your card details:
                  </p>
                  <CardElement
                    options={useOptions}
                    onChange={(e) => {
                      if (e.brand) {
                        setCardBrand(e.brand.charAt(0).toUpperCase() + e.brand.slice(1));
                      }
                      setError(e.error?.message || null);
                      setCardComplete(e.complete);
                    }}
                  />
                </div>
              )}
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <p className="text-base font-semibold mb-1">
                Payment method
              </p>
              <p
                className="text-base font-medium text-muted-foreground"
                data-testid="payment-method-summary"
              >
                Gift card
              </p>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={
              (!selectedPaymentMethod && !paidByGiftcard) ||
              !cart?.shippingMethods?.length ||
              isLoading
            }
            data-testid="submit-payment-button"
            className="mt-6"
          >
            {isLoading && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin"/>}
            {isStripePayment && !cardComplete
              ? "Enter card details"
              : "Continue to review"}
          </Button>
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-x-8 w-full">
              <div className="flex flex-col w-full sm:w-1/3">
                <p className="text-sm font-medium mb-1">
                  Payment method
                </p>
                <p
                  className="text-sm text-muted-foreground"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    selectedPaymentMethod}
                </p>
              </div>
              <div className="flex flex-col w-full sm:w-1/3">
                <p className="text-sm font-medium mb-1">
                  Payment details
                </p>
                <div
                  className="flex gap-2 text-sm text-muted-foreground items-center"
                  data-testid="payment-details-summary"
                >
                  <div className="flex items-center h-7 w-fit p-2 bg-muted/40 border rounded-md">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </div>
                  <span>
                    {isStripe(selectedPaymentMethod) && cardBrand
                      ? cardBrand
                      : "Another step will appear"}
                  </span>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <p className="text-base font-semibold mb-1">
                Payment method
              </p>
              <p
                className="text-base font-medium text-muted-foreground"
                data-testid="payment-method-summary"
              >
                Gift card
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  );
};

export default Payment;
