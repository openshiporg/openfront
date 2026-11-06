import { Metadata } from "next"
import { getStore } from "@/features/storefront/lib/data/store"
import { getGiftCardOptions } from "@/features/storefront/lib/data/gift-cards"
import { GiftCardBuy } from "@/features/storefront/modules/gift-cards/gift-card-buy"

export const metadata: Metadata = {
  title: "Gift cards",
  description: "Send a gift card by email, or buy one for yourself.",
}

export async function GiftCardsPage(props: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await props.params
  const [store, options] = await Promise.all([getStore(), getGiftCardOptions(countryCode)])
  const name = store?.name || "our store"

  return (
    <div className="flex-1 w-full px-6 max-w-2xl mx-auto py-12 sm:py-16">
      <h1 className="text-3xl font-semibold mb-3">Gift cards</h1>
      <p className="text-base text-muted-foreground mb-10">
        Give them anything at {name}. The code arrives by email and is used at checkout.
      </p>
      {options.online && options.currencyCode ? (
        <GiftCardBuy amounts={options.amounts} currencyCode={options.currencyCode} countryCode={countryCode} />
      ) : (
        <p className="text-base">Gift cards can&apos;t be bought online in this region right now.</p>
      )}
    </div>
  )
}
