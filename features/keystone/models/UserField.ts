
import { list } from "@keystone-6/core";
import { denyAll } from "@keystone-6/core/access";
import { text, relationship, timestamp, json } from "@keystone-6/core/fields";
import { permissions } from "../access";
import { trackingFields } from "./trackingFields";

export const UserField = list({
  access: {
    operation: {
      query: ({ session }) =>
        permissions.canReadUsers({ session }) ||
        permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers,
    },
  },
  fields: {
    user: relationship({
      ref: "User.userField",
      many: false,
    }),
    lastLoginIp: text(),
    lastLoginUserAgent: text(),
    loginHistory: json({
      defaultValue: [],
    }),
    preferences: json({
      defaultValue: {
        theme: "light",
        notifications: true,
        emailNotifications: true,
      },
    }),
    notes: text(),
    lastPasswordChange: timestamp(),
    failedLoginAttempts: json({
      defaultValue: {
        count: 0,
        lastAttempt: null,
        lockedUntil: null,
      },
    }),
    ...trackingFields,
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      // Update login history when IP or user agent changes
      if (resolvedData.lastLoginIp || resolvedData.lastLoginUserAgent) {
        const history = resolvedData.loginHistory || [];
        history.push({
          timestamp: new Date().toISOString(),
          ip: resolvedData.lastLoginIp,
          userAgent: resolvedData.lastLoginUserAgent,
        });

        // Keep only last 10 logins
        if (history.length > 10) {
          history.shift();
        }

        resolvedData.loginHistory = history;
      }

      return resolvedData;
    },
  },
}); 