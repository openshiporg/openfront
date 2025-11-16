import { Metadata } from "next"
import Overview from "@/features/storefront/modules/account/components/overview"
import { notFound } from "next/navigation"
import { getUserWithOrders, getUser } from "@/features/storefront/lib/data/user";
import Spinner from "@/features/storefront/modules/common/icons/spinner"
import AccountLayout from "@/features/storefront/modules/account/templates/account-layout";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export async function AccountDashboardPage() {
  const user = await getUserWithOrders();

  if (!user?.id) notFound();

  return <Overview user={user} orders={user.orders} />;
}

export function AccountLoading() {
  return (
    <div className="flex items-center justify-center w-full h-full text-foreground">
      <Spinner size={36} />
    </div>
  )
}

export async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: ReactNode
  login?: ReactNode
}) {
  const user = await getUser()

  return (
    <AccountLayout customer={user}>
      {user ? dashboard : login}
    </AccountLayout>
  )
}
