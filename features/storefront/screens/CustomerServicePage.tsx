import { Metadata } from "next"

import { getStore } from "@/features/storefront/lib/data/store"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Customer service",
  description: "Shipping, returns and order help.",
}

const sections = [
  {
    id: "orders",
    title: "Tracking an order",
    body: "Sign in to your account and open Orders to see each order's payment and fulfillment status. When an order ships, its carrier and tracking number appear on the order page.",
  },
  {
    id: "shipping",
    title: "Shipping",
    body: "Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home. Shipping options and prices for your region are shown at checkout before you pay.",
  },
  {
    id: "returns",
    title: "Returns and exchanges",
    body: "Is the fit not quite right? We'll exchange your product for a new one, or refund your money when you return it. Refunds go back to the original payment method.",
  },
  {
    id: "contact",
    title: "Contact us",
    body: "Reply to your order confirmation email with your order number and we'll get back to you.",
  },
]

export async function CustomerServicePage() {
  const store = await getStore()
  const name = store?.name || "our store"

  return (
    <div className="flex-1 w-full px-6 max-w-3xl mx-auto py-12 sm:py-16">
      <h1 className="text-3xl font-semibold mb-3">Customer service</h1>
      <p className="text-base text-muted-foreground mb-10">
        Help with orders, shipping and returns at {name}.
      </p>
      <div className="flex flex-col gap-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
            <p className="text-base leading-7 text-foreground/80">{section.body}</p>
            {section.id === "orders" && (
              <LocalizedClientLink href="/account/orders" className="mt-3 inline-block text-base underline">
                Go to your orders
              </LocalizedClientLink>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}
