
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { 
  checkbox, 
  relationship, 
  text,
  json,
  virtual 
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import { graphql } from "@keystone-6/core";

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
    credentials: json({
      defaultValue: {},
    }),
    metadata: json({
      defaultValue: {},
    }),
    // Adapter function fields
    createPaymentFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to create payments",
      }
    }),
    capturePaymentFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to capture payments",
      }
    }),
    refundPaymentFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to refund payments",
      }
    }),
    getPaymentStatusFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to check payment status",
      }
    }),
    generatePaymentLinkFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to generate payment dashboard links",
      }
    }),
    handleWebhookFunction: text({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to handle provider webhooks",
      }
    }),
    regions: relationship({
      ref: "Region.paymentProviders",
      many: true,
    }),
    sessions: relationship({
      ref: "PaymentSession.paymentProvider",
      many: true,
    }),
    ...trackingFields,
  },
});
