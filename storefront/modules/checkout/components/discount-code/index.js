"use client";
import { InformationCircleSolid } from "@medusajs/icons";
import { Heading, Label, Text, Tooltip } from "@medusajs/ui";
import React, { useMemo } from "react";
import { useFormState } from "react-dom";

import Input from "@storefront/modules/common/components/input";
import Trash from "@storefront/modules/common/icons/trash";
import ErrorMessage from "@storefront/modules/checkout/components/error-message";
import { SubmitButton } from "@storefront/modules/checkout/components/submit-button";
import {
  removeDiscount,
  removeGiftCard,
  submitDiscountForm,
} from "@storefront/modules/checkout/actions";
import { formatAmount } from "@storefront/lib/util/prices";

const DiscountCode = ({ cart }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const { discounts, giftCards, region } = cart || {};

  const appliedDiscount = useMemo(() => {
    if (!discounts || !discounts.length) {
      return undefined;
    }

    const discount = discounts[0];
    if (!discount.discountRule) return undefined;

    switch (discount.discountRule.type) {
      case "percentage":
        return `${discount.discountRule.value}%`;
      case "fixed":
        return `- ${formatAmount({
          amount: discount.discountRule.value,
          region: region,
        })}`;
      default:
        return "Free shipping";
    }
  }, [discounts, region]);

  const removeGiftCardCode = async (code) => {
    await removeGiftCard(code);
  };

  const removeDiscountCode = async () => {
    await removeDiscount(discounts[0].code);
  };

  const [message, formAction] = useFormState(submitDiscountForm, null);

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="txt-medium">
        {giftCards?.length > 0 && (
          <div className="flex flex-col mb-4">
            <Heading className="txt-medium">Gift card(s) applied:</Heading>
            {giftCards.map((gc) => (
              <div
                className="flex items-center justify-between txt-small-plus"
                key={gc.id}
              >
                <Text className="flex gap-x-1 items-baseline">
                  <span>Code: </span>
                  <span className="truncate">{gc.code}</span>
                </Text>
                <Text className="font-semibold">
                  {formatAmount({
                    region: region,
                    amount: gc.balance,
                    includeTaxes: false,
                  })}
                </Text>
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

        {appliedDiscount ? (
          <div className="w-full flex items-center">
            <div className="flex flex-col w-full">
              <Heading className="txt-medium">Discount applied:</Heading>
              <div className="flex items-center justify-between w-full max-w-full">
                <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1">
                  <span>Code:</span>
                  <span className="truncate">{discounts[0].code}</span>
                  <span className="min-w-fit">({appliedDiscount})</span>
                </Text>
                <button
                  className="flex items-center"
                  onClick={removeDiscountCode}
                >
                  <Trash size={14} />
                  <span className="sr-only">
                    Remove discount code from order
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form action={formAction} className="w-full">
            <Label className="flex gap-x-1 my-2 items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              >
                Add gift card or discount code
              </button>
              <Tooltip content="You can add multiple gift cards, but only one discount code.">
                <InformationCircleSolid color="var(--fg-muted)" />
              </Tooltip>
            </Label>
            {isOpen && (
              <>
                <div className="flex w-full gap-x-2 items-center">
                  <Input
                    label="Please enter code"
                    name="code"
                    type="text"
                    autoFocus={false}
                  />
                  <SubmitButton variant="secondary">Apply</SubmitButton>
                </div>
                <ErrorMessage error={message} />
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default DiscountCode;
