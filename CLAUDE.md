# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Platform Pages Generation Pattern (PRIORITY)

**Use this pattern to rapidly create new platform pages for any entity.**

### Quick Start Template

For any new entity (e.g., `users`, `inventory`, `regions`):

1. **Create directory structure**:
   ```
   features/platform/{entity}/
   ├── actions/index.ts          # Server actions (copy from products, adapt GraphQL)
   ├── components/
   │   ├── {Entity}DetailsComponent.tsx  # Card display (design for entity)
   │   └── StatusTabs.tsx        # Entity-specific status config
   └── screens/
       ├── {Entity}ListPage.tsx  # Server component (copy from products)
       └── {Entity}ListPageClient.tsx  # Client component (copy from products)
   ```

2. **StatusTabs Configuration**:
   ```typescript
   // components/StatusTabs.tsx
   import { StatusTabs as BaseStatusTabs, StatusConfig } from "../../components/StatusTabs";
   import { Icon1, Icon2 } from "lucide-react";
   
   const statusConfig: Record<string, StatusConfig> = {
     status1: { label: "Label", icon: Icon1, color: "blue" },
     status2: { label: "Label", icon: Icon2, color: "emerald" },
   };
   
   export function StatusTabs({ statusCounts }: StatusTabsProps) {
     return (
       <BaseStatusTabs
         statusCounts={statusCounts}
         statusConfig={statusConfig}
         entityName="EntityPlural"
       />
     );
   }
   ```

3. **Actions Pattern** (critical - follow exactly):
   ```typescript
   // actions/index.ts
   'use server';
   import { keystoneClient } from "../../../dashboard/lib/keystoneClient";
   
   export async function getEntities(where = {}, take = 10, skip = 0, orderBy = [{ createdAt: 'desc' }]) {
     const query = `query GetEntities($where: EntityWhereInput, $take: Int!, $skip: Int!, $orderBy: [EntityOrderByInput!]) {
       items: entities(where: $where, take: $take, skip: $skip, orderBy: $orderBy) { /* fields */ }
       count: entitiesCount(where: $where)
     }`;
     
     const response = await keystoneClient(query, { where, take, skip, orderBy });  // ← Function call, NOT .request()
     
     if (response.success) {
       return { success: true, data: { items: response.data.items || [], count: response.data.count || 0 } };
     } else {
       return { success: false, error: response.error, data: { items: [], count: 0 } };
     }
   }
   ```

4. **PlatformFilterBar Usage**:
   ```typescript
   // Uses dynamic list.path and list.singular automatically
   <PlatformFilterBar list={list} />
   ```

5. **Layout Pattern**:
   ```typescript
   // Always use this layout for consistency
   <div className="grid grid-cols-1 divide-y">
     {data?.items?.map((item: any) => (
       <EntityDetailsComponent key={item.id} entity={item} list={list} />
     ))}
   </div>
   ```

### ⚠️ Critical Requirements

- **keystoneClient**: Call as function `keystoneClient(query, vars)`, NOT `.request()`
- **StatusTabs**: Use shared `BaseStatusTabs` component with entity-specific config
- **Actions**: Follow exact response pattern `{ success, data: { items, count }, error }`
- **Layout**: Use `grid grid-cols-1 divide-y` for visual consistency
- **Imports**: Copy exact import patterns from products actions

### 📋 Verified Working Examples

- **Orders**: `features/platform/orders/` - Complete implementation
- **Products**: `features/platform/products/` - Complete implementation  

Both are fully consistent and working. Copy from either for new platform pages.

## Development Commands

- `npm run dev` - Build Keystone + migrate + start Next.js dev server
- `npm run build` - Build Keystone + migrate + build Next.js for production
- `npm run migrate:gen` - Generate and apply new database migrations
- `npm run migrate` - Deploy existing migrations to database

## Architecture Overview

This is a Next.js 15 + KeystoneJS 6 application with a **dual dashboard architecture**:

- **Backend**: KeystoneJS 6 provides GraphQL API, authentication, and database operations
- **Frontend**: Two parallel admin interfaces sharing the same backend
  - `dashboard/` - Original KeystoneJS implementation (feature-complete)
  - `dashboard2/` - Refactored implementation (work in progress)

## Key Directories

- `features/keystone/` - Backend configuration
  - `models/` - Keystone list definitions (User, Role, Todo)
  - `access.ts` - Role-based permission logic
  - `mutations/` - Custom GraphQL mutations

- `features/dashboard/` - Original admin interface
  - `actions/` - Server actions for data operations
  - `components/` - Reusable UI components
  - `screens/` - Page-level components
  - `views/` - Field type implementations

