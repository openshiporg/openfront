
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { json, text, relationship, virtual } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import { graphql } from "@keystone-6/core";

export const Store = list({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels,
    },
  },
  fields: {
    name: text({
      defaultValue: "Openfront Store",
      validation: {
        isRequired: true,
      },
    }),
    defaultCurrencyCode: text({
      defaultValue: "usd",
      validation: {
        isRequired: true,
      },
    }),
    homepageTitle: text({
      defaultValue: "Openfront Next.js Starter",
    }),
    homepageDescription: text({
      defaultValue: "A performant frontend e-commerce starter template with Next.js 15 and Openfront.",
    }),
    logoIcon: text({
      defaultValue: '<svg width="24" height="24" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_238_1296)"><path fillRule="evenodd" clipRule="evenodd" d="M100 0H0L100 100H0L100 200H200L100 100H200L100 0Z" fill="currentColor" /></g><defs><clipPath id="clip0_238_1296"><rect width="200" height="200" fill="white" /></clipPath></defs></svg>',
    }),
    logoColor: text({
      defaultValue: '#2b7fff',
    }),
    metadata: json(),
    swapLinkTemplate: text(),
    paymentLinkTemplate: text(),
    inviteLinkTemplate: text(),
    // currency: relationship({
    //   ref: "Currency.stores",
    // }),
    currencies: relationship({
      ref: "Currency.stores",
      many: true,
    }),
    paymentProviders: virtual({
      field: graphql.field({
        type: graphql.list(
          graphql.object<{
            provider: string;
            publishableKey: string;
          }>()({
            name: 'PaymentProviderConfig',
            fields: {
              provider: graphql.field({ type: graphql.String }),
              publishableKey: graphql.field({ type: graphql.String }),
            },
          })
        ),
        resolve: async (item, args, context) => {
          // Query actual payment providers from database
          const paymentProviders = await context.sudo().query.PaymentProvider.findMany({
            where: { isInstalled: { equals: true } },
            query: 'code',
          });

          const providers = [];

          // Check if Stripe is installed (code starts with pp_stripe_)
          const hasStripe = paymentProviders.some((p: any) => p.code?.startsWith('pp_stripe_'));
          if (hasStripe) {
            const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
            if (stripePublishableKey) {
              providers.push({
                provider: 'stripe',
                publishableKey: stripePublishableKey,
              });
            }
          }

          // Check if PayPal is installed (code starts with pp_paypal)
          const hasPaypal = paymentProviders.some((p: any) => p.code?.startsWith('pp_paypal'));
          if (hasPaypal) {
            const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
            if (paypalClientId) {
              providers.push({
                provider: 'paypal',
                publishableKey: paypalClientId,
              });
            }
          }

          return providers;
        },
      }),
      ui: { query: '{ provider publishableKey }' },
    }),
    ...trackingFields,
  },
});
