'use server'

import { revalidatePath } from 'next/cache'
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient'

export async function refundOrderPaymentAction(input: {
  orderId: string; paymentId: string; amount: number; reason: string; idempotencyKey: string
}) {
  const response = await keystoneClient(
    `mutation RefundOrderPayment($orderId: ID!, $paymentId: ID!, $amount: Int!, $reason: String!, $idempotencyKey: String!) {
      refundOrderPayment(orderId: $orderId, paymentId: $paymentId, amount: $amount, reason: $reason, idempotencyKey: $idempotencyKey) { id amount }
    }`, input
  )
  if (response.success) {
    for (const path of [`/dashboard/platform/orders/${input.orderId}`, '/dashboard/platform/orders', '/dashboard/platform/payments', '/dashboard/platform/refunds']) revalidatePath(path)
  }
  return response
}
