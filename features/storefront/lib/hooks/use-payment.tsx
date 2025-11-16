"use client";

// Note: In Next.js 16, payment operations should be handled via Server Actions.
// Payment-related Server Actions from cart.ts include:
// - createPaymentSessions(cartId)
// - setPaymentSession({ cartId, providerId })
// - setPaymentMethod(providerId)
// - placeOrder(paymentSessionId?)
//
// These are "use server" functions and should be called directly from components,
// not through React Query mutations. The server automatically handles revalidation
// via revalidateTag("cart") and other cache tags.
//
// This file is kept for backward compatibility but exports nothing.
// Components should import payment functions directly from:
// @/features/storefront/lib/data/cart