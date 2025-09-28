
import { list } from "@keystone-6/core";
import { allowAll, denyAll } from "@keystone-6/core/access";
import { json, text, relationship, image, integer } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const ProductImage = list({
  access: {
    operation: {
      // query: ({ session }) =>
      //   permissions.canReadProducts({ session }) ||
      //   permissions.canManageProducts({ session }),
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts,
    },
  },
  fields: {
    image: image({ storage: "my_images" }),
    imagePath: text(),
    altText: text(),
    order: integer({
      defaultValue: 0,
    }),
    products: relationship({ ref: "Product.productImages", many: true }),
    productVariants: relationship({ ref: "ProductVariant.primaryImage", many: true }),
    metadata: json(),
    ...trackingFields,
  },
  ui: {
    listView: {
      initialColumns: ["image", "imagePath", "altText", "products"],
    },
  },
});
