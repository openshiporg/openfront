// Returning guests. Guest checkout creates a User per checkout (hasAccount:false,
// random unknown password) and signs it in, so it can read its own addresses and
// carts. The email column is unique, so a second guest checkout with the same email
// used to fail with "already has an account".
//
// The old guest record is never reused or signed in to: that would hand the next
// visitor the first guest's addresses and carts. It is retired instead: its email is
// replaced with an unroutable tombstone, which frees the address for the new guest
// record. Its addresses, carts and orders stay on it and are reachable only by the
// browser session that created it (and by the secret-key order links already emailed).
//
// Only records provably created by the guest flow are retired. Before b875777 public
// sign-up also stored hasAccount:false, so older false rows may be real members.
export const GUEST_FLAG_EPOCH = new Date(process.env.GUEST_FLAG_EPOCH || "2026-11-02T18:58:00.000Z");

type GuestCandidate = {
  id: string;
  hasAccount: boolean | null;
  createdAt: Date | string | null;
  roleId?: string | null;
  accounts?: unknown[];
  carts?: unknown[];
  orders?: unknown[];
};

export function isRetirableGuest(user: GuestCandidate | null | undefined, epoch: Date = GUEST_FLAG_EPOCH): boolean {
  if (!user || user.hasAccount !== false) return false;
  if (user.roleId) return false;
  if (user.accounts && user.accounts.length) return false;
  // The guest flow creates the user for a cart/order; a sign-up has neither.
  if (!(user.carts && user.carts.length) && !(user.orders && user.orders.length)) return false;
  const created = user.createdAt ? new Date(user.createdAt).getTime() : NaN;
  return Number.isFinite(created) && created >= epoch.getTime();
}

export function retiredGuestEmail(id: string) {
  return `retired-guest+${id}@guest.invalid`;
}

/** Frees `email` for a new guest/registration when the current holder is a retirable guest. */
export async function retireReturningGuest(prisma: any, email: unknown): Promise<boolean> {
  const normalized = String(email || "").trim();
  if (!normalized) return false;
  const existing = await prisma.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true, hasAccount: true, createdAt: true, roleId: true, accounts: { select: { id: true }, take: 1 }, carts: { select: { id: true }, take: 1 }, orders: { select: { id: true }, take: 1 } },
  });
  if (!isRetirableGuest(existing)) return false;
  await prisma.user.update({ where: { id: existing.id }, data: { email: retiredGuestEmail(existing.id) } });
  return true;
}
