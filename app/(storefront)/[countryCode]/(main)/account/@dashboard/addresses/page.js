import { notFound } from "next/navigation";
import AddressBook from "@storefront/modules/account/components/address-book";
import { headers } from "next/headers";
import { getUser } from "@storefront/lib/data/user";
import { getRegion } from "@storefront/lib/data/regions";

export const metadata = {
  title: "Addresses",
  description: "View your addresses",
};

export default async function Addresses({ params: { countryCode } }) {
  const user = await getUser();
  const region = await getRegion(countryCode);


  if (!user || !region) {
    notFound();
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Shipping Addresses</h1>
        <p className="text-base-regular">
          View and update your shipping addresses, you can add as many as you
          like. Saving your addresses will make them available during checkout.
        </p>
      </div>
      <AddressBook user={user} region={region} />
    </div>
  );
}
