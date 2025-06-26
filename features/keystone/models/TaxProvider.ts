import { Lists } from '.keystone/types';
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { checkbox, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";

export const TaxProvider: Lists.TaxProvider = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadUsers({ session }) ||
        permissions.canManageUsers({ session }),
      create: ({ session }: { session?: { data: { isAdmin: boolean } } }) => !!session?.data.isAdmin,
      update: ({ session }: { session?: { data: { isAdmin: boolean } } }) => !!session?.data.isAdmin,
      delete: ({ session }: { session?: { data: { isAdmin: boolean } } }) => !!session?.data.isAdmin,
    },
  },
  fields: {
    isInstalled: checkbox({
      defaultValue: true,
    }),
    regions: relationship({
      ref: "Region.taxProvider",
      many: true,
    }),
  },
});
