import { permissions } from "../access";

export const canCreateUserRole = permissions.canManageUsers;

const PUBLIC_USER_CREATE_FIELDS = new Set([
  "name",
  "email",
  "password",
  "phone",
  // createAuth merges initFirstItem.itemData into the DB API input before list
  // hooks run. Public callers cannot supply role because User.role field access
  // is enforced before resolveInput; allowing it here preserves the first admin.
  "role",
  // Guest checkout sends this explicitly. It is always forced to false below.
  "hasAccount",
]);

type UserCreateData = Record<string, unknown>;

/**
 * Restrict fields supplied by an unauthenticated/non-manager caller without
 * deleting values added by Keystone field defaults or initFirstItem.itemData.
 */
export function resolvePublicUserCreateData({
  inputData,
  resolvedData,
}: {
  inputData?: UserCreateData;
  resolvedData: UserCreateData;
}): UserCreateData {
  const restrictedData = { ...resolvedData };

  // inputData is the caller-controlled boundary. resolvedData also contains
  // trusted field defaults and createAuth initFirstItem data (including the
  // first administrator's role), so iterating all resolved keys is unsafe.
  for (const key of Object.keys(inputData ?? {})) {
    if (!PUBLIC_USER_CREATE_FIELDS.has(key)) {
      delete restrictedData[key];
    }
  }

  // Public signup and checkout-created guest users must never self-upgrade.
  restrictedData.hasAccount = false;
  return restrictedData;
}
