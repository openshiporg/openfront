/**
 * OAuth Scopes to Permission Mapping
 * 
 * This file maps OAuth scopes (used by external apps) to internal permissions.
 * When an OAuth token has a certain scope, it grants the mapped permissions.
 */

export type OAuthScope = 
  | "read_products" 
  | "write_products"
  | "read_orders"
  | "write_orders"
  | "read_customers"
  | "write_customers"
  | "read_fulfillments"
  | "write_fulfillments"
  | "read_checkouts"
  | "write_checkouts"
  | "read_discounts"
  | "write_discounts"
  | "read_gift_cards"
  | "write_gift_cards"
  | "read_returns"
  | "write_returns"
  | "read_sales_channels"
  | "write_sales_channels"
  | "read_payments"
  | "write_payments"
  | "read_webhooks"
  | "write_webhooks"
  | "read_apps"
  | "write_apps";

export type Permission = 
  | "canReadProducts"
  | "canManageProducts"
  | "canReadOrders"
  | "canManageOrders"
  | "canReadUsers"
  | "canManageUsers"
  | "canReadFulfillments"
  | "canManageFulfillments"
  | "canReadCheckouts"
  | "canManageCheckouts"
  | "canReadDiscounts"
  | "canManageDiscounts"
  | "canReadGiftCards"
  | "canManageGiftCards"
  | "canReadReturns"
  | "canManageReturns"
  | "canReadSalesChannels"
  | "canManageSalesChannels"
  | "canReadPayments"
  | "canManagePayments"
  | "canReadWebhooks"
  | "canManageWebhooks"
  | "canReadApps"
  | "canManageApps";

/**
 * Maps OAuth scopes to internal permissions
 */
export const SCOPE_TO_PERMISSIONS: Record<OAuthScope, Permission[]> = {
  // Products
  "read_products": ["canReadProducts"],
  "write_products": ["canReadProducts", "canManageProducts"],
  
  // Orders  
  "read_orders": ["canReadOrders"],
  "write_orders": ["canReadOrders", "canManageOrders"],
  
  // Customers (maps to users in our system)
  "read_customers": ["canReadUsers"],
  "write_customers": ["canReadUsers", "canManageUsers"],
  
  // Fulfillments
  "read_fulfillments": ["canReadFulfillments"],
  "write_fulfillments": ["canReadFulfillments", "canManageFulfillments"],
  
  // Checkouts
  "read_checkouts": ["canReadCheckouts"],
  "write_checkouts": ["canReadCheckouts", "canManageCheckouts"],
  
  // Discounts
  "read_discounts": ["canReadDiscounts"],
  "write_discounts": ["canReadDiscounts", "canManageDiscounts"],
  
  // Gift Cards
  "read_gift_cards": ["canReadGiftCards"],
  "write_gift_cards": ["canReadGiftCards", "canManageGiftCards"],
  
  // Returns
  "read_returns": ["canReadReturns"],
  "write_returns": ["canReadReturns", "canManageReturns"],
  
  // Sales Channels
  "read_sales_channels": ["canReadSalesChannels"],
  "write_sales_channels": ["canReadSalesChannels", "canManageSalesChannels"],
  
  // Payments
  "read_payments": ["canReadPayments"],
  "write_payments": ["canReadPayments", "canManagePayments"],
  
  // Webhooks
  "read_webhooks": ["canReadWebhooks"],
  "write_webhooks": ["canReadWebhooks", "canManageWebhooks"],
  
  // Apps
  "read_apps": ["canReadApps"],
  "write_apps": ["canReadApps", "canManageApps"],
};

/**
 * Gets all permissions for a given set of scopes
 */
export function getPermissionsForScopes(scopes: OAuthScope[]): Permission[] {
  const permissions = new Set<Permission>();
  
  scopes.forEach(scope => {
    const scopePermissions = SCOPE_TO_PERMISSIONS[scope];
    if (scopePermissions) {
      scopePermissions.forEach(permission => permissions.add(permission));
    }
  });
  
  return Array.from(permissions);
}

/**
 * Checks if a set of scopes grants a specific permission
 */
export function hasPermission(scopes: OAuthScope[], permission: Permission): boolean {
  return getPermissionsForScopes(scopes).includes(permission);
}

/**
 * Scope descriptions for the OAuth authorization page
 */
export const SCOPE_DESCRIPTIONS: Record<OAuthScope, string> = {
  "read_products": "View your products and inventory",
  "write_products": "Manage your products and inventory",
  "read_orders": "View your orders and customer information",
  "write_orders": "Manage your orders and fulfillments",
  "read_customers": "View customer information",
  "write_customers": "Manage customer accounts",
  "read_fulfillments": "View fulfillment information",
  "write_fulfillments": "Manage fulfillments and shipping",
  "read_checkouts": "View checkout sessions",
  "write_checkouts": "Manage checkout sessions",
  "read_discounts": "View discount codes and promotions",
  "write_discounts": "Manage discount codes and promotions",
  "read_gift_cards": "View gift card information",
  "write_gift_cards": "Manage gift cards",
  "read_returns": "View return requests",
  "write_returns": "Manage return requests",
  "read_sales_channels": "View sales channel information",
  "write_sales_channels": "Manage sales channels",
  "read_payments": "View payment information",
  "write_payments": "Process payments and refunds",
  "read_webhooks": "View webhook configurations",
  "write_webhooks": "Manage webhook configurations",
  "read_apps": "View installed applications",
  "write_apps": "Manage application installations",
};

/**
 * Available scopes that apps can request
 */
export const AVAILABLE_SCOPES: OAuthScope[] = Object.keys(SCOPE_TO_PERMISSIONS) as OAuthScope[];

/**
 * Default scopes for new apps (minimal access)
 */
export const DEFAULT_SCOPES: OAuthScope[] = ["read_products", "read_orders"];