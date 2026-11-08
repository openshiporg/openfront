/**
 * Who a cart belongs to after a create or update.
 *
 * - An explicit `user` in the input (connect or disconnect) is kept as given.
 * - A shopper's own write claims a cart that has no owner yet. This is how a guest
 *   cart becomes the shopper's after they sign in (updateActiveCart runs with the
 *   shopper's session).
 * - Staff edits never change the owner. Before this, any dashboard or API edit
 *   relinked the customer's cart to the staff member making the edit.
 *
 * Returns the value for the `user` relationship: undefined leaves it unchanged.
 */
export function resolveCartOwner(args: {
  operation: "create" | "update" | string;
  resolvedUser: unknown;
  existingUserId?: string | null;
  sessionUserId?: string | null;
  editorIsStaff: boolean;
}) {
  const { operation, resolvedUser, existingUserId, sessionUserId, editorIsStaff } = args;
  if (resolvedUser !== undefined && resolvedUser !== null) return resolvedUser;
  if (operation !== "create" && operation !== "update") return resolvedUser;
  if (!sessionUserId || editorIsStaff) return resolvedUser;
  if (operation === "update" && existingUserId) return resolvedUser;
  return { connect: { id: sessionUserId } };
}
