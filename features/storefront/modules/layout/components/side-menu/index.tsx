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

const SideMenuItems = {
  Home: "/",
  Store: "/store",
  Account: "/account",
  Cart: "/cart",
}

const SideMenu = ({ regions }: { regions: StoreRegion[] | null }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              data-testid="nav-menu-button"
              className="relative h-full flex items-center transition-all ease-out duration-200 focus:outline-none hover:text-foreground"
            >
              Menu
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-full sm:max-w-md border-0 bg-background/95 backdrop-blur-md flex flex-col h-full"
            data-testid="nav-menu-popup"
          >
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
              <SheetDescription>
                Browse our store and find what you need
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col justify-between flex-1 py-6 overflow-y-auto">
              <ul className="flex flex-col gap-6 items-start justify-start">
                {Object.entries(SideMenuItems).map(([name, href]) => {
                  return (
                    <li key={name}>
                      <LocalizedClientLink
                        href={href}
                        className="text-2xl leading-10 hover:text-muted-foreground"
                        data-testid={`${name.toLowerCase()}-link`}
                        onClick={() => setOpen(false)}
                      >
                        {name}
                      </LocalizedClientLink>
                    </li>
                  )
                })}
              </ul>

              <div className="flex flex-col gap-y-6 mt-auto pt-6">
                {regions && (
                  <div className="flex justify-between">
                    <CountrySelect regions={regions} />
                  </div>
                )}
                <p className="flex justify-between text-[0.8125rem] leading-5 font-normal text-muted-foreground">
                  © {new Date().getFullYear()} Openfront. All rights reserved.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default SideMenu
