import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from "@stripe/react-stripe-js"
import React, { useMemo } from "react"

const PaymentStripe = () => {
  const useOptions = useMemo(() => {
    return {
      style: {
        base: {
          fontFamily: "Inter, sans-serif",
          color: "#424270",
          padding: "10px 12px",
          "::placeholder": {
            color: "#CFD7E0",
          },
        },
      },
    }
  }, [])

  return (
    <div>
      <div className="flex flex-col relative w-full pb-6">
        <CardNumber options={useOptions} />
        <div className="flex items-center mt-12 relative gap-x-4">
          <CardExpiry options={useOptions} />
          <CardCVC options={useOptions} />
        </div>
      </div>
    </div>
  );
}

const CardNumber = ({
  options
}) => {
  return (
    <div className="border-b border-gray-200 py-2 relative">
      <span className="absolute -top-6 text-gray-700 text-base-regular">
        Card number
      </span>
      <CardNumberElement options={options} />
    </div>
  );
}

const CardExpiry = ({
  options
}) => {
  return (
    <div className="border-b border-gray-200 w-full py-2 relative">
      <span className="absolute -top-6 text-gray-700 text-base-regular">
        Expiration date
      </span>
      <CardExpiryElement options={options} />
    </div>
  );
}

const CardCVC = ({
  options
}) => {
  return (
    <div className="border-b border-gray-200 w-full py-2 relative">
      <span className="absolute -top-6 text-gray-700 text-base-regular">
        CVC
      </span>
      <CardCvcElement options={{ ...options, placeholder: "123" }} />
    </div>
  );
}

export default PaymentStripe
