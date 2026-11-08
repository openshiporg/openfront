/**
 * Who a cart belongs to after a create or update.
 *
 * - An explicit `user` in the input (connect or disconnect) is kept as given.
 * - The owner is set from the session only on create, and only when the creator is a
 *   shopper: a signed-in shopper's new cart is theirs.
 * - An update never changes the owner unless the input says so. Before this, any
 *   dashboard or API edit relinked the customer's cart to whoever made the edit.
 *   (A signed-in checkout still reaches the customer through the shipping address,
 *   see resolveOrderCustomer in checkout/order-commit.ts.)
 *
 * Returns the value for the `user` relationship: undefined leaves it unchanged.
 */
export function resolveCartOwner(args: {
  operation: "create" | "update" | string;
  resolvedUser: unknown;
  sessionUserId?: string | null;
  editorIsStaff: boolean;
}) {
  const { operation, resolvedUser, sessionUserId, editorIsStaff } = args;
  if (resolvedUser !== undefined && resolvedUser !== null) return resolvedUser;
  if (operation !== "create") return resolvedUser;
  if (!sessionUserId || editorIsStaff) return resolvedUser;
  return { connect: { id: sessionUserId } };
}
