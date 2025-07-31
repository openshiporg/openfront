"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethod {
  id: string;
  code: string;
  name: string;
}

interface AdminPaymentSelectionProps {
  availablePaymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

const paymentInfoMap: Record<string, { title: string; icon: React.ReactNode }> = {
  manual: { title: "Manual Payment", icon: <DollarSign className="h-5 w-5" /> },
  stripe: { title: "Stripe", icon: <CreditCard className="h-5 w-5" /> },
  paypal: { title: "PayPal", icon: <CreditCard className="h-5 w-5" /> },
};

export function AdminPaymentSelection({
  availablePaymentMethods,
  selectedPaymentMethod,
  onPaymentMethodChange,
}: AdminPaymentSelectionProps) {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedPaymentMethod}
        onValueChange={onPaymentMethodChange}
        className="space-y-2"
      >
        {availablePaymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <RadioGroupItem
              value={method.code}
              id={method.id}
              className="sr-only"
            />
            <div
              onClick={() => onPaymentMethodChange(method.code)}
              className={cn(
                "flex items-center justify-between text-sm font-normal cursor-pointer py-4 border rounded-md px-4 transition-colors",
                {
                  "border-primary bg-primary/5":
                    selectedPaymentMethod === method.code,
                  "border-border hover:border-primary/50":
                    selectedPaymentMethod !== method.code,
                }
              )}
            >
              <div className="flex items-center gap-x-4">
                <div
                  className={cn(
                    "w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors",
                    {
                      "border-primary": selectedPaymentMethod === method.code,
                      "border-border": selectedPaymentMethod !== method.code,
                    }
                  )}
                >
                  {selectedPaymentMethod === method.code && (
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </div>
                <span className="text-sm font-normal">
                  {paymentInfoMap[method.code]?.title || method.name}
                </span>
              </div>
              <div className="flex items-center">
                {paymentInfoMap[method.code]?.icon || <CreditCard className="h-5 w-5" />}
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}