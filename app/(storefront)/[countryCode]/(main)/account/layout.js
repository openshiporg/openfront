import { getCustomer } from "@storefront/lib/data"
import AccountLayout from "@storefront/modules/account/templates/account-layout"

export default async function AccountPageLayout({
  dashboard,
  login
}) {
  const customer = await getCustomer().catch(() => null)

  return (
    <AccountLayout customer={customer}>
      {customer ? dashboard : login}
    </AccountLayout>
  );
}
