import { getUser } from "@storefront/lib/data/user";
import AccountLayout from "@storefront/modules/account/templates/account-layout"

export default async function AccountPageLayout({
  dashboard,
  login
}) {
  // Get user but don't throw if not found
  const { authenticatedItem: user } = await getUser()

  // If we're on a dashboard route and not logged in, show login
  // If we're on login route and logged in, show dashboard
  // Otherwise show the appropriate slot based on auth state
  return (
    <AccountLayout customer={user}>
      {user ? dashboard : login}
    </AccountLayout>
  );
}
