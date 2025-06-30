"use server";
import { gql } from "graphql-request";
import { openfrontClient } from "../config";
import { cache } from "react";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

export const listCartPaymentMethods = cache(async function (regionId: string) {
  const LIST_PAYMENT_PROVIDERS = gql`
    query ListPaymentProviders($regionId: ID!) {
      activeCartPaymentProviders(regionId: $regionId) {
        id
        name
        code
        isInstalled
      }
    }
  `;

  const { activeCartPaymentProviders } = await openfrontClient.request(
    LIST_PAYMENT_PROVIDERS,
    { regionId }
  );
  return activeCartPaymentProviders;
});

export const initiatePaymentSession = async (cartId: string, paymentProviderId: string) => {
  if (!cartId) throw new Error("Cart ID is required");
  const INITIATE_PAYMENT_SESSION = gql`
    mutation InitiatePaymentSession($cartId: ID!, $paymentProviderId: String!) {
      initiatePaymentSession(
        cartId: $cartId
        paymentProviderId: $paymentProviderId
      ) {
        id
        data
        amount
      }
    }
  `;

  const { initiatePaymentSession: session } = await openfrontClient.request(
    INITIATE_PAYMENT_SESSION,
    {
      cartId,
      paymentProviderId,
    }
  );

  revalidateTag("cart");
  return session;
};
