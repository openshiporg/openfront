"use server"
import { cookies } from "next/headers"
import {
  cartIdFromProof,
  createCartProof,
  verifyCartProof,
} from "@/features/keystone/security/token-crypto"

// Production is HTTPS: the cart proof is SameSite=None; Secure; Partitioned
// (CHIPS) so a framed shop (the Oathkeeper Browser, an embed) keeps its cart;
// Safari keeps a cookie in a cross-site frame only when it is partitioned. It
// lives under _openfront_cart; the earlier Strict _openfront_cart_id is still
// read and is cleared whenever the cart cookie is written or removed.
function cartCookieScope() {
  return process.env.NODE_ENV === "production"
    ? ({ sameSite: "none", secure: true, partitioned: true } as const)
    : ({ sameSite: "lax", secure: false } as const)
}

async function clearLegacyCartCookie() {
  const jar = await cookies()
  if (jar.get("_openfront_cart_id")) jar.set("_openfront_cart_id", "", { maxAge: 0, path: "/" })
}

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const cookieStore = await cookies()
  const token = cookieStore.get("keystonejs-session")?.value
  const cartProof = (cookieStore.get("_openfront_cart") || cookieStore.get("_openfront_cart_id"))?.value
  const headers: Record<string, string> = {}

  if (token) headers.authorization = `Bearer ${token}`
  if (cartProof) headers["x-openfront-cart-proof"] = cartProof

  return headers
}

// Define a type for cookie options for reusability
type CookieOptions = { [key: string]: any; };

export const setAuthToken = async (token: string, options: CookieOptions = {}) => {
  (await cookies()).set("keystonejs-session", token, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...options
  })
}

export const removeAuthToken = async () => {
  (await cookies()).set("keystonejs-session", "", {
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })
}

export const getCartId = async (): Promise<string | undefined> => {
  const jar = await cookies()
  const proof = (jar.get("_openfront_cart") || jar.get("_openfront_cart_id"))?.value
  const cartId = cartIdFromProof(proof)
  return cartId && verifyCartProof(proof, cartId) ? cartId : undefined
}

export const setCartId = async (cartId: string, options: CookieOptions = {}) => {
  (await cookies()).set("_openfront_cart", createCartProof(cartId), {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    ...cartCookieScope(),
    path: "/",
    ...options
  })
  await clearLegacyCartCookie()
}

export const removeCartId = async () => {
  (await cookies()).set("_openfront_cart", "", {
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    ...cartCookieScope(),
    path: "/",
  })
  await clearLegacyCartCookie()
}
