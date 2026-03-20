import { Suspense } from 'react'

import { listRegions } from '@/features/storefront/lib/data/regions'
import { WA } from '@/lib/constants/contact'

import LocalizedClientLink from '@/features/storefront/modules/common/components/localized-client-link'
import CartButton from '@/features/storefront/modules/layout/components/cart-button'
import SideMenu from '@/features/storefront/modules/layout/components/side-menu'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/store' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default async function Nav() {
  const { regions } = await listRegions()

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="h-16 border-b bg-[#0A0A0F] border-[#1E1E2E]">
        <nav className="max-w-[1440px] mx-auto px-6 flex items-center justify-between w-full h-full gap-6">

          {/* Left: Logo + Brand Name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
              data-testid="nav-store-link"
            >
              <img src="/images/logo.svg" alt="SYSmoAI" width="120" height="32" />
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors hidden sm:block">
                SYSmo<span className="text-indigo-400">AI</span>
              </span>
            </LocalizedClientLink>
          </div>

          {/* Center: Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {NAV_LINKS.map(({ label, href }) => (
              <LocalizedClientLink
                key={href}
                href={href}
                className="text-sm font-medium text-white/70 hover:text-[#6366F1] transition-colors duration-150"
              >
                {label}
              </LocalizedClientLink>
            ))}
          </div>

          {/* Right: WhatsApp + Account + Cart + mobile hamburger */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <a
              href={WA.navbar}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#20b85a] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
              </svg>
              WhatsApp
            </a>

            <LocalizedClientLink
              className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden lg:block"
              href="/account"
              data-testid="nav-account-link"
            >
              Account
            </LocalizedClientLink>

            <Suspense
              fallback={
                <LocalizedClientLink
                  className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>

            {/* Mobile hamburger */}
            <div className="lg:hidden">
              <SideMenu regions={regions} />
            </div>
          </div>

        </nav>
      </header>
    </div>
  )
}