- `features/dashboard2/` - Refactored admin interface (in development)
  - More modular architecture with improved TypeScript

- `app/` - Next.js App Router with parallel routes for both dashboards

## Data Models & Permissions

**Core Models**: User, Role, Todo with sophisticated relationship handling

**Permission System**: Role-based access control with granular permissions:
- `canAccessDashboard`, `canManagePeople`, `canManageRoles`
- `canCreateTodos`, `canManageAllTodos`
- `canSeeOtherPeople`, `canEditOtherPeople`

## Architecture Patterns

**Field Controller Pattern**: KeystoneJS uses field controllers that handle data serialization, validation, GraphQL selection building, and React rendering.

**Conditional Field Modes**: Fields change behavior based on user permissions, other field values, and create/update context.

**GraphQL Integration**: Dynamic query building from field controllers with SWR for client-side data fetching.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: KeystoneJS 6, Prisma ORM, PostgreSQL
- **UI**: Radix UI primitives, Tailwind CSS, Lucide React icons
- **Data**: GraphQL (GraphQL Yoga), SWR for client state

## Current Development Status - Dashboard2

**Why Dashboard2**: Rebuilding dashboard because original has extensive type errors that break functionality when fixed. Dashboard2 follows KeystoneJS examples more closely using GitHub MCP while preserving the UI work from dashboard1.

**Current Focus**: Core dashboard functionality completion

### Remaining Major Issues

#### 1. Item Page UI Layout (PRIORITY)
- **Status**: Functionality works perfectly, but missing Dashboard1's button layout
- **Needed**: Copy button positioning and responsive design from Dashboard1
- **Details**: Need left-side button layout, mobile screen handling, proper spacing
- **Why Priority**: Item page layout will inform create page design

#### 2. Create Pages Working - Layout Updated ✅
- **Status**: Functionality working, layout now matches ItemPage
- **Fixed**: Rebuilt component to match ItemPage's sidebar/floating button responsive design
- **Layout**: Left sidebar with buttons (desktop), floating toolbar (mobile), proper responsive behavior
- **Next**: Ready to move on to remaining issues

#### 3. Dashboard Home Page Issues
- **Missing counts**: Model counts not displaying (Dashboard1 shows these correctly)
- **Server rendering**: Getting "no models configured" flash, Dashboard1 server renders properly
- **Hardcoded styling**: Dashboard text uses hardcoded color instead of text-foreground
- **Root cause**: Not properly server-side rendering the dashboard data

#### 4. Sidebar User UI Missing
- **Missing components**: User avatar, email display, dropdown menu
- **Needed from Dashboard1**: User info section with GraphQL API link, direct user access
- **Note**: User data fetching approach may need adjustment for Dashboard2

### TODO List (Priority Order)
- [ ] **Fix item page UI layout** - Copy Dashboard1's button positioning and responsive design
- [x] **Create pages working with proper layout** - Layout now matches ItemPage design ✅
- [ ] **Fix dashboard home page** - Proper server rendering, counts, remove hardcoded colors  
- [ ] **Add sidebar user UI** - Copy Dashboard1's user avatar/email/dropdown functionality

### Fixed Cell Issues
- **Relationship cells**: Now properly display `item.label || item.id` with links, handle null/empty data
- **Password cells**: Show 3 asterisk icons when set, hidden "not set" text when empty (matches KeystoneJS)
- **Document cells**: Extract plain text from Slate document structure, truncate at 100 chars
- **Checkbox cells**: Show actual checkboxes (checked/unchecked) for better visual feedback vs KeystoneJS icon-only approach
- **ListTable rendering**: Fixed to properly use Cell components instead of String() conversion that caused "object, object"

### Fixed Search & UI Issues
- **Search functionality**: Fixed GraphQL errors by using proper field type detection (ID fields use `equals`, text fields use `contains`/`mode`)
- **Page layout**: Added border below breadcrumbs, "Create and manage X" descriptions, removed padding issues
- **Button styling**: Matched dashboard1 responsive design (icons on mobile, text on desktop) 
- **Table layout**: Fixed full-width table display, proper spacing
- **Filter UI**: Replaced basic badges with dashboard1's sophisticated filter pills with editing capability
- **TypeScript errors**: Fixed checkbox filter type definitions

**Reference Files**:
- `/features/dashboard2/views/repomix-keystonejs-views.xml` - KeystoneJS examples
- `/features/dashboard2/views/relationship/` - Current relationship implementation
- `/features/dashboard2/views/password/` - Current password implementation

## Platform Pages Migration Pattern

**Purpose**: Migration pattern for bringing all Dasher7 platform pages into OpenFrontFinal2 while leveraging the new dashboard architecture. This is the core strategy for scaling the application with specialized business entity management.

### Migration Status & Current Problems

**Partially Implemented** (2/19 - **WITH MAJOR INCONSISTENCIES**): 
- ⚠️ **Orders** (`features/platform/orders/`) - Has dedicated actions, StatusTabs with icons
- ⚠️ **Products** (`features/platform/products/`) - Missing actions, StatusTabs without icons, hardcoded GraphQL

**Critical Issues in Current Implementation**:
1. **PlatformFilterBar is hardcoded to orders** - Create button points to `/platform/orders/create`
2. **No consistency between Orders and Products** - Different data fetching, different StatusTabs features
3. **Products missing server actions** - Uses generic utils instead of dedicated actions
4. **StatusTabs implementations differ** - Orders has icons, Products doesn't
5. **Hardcoded entity names throughout** - "All Orders", "Create Order" baked into components

**Remaining Dasher7 Platform Pages** (17):
Analytics, Claims, Collections, Countries, Currencies, Discounts, Gift Cards, Inventory, Payment Providers, Price Lists, Product Categories, Regions, Returns, Settings, Shipping, Stores, Users

**Revised Strategy**: **FIX THE INCONSISTENCIES FIRST** before migrating more pages. The current implementations violate the documented pattern and will create more problems as we scale.

### Core Architecture Pattern

#### Server + Client Component Split
**Server Component Pattern** (`{Entity}ListPage.tsx`):
```typescript
// Handle server-side operations only
export async function OrderListPage({ searchParams }: PageProps) {
  // 1. Parse URL search params (status, search, page, sort, filters)
  // 2. Fetch data using platform-specific actions  
  // 3. Calculate status counts for StatusTabs
  // 4. Pass all data to client component
  return <OrderListPageClient {...props} />;
}
```

**Client Component Pattern** (`{Entity}ListPageClient.tsx`):
```typescript
// Handle all client-side interactions
export function OrderListPageClient({ list, initialData, statusCounts }) {
  // Render: PlatformFilterBar → StatusTabs → Details Components → Pagination
  // Handle: Search, filtering, sorting via URL manipulation
  // Display: Cards with collapsible content instead of table rows
}
```

#### Component Hierarchy Structure
```
Platform List Page
├── Server Component (handles data + search params)
│   ├── Parse search params (status, search, page, sortBy, filters)
│   ├── Fetch filtered data via platform actions
│   ├── Calculate status counts for tabs
│   └── Pass to Client Component
│
└── Client Component (handles UI + interactions)
    ├── PageContainer (breadcrumbs + "Create and manage X" header)
    ├── PlatformFilterBar (search, sorting, create button)
    ├── StatusTabs (status filtering with live counts)
    ├── FilterList (active filter pills with remove capability)
    ├── Details Components (card-based item rendering)
    └── Pagination (page navigation controls)
```

### Key Component Specifications

#### PlatformFilterBar vs Dashboard FilterBar

**Critical Differences**:
| Feature | Dashboard FilterBar | Platform FilterBar |
|---------|-------------------|-------------------|
| **Field Selection** | ✅ Dynamic `FieldSelection` with Columns3 icon | ❌ **Removed** - Fields are hardcoded per entity |
| **Create Button** | Dynamic `Create ${list.singular}` | **Custom Button Support** via props |
| **Flexibility** | Generic across all dashboard lists | **Entity-Specific** customization |

**Implementation Locations**:
- Dashboard: `features/dashboard/components/FilterBar.tsx`
- Platform: `features/platform/components/PlatformFilterBar.tsx`

**CRITICAL ISSUE**: PlatformFilterBar is completely hardcoded to orders:

```typescript
// Line 132-140 in PlatformFilterBar.tsx - BROKEN
<Link href={`${basePath}/platform/orders/create`}>  // Hardcoded "orders"
  <span className="hidden lg:inline">Create Order</span>  // Hardcoded "Order"
</Link>
```

**This makes the component unusable for products or any other entity.** Must be fixed before any new migrations.

#### StatusTabs - URL Manipulation Pattern

**Purpose**: Abstract status filtering into visual tabs with live counts that manipulate URL parameters exactly like dashboard filter buttons.

**URL Parameter Pattern**:
```typescript
// No filter (show all)
?page=1&search=test&sortBy=createdAt

// Filtered by specific status  
?page=1&search=test&sortBy=createdAt&!status_matches=%5B%22pending%22%5D
// Decoded: !status_matches=["pending"]
```

**Implementation Differences**:

