import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { 
  checkbox, 
  relationship, 
  text,
  json 
} from "@keystone-6/core/fields";
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
    name: text({
      validation: { isRequired: true },
    }),
    code: text({
      isIndexed: "unique",
      validation: {
        isRequired: true,
        match: {
          regex: /^pp_[a-zA-Z0-9-_]+$/,
          explanation: 'Payment provider code must start with "pp_" followed by alphanumeric characters, hyphens or underscores'
        }
      },
    }),
    isInstalled: checkbox({
      defaultValue: true,
    }),
    metadata: json({
      defaultValue: {},
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
