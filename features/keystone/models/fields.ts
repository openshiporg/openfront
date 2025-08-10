import { checkbox } from "@keystone-6/core/fields"

export const permissionFields = {
  canAccessDashboard: checkbox({
    defaultValue: false,
    label: "User can access the dashboard"
  }),
  canReadOrders: checkbox({
    defaultValue: false,
    label: "User can read orders"
  }),
  canManageOrders: checkbox({
    defaultValue: false,
    label: "User can update and delete any order"
  }),
  canReadProducts: checkbox({
    defaultValue: false,
    label: "User can read products"
  }),
  canManageProducts: checkbox({
    defaultValue: false,
    label: "User can update and delete any product"
  }),
  canReadFulfillments: checkbox({
    defaultValue: false,
    label: "User can read fulfillments"
  }),
  canManageFulfillments: checkbox({
    defaultValue: false,
    label: "User can update and delete any fulfillment"
  }),
  canReadUsers: checkbox({
    defaultValue: false,
    label: "User can read other users"
  }),
  canManageUsers: checkbox({
    defaultValue: false,
    label: "User can update and delete other users"
  }),
  canReadRoles: checkbox({
    defaultValue: false,
    label: "User can read other roles"
  }),
  canManageRoles: checkbox({
    defaultValue: false,
    label: "User can CRUD roles"
  }),
  canReadCheckouts: checkbox({
    defaultValue: false,
    label: "User can read other checkouts"
  }),
  canManageCheckouts: checkbox({
    defaultValue: false,
    label: "User can see and manage checkouts"
  }),
  canReadDiscounts: checkbox({
    defaultValue: false,
    label: "User can read other discounts"
  }),
  canManageDiscounts: checkbox({
    defaultValue: false,
    label: "User can see and manage discounts"
  }),
  canReadGiftCards: checkbox({
    defaultValue: false,
    label: "User can read other gift cards"
  }),
  canManageGiftCards: checkbox({
    defaultValue: false,
    label: "User can see and manage gift cards"
  }),
  canReadReturns: checkbox({
    defaultValue: false,
    label: "User can read other returns"
  }),
  canManageReturns: checkbox({
    defaultValue: false,
    label: "User can see and manage returns"
  }),
  canReadSalesChannels: checkbox({
    defaultValue: false,
    label: "User can read other returns"
  }),
  canManageSalesChannels: checkbox({
    defaultValue: false,
    label: "User can see and manage returns"
  }),
  canReadPayments: checkbox({
    defaultValue: false,
    label: "User can read other payments"
  }),
  canManagePayments: checkbox({
    defaultValue: false,
    label: "User can see and manage payments"
  }),
  canReadIdempotencyKeys: checkbox({
    defaultValue: false,
    label: "User can read other idempotency keys"
  }),
  canManageIdempotencyKeys: checkbox({
    defaultValue: false,
    label: "User can see and manage idempotency keys"
  }),
  canReadApps: checkbox({
    defaultValue: false,
    label: "User can read other apps"
  }),
  canManageApps: checkbox({
    defaultValue: false,
    label: "User can see and manage apps"
  }),
  canManageKeys: checkbox({
    defaultValue: false,
    label: "User can see and manage API Keys"
  }),
  canManageOnboarding: checkbox({
    defaultValue: false,
    label: "User can access onboarding and store configuration"
  }),
  canReadWebhooks: checkbox({
    defaultValue: false,
    label: "User can view webhook endpoints and events"
  }),
  canManageWebhooks: checkbox({
    defaultValue: false,
    label: "User can create, update, and delete webhook endpoints (Warning: Grants access to ALL resource events)"
  }),
}

export const permissionsList = Object.keys(permissionFields)
