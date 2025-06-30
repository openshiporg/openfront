"use client";
import { Info, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

import Trash from "@/features/storefront/modules/common/icons/trash";
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message";
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button";
import {
  removeDiscount,
  removeGiftCard,
  submitDiscountForm,
} from "@/features/storefront/lib/data/cart";
import { formatAmount } from "@/features/storefront/lib/util/prices";
import { useState, useMemo, useActionState } from "react";
import { Input } from "@/components/ui/input";

interface DiscountCodeProps {
  cart?: {
    discounts?: any[];
    giftCards?: any[];
    region?: any;
    discountsById?: Record<string, number>;
  };
}

const DiscountCode = ({ cart }: DiscountCodeProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { discounts, giftCards, region } = cart || {};

  const appliedDiscounts = useMemo(() => {
    if (!discounts || !discounts.length) {
      return [];
    }

    const discountAmounts = cart?.discountsById || {};

    return discounts
      .map((discount) => {
        if (!discount.discountRule) return null;

        const value = (() => {
          switch (discount.discountRule.type) {
            case "percentage":
              return `${discount.discountRule.value}% off`;
            case "fixed":
              return `${formatAmount({
                amount: discount.discountRule.value,
                region: region,
              })} off`;
            case "free_shipping":
              return "Free shipping";
            default:
              return "";
          }
        })();

        return {
          code: discount.code,
          value,
          id: discount.id,
          type: discount.discountRule.type,
          discountAmount: discountAmounts[discount.id] || 0,
        };
      })
      .filter(Boolean);
  }, [discounts, region, cart?.discountsById]);

  const removeGiftCardCode = async (code: string) => {
    await removeGiftCard(code);
  };

  const removeDiscountCode = async (code: string) => {
    await removeDiscount(code);
  };

  const [message, formAction] = useActionState(submitDiscountForm, null);

  return (
    <div className="w-full bg-background flex flex-col">
      <div className="font-medium">
        <form action={formAction} className="w-full">
          <Label className="flex gap-x-2 my-2 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-blue-800 dark:text-blue-500"
            >
              Add gift card or discount code
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  You can add multiple gift cards and stackable discount codes
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          {isOpen && (
            <>
              <div className="flex w-full gap-x-2 items-center">
                <Input
                  placeholder="Please enter code"
                  name="code"
                  type="text"
                  autoFocus={false}
                />
                <SubmitButton variant="outline" size="lg">Apply</SubmitButton>
              </div>
              <ErrorMessage error={message} />
            </>
          )}
        </form>
        {giftCards && giftCards.length > 0 && (
          <div className="flex flex-col mt-4">
            <h3 className="font-medium">Gift card(s) applied:</h3>
            {giftCards.map((gc) => (
              <div
                className="flex items-center justify-between txt-small-plus"
                key={gc.id}
              >
                <span className="flex gap-x-1 items-baseline">
                  <span>Code: </span>
                  <span className="truncate">{gc.code}</span>
                </span>
                <span className="font-semibold">
                  {formatAmount({
                    region: region,
                    amount: gc.balance,
                    includeTaxes: false,
                  })}
                </span>
                <button
                  className="flex items-center gap-x-2 !background-transparent !border-none"
                  onClick={() => removeGiftCardCode(gc.code)}
                >
                  <Trash size={14} />
                  <span className="sr-only">Remove gift card from order</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {appliedDiscounts.length > 0 && (
          <div className="flex flex-col gap-y-2 mt-4">
            {appliedDiscounts.map((discount) =>
              discount ? (
                <div className="flex justify-between" key={discount.code}>
                  <div className="flex flex-col">
                    <Badge
                      variant="default"
                      className="flex items-center gap-x-2"
                    >
                      {discount.code}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDiscountCode(discount.code)}
                        className="-mr-2"
                      >
                        <X size={14} />
                        <span className="sr-only">Remove discount code</span>
                      </Button>
                    </Badge>
                    <span className="txt-xsmall text-ui-fg-muted">
                      {discount.value}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-ui-fg-muted">
                      -{discount.discountAmount}
                    </span>
                  </div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountCode;
