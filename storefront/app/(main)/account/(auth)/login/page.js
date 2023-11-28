import LoginTemplate from "@modules/account/templates/login-template"

export const metadata = {
  title: "Sign in",
  description: "Sign in to your ACME account.",
}

export default function Login() {
  return <LoginTemplate />;
}