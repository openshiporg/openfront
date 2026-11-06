"use server";

import { gql } from "graphql-request";
import { redirect } from "next/navigation";
import { openfrontClient } from "../config";

export type GiftCardPurchase = {
  status: string;
  amount: number;
  currencyCode: string;
  recipientName: string | null;
  recipientEmail: string | null;
  code: string | null;
  endsAt: string | null;
};

function publicMessage(error: any) {
  const raw = error?.response?.errors?.[0]?.message;
  return raw && raw !== "Unexpected error." ? String(raw).slice(0, 300) : "Checkout couldn't open. Try again in a moment.";
}

export async function getGiftCardOptions(countryCode: string): Promise<{ online: boolean; amounts: number[]; currencyCode: string | null }> {
  try {
    const data = await openfrontClient.request<{ giftCardOptions: { online: boolean; amounts: number[]; currencyCode: string | null } }>(
      gql`query GiftCardOptions($countryCode: String!) { giftCardOptions(countryCode: $countryCode) { online amounts currencyCode } }`,
      { countryCode }
    );
    return data.giftCardOptions;
  } catch {
    return { online: false, amounts: [], currencyCode: null };
  }
}

/** Sends the buyer to Stripe Checkout; the card is issued once Stripe confirms the payment. */
export async function buyGiftCardAction(_prev: { error: string } | null, form: FormData): Promise<{ error: string }> {
  const text = (key: string) => String(form.get(key) || "").trim();
  const forSomeone = text("forSomeone") === "yes";
  let url = "";
  try {
    const data = await openfrontClient.request<{ startGiftCardPurchase: { checkoutUrl: string } }>(
      gql`
        mutation StartGiftCardPurchase($countryCode: String!, $amount: Int!, $name: String!, $email: String!, $toName: String, $toEmail: String, $message: String) {
          startGiftCardPurchase(countryCode: $countryCode, amount: $amount, purchaserName: $name, purchaserEmail: $email, recipientName: $toName, recipientEmail: $toEmail, message: $message) { checkoutUrl }
        }
      `,
      {
        countryCode: text("countryCode"),
        amount: Number(text("amount")),
        name: text("purchaserName"),
        email: text("purchaserEmail"),
        toName: forSomeone ? text("recipientName") || null : null,
        toEmail: forSomeone ? text("recipientEmail") || null : null,
        message: forSomeone ? text("message") || null : null,
      }
    );
    url = data.startGiftCardPurchase.checkoutUrl;
  } catch (error) {
    return { error: publicMessage(error) };
  }
  if (!url.startsWith("https://checkout.stripe.com/")) return { error: "Checkout couldn't open. Try again in a moment." };
  redirect(url);
}

export async function confirmGiftCardPurchase(ref: string, token: string): Promise<{ order: GiftCardPurchase | null; error: string | null }> {
  try {
    const data = await openfrontClient.request<{ confirmGiftCardPurchase: GiftCardPurchase }>(
      gql`
        mutation ConfirmGiftCardPurchase($ref: ID!, $token: String!) {
          confirmGiftCardPurchase(ref: $ref, token: $token) { status amount currencyCode recipientName recipientEmail code endsAt }
        }
      `,
      { ref, token }
    );
    return { order: data.confirmGiftCardPurchase, error: null };
  } catch (error: any) {
    const raw = error?.response?.errors?.[0]?.message;
    return { order: null, error: raw && raw !== "Unexpected error." ? raw : "We couldn't find that gift card order." };
  }
}
