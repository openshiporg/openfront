import { getUserWithOrders } from "@storefront/lib/data/user";
import Overview from "@storefront/modules/account/components/overview"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const user = await getUserWithOrders();

  if (!user?.id) notFound();

  return <Overview user={user} orders={user.orders} />;
}
