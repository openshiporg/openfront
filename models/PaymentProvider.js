import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { checkbox, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const PaymentProvider = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadPayments({ session }) ||
        permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments,
    },
  },
  fields: {
    isInstalled: checkbox({
      defaultValue: true,
    }),
    regions: relationship({
      ref: "Region.paymentProviders",
      many: true,
    }),
    paymentSessions: relationship({
      ref: "PaymentSession.paymentProvider",
      many: true,
    }),

    ...trackingFields,
  },
});
