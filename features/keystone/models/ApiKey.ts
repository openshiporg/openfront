import {
  text,
  password,
  relationship,
  multiselect,
  select,
  timestamp,
  json,
} from "@keystone-6/core/fields";
import { list } from "@keystone-6/core";
import { isSignedIn, rules, permissions } from "../access";
import { trackingFields } from "./trackingFields";

// OpenFront-specific API key scopes (based on OAuth scopes)
export const API_KEY_SCOPES = {
  // Products
  "read_products": "View products and inventory",
  "write_products": "Manage products and inventory",
  
  // Orders  
  "read_orders": "View orders and customer information",
  "write_orders": "Manage orders and fulfillments",
  
  // Customers (users in our system)
  "read_customers": "View customer information",
  "write_customers": "Manage customer accounts",
  
  // Fulfillments
  "read_fulfillments": "View fulfillment information",
  "write_fulfillments": "Manage fulfillments and shipping",
  
  // Checkouts
  "read_checkouts": "View checkout sessions",
  "write_checkouts": "Manage checkout sessions",
  
  // Discounts
  "read_discounts": "View discount codes and promotions",
  "write_discounts": "Manage discount codes and promotions",
  
  // Gift Cards
  "read_gift_cards": "View gift card information",
  "write_gift_cards": "Manage gift cards",
  
  // Returns
  "read_returns": "View return requests",
  "write_returns": "Manage return requests",
  
  // Sales Channels
  "read_sales_channels": "View sales channel information",
  "write_sales_channels": "Manage sales channels",
  
  // Payments
  "read_payments": "View payment information",
  "write_payments": "Process payments and refunds",
  
  // Webhooks
  "read_webhooks": "View webhook configurations",
  "write_webhooks": "Manage webhook configurations",
  
  // Apps & System
  "read_apps": "View installed applications",
  "write_apps": "Manage application installations",
} as const;

export type ApiKeyScope = keyof typeof API_KEY_SCOPES;


export const ApiKey = list({
  access: {
    operation: {
      query: isSignedIn,
      create: permissions.canManageKeys,
      update: permissions.canManageKeys,
      delete: permissions.canManageKeys,
    },
    filter: {
      query: rules.canManageKeys,
      update: rules.canManageKeys,
      delete: rules.canManageKeys,
    },
  },
  hooks: {
    validate: {
      create: async ({ resolvedData, addValidationError }) => {
        if (!resolvedData.scopes || resolvedData.scopes.length === 0) {
          addValidationError('At least one scope is required for API keys');
        }
      },
    },
    resolveInput: {
      create: async ({ resolvedData, context }) => {
        // Auto-assign user relationship
        return {
          ...resolvedData,
          user: resolvedData.user || (context.session?.itemId ? { connect: { id: context.session.itemId } } : undefined),
        };
      },
    },
  },
  fields: {
    name: text({
      validation: { isRequired: true },
      ui: {
        description: "A descriptive name for this API key (e.g. 'Production Bot', 'Analytics Dashboard')",
      },
    }),
    
    tokenSecret: password({
      validation: { isRequired: true },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
        description: "Secure API key token (hashed and never displayed)",
      },
    }),
    
    tokenPreview: text({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        listView: { fieldMode: "read" },
        description: "Preview of the API key (actual key is hidden for security)",
      },
    }),
    
    scopes: json({
      defaultValue: [],
      ui: {
        description: "Array of scopes for this API key. Available scopes: orders:read, orders:write, shops:read, shops:write, channels:read, channels:write, etc.",
      },
    }),
    
    status: select({
      type: 'enum',
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Revoked", value: "revoked" },
      ],
      defaultValue: "active",
      ui: {
        description: "Current status of this API key",
      },
    }),
    
    expiresAt: timestamp({
      ui: {
        description: "When this API key expires (optional - leave blank for no expiration)",
      },
    }),
    
    lastUsedAt: timestamp({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Last time this API key was used",
      },
    }),
    
    usageCount: json({
      defaultValue: { total: 0, daily: {} },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Usage statistics for this API key",
      },
    }),
    
    restrictedToIPs: json({
      defaultValue: [],
      ui: {
        description: "Optional: Restrict this key to specific IP addresses (array of IPs)",
      },
    }),
    
    user: relationship({
      ref: "User.apiKeys",
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
      },
    }),
    
    ...trackingFields,
  },
  
  ui: {
    labelField: "name",
    listView: {
      initialColumns: ["name", "tokenPreview", "scopes", "status", "lastUsedAt", "expiresAt"],
    },
    description: "Secure API keys for programmatic access to Openfront",
  },
});

