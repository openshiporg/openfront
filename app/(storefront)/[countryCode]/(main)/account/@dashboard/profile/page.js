import { listRegions } from "@storefront/lib/data/regions"
import { getUser } from "@storefront/lib/data/user"
import ProfilePhone from "@storefront/modules/account//components/profile-phone"
import ProfileBillingAddress from "@storefront/modules/account/components/profile-billing-address"
import ProfileEmail from "@storefront/modules/account/components/profile-email"
import ProfileName from "@storefront/modules/account/components/profile-name"
import ProfilePassword from "@storefront/modules/account/components/profile-password"

import { notFound } from "next/navigation"

export const metadata = {
  title: "Profile",
  description: "View and edit your Openfront Store profile.",
}

export default async function Profile() {
  const customer = await getUser()
  const { regions } = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Profile</h1>
        <p className="text-base-regular">
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
        <ProfilePassword customer={customer} />
        <Divider />
        <ProfileBillingAddress customer={customer} regions={regions} />
      </div>
    </div>
  );
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />;
}
