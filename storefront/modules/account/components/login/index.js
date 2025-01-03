import { useFormState } from "react-dom"

import { LOGIN_VIEW } from "@storefront/modules/account/templates/login-template"
import Input from "@storefront/modules/common/components/input"
import { login } from "@storefront/lib/data/user"
import ErrorMessage from "@storefront/modules/checkout/components/error-message"
import { SubmitButton } from "@storefront/modules/checkout/components/submit-button"

const Login = ({
  setCurrentView
}) => {
  const [message, formAction] = useFormState(login, null)

  return (
    <div className="max-w-sm w-full flex flex-col items-center">
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required />
        </div>
        <ErrorMessage error={message} />
        <SubmitButton className="w-full mt-6">Sign in</SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Not a member?{" "}
        <button onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)} className="underline">
          Join us
        </button>
        .
      </span>
    </div>
  );
}

export default Login
