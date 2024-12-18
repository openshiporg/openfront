"use client";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import StripeWrapper from "./stripe-wrapper";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { isPaypal, isStripe } from "@storefront/lib/constants";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

const PaymentWrapper = ({ cart, children }) => {
  const paymentSession = cart.paymentCollection?.paymentSessions?.find(
    (s) => s.isSelected
  );

  if (
    isStripe(paymentSession?.paymentProvider?.code) &&
    paymentSession &&
    stripePromise
  ) {
    return (
      <StripeWrapper
        paymentSession={paymentSession}
        stripeKey={stripeKey}
        stripePromise={stripePromise}
      >
        {children}
      </StripeWrapper>
    );
  }

  if (
    isPaypal(paymentSession?.paymentProvider?.code) &&
    paypalClientId !== undefined &&
    cart
  ) {
    return (
      <PayPalScriptProvider
        options={{
          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
          currency: cart?.region?.currency?.code?.toUpperCase(),
          intent: "authorize",
          components: "buttons",
        }}
      >
        {children}
      </PayPalScriptProvider>
    );
  }

  return <div>{children}</div>;
};

export default PaymentWrapper;
