"use client";

// Note: In Next.js 16, order operations should be handled via Server Actions.
// Order-related Server Actions from orders.ts include:
// - retrieveOrder(id, secretKey?)
// - listCustomerOrders(limit?, offset?)
//
// Cart completion is handled in cart.ts:
// - placeOrder(paymentSessionId?) - completes cart and creates order
//
// These are "use server" functions and should be called directly from Server Components
// or passed to Client Components as props. The server automatically handles revalidation
// via revalidateTag("cart") and other cache tags.
//
// This file is kept for backward compatibility but exports nothing.
// Components should import order functions directly from:
// @/features/storefront/lib/data/orders
// @/features/storefront/lib/data/cart