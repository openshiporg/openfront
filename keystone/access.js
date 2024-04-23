import { permissionsList } from "./models/fields";
// At it's simplest, the access control returns a yes or no value depending on the users session

export function isSignedIn({ session }) {
  return !!session;
}

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }) {
      return !!session?.data.role?.[permission];
    },
  ])
);


// Permissions check if someone meets a criteria - yes or no.
export const permissions = {
  ...generatedPermissions,
};

// Rule based function
// Rules can return a boolean - yes or no - or a filter which limits which products they can CRUD.
export const rules = {
  canManageOrders({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    // return { user: { id: { equals: session?.itemId } } };
  },
  canManageProducts({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    // return { user: { id: { equals: session?.itemId } } };
  },
  canManageOrderItems({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. Do they have the permission of canManageProducts
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // 2. If not, do they own this item?
    // return { order: { user: { id: { equals: session?.itemId } } } };
  },
  canReadProducts({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageProducts({ session })) {
      return true; // They can read everything!
    }
    // They should only see available products (based on the status field)
    // return { status: { equals: "AVAILABLE" } };
  },
  canManageUsers({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageUsers({ session })) {
      return true;
    }
    // Otherwise they may only update themselves!
    return { id: { equals: session?.itemId } };
  },

  canManageKeys({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageKeys({ session })) {
      return true;
    }
    // Otherwise they may only update themselves!
    return { id: { equals: session?.itemId } };
  },
};
