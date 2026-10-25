/**
 * MCP OAuth settings for this repo: the only file in mcp-oauth/ that differs
 * between family members. No env vars of its own.
 */

/** Shown as "Connect ChatGPT to …"; null uses the request host. */
export async function siteDisplayName(context: any): Promise<string | null> {
  const store = await context.sudo().prisma.store.findFirst({ select: { name: true } })
  return store?.name || null
}

/** Customers can always create an account here (User create is public; roles are stripped). */
export function allowAccountCreation(): boolean {
  return true
}

/** Staff are people whose role opens the dashboard. */
export function isStaffSession(session: any): boolean {
  return session?.data?.role?.canAccessDashboard === true
}

export function roleLabel(session: any): string {
  return session?.data?.role?.name || (isStaffSession(session) ? 'Staff' : 'Customer')
}

/** What the consent screen says the app can do, before scopes narrow it. */
export function capabilityLines(session: any, canWrite: boolean): string[] {
  if (isStaffSession(session)) {
    return canWrite
      ? ['See and change everything your role allows in the dashboard: products, orders, customers and more', 'Nothing your role cannot already do']
      : ['See everything your role allows in the dashboard', 'No changes']
  }
  return canWrite
    ? ['Browse products and prices', 'Manage your cart and start checkout', 'See your own orders and addresses', 'Never change the store itself']
    : ['Browse products and prices', 'See your cart, orders and addresses', 'No changes']
}