**OpenFrontFinal2** (Simplified):
```typescript
const handleStatusChange = (status: string) => {
  const params = new URLSearchParams(searchParams.toString());
  if (status === "all") {
    params.delete("!status_matches");
  } else {
    params.set("!status_matches", JSON.stringify([status])); // String array
  }
  router.push(`${pathname}?${params.toString()}`);
};
```

**Dasher7** (Object-based):
```typescript
const handleStatusChange = (status: string) => {
  // Creates filter objects with label + value for better UX
  const filterValue = [{
    label: statusConfig[status].label,
    value: status,
  }];
  params.set("!status_matches", JSON.stringify(filterValue)); // Object array
};
```

**IMPLEMENTATION INCONSISTENCIES**:

**Orders StatusTabs** (`features/platform/orders/components/StatusTabs.tsx`):
- ✅ Has StatusIcon component with visual icons
- ❌ Hardcoded "All Orders" text (line 148)
- ✅ Complete statusConfig with icons (lines 8-34)

**Products StatusTabs** (`features/platform/products/components/StatusTabs.tsx`):
- ❌ NO StatusIcon component - missing visual icons
- ❌ Hardcoded "All Products" text (line 124)
- ❌ Incomplete statusConfig WITHOUT icons (lines 7-24)

**Result**: StatusTabs are inconsistent between entities and not reusable.

#### Details Components - Card-Based Display

**Philosophy**: Replace traditional table rows with rich, collapsible card components that provide more context and actions per item.

**OrderDetailsComponent Architecture** (`features/platform/orders/components/OrderDetailsComponent.tsx`):
- **Accordion Structure**: Radix UI Accordion for expand/collapse behavior  
- **Summary View**: Order number, customer, total, status badge, date
- **Expanded View**: Line items, shipping, customer details, order history
- **Action Integration**: MoreVertical menu + EditItemDrawer integration
- **Nested Components**: ProductDetailsCollapsible for line item rendering

**ProductDetailsComponent Architecture** (`features/platform/products/components/ProductDetailsComponent.tsx`):
- **Image Display**: Product thumbnail with fallback handling
- **Rich Metadata**: Variants, inventory levels, categories, collections
- **Collapsible Sections**: Variants list, organization tags, settings
- **Status Indicators**: Color-coded availability/status badges

**Key Pattern**: Details components are **completely self-contained** - they handle their own data display, interactions, and can be copied between projects with minimal adaptation.

### EditItemDrawer Integration

**Shared Component**: `features/platform/components/EditItemDrawer.tsx`
**Purpose**: Provide inline editing without page navigation for any platform entity

**Integration Pattern**:
```typescript
// In Details Component
<button onClick={() => setIsEditDrawerOpen(true)}>
  <MoreVertical className="h-4 w-4" />
</button>

<EditItemDrawer
  isOpen={isEditDrawerOpen}
  onClose={() => setIsEditDrawerOpen(false)}
  itemData={order}
  listConfig={list}
  onSave={handleSave}
/>
```

**Benefits**: 
- Reuses existing dashboard field validation logic
- Mobile-friendly drawer interface
- Real-time change detection and conflict resolution
- Server action integration with toast notifications

### Migration Implementation Steps

#### Step 1: Directory Structure Setup
```
features/platform/{entity}/
├── actions/
│   └── index.ts                     # Data fetching actions (copy from Dasher7)
├── components/
│   ├── {Entity}DetailsComponent.tsx # Card-based display component
│   └── StatusTabs.tsx              # Entity-specific status filtering
└── screens/
    ├── {Entity}ListPage.tsx        # Server component (search params + data)
    └── {Entity}ListPageClient.tsx  # Client component (UI + interactions)
```

#### Step 2: Action Migration Pattern

**CURRENT PROBLEM**: Orders and Products use completely different patterns:

**Orders** (`features/platform/orders/actions/index.ts` - 701 lines):
- ✅ Dedicated server actions: `getOrders()`, `getFilteredOrders()`, `getOrderStatusCounts()`
- ✅ Proper error handling and type safety
- ✅ Optimized GraphQL queries

**Products** (`features/platform/products/` - NO actions directory):
- ❌ Uses generic `getListItemsAction` utility
- ❌ Hardcoded GraphQL queries inline in components (lines 129-137 in ProductListPage.tsx)
- ❌ No dedicated status count functions

**Required**: Create consistent server actions pattern for all platform entities.

#### Step 3: Component Porting Strategy

**Direct Copy Candidates** (95% of components):
- UI components using only `@/components/ui` imports
- Self-contained logic with standard React hooks  
- Platform-specific business logic components

