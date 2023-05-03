import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";

const Wrapper = ({ paymentSession, children }) => {
  if (!paymentSession) {
    return <div>{children}</div>;
  }

  switch (paymentSession.provider_id) {
    case "stripe":
      return (
        <StripeWrapper paymentSession={paymentSession}>
          {children}
        </StripeWrapper>
      );

    default:
      return <div>{children}</div>;
  }
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || "");

const StripeWrapper = ({ paymentSession, children }) => {
  const options = {
    clientSecret: paymentSession.data.client_secret,
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
};

export default Wrapper;
