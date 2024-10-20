import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link"
import ChevronDown from "@storefront/modules/common/icons/chevron-down"
import OpenfrontCTA from "@storefront/modules/layout/components/openfront-cta"

export default function CheckoutLayout({
  children
}) {
  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b ">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0">
            <ChevronDown className="rotate-90" size={16} />
            <span
              className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
              Back to shopping cart
            </span>
            <span
              className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase">
            Openfront Store
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative">{children}</div>
      <div className="py-4 w-full flex items-center justify-center">
        <OpenfrontCTA />
      </div>
    </div>
  );
}