**Adaptation Required**:
- Components with hardcoded Dasher7 import paths
- Components using Dasher7-specific utility functions
- Components with different external API integrations

#### Step 4: StatusTabs Configuration
**Per Entity**: Define appropriate status enums and colors
```typescript
// Example: Order Status Configuration
const ORDER_STATUS_CONFIG = {
  pending: { label: "Pending", color: "yellow" },
  processing: { label: "Processing", color: "blue" },
  shipped: { label: "Shipped", color: "purple" },
  delivered: { label: "Delivered", color: "green" },
  cancelled: { label: "Cancelled", color: "red" }
};
```

#### Step 5: Details Component Design
**Design Principles**:
- **Summary + Details**: Collapsed view shows key info, expanded shows everything
- **Action Integration**: Edit button (MoreVertical) in every card
- **Visual Hierarchy**: Use typography, spacing, badges for information hierarchy
- **Mobile Responsive**: Cards work well on all screen sizes

### URL Parameter Specifications

**Standard Parameters Across All Platform Pages**:
- `page`: Pagination (integer, default: 1)
- `pageSize`: Items per page (integer, uses list.pageSize default)
- `search`: Search query (string, searches across entity-specific fields)
- `sortBy`: Sort field and direction (`field` for ASC, `-field` for DESC)
- `!{field}_matches`: Filter parameters (JSON-encoded arrays)

**Status Filtering Format**:
```typescript
// All items
/platform/orders

// Filtered by pending status  
/platform/orders?!status_matches=%5B%22pending%22%5D

// Multiple filters + search + sort
/platform/orders?search=john&sortBy=-createdAt&!status_matches=%5B%22pending%22%5D&page=2
```

### Component Compatibility Matrix

| Component Type | Direct Copy | Adaptation Level | Notes |
|---------------|-------------|------------------|-------|
| **UI Components** (`@/components/ui`) | ✅ | None | Perfect compatibility |
| **Platform Logic** (business rules) | ✅ | Import paths only | Core logic unchanged |
| **Actions** (data fetching) | ❌ | GraphQL schema | Query structure may differ |
| **StatusTabs** | ✅ | Status values/colors | Entity-specific configuration |
| **Details Components** | ✅ | Import paths | Self-contained display logic |
| **Server Components** | ✅ | Action imports | Minimal adaptation needed |
| **Client Components** | ✅ | Component imports | Standard React patterns |

### Benefits of This Migration Pattern

1. **Maximum Code Reuse**: 80-90% of Dasher7 UI components can be copied directly
2. **Consistent User Experience**: Platform pages integrate seamlessly with dashboard
3. **Maintainable Architecture**: Clear separation between server and client logic
4. **Scalable Pattern**: Same approach works for all 17 remaining platform entities  
5. **Dashboard Integration**: Leverages existing filtering, sorting, and field systems
6. **Enhanced UX**: StatusTabs and Details components provide better user experience than traditional table views

### Current State & REQUIRED Fixes

**Reality Check**: Orders and Products are **inconsistent implementations** that violate the documented pattern.

**IMMEDIATE REQUIRED FIXES** (Before any new migrations):

1. **🔴 CRITICAL: Fix PlatformFilterBar hardcoding**
   - Remove hardcoded `/platform/orders/create` path
   - Remove hardcoded "Create Order" text  
   - Implement dynamic list-based paths and text

2. **🔴 CRITICAL: Unify StatusTabs implementation**
   - Products missing StatusIcon component
   - Remove hardcoded "All Orders"/"All Products" text
   - Create consistent statusConfig pattern with icons

3. **🔴 CRITICAL: Create Products actions**
   - Build `features/platform/products/actions/index.ts`
   - Replace hardcoded GraphQL with proper server actions
   - Match Orders' action patterns exactly

4. **🟡 Standardize data fetching patterns**
   - Remove inline GraphQL from ProductListPage.tsx
   - Ensure both Orders and Products use identical patterns

5. **🟡 Fix layout inconsistencies**
   - Orders uses `grid grid-cols-1 divide-y`
   - Products uses `space-y-0`
   - Pick one and standardize

**DO NOT MIGRATE MORE PAGES** until these inconsistencies are fixed. The current implementations will create technical debt that multiplies with each new platform page.

**After Fixes**: The pattern will be ready for rapid migration of the remaining 17 platform pages with true consistency and reusability.

## Development Notes

- GraphQL endpoint available at `/api/graphql`
- Both dashboards share the same Keystone backend
- Use server actions for data mutations in dashboard components
- Field implementations follow KeystoneJS controller patterns
- Permission checks integrated throughout the UI layer