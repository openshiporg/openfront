import { notFound } from "next/navigation";
import Wrapper from "@/features/storefront/modules/checkout/components/payment-wrapper";
import CheckoutForm from "@/features/storefront/modules/checkout/templates/checkout-form";
import CheckoutSummary from "@/features/storefront/modules/checkout/templates/checkout-summary";
import { retrieveCart } from "@/features/storefront/lib/data/cart";
import { getUser } from "@/features/storefront/lib/data/user";
import React from "react"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import ChevronDown from "@/features/storefront/modules/common/icons/chevron-down"
import OpenfrontCTA from "@/features/storefront/modules/layout/components/openfront-cta"
import Logo from "@/features/storefront/modules/layout/components/logo"
import InteractiveLink from "@/features/storefront/modules/common/components/interactive-link"
import { Metadata } from "next"

export const metadata = {
  title: "Checkout",
};

const fetchCart = async () => {
  const cart = await retrieveCart();

  if (!cart) {
    return notFound();
  }

  return cart;
};

export async function CheckoutPage() {
  const cart = await fetchCart();
  const customer = await getUser();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_416px] max-w-[1440px] w-full mx-auto px-6 gap-x-40 py-12">
      <Wrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </Wrapper>
      <CheckoutSummary cart={cart} />
    </div>
  );
}

export function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-background relative">
      <div className="h-16 bg-background border-b ">
        <nav className="flex h-full items-center max-w-[1440px] w-full mx-auto px-6 justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-muted-foreground hover:text-foreground text-xs font-semibold flex items-center gap-x-2 uppercase flex-1 basis-0 min-w-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90 shrink-0" size={16} />
            <span className="mt-px hidden lg:block text-xs font-medium leading-5 truncate">
              Back to shopping cart
            </span>
            <span className="mt-px hidden sm:block lg:hidden text-xs font-medium leading-5 truncate">
              Back
            </span>
          </LocalizedClientLink>
          <div>
            <Logo />
          </div>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
      <div className="py-4 w-full flex items-center justify-center">
        <OpenfrontCTA />
      </div>
    </div>
  )
}

export const NotFoundMetadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export function CheckoutNotFound() {
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