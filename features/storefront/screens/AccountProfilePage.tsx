import { Metadata } from "next"
import type { StorefrontCustomerProfile, StorefrontRegionBasic } from '@/features/storefront/types'

import ProfilePhone from "@/features/storefront/modules/account/components/profile-phone"
import ProfileBillingAddress from "@/features/storefront/modules/account/components/profile-billing-address"
import ProfileEmail from "@/features/storefront/modules/account/components/profile-email"
import ProfileName from "@/features/storefront/modules/account/components/profile-name"

import { notFound } from "next/navigation"
import { listRegions } from "@/features/storefront/lib/data/regions"
import { getUser } from "@/features/storefront/lib/data/user"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your store profile.",
}

export async function AccountProfilePage() {
  const customer: StorefrontCustomerProfile | null = await getUser()
  const { regions }: { regions: StorefrontRegionBasic[] | null } = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm font-normal">
          View and update your profile information, including your name, email,
          and phone number. You can also update your billing address, or change
          your password.
        </p>
      </div>
      <div className="flex flex-col gap-y-8 w-full">
        <ProfileName customer={customer} />
        <Divider />
        <ProfileEmail customer={customer} />
        <Divider />
        <ProfilePhone customer={customer} />
        <Divider />
        {/* <ProfilePassword customer={customer} />
        <Divider /> */}
        <ProfileBillingAddress customer={customer} regions={regions} />
      </div>
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}
