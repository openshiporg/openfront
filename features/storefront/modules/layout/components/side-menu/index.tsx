"use client"

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import type { StoreRegion } from "@/features/storefront/types/storefront"

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/store' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const SideMenu = ({ regions }: { regions: StoreRegion[] | null }) => {
  const [open, setOpen] = useState(false);

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

            <div className="flex flex-col justify-between flex-1 py-8 overflow-y-auto">
              <ul className="flex flex-col gap-2">
                {NAV_ITEMS.map(({ label, href }) => (
                  <li key={href}>
                    <LocalizedClientLink
                      href={href}
                      className="flex items-center text-xl font-medium text-white/80 hover:text-[#6366F1] py-3 border-b border-white/5 transition-colors cursor-pointer"
                      data-testid={`${label.toLowerCase()}-link`}
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </LocalizedClientLink>
                  </li>
                ))}
                <li>
                  <a
                    href="https://wa.me/8801865385348?text=Hi%20SYSmoAI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xl font-medium text-[#25D366] py-3 border-b border-white/5 hover:opacity-80 transition-opacity"
                    onClick={() => setOpen(false)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.523 5.851L0 24l6.335-1.498A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.36-.213-3.732.882.936-3.618-.235-.372A9.818 9.818 0 1112 21.818z" />
                    </svg>
                    WhatsApp
                  </a>
                </li>
              </ul>

              <div className="flex flex-col gap-y-4 mt-auto pt-6">
                {regions && (
                  <div className="flex justify-between">
                    <CountrySelect regions={regions} />
                  </div>
                )}
                <p className="text-xs text-white/30" suppressHydrationWarning>
                  © {new Date().getFullYear()} SYSmoAI Private Limited. All rights reserved.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default SideMenu;
