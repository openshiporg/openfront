
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import {
  json,
  text,
  relationship,
  image,
} from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

// export const cloudinary = {
//   cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'fake',
//   apiKey: process.env.CLOUDINARY_KEY || 'fake',
//   apiSecret: process.env.CLOUDINARY_SECRET || 'fake',
//   folder: 'sickfits',
// };

export const ClaimImage = list({
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
    // image: cloudinaryImage({
    //   cloudinary,
    //   label: 'Source',
    // }),
    image: image({ storage: 'my_images' }),
    url: text({
      label: 'Image URL',
      ui: {
        description: 'Direct URL to the image file'
      }
    }),
    altText: text(),
    claimItem: relationship({ ref: 'ClaimItem.claimImages' }),
    metadata: json(),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ['image', 'altText', 'product'],
    },
  },
});
