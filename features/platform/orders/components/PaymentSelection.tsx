"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardElement } from "@stripe/react-stripe-js";
import { paymentInfoMap, isStripe, isManual } from "@/features/storefront/lib/constants";

interface PaymentProvider {
  id: string;
  code: string;
  name?: string;
}

interface PaymentSelectionProps {
  availableProviders: PaymentProvider[];
  selectedProviderId: string | null;
  onProviderChange: (providerId: string) => void;
  onSelectPaymentMethod: (providerId: string) => Promise<void>;
  onPlaceOrder: (sendEmail?: boolean) => Promise<void>;
  isSelectingPayment: boolean;
  isPlacingOrder: boolean;
  paymentSessionCreated: boolean;
  stripeReady?: boolean;
  onCardChange?: (complete: boolean, error?: string) => void;
  cardComplete?: boolean;
  error?: string;
}

export function PaymentSelection({
  availableProviders,
  selectedProviderId,
  onProviderChange,
  onSelectPaymentMethod,
  onPlaceOrder,
  isSelectingPayment,
  isPlacingOrder,
  paymentSessionCreated,
  stripeReady = false,
  onCardChange,
  cardComplete = false,
  error
}: PaymentSelectionProps) {
  const [sendEmailLink, setSendEmailLink] = React.useState(false);
  
  const isStripeProvider = selectedProviderId ? isStripe(selectedProviderId) : false;
  const isManualProvider = selectedProviderId ? isManual(selectedProviderId) : false;

  const handleSelectPayment = async () => {
    if (!selectedProviderId) return;
    await onSelectPaymentMethod(selectedProviderId);
  };

  const handlePlaceOrder = async () => {
    await onPlaceOrder(sendEmailLink);
  };

  const getSelectButtonText = () => {
    if (isSelectingPayment) return "Selecting...";
    return "Select Payment Method";
  };

  const getPlaceOrderButtonText = () => {
    if (isPlacingOrder) return "Processing...";
    if (sendEmailLink) return "Send Payment Link";
    if (isManualProvider) return "Place Order (Cash on Delivery)";
    return "Place Order";
  };

  const isSelectButtonDisabled = () => {
    return !selectedProviderId || isSelectingPayment || paymentSessionCreated;
  };

  const isPlaceOrderButtonDisabled = () => {
    if (!paymentSessionCreated || isPlacingOrder) return true;
    if (isStripeProvider && !cardComplete && !sendEmailLink) return true;
    return false;
  };

  const useStripeOptions = React.useMemo(() => ({
    style: {
      base: {
        fontFamily: "Inter, sans-serif",
        color: "#424270",
        "::placeholder": {
          color: "rgb(107 114 128)",
        },
      },
    },
    classes: {
      base: "pt-3 pb-1 block w-full h-11 px-4 mt-0 bg-background border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-border hover:bg-muted transition-all duration-300 ease-in-out",
    },
  }), []);

  return (
    <Card className="bg-muted/10">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b">
        <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground">
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Payment Provider Selection */}
        {availableProviders.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Payment Method</Label>
            <RadioGroup
              value={selectedProviderId || ""}
              onValueChange={onProviderChange}
              className="space-y-2"
            >
              {availableProviders.map((provider) => (
                <div key={provider.id} className="relative">
                  <RadioGroupItem 
                    value={provider.code} 
                    id={provider.id} 
                    className="sr-only" 
                  />
                  <Label 
                    htmlFor={provider.id}
                    className={cn(
                      "flex items-center justify-between text-sm font-normal cursor-pointer py-3 border rounded-md px-4 transition-colors",
                      {
                        "border-primary bg-primary/5": selectedProviderId === provider.code,
                        "border-border hover:border-primary/50": selectedProviderId !== provider.code,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-3">
                      <div className={cn(
                        "w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors",
                        {
                          "border-primary": selectedProviderId === provider.code,
                          "border-border": selectedProviderId !== provider.code,
                        }
                      )}>
                        {selectedProviderId === provider.code && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <span className="text-sm font-normal">
                        {paymentInfoMap[provider.code]?.title || provider.name || provider.code}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {paymentInfoMap[provider.code]?.icon || <CreditCard className="h-4 w-4" />}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* Email Payment Link Option */}
        <div className="flex items-center space-x-2 p-3 bg-muted/20 rounded-md">
          <Switch
            id="send-email"
            checked={sendEmailLink}
            onCheckedChange={setSendEmailLink}
          />
          <Label htmlFor="send-email" className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Send payment link to customer via email
          </Label>
        </div>

        {/* Select Payment Method Button */}
        {!paymentSessionCreated && (
          <Button
            onClick={handleSelectPayment}
            disabled={isSelectButtonDisabled()}
            className="w-full"
            size="lg"
            variant="outline"
          >
            {isSelectingPayment && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {getSelectButtonText()}
          </Button>
        )}

        {/* Payment Session Created - Show Payment Options */}
        {paymentSessionCreated && (
          <>
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
              ✓ Payment method selected successfully
            </div>

            {/* Email Payment Link Option */}
            <div className="flex items-center space-x-2 p-3 bg-muted/20 rounded-md">
              <Switch
                id="send-email"
                checked={sendEmailLink}
                onCheckedChange={setSendEmailLink}
              />
              <Label htmlFor="send-email" className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send payment link to customer via email
              </Label>
            </div>

            {/* Stripe Card Input */}
            {isStripeProvider && stripeReady && !sendEmailLink && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Card Details</Label>
                <div className="border rounded-md p-3">
                  <CardElement
                    options={useStripeOptions}
                    onChange={(e) => {
                      if (onCardChange) {
                        onCardChange(e.complete || false, e.error?.message);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Payment Processing Info */}
            {!sendEmailLink && (
              <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-md">
                {isStripeProvider && "Enter card details to process payment immediately."}
                {isManualProvider && "Order will be created with manual payment status."}
                {!isStripeProvider && !isManualProvider && "Payment will be processed with the selected provider."}
              </div>
            )}

            {sendEmailLink && (
              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-md border border-blue-200">
                <Mail className="h-4 w-4 inline mr-2" />
                A payment link will be sent to the customer's email. They can complete the order at their convenience.
              </div>
            )}

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isPlaceOrderButtonDisabled()}
              className="w-full"
              size="lg"
            >
              {isPlacingOrder && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {getPlaceOrderButtonText()}
            </Button>
          </>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}