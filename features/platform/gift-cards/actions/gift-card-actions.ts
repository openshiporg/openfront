'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from '../../../dashboard/lib/keystoneClient';

function done(path: string[]) {
  for (const p of path) revalidatePath(p);
}

/** Refunds the remaining balance to the buyer's card and disables the card. */
export async function refundGiftCardAction(giftCardId: string, reason: string) {
  const response = await keystoneClient(
    `mutation RefundGiftCard($giftCardId: ID!, $reason: String!) { refundGiftCard(giftCardId: $giftCardId, reason: $reason) }`,
    { giftCardId, reason }
  );
  if (!response.success) return { success: false, error: response.error || 'The refund did not go through' };
  done(['/dashboard/platform/gift-cards']);
  return { success: true, data: response.data.refundGiftCard };
}

/** Voids a card with no refund (lost, fraud or issued by mistake). */
export async function voidGiftCardAction(giftCardId: string, reason: string) {
  const response = await keystoneClient(
    `mutation VoidGiftCard($giftCardId: ID!, $reason: String!) { voidGiftCard(giftCardId: $giftCardId, reason: $reason) }`,
    { giftCardId, reason }
  );
  if (!response.success) return { success: false, error: response.error || 'The card could not be voided' };
  done(['/dashboard/platform/gift-cards']);
  return { success: true, data: response.data.voidGiftCard };
}

/** Puts an order's gift-card payment back on the card. */
export async function returnGiftCardPaymentAction(orderId: string, giftCardId: string, amount: number, reason: string) {
  const response = await keystoneClient(
    `mutation ReturnGiftCardPayment($orderId: ID!, $giftCardId: ID!, $amount: Int!, $reason: String!) {
      returnGiftCardPayment(orderId: $orderId, giftCardId: $giftCardId, amount: $amount, reason: $reason)
    }`,
    { orderId, giftCardId, amount, reason }
  );
  if (!response.success) return { success: false, error: response.error || 'The amount could not be returned to the card' };
  done([`/dashboard/platform/orders/${orderId}`, '/dashboard/platform/gift-cards']);
  return { success: true, data: response.data.returnGiftCardPayment };
}
