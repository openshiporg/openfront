
import { list } from "@keystone-6/core";
import { integer, relationship, text, json, virtual } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import { graphql } from "@keystone-6/core";

const isS3SignedUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.has('X-Amz-Date') && parsedUrl.searchParams.has('X-Amz-Expires');
  } catch (e) {
    return false;
  }
};

const isS3UrlExpired = (url) => {
  try {
    const parsedUrl = new URL(url);
    const dateStr = parsedUrl.searchParams.get('X-Amz-Date');
    const expiresSeconds = parseInt(parsedUrl.searchParams.get('X-Amz-Expires'));
    
    // AWS Date format: YYYYMMDDTHHMMSSZ
    const date = new Date(
      dateStr.slice(0, 4) + '-' + 
      dateStr.slice(4, 6) + '-' + 
      dateStr.slice(6, 8) + 'T' + 
      dateStr.slice(9, 11) + ':' + 
      dateStr.slice(11, 13) + ':' + 
      dateStr.slice(13, 15) + 'Z'
    );
    
    const expirationTime = new Date(date.getTime() + (expiresSeconds * 1000));
    return expirationTime < new Date();
  } catch (e) {
    return true; // If we can't parse the URL or date, assume it's expired
  }
};

const checkUrlIsAccessible = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const OrderLineItem = list({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders,
    },
  },
  fields: {
    quantity: integer({
      validation: { isRequired: true },
    }),
    title: text({
      validation: { isRequired: true },
    }),
    sku: text(),
    thumbnail: virtual({
      field: graphql.field({
        type: graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          
          // First try to get thumbnail from productData
          if (item.productData?.thumbnail) {
            const thumbnail = item.productData.thumbnail;
            
            // If it's a local image (starts with / or doesn't have protocol), return it
            if (thumbnail.startsWith('/') || !thumbnail.includes('://')) {
              return thumbnail;
            }
            
            // If it's an S3 signed URL, check if it's expired
            if (isS3SignedUrl(thumbnail)) {
              // Quick check based on URL parameters
              if (!isS3UrlExpired(thumbnail)) {
                // Double check with actual fetch if the URL parameters suggest it's still valid
                const isAccessible = await checkUrlIsAccessible(thumbnail);
                if (isAccessible) {
                  return thumbnail;
                }
              }
            } else {
              // For non-S3 URLs, just check if they're accessible
              const isAccessible = await checkUrlIsAccessible(thumbnail);
              if (isAccessible) {
                return thumbnail;
              }
            }
          }

          // If thumbnail is expired or inaccessible, try to get from connected productVariant
          const orderLineItem = await sudoContext.query.OrderLineItem.findOne({
            where: { id: item.id },
            query: `
              productVariant {
                id
                primaryImage {
                  image { url }
                  imagePath
                }
                product {
                  thumbnail
                }
              }
            `,
          });

          // Prioritize variant's primaryImage, fall back to product thumbnail
          const primaryImage = orderLineItem?.productVariant?.primaryImage;
          if (primaryImage) {
            return primaryImage.image?.url || primaryImage.imagePath || null;
          }

          return orderLineItem?.productVariant?.product?.thumbnail || null;
        }
      })
    }),
    metadata: json(),
    productData: json({
      description: "Snapshot of product data at time of order",
    }),
    variantData: json({
      description: "Snapshot of variant data at time of order",
    }),
    // Formatted values for display
    variantTitle: text(),
    formattedUnitPrice: text(),
    formattedTotal: text(),
    order: relationship({
      ref: "Order.lineItems",
    }),
    productVariant: relationship({
      ref: "ProductVariant",
      description: "Optional reference to product variant (may be deleted)",
    }),
    moneyAmount: relationship({
      ref: "OrderMoneyAmount.orderLineItem",
    }),
    originalLineItem: relationship({
      ref: "LineItem",
      description: "Reference to the original cart line item",
    }),
    fulfillmentItems: relationship({
      ref: "FulfillmentItem.lineItem",
      many: true,
    }),
    ...trackingFields,
  },
});