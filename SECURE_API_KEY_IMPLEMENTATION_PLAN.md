# OpenFront Secure API Key Implementation Plan

## Overview

This document outlines the plan to upgrade OpenFront's API key system from the current basic implementation to a secure, scoped system based on Openship's implementation.

## Current State Analysis

### OpenFront Current Implementation
- **Model**: Extremely basic - only has `user` relationship and tracking fields
- **Authentication**: Uses `x-api-key` header with direct ID lookup (lines 70-87 in `features/keystone/index.ts`)
- **Security**: **MAJOR VULNERABILITY** - API keys are stored and transmitted as plain IDs
- **Scopes**: No scoping system - keys have full user permissions
- **Token Format**: Plain UUID/ID values
- **Show Once**: No - keys can be viewed repeatedly

### Openship Implementation (Proven Secure)
- **Model**: Comprehensive with `name`, `tokenSecret` (password field), `scopes`, `status`, `expiresAt`, `usageCount`, etc.
- **Authentication**: Bearer token with bcryptjs verification via Keystone's password field
- **Security**: Tokens hashed using bcryptjs, only shown once during creation
- **Scopes**: Granular permission system with 19 different scopes
- **Token Format**: `osp_` prefix + 32-character base62 string
- **Show Once**: ✅ Secure - tokens displayed only during creation

## Security Gap Analysis

### Critical Issues in OpenFront
1. **Plaintext Storage**: API keys stored as plain IDs in database
2. **No Token Security**: Keys can be extracted from database directly
3. **No Scope Limitation**: Keys grant full user permissions
4. **No Expiration**: Keys never expire
5. **No Usage Tracking**: No monitoring of API key usage
6. **Insecure Headers**: Uses `x-api-key` instead of standard `Authorization: Bearer`

## Implementation Plan

### Phase 1: Model Enhancement

#### Update ApiKey Model (`features/keystone/models/ApiKey.ts`)

```typescript
import {
  text,
  password,
  json,
  select,
  timestamp,
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
      query: rules.canReadApiKeys,
      update: rules.canManageApiKeys,
      delete: rules.canManageApiKeys,
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
        description: "A descriptive name for this API key (e.g. 'Mobile App', 'Analytics Dashboard')",
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
        description: "Array of scopes for this API key. Available scopes: read_products, write_products, read_orders, etc.",
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
    description: "Secure API keys for programmatic access to OpenFront",
  },
});

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
      // ... continue for all scopes
    }
  });
  
  return Array.from(permissions);
}
```

### Phase 2: Authentication System Update

#### Update Keystone Index (`features/keystone/index.ts`)

Replace the insecure x-api-key authentication (lines 69-87) with secure Bearer token authentication:

```typescript
// Check for OAuth Bearer token authentication
const authHeader = context.req.headers.authorization;

if (authHeader?.startsWith("Bearer ")) {
  const accessToken = authHeader.replace("Bearer ", "");
  
  // Try to validate as API key first
  if (accessToken.startsWith("of_")) {
    console.log('🔑 API KEY DETECTED, VALIDATING...');
    try {
      // Get all active API keys and test the token against each one
      const apiKeys = await context.sudo().query.ApiKey.findMany({
        where: { status: { equals: 'active' } },
        query: `
          id
          name
          scopes
          status
          expiresAt
          usageCount
          tokenSecret { isSet }
          user { id }
        `,
      });
      
      console.log('🔑 CHECKING AGAINST', apiKeys.length, 'ACTIVE API KEYS');
      
      let matchingApiKey = null;
      
      // Test token against each API key using bcryptjs (same as Keystone's default KDF)
      for (const apiKey of apiKeys) {
        try {
          if (!apiKey.tokenSecret?.isSet) continue;
          
          // Get the full API key item with the tokenSecret value
          const fullApiKey = await context.sudo().db.ApiKey.findOne({
            where: { id: apiKey.id },
          });
          
          if (!fullApiKey || typeof fullApiKey.tokenSecret !== 'string') {
            continue;
          }
          
          // Use bcryptjs to compare - this is exactly what Keystone does internally
          const isValid = await bcryptjs.compare(accessToken, fullApiKey.tokenSecret);
          
          if (isValid) {
            matchingApiKey = apiKey;
            console.log('🔑 FOUND MATCHING API KEY:', apiKey.id);
            break;
          }
        } catch (error) {
          console.log('🔑 ERROR VERIFYING API KEY:', error);
          continue;
        }
      }
      
      if (!matchingApiKey) {
        console.log('🔑 NO MATCHING API KEY FOUND');
        return; // API key not found or invalid
      }
      
      if (matchingApiKey.status !== 'active') {
        console.log('🔑 API KEY NOT ACTIVE:', matchingApiKey.status);
        return; // API key is inactive
      }
      
      if (matchingApiKey.expiresAt && new Date() > new Date(matchingApiKey.expiresAt)) {
        console.log('🔑 API KEY EXPIRED');
        // Auto-revoke expired keys
        await context.sudo().query.ApiKey.updateOne({
          where: { id: matchingApiKey.id },
          data: { status: 'revoked' },
        });
        return; // API key has expired
      }
      
      // Update usage statistics (async, don't wait)
      const today = new Date().toISOString().split('T')[0];
      const usage = matchingApiKey.usageCount || { total: 0, daily: {} };
      usage.total = (usage.total || 0) + 1;
      usage.daily[today] = (usage.daily[today] || 0) + 1;
      
      context.sudo().query.ApiKey.updateOne({
        where: { id: matchingApiKey.id },
        data: {
          lastUsedAt: new Date(),
          usageCount: usage,
        },
      }).catch(console.error);
      
      // Return user session with API key scopes attached
      if (matchingApiKey.user?.id) {
        const session = { 
          itemId: matchingApiKey.user.id, 
          listKey,
          apiKeyScopes: matchingApiKey.scopes || [] // Attach scopes for permission checking
        };
        console.log('🔑 RETURNING SESSION:', JSON.stringify(session, null, 2));
        return session;
      }
    } catch (err) {
      console.log('🔑 API Key validation error:', err);
      return;
    }
  }
  
  // Continue with existing OAuth token validation...
}
```

### Phase 3: Client-Side Components

#### Create API Key Management UI

Based on Openship's implementation, create:

1. **CreateApiKey Component** - For generating new API keys with client-side token generation
2. **API Key List Page** - For managing existing keys
3. **API Key Actions** - Server actions for CRUD operations

#### Token Generation Function

```typescript
// Client-side token generation (same as Openship)
function generateApiKeyToken(): string {
  const prefix = 'of_'; // OpenFront prefix
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  
  // Convert to base62 (alphanumeric) for readability
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < randomBytes.length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  
  return prefix + result;
}
```

### Phase 4: Access Control Integration

#### Update User Model

Add API key relationship to User model:

```typescript
apiKeys: relationship({
  ref: "ApiKey.user",
  many: true,
  ui: {
    displayMode: "cards",
    cardFields: ["name", "tokenPreview", "status", "lastUsedAt"],
    inlineCreate: { fields: ["name", "scopes", "expiresAt"] },
    inlineEdit: { fields: ["name", "scopes", "status", "expiresAt"] },
  },
}),
```

#### Update Access Control Rules

Extend the access control to handle API key scopes:

```typescript
// In access.ts, add API key scope checking
export function hasApiKeyScope(session: any, requiredScope: string): boolean {
  if (!session?.apiKeyScopes) return false;
  return session.apiKeyScopes.includes(requiredScope);
}

// Update existing permission functions to check API key scopes
export const rules = {
  canReadProducts: ({ session }: { session?: any }) => {
    if (!session) return false;
    
    // Check if using API key
    if (session.apiKeyScopes) {
      return hasApiKeyScope(session, 'read_products') || hasApiKeyScope(session, 'write_products');
    }
    
    // Regular user permission check
    return !!session.data?.role?.canReadProducts;
  },
  
  // ... continue for all resources
};
```

## Migration Strategy

### Step 1: Database Migration
- Add new fields to ApiKey table
- Migrate existing API keys (if any) to new format
- **CRITICAL**: Old keys will need to be regenerated due to security upgrade

### Step 2: Backward Compatibility
- **IMPORTANT**: This is a breaking change for existing API integrations
- Old `x-api-key` header method will be removed
- All API consumers must upgrade to `Authorization: Bearer` format

### Step 3: Deployment Plan
1. Deploy new API key model and UI
2. Generate new secure API keys for existing integrations
3. Update all client applications to use new tokens
4. Remove old authentication method
5. Monitor usage and audit security

## Security Benefits

### Before (Current State)
- ❌ Plaintext API key storage
- ❌ No scope limitations
- ❌ No expiration support
- ❌ No usage tracking
- ❌ Non-standard authentication header
- ❌ Keys visible repeatedly

### After (Post-Implementation)
- ✅ Hashed token storage using bcryptjs
- ✅ Granular scope-based permissions
- ✅ Optional expiration dates
- ✅ Usage tracking and analytics
- ✅ Standard Bearer token authentication
- ✅ Show-once token display
- ✅ Auto-revocation of expired keys
- ✅ Status management (active/inactive/revoked)

## Testing Strategy

1. **Unit Tests**: Verify token generation, hashing, and validation
2. **Integration Tests**: Test API key authentication flow
3. **Security Tests**: Ensure tokens cannot be extracted from database
4. **Performance Tests**: Verify bcryptjs comparison performance
5. **Migration Tests**: Test upgrade path from old to new system

## Scope Mapping Reference

| OpenFront Scope | Description | Permissions Granted |
|----------------|-------------|-------------------|
| `read_products` | View products | `canReadProducts` |
| `write_products` | Manage products | `canReadProducts`, `canManageProducts` |
| `read_orders` | View orders | `canReadOrders` |
| `write_orders` | Manage orders | `canReadOrders`, `canManageOrders` |
| `read_customers` | View customers | `canReadUsers` |
| `write_customers` | Manage customers | `canReadUsers`, `canManageUsers` |
| ... | ... | ... |

## Implementation Timeline

- **Week 1**: Model updates and database migration
- **Week 2**: Authentication system updates
- **Week 3**: UI components and client-side implementation
- **Week 4**: Testing, documentation, and deployment

## Risk Assessment

### High Risks
- **Breaking Changes**: Existing API integrations will break
- **Migration Complexity**: Need to coordinate client updates

### Mitigation
- Provide clear migration guide
- Offer extended transition period
- Create migration tooling for easy token generation

## Conclusion

This implementation brings OpenFront's API key system up to enterprise security standards, matching the proven secure implementation from Openship while adapting the scopes to OpenFront's e-commerce domain.

The upgrade addresses critical security vulnerabilities and provides a foundation for secure API access that can scale with the platform's growth.