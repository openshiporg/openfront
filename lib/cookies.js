"use server"
import { cookies } from "next/headers"

export const getAuthHeaders = () => {
  const token = cookies().get("_openfront_jwt")?.value

  if (token) {
    return { authorization: `Bearer ${token}` }
  }

  return {}
}

export const setAuthToken = (token) => {
  cookies().set("_openfront_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = () => {
  cookies().set("_openfront_jwt", "", {
    maxAge: -1,
  })
}

export const getCartId = () => {
  return cookies().get("_openfront_cart_id")?.value
}

export const setCartId = (cartId) => {
  cookies().set("_openfront_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = () => {
  cookies().set("_openfront_cart_id", "", { maxAge: -1 })
} 