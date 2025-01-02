"use server"
import { cookies } from "next/headers"

export const getAuthHeaders = () => {
  const token = cookies().get("keystonejs-session")?.value

  if (token) {
    return { authorization: `Bearer ${token}` }
  }

  return {}
}

export const setAuthToken = (token, options = {}) => {
  cookies().set("keystonejs-session", token, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...options
  })
}

export const removeAuthToken = () => {
  cookies().set("keystonejs-session", "", {
    maxAge: -1,
  })
}

export const getCartId = () => {
  return cookies().get("_openfront_cart_id")?.value
}

export const setCartId = (cartId, options = {}) => {
  cookies().set("_openfront_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...options
  })
}

export const removeCartId = () => {
  cookies().set("_openfront_cart_id", "", { maxAge: -1 })
} 