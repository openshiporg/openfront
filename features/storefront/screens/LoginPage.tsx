import { Metadata } from "next"

import LoginTemplate from "@/features/storefront/modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account.",
}

export function LoginPage() {
  return <LoginTemplate />
}