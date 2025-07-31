
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { float, select, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

const UNITS = {
  weight: ["g", "kg", "oz", "lb"],
  dimensions: ["cm", "m", "in", "ft"],
};

export const Measurement = list({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    value: float({
      validation: {
        isRequired: true,
        min: 0,
      },
    }),
    unit: select({
      type: "string",
      validation: {
        isRequired: true,
      },
      options: [...UNITS.weight, ...UNITS.dimensions].map(unit => ({
        label: unit.toUpperCase(),
        value: unit,
      })),
      defaultValue: "g",
      ui: {
        displayMode: "select",
      },
    }),
    type: select({
      type: "string",
      validation: {
        isRequired: true,
      },
      options: [
        { label: "Weight", value: "weight" },
        { label: "Length", value: "length" },
        { label: "Width", value: "width" },
        { label: "Height", value: "height" },
      ],
      defaultValue: "weight",
      ui: {
        displayMode: "select",
      },
    }),
    productVariant: relationship({
      ref: "ProductVariant.measurements",
    }),
    ...trackingFields,
  },
});
