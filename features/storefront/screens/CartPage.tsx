import CartTemplate from "@/features/storefront/modules/cart/templates"
import { retrieveCart } from "@/features/storefront/lib/data/cart"
import { getUser } from "@/features/storefront/lib/data/user"
import SkeletonCartPage from "@/features/storefront/modules/skeletons/templates/skeleton-cart-page"
import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"

export const metadata = {
  title: "Cart",
  description: "View your cart",
}

export async function CartPage() {
  const cart = await retrieveCart()
  const user = await getUser()

  return <CartTemplate cart={cart} user={user} />
}

export function CartLoading() {
  return <SkeletonCartPage />
}

export function CartNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-xs font-normal text-foreground">
        The cart you tried to access does not exist. Clear your cookies and try
        again.
      </p>
      <InteractiveLink href="/">Go to frontpage</InteractiveLink>
    </div>
  )
}
