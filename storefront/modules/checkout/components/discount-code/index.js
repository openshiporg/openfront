"use client";
import { InformationCircleSolid, Tag, XMarkMini } from "@medusajs/icons";
import {
  Badge,
  Heading,
  IconBadge,
  IconButton,
  Label,
  Text,
  Tooltip,
} from "@medusajs/ui";

import Input from "@storefront/modules/common/components/input";
import Trash from "@storefront/modules/common/icons/trash";
import ErrorMessage from "@storefront/modules/checkout/components/error-message";
import { SubmitButton } from "@storefront/modules/checkout/components/submit-button";
import {
  removeDiscount,
  removeGiftCard,
  submitDiscountForm,
} from "@storefront/lib/data/cart";
import { formatAmount } from "@storefront/lib/util/prices";
import { useState, useMemo } from "react";
import { useFormState } from "react-dom";

const DiscountCode = ({ cart }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { discounts, giftCards, region } = cart || {};

  const appliedDiscounts = useMemo(() => {
    if (!discounts || !discounts.length) {
      return [];
    }

    const discountAmounts = cart.discountsById || {};

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
  }, [discounts, region, cart.discountsById]);

  const removeGiftCardCode = async (code) => {
    await removeGiftCard(code);
  };

  const removeDiscountCode = async (code) => {
    await removeDiscount(code);
  };

  const [message, formAction] = useFormState(submitDiscountForm, null);

  return (
    <div className="w-full bg-white flex flex-col">
      <div className="txt-medium">
        <form action={formAction} className="w-full">
          <Label className="flex gap-x-1 my-2 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="txt-medium text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
            >
              Add gift card or discount code
            </button>
            <Tooltip content="You can add multiple gift cards and stackable discount codes">
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
        {giftCards?.length > 0 && (
          <div className="flex flex-col mt-4">
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

        {appliedDiscounts.length > 0 && (
          <div className="flex flex-col gap-y-2 mt-4">
            {appliedDiscounts.map((discount) => (
              <div className="flex justify-between" key={discount.code}>
                <div className="flex flex-col">
                  <Badge
                    variant="default"
                    className="flex items-center gap-x-2"
                  >
                    {discount.code}
                    <IconButton
                      variant="transparent"
                      onClick={() => removeDiscountCode(discount.code)}
                      size="small"
                      className="-mr-2"
                    >
                      <XMarkMini />
                      <span className="sr-only">Remove discount code</span>
                    </IconButton>
                  </Badge>
                  <Text className="txt-xsmall text-ui-fg-muted">
                    {discount.value}
                  </Text>
                </div>
                <div className="flex flex-col">
                  <Text className="text-ui-fg-muted">
                    -{discount.discountAmount}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountCode;
