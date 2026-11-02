/**
 * Whether the sidebar should still offer the "get started" onboarding card.
 * It is for an empty store: once onboarding is finished or dismissed,
 * or the store already has products (seeded or added by hand), it stays hidden.
 */
export function shouldShowOnboardingCard(input: {
  canManageOnboarding?: boolean | null
  onboardingStatus?: string | null
  productsCount?: number | null
}): boolean {
  if (!input.canManageOnboarding) return false
  if (input.onboardingStatus === "completed" || input.onboardingStatus === "dismissed") return false
  if (typeof input.productsCount === "number" && input.productsCount > 0) return false
  return true
}
