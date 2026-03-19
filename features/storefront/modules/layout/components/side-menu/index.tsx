"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import type { StoreRegion } from "@/features/storefront/types/storefront"
import { WA } from "@/lib/constants/contact"

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/store' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const SideMenu = ({ regions }: { regions: StoreRegion[] | null }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="h-full" suppressHydrationWarning>
      <div className="flex items-center h-full">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              data-testid="nav-menu-button"
              className="flex flex-col gap-1.5 p-2 hover:opacity-70 transition-opacity cursor-pointer focus:outline-none"
              aria-label="Open menu"
              suppressHydrationWarning
            >
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
              <span className="block w-5 h-0.5 bg-white" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full sm:max-w-sm border-0 bg-[#0A0A0F] flex flex-col h-full"
            data-testid="nav-menu-popup"
          >
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-white">SYSmoAI</SheetTitle>
              <SheetDescription className="text-white/50 text-sm">
                AI Tools &amp; Systems for Bangladesh
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col flex-1 justify-between">
              <div className="flex flex-col">
                {[
                  { label: "Home", href: "/" },
                  { label: "Shop", href: "/store" },
                  { label: "Services", href: "/services" },
                  { label: "About", href: "/about" },
                  { label: "Contact", href: "/contact" },
                ].map((item) => (
                  <LocalizedClientLink
                    key={item.href}
                    href={item.href}
                    className="flex items-center px-6 py-4 text-white text-base font-medium border-b border-[#1E1E2E] hover:bg-[#13131A] hover:text-indigo-400 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </LocalizedClientLink>
                ))}
              </div>
              <div className="flex flex-col gap-y-4 pt-6 border-t border-[#1E1E2E]">
                {regions && (
                  <div className="px-6">
                    <CountrySelect regions={regions} />
                  </div>
                )}
                <div className="p-5">
                  <a
                    href={WA.general}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-base"
                    onClick={() => setOpen(false)}
                  >
                    💬 WhatsApp Us
                  </a>
                </div>
                <p className="text-xs text-white/30 px-6" suppressHydrationWarning>
                  © {new Date().getFullYear()} SYSmoAI Private Limited. All rights reserved.
                </p>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default SideMenu
