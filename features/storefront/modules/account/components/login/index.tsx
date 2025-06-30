import { login } from "@/features/storefront/lib/data/user" 
import { LOGIN_VIEW } from "@/features/storefront/modules/account/templates/login-template" 
import ErrorMessage from "@/features/storefront/modules/checkout/components/error-message" 
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button" 
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useState } from "react"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => setIsVisible((prev) => !prev)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-base leading-6 font-semibold uppercase mb-6">Welcome back</h1>
      <p className="text-center text-sm leading-6 font-normal text-foreground mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <div className="flex flex-col space-y-2">
           
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              title="Enter a valid email address."
              autoComplete="email"
              required
              data-testid="email-input"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
      
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={isVisible ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                required
                data-testid="password-input"
                className="pe-9"
              />
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
                tabIndex={-1}
              >
                {isVisible ? (
                  <EyeOffIcon size={16} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Sign in
        </SubmitButton>
      </form>
      <span className="text-center text-foreground text-xs leading-5 font-normal mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Join us
        </button>
        .
      </span>
    </div>
  )
}

export default Login
