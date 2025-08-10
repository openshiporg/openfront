import { list } from "@keystone-6/core";
import { text, timestamp, select, json, relationship } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const OAuthToken = list({
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
    tokenType: select({
      options: [
        { label: "Authorization Code", value: "authorization_code" },
        { label: "Access Token", value: "access_token" },
        { label: "Refresh Token", value: "refresh_token" },
      ],
      validation: {
        isRequired: true,
      },
    }),
    token: text({
      validation: {
        isRequired: true,
      },
      isIndexed: "unique",
    }),
    clientId: text({
      validation: {
        isRequired: true,
      },
      isIndexed: true,
    }),
    user: relationship({
      ref: "User",
      ui: {
        description: "The user who authorized this token",
      },
    }),
    scopes: json({
      defaultValue: [],
      ui: {
        description: "Array of granted scopes",
      },
    }),
    redirectUri: text({
      ui: {
        description: "The redirect URI used during authorization",
      },
    }),
    expiresAt: timestamp({
      ui: {
        description: "When this token expires",
      },
    }),
    isRevoked: select({
      options: [
        { label: "Active", value: "false" },
        { label: "Revoked", value: "true" },
      ],
      defaultValue: "false",
    }),
    authorizationCode: text({
      ui: {
        description: "The authorization code that was exchanged for this token (for access tokens)",
      },
    }),
    refreshToken: text({
      ui: {
        description: "Associated refresh token (for access tokens)",
      },
    }),
    accessToken: text({
      ui: {
        description: "Associated access token (for refresh tokens)",
      },
    }),
    state: text({
      ui: {
        description: "OAuth state parameter for CSRF protection",
      },
    }),
    codeChallenge: text({
      ui: {
        description: "PKCE code challenge",
      },
    }),
    codeChallengeMethod: select({
      options: [
        { label: "Plain", value: "plain" },
        { label: "SHA256", value: "S256" },
      ],
      ui: {
        description: "PKCE code challenge method",
      },
    }),
    ...trackingFields,
  },
  hooks: {
    resolveInput({ operation, resolvedData, context }) {
      if (
        (operation === "create" || operation === "update") &&
        !resolvedData.user &&
        context.session?.itemId
      ) {
        return {
          ...resolvedData,
          user: { connect: { id: context.session.itemId } }
        };
      }
      return resolvedData;
    },
  },
  ui: {
    labelField: "token",
    listView: {
      initialColumns: ["tokenType", "clientId", "scopes", "expiresAt", "isRevoked"],
    },
  },
});