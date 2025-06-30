"use client"

import { resetOnboardingState } from "@/features/storefront/lib/data/onboarding"
import { Button } from "@/components/ui/button" // Use Shadcn Button
// Removed Container, Text imports

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <div className="max-w-4xl h-full bg-muted w-full">
      <div className="flex flex-col gap-y-4 center p-4 md:items-center">
        <p className="text-foreground text-xl">
          Your test order was successfully created! 🎉
        </p>
        <p className="text-muted-foreground text-xs leading-5 font-normal">
          You can now complete setting up your store in the admin.
        </p>
        <Button
          className="w-fit"
          size="lg" // Use Shadcn size 'lg' which is similar to Medusa 'xlarge'
          onClick={() => resetOnboardingState(orderId)}
        >
          Complete setup in admin
        </Button>
      </div>
    </div>
  )
}

export default OnboardingCta
