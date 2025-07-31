"use server"
import { cookies } from "next/headers"

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = (await cookies()).get("keystonejs-session")?.value

  if (token) {
    return { authorization: `Bearer ${token}` }
  }

  return {} // Empty object is compatible with Record<string, string>
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
    maxAge: -1,
  })
}

export const getCartId = async (): Promise<string | undefined> => {
  return (await cookies()).get("_openfront_cart_id")?.value
}

export const setCartId = async (cartId: string, options: CookieOptions = {}) => {
  (await cookies()).set("_openfront_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...options
  })
}

export const removeCartId = async () => {
  (await cookies()).set("_openfront_cart_id", "", { maxAge: -1 })
} 