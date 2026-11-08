"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

/** The floating badge stays off the cart: on a phone it covers the summary
 *  ("Add gift card or discount code"). The cart shows it in the page flow instead. */
export default function FloatingOutsideCart({ children }: { children: ReactNode }) {
  const pathname = usePathname() || ""
  if (/\/cart\/?$/.test(pathname)) return null
  return <>{children}</>
}
