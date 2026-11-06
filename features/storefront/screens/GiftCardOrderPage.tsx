import { Metadata } from "next"
import { confirmGiftCardPurchase } from "@/features/storefront/lib/data/gift-cards"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Your gift card",
  robots: { index: false },
}

export async function GiftCardOrderPage(props: { searchParams: Promise<{ ref?: string; token?: string; result?: string }> }) {
  const { ref = "", token = "", result } = await props.searchParams
  const { order, error } = await confirmGiftCardPurchase(String(ref), String(token))
  const money = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: (order?.currencyCode || "usd").toUpperCase() }).format(cents / 100)

  let heading = "Gift card"
  let body: React.ReactNode = null
  if (!order) {
    heading = "We couldn't find that order"
    body = <p className="text-base text-muted-foreground">{error}</p>
  } else if (order.code) {
    const toSomeoneElse = order.recipientEmail && order.recipientName
    heading = `Your ${money(order.amount)} gift card`
    body = (
      <>
        <p className="text-base text-muted-foreground mb-6">
          Paid. {toSomeoneElse ? `We emailed the code to ${order.recipientName} at ${order.recipientEmail}.` : "We emailed you the code."}
        </p>
        <div className="rounded-md border px-4 py-5 text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">Gift card code</p>
          <p className="font-mono text-2xl font-semibold tracking-widest break-all" data-testid="gift-card-code">{order.code}</p>
        </div>
        <p className="text-base mb-6">
          Enter it at checkout under &ldquo;Add gift card or discount code&rdquo;.
          {order.endsAt ? ` Valid until ${new Date(order.endsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.` : ""}
        </p>
        <LocalizedClientLink href="/store" className="text-base underline">Start shopping</LocalizedClientLink>
      </>
    )
  } else if (order.status === "cancelled" || result === "cancelled") {
    heading = "Payment not completed"
    body = (
      <>
        <p className="text-base text-muted-foreground mb-6">You weren&apos;t charged, and no gift card was issued.</p>
        <LocalizedClientLink href="/gift-cards" className="text-base underline">Try again</LocalizedClientLink>
      </>
    )
  } else {
    heading = "Confirming your payment"
    body = (
      <p className="text-base text-muted-foreground">
        This usually takes a few seconds. Refresh the page; the code is also emailed as soon as the payment clears.
      </p>
    )
  }

  return (
    <div className="flex-1 w-full px-6 max-w-2xl mx-auto py-12 sm:py-16">
      <h1 className="text-3xl font-semibold mb-3">{heading}</h1>
      {body}
    </div>
  )
}
