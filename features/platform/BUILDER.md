# Platform Pages Builder Guide

This guide documents how to build custom platform pages by frankensteining the dashboard functionality while maintaining the dashboard's filtering, sorting, and pagination capabilities.

## Overview

Platform pages use the **Dashboard Extension Pattern** - they copy the dashboard's `ListPage` structure but replace the generic `ListTable` component with custom UI components specific to the platform needs (like `OrderDetailsComponent`).

## Benefits

- ✅ **Reuse Dashboard Functionality**: Get filtering, sorting, field selection, pagination for free
- ✅ **Custom UI**: Show data in platform-specific formats instead of generic tables
- ✅ **Full GraphQL Control**: Override field selections for complex nested relationships
- ✅ **Consistent Experience**: Platform pages feel integrated with the dashboard

## Building a Platform List Page

### Step 1: Copy Dashboard List Page Structure

1. **Create Server Component** (`screens/YourListPage.tsx`):
   ```typescript
   // Copy from dashboard/screens/ListPage/index.tsx
   // Update imports to use platform utils
   import { getListItemsAction } from '../../utils/getListItemsAction'
   ```

2. **Create Client Component** (`screens/YourListPageClient.tsx`):
   ```typescript
   // Copy from dashboard/screens/ListPage/ListPageClient.tsx
   // Import dashboard components for functionality
   import { PlatformFilterBar } from '../components/PlatformFilterBar'
   import { Pagination } from '../../../dashboard/components/Pagination'
   ```

### Step 2: Hardcode the List Key

Replace the dynamic `listKey` parameter with your specific entity:

```typescript
// In server component
const listKey = 'orders'; // Hardcode your entity key
```

### Step 3: Create Platform Filter Bar

Copy the dashboard's `FilterBar` and remove field selection:

```typescript
// components/PlatformFilterBar.tsx
// Copy from dashboard/components/FilterBar.tsx
// Remove FieldSelection component and import
// Keep FilterAdd, SortSelection, FilterList for full functionality
```

### Step 4: Custom GraphQL Selection

Define your custom GraphQL selection with nested fields:

```typescript
const customGraphQLSelection = `
  id
  displayId
  status
  email
  createdAt
  updatedAt
  currency {
    id
    code
    symbol
  }
  user {
    id
    name
    email
  }
  shippingAddress {
    id
    firstName
    lastName
    address1
    city
    province
    postalCode
  }
  lineItems {
    id
    title
    quantity
    sku
    thumbnail
    formattedUnitPrice
    formattedTotal
    variantTitle
  }
`

// Pass to getListItemsAction
const response = await getListItemsAction(
  listKey, 
  variables, 
  selectedFields, 
  cacheOptions, 
  customGraphQLSelection
)
```

### Step 5: Replace ListTable with Custom Components

Instead of the generic `ListTable`, use your custom display components:

```typescript
// Replace this:
<ListTable data={data} list={list} selectedFields={selectedFields} />

// With this:
<div className="grid grid-cols-1 divide-y">
  {data?.items?.map((item: any) => (
    <YourCustomComponent key={item.id} item={item} />
  ))}
</div>
```

### Step 6: Add Status Tabs (Optional)

For entities with status fields, add status filtering:

```typescript
// Import existing status counts function
import { getYourStatusCounts } from '../actions'

// Use StatusTabs component
<StatusTabs statusCounts={statusCounts} />
```

### Step 7: Add Pagination

Import and use the dashboard's pagination:

```typescript
{data && data.count > pageSize && (
  <Pagination
    currentPage={currentPage}
    total={data.count}
    pageSize={pageSize}
    list={{ singular: 'order', plural: 'orders' }}
  />
)}
```

## File Structure

```
features/platform/
├── utils/
│   └── getListItemsAction.ts        # Shared list fetching utility
├── orders/                          # Example platform page
│   ├── screens/
│   │   ├── OrderListPage.tsx        # Server component
│   │   └── OrderListPageClient.tsx  # Client component
│   ├── components/
│   │   ├── PlatformFilterBar.tsx    # Dashboard FilterBar without field selection
│   │   ├── StatusTabs.tsx           # Status filtering tabs
│   │   └── OrderDetailsComponent.tsx # Custom display component
│   └── actions/
│       └── index.ts                 # Status counts and other actions
└── BUILDER.md                       # This guide
```

## Key Components

### getListItemsAction (Shared Utility)

Located in `platform/utils/getListItemsAction.ts`, this enhanced version of the dashboard's action supports custom GraphQL selections:

```typescript
export async function getListItemsAction(
  listKey: string,
  variables: ListItemsVariables,
  selectedFields: string[] = ['id'],
  cacheOptions?: CacheOptions,
  customGraphQLSelection?: string  // 🔑 Key addition
)
```

**Usage**:
- **Without custom selection**: Uses dashboard's automatic field detection
- **With custom selection**: Uses your provided GraphQL selection string

### PlatformFilterBar

Dashboard's `FilterBar` without field selection - gives you:
- ✅ Search functionality
- ✅ Filter controls (FilterAdd)
- ✅ Sort controls (SortSelection)
- ✅ Active filter display (FilterList)
- ❌ Field selection (removed for platform pages)

### Custom Display Components

Replace `ListTable` with components that render your data in platform-specific formats:
- `OrderDetailsComponent` - Shows orders with addresses, line items, etc.
- `ProductDetailsCollapsible` - Collapsible line items with pagination
- Any custom component that fits your data structure

## Example: Orders Page

The orders page demonstrates the complete pattern:

1. **Server Component**: Fetches orders with custom GraphQL selection
2. **Client Component**: Uses `PlatformFilterBar`, `StatusTabs`, `Pagination`
3. **Custom Display**: `OrderDetailsComponent` shows order details instead of table rows
4. **Status Filtering**: `StatusTabs` for order status filtering
5. **Full Functionality**: Search, sort, filter, paginate all work seamlessly

## Quick Start Template

To create a new platform page:

1. **Copy** the entire `orders` folder structure
2. **Find & Replace** "order" → "your-entity" throughout all files
3. **Update** the `listKey` to your entity name
4. **Modify** the `customGraphQLSelection` for your entity's fields
5. **Replace** `OrderDetailsComponent` with your custom display component
6. **Update** status counts function if your entity has status
7. **Test** all functionality (search, filter, sort, paginate)

## Notes

- Always use the shared `getListItemsAction` from `platform/utils`
- Keep the dashboard import paths for maximum functionality reuse
- Test filtering and sorting to ensure your custom GraphQL selection works
- The platform approach maintains all dashboard capabilities while providing custom UI