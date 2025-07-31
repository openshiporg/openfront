import { Button } from "@/components/ui/button" // Use Shadcn Button
// Removed Container, Text imports
import { cookies as nextCookies } from "next/headers"

async function ProductOnboardingCta() {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  if (!isOnboarding) {
    return null
  }

  return (
    <div className="max-w-4xl h-full bg-muted w-full p-8">
      <div className="flex flex-col gap-y-4 center">
        <p className="text-foreground text-xl">
          Your demo product was successfully created! 🎉
        </p>
        <p className="text-muted-foreground text-xs leading-5 font-normal">
          You can now continue setting up your store in the admin.
        </p>
        <a href="http://localhost:7001/a/orders?onboarding_step=create_order_nextjs">
          <Button className="w-full">Continue setup in admin</Button>
        </a>
      </div>
    </div>
  )
}

export default ProductOnboardingCta
