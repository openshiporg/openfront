"use client";
import { Elements } from "@stripe/react-stripe-js"

const StripeWrapper = ({
    paymentSession,
    stripeKey,
    stripePromise,
    children,
  }) => {
    const options = {
      clientSecret: paymentSession.data?.client_secret,
    }
  
    if (!stripeKey) {
      throw new Error("Stripe key is missing. Set NEXT_PUBLIC_STRIPE_KEY environment variable.")
    }
  
    if (!stripePromise) {
      throw new Error(
        "Stripe promise is missing. Make sure you have provided a valid Stripe key."
      )
    }
  
    if (!paymentSession?.data?.client_secret) {
      throw new Error("Stripe client secret is missing. Cannot initialize Stripe.")
    }
  
    return (
      <Elements options={options} stripe={stripePromise}>
        {children}
      </Elements>
    );
  }

export default StripeWrapper