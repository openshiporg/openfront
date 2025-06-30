"use client"

import clsx from "clsx"
import {
  LogOut,
  ChevronDown,
  User,
  MapPin,
  Package,
} from "lucide-react"
import { useParams, usePathname } from "next/navigation"

import LocalizedClientLink from "@/features/storefront/modules/common/components/localized-client-link"
import { signOut } from "@/features/storefront/lib/data/user"

// Define inline type based on GraphQL User schema
type CustomerInfoForNav = {
  id: string;
  firstName?: string | null; // Correct field name from schema
  lastName?: string | null; // Correct field name from schema
};

type AccountNavProps = {
  customer: CustomerInfoForNav | null; // Use updated type
};

const AccountNav = ({
  customer,
}: AccountNavProps) => {
  const params = useParams()
  const route = usePathname()

  // Handle case where countryCode is missing or invalid
  if (typeof params?.countryCode !== "string") {
    // Or return a loading/error state, or disable links
    return null
  }
  const countryCode = params.countryCode

  const handleLogout = async () => {
    await signOut(countryCode)
  }

  return (
    <div>
      <div className="sm:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-xs leading-5 font-normal py-2"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>Account</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-2xl leading-[36px] font-semibold mb-4 px-8">
              Hello {customer?.firstName}
            </div>
            <div className="text-sm leading-6 font-normal">
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/account/profile"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User size={20} />
                        <span>Profile</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/addresses"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <MapPin size={20} />
                        <span>Addresses</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <Package size={20} />
                      <span>Orders</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <LogOut />
                      <span>Log out</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden sm:block" data-testid="account-nav">
        <div>
          <div className="pb-4">
            <h3 className="text-sm leading-6 font-semibold">Account</h3>
          </div>
          <div className="text-sm leading-6 font-normal">
            <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
              <li>
                <AccountNavLink
                  href="/account"
                  route={route!}
                  data-testid="overview-link"
                >
                  Overview
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/profile"
                  route={route!}
                  data-testid="profile-link"
                >
                  Profile
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/addresses"
                  route={route!}
                  data-testid="addresses-link"
                >
                  Addresses
                </AccountNavLink>
              </li>
              <li>
                <AccountNavLink
                  href="/account/orders"
                  route={route!}
                  data-testid="orders-link"
                >
                  Orders
                </AccountNavLink>
              </li>
              <li className="text-grey-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="logout-button"
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const params = useParams()

  // Handle case where countryCode is missing or invalid in NavLink
  if (typeof params?.countryCode !== "string") {
    // Or return a disabled link, or null
    return null
  }
  const countryCode = params.countryCode

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clsx("text-muted-foreground hover:text-foreground", {
       "text-foreground font-semibold": active,
      })}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
