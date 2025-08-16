import { retrieveCart } from "@/features/storefront/lib/data/cart"
import { getUser } from "@/features/storefront/lib/data/user"
import Footer from "@/features/storefront/modules/layout/templates/footer"
import Nav from "@/features/storefront/modules/layout/templates/nav"
import OpenfrontCTA from "@/features/storefront/modules/layout/components/openfront-cta"
import { Metadata } from "next"
import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"

export async function MainLayout({ children }: { children: React.ReactNode }) {
  await getUser()
  await retrieveCart()

  return (
    <>
      <Nav />
      {children}
      <Footer />
      <OpenfrontCTA />
    </>
  )
}

export const MainNotFoundMetadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export function MainNotFound() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-xs font-normal text-foreground">
        The page you tried to access does not exist.
      </p>
      <InteractiveLink href="/">Go to frontpage</InteractiveLink>
    </div>
  )
}