
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  integer,
  json,
  select,
  text,
  relationship,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ClaimItem = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadOrders({ session }) ||
        permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    reason: select({
      type: "enum",
      options: [
        {
          label: "Missing Item",
          value: "missing_item",
        },
        {
          label: "Wrong Item",
          value: "wrong_item",
        },
        {
          label: "Production Failure",
          value: "production_failure",
        },
        {
          label: "Other",
          value: "other",
        },
      ],
      validation: {
        isRequired: true,
      },
    }),
    note: text(),
    quantity: integer({
      validation: {
        isRequired: true,
      },
    }),
    metadata: json(),
    productVariant: relationship({
      ref: "ProductVariant.claimItems",
    }),
    lineItem: relationship({
      ref: "LineItem.claimItems",
    }),
    claimOrder: relationship({
      ref: "ClaimOrder.claimItems",
    }),
    claimImages: relationship({
      ref: "ClaimImage.claimItem",
      many: true,
    }),
    claimTags: relationship({
      ref: "ClaimTag.claimItems",
      many: true,
    }),
    ...trackingFields
  },
});