// Helper function to validate API key tokens using password field
export async function validateApiKeyToken(
  apiKeyId: string,
  token: string,
  context: any
): Promise<boolean> {
  try {
    // Use Keystone's built-in password verification through createAuth
    // This is a simplified approach - we'll handle this in the authentication layer
    const result = await context.query.ApiKey.authenticateItemWithPassword({
      identifier: apiKeyId,
      secret: token,
      identityField: 'id',
      secretField: 'tokenSecret'
    });
    
    return result.success;
  } catch (error) {
    return false;
  }
}

// Simplified validation function for API keys
export async function validateApiKey(
  token: string,
  requiredScopes: ApiKeyScope[] = [],
  context: any
): Promise<{
  valid: boolean;
  user?: any;
  scopes?: ApiKeyScope[];
  error?: string;
}> {
  if (!token || !token.startsWith('of_')) {
    return { valid: false, error: 'Invalid API key format' };
  }
  
  // This will be handled differently - we'll need to update the keystone/index.ts
  // authentication logic to use the password field directly
  // For now, return a placeholder that will be updated in the auth layer
  return { valid: false, error: 'API key validation moved to auth layer' };
}

// Scope validation helper
export function hasScope(userScopes: ApiKeyScope[], requiredScope: ApiKeyScope): boolean {
  // Check for specific scope
  return userScopes.includes(requiredScope);
}

// Check if user has any of the required scopes
export function hasAnyScope(userScopes: ApiKeyScope[], requiredScopes: ApiKeyScope[]): boolean {
  return requiredScopes.some(scope => hasScope(userScopes, scope));
}

// Map API key scopes to internal permissions (reuse OAuth mapping)
export function getPermissionsForScopes(scopes: ApiKeyScope[]): string[] {
  const permissions = new Set<string>();
  
  scopes.forEach(scope => {
    switch (scope) {
      case 'read_products':
        permissions.add('canReadProducts');
        break;
      case 'write_products':
        permissions.add('canReadProducts');
        permissions.add('canManageProducts');
        break;
      case 'read_orders':
        permissions.add('canReadOrders');
        break;
      case 'write_orders':
        permissions.add('canReadOrders');
        permissions.add('canManageOrders');
        break;
      case 'read_customers':
        permissions.add('canReadUsers');
        break;
      case 'write_customers':
        permissions.add('canReadUsers');
        permissions.add('canManageUsers');
        break;
      case 'read_fulfillments':
        permissions.add('canReadFulfillments');
        break;
      case 'write_fulfillments':
        permissions.add('canReadFulfillments');
        permissions.add('canManageFulfillments');
        break;
      case 'read_checkouts':
        permissions.add('canReadCheckouts');
        break;
      case 'write_checkouts':
        permissions.add('canReadCheckouts');
        permissions.add('canManageCheckouts');
        break;
      case 'read_discounts':
        permissions.add('canReadDiscounts');
        break;
      case 'write_discounts':
        permissions.add('canReadDiscounts');
        permissions.add('canManageDiscounts');
        break;
      case 'read_gift_cards':
        permissions.add('canReadGiftCards');
        break;
      case 'write_gift_cards':
        permissions.add('canReadGiftCards');
        permissions.add('canManageGiftCards');
        break;
      case 'read_returns':
        permissions.add('canReadReturns');
        break;
      case 'write_returns':
        permissions.add('canReadReturns');
        permissions.add('canManageReturns');
        break;
      case 'read_sales_channels':
        permissions.add('canReadSalesChannels');
        break;
      case 'write_sales_channels':
        permissions.add('canReadSalesChannels');
        permissions.add('canManageSalesChannels');
        break;
      case 'read_payments':
        permissions.add('canReadPayments');
        break;
      case 'write_payments':
        permissions.add('canReadPayments');
        permissions.add('canManagePayments');
        break;
      case 'read_webhooks':
        permissions.add('canReadWebhooks');
        break;
      case 'write_webhooks':
        permissions.add('canReadWebhooks');
        permissions.add('canManageWebhooks');
        break;
      case 'read_apps':
        permissions.add('canReadApps');
        break;
      case 'write_apps':
        permissions.add('canReadApps');
        permissions.add('canManageApps');
        break;
    }
  });
  
  return Array.from(permissions);
}