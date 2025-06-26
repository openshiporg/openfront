
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { integer, text, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const Country = list({
  access: {
    operation: {
      query: () => true,
      // query: ({ session }) =>
      //   permissions.canReadUsers({ session }) ||
      //   permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers,
    },
  },
  fields: {
    iso2: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
      },
    }),
    iso3: text({
      validation: {
        isRequired: true,
      },
    }),
    numCode: integer({
      validation: {
        isRequired: true,
      },
    }),
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    displayName: text({
      validation: {
        isRequired: true,
      },
    }),
    region: relationship({
      ref: "Region.countries",
    }),
    addresses: relationship({
      ref: "Address.country",
      many: true,
    }),
    ...trackingFields,
  },
});
