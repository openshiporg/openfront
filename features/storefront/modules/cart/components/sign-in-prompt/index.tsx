import { Button } from "@/components/ui/button" // Shadcn Button
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import LinkStatus from "@/features/storefront/modules/common/components/link-status"

const SignInPrompt = () => {
  return (
    <div className="bg-background flex items-center justify-between">
      <div>
        <h2 className="text-lg font-medium">
          Already have an account?
        </h2>
        <p className="text-sm font-normal text-muted-foreground mt-1">
          Sign in for a better experience.
        </p>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="outline" data-testid="sign-in-button">
            <LinkStatus />
            Sign in
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
