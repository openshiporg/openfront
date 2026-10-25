import { list } from "@keystone-6/core";
import { text, select, json } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";
import { DEFAULT_SCOPES } from "../oauth/scopes";
import {
  generateOpaqueToken,
  oauthClientSecretDigest,
} from "../security/token-crypto";

export const OAuthApp = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadApps({ session }) ||
        permissions.canManageApps({ session }),
      create: ({ session }) => permissions.canManageApps({ session }),
      update: ({ session }) => permissions.canManageApps({ session }),
      delete: ({ session }) => permissions.canManageApps({ session }),
    },
  },
  fields: {
    name: text({
      validation: {
        isRequired: true,
      },
    }),
    clientId: text({
      isIndexed: "unique",
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === "create" && !resolvedData.clientId) {
            return generateOpaqueToken("of_");
          }
          return resolvedData.clientId;
        },
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Auto-generated unique identifier for your application.",
      },
    }),
    clientSecret: text({
      access: {
        read: () => false,
      },
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          // Public MCP clients (PKCE, no secret) register through /oauth/register.
          if (operation === "create" && !resolvedData.clientSecret && resolvedData.tokenEndpointAuthMethod !== "none") {
            throw new Error("OAuth apps must be created through the show-once credential command");
          }
          if (resolvedData.clientSecret) {
            return oauthClientSecretDigest(resolvedData.clientSecret);
          }
          return undefined;
        },
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        // displayMode: "textarea",
        description: "Auto-generated secret key. Keep this secure - it's used to authenticate your application.",
      },
    }),
    tokenEndpointAuthMethod: select({
      options: [
        { label: "Client secret (POST)", value: "client_secret_post" },
        { label: "Client secret (Basic)", value: "client_secret_basic" },
        { label: "None (public PKCE client)", value: "none" },
      ],
      defaultValue: "client_secret_post",
      ui: {
        description: "How the app authenticates at the token endpoint. MCP clients are public (none).",
      },
    }),
    redirectUris: json({
      defaultValue: [],
      ui: {
        description: "Array of allowed redirect URIs for OAuth callbacks",
      },
    }),
    scopes: json({
      defaultValue: DEFAULT_SCOPES,
      ui: {
        description: "Array of allowed OAuth scopes that map to permissions",
      },
    }),
    webhookUrl: text({
      ui: {
        description: "URL to receive webhook notifications",
      },
    }),
    status: select({
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "Pending", value: "pending" },
      ],
      defaultValue: "active",
    }),
    installUrl: text({
      ui: {
        description: "URL where users can install this app",
      },
    }),
    uninstallUrl: text({
      ui: {
        description: "URL to handle app uninstallation",
      },
    }),
    description: text({
      ui: {
        displayMode: "textarea",
      },
    }),
    metadata: json({
      defaultValue: {},
      ui: {
        description: "Additional app-specific configuration and settings",
      },
    }),
    developerEmail: text(),
    privacyPolicyUrl: text(),
    termsOfServiceUrl: text(),
    supportUrl: text(),
    ...trackingFields,
  },
  ui: {
    labelField: "name",
    listView: {
      initialColumns: ["name", "clientId", "status", "createdAt"],
    },
  },
});