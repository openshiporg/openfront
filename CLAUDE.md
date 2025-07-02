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
   │   └── {Entity}DetailsComponent.tsx  # Card display (design for entity)
   └── screens/
       ├── {Entity}ListPage.tsx  # Server component (copy from products)
       └── {Entity}ListPageClient.tsx  # Client component (copy from products)
   ```

2. **StatusTabs Usage** (no wrapper files needed):
   ```typescript
   // In ListPageClient.tsx
   import { StatusTabs } from '../../components/StatusTabs';
   
   // Usage in component:
   <StatusTabs 
     statusCounts={statusCounts}
     statusConfig={{
       status1: { label: "Label", color: "blue" },
       status2: { label: "Label", color: "emerald" },
     }}
     entityName="EntityPlural"
   />
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
- **StatusTabs**: Use shared component directly, no wrapper files needed
- **Actions**: Follow exact response pattern `{ success, data: { items, count }, error }`
- **Layout**: Use `grid grid-cols-1 divide-y` for visual consistency
- **GraphQL Fields**: Copy working field selection from products actions

### 🚨 SCHEMA DIFFERENCES FROM DASHER7

**When copying from Dasher7, these fields DON'T EXIST in OpenFrontFinal2:**
- **Role.canManageSettings** - Remove this field from all queries and components
- Check all GraphQL fields against actual schema before using

**ListKey naming MUST use camelCase:**
- ✅ Correct: `productCollections`, `productCategories`, `giftCards`
- ❌ Wrong: `ProductCollection`, `product-categories`, `gift-cards`

**Common syntax errors to check:**
- Missing closing braces in JSX props
- Incomplete object literals in component props
- Always validate component syntax before testing

## 📊 PLATFORM PAGES STATUS (19 Total Entities)

### ✅ PRODUCTION READY - COMPLETE (19 entities)

**All platform pages now have complete implementations with:**
- ✅ Server/Client component architecture
- ✅ PlatformFilterBar integration  
- ✅ StatusTabs with proper filtering
- ✅ EditItemDrawer integration
- ✅ Collapsible content for related items
- ✅ Consistent UI patterns

**Core Platform Pages:**
- **Orders**: Complete with line items, returns, claims collapsible sections (blue) ✅
- **Products**: Complete with variants collapsible section (emerald) ✅  
- **Users**: Complete with orders collapsible section (purple) ✅
- **Inventory**: Complete with standard drawer pattern ✅
- **Regions**: Complete with custom regional settings and multiple drawers ✅

**Entity Management Pages:**
- **Claims**: Complete with EditItemDrawer integration ✅
- **Countries**: Complete with EditItemDrawer integration ✅
- **Currencies**: Complete with EditItemDrawer integration ✅
- **Discounts**: Complete with EditItemDrawer integration ✅
- **Gift Cards**: Complete with EditItemDrawer integration ✅
- **Payment Providers**: Complete with EditItemDrawer + StatusTabs ✅
- **Price Lists**: Complete with EditItemDrawer integration ✅
- **Product Categories**: Complete with products collapsible section (orange) + EditItemDrawer ✅
- **Product Collections**: Complete with products collapsible section (indigo) + EditItemDrawer ✅
- **Shipping Providers**: Complete with EditItemDrawer + StatusTabs ✅
- **Stores**: Complete with EditItemDrawer + StatusTabs ✅

**Specialized Pages:**
- **Analytics**: Advanced dashboard with charts ✅
- **System**: Tab-based settings consolidation ✅

### 📝 NOT PLATFORM PAGES (2 entities)

- **Onboarding**: Helper components only, not a list/detail page
- **Components**: Shared components directory

## ✅ RESOLVED - PlatformFilterBar Fixed

**File**: `/features/platform/components/PlatformFilterBar.tsx`
**Status**: ✅ **FIXED** - PlatformFilterBar now properly uses dynamic entity paths:

```typescript
// ✅ CORRECT - Dynamic entity
<Link href={`${basePath}/platform/${list.path}/create`}>
  <span className="hidden lg:inline">Create {list.singular}</span>
</Link>
```

**Resolution**: PlatformFilterBar properly implements dynamic entity paths and is working correctly for all platform pages.

## 🎯 IMPLEMENTATION COMPLETED ✅

### **✅ Phase 1: Critical Fix (COMPLETED)**
1. **✅ PlatformFilterBar fixed** - All platform pages now work with dynamic paths

### **✅ Phase 2: Drawer Integration (COMPLETED)**
All DetailsComponents now have EditItemDrawer integration:
```typescript
// ✅ IMPLEMENTED in all entities:
const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

// ✅ MoreVertical button onClick:
onClick={() => setIsEditDrawerOpen(true)}

// ✅ EditItemDrawerClientWrapper at component bottom:
<EditItemDrawerClientWrapper
  listKey="entityName"
  itemId={entity.id}
  open={isEditDrawerOpen}
  onClose={() => setIsEditDrawerOpen(false)}
/>
```

### **✅ Phase 3: StatusTabs Creation (COMPLETED)**
Created StatusTabs for all entities:
- ✅ Payment Providers StatusTabs (active, inactive, pending, configured)
- ✅ Shipping Providers StatusTabs (active, inactive, pending, configured)
- ✅ Stores StatusTabs (active, inactive, draft, published)

### **✅ Phase 4: Collapsible Content (COMPLETED)**
Enhanced DetailsComponents with related items:
- ✅ Products: Variants collapsible section (emerald color scheme)
- ✅ Product Categories: Products collapsible section (orange color scheme)
- ✅ Product Collections: Products collapsible section (indigo color scheme)
- ✅ Users: Orders collapsible section (purple color scheme)

## 🚀 FINAL STATUS

**Progress: 100% Complete (19/19 entities)**
- ✅ 19 entities: All platform pages are production ready
- ✅ 2 entities: Specialized implementations complete
- ✅ 2 entities: Non-platform page components

**Total work completed**: All platform pages brought to production standards with consistent UI patterns, EditItemDrawer integration, StatusTabs, and enhanced collapsible content sections.

## 🎨 Drawer-Based Creation Pattern (REQUIRED)

**IMPORTANT**: All platform pages (except Orders and Products) must use drawer-based creation instead of separate create pages.

### Why Drawers Instead of Pages?

- **Orders & Products**: Have dedicated ID pages due to complexity (exceptions)
- **All Other Entities**: Use CreateItemDrawer for inline creation
- **Consistent UX**: Edit (via MoreVertical menu) and Create both use drawers
- **Better Mobile Experience**: Drawers work well on all screen sizes

### Implementation Pattern

#### 1. **PlatformFilterBar with Custom Button**
```typescript
// In ListPageClient.tsx
const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

<PlatformFilterBar 
  list={list}
  customCreateButton={
    <Button 
      onClick={() => setIsCreateDrawerOpen(true)}
      variant="default"
      size="sm"
    >
      <Plus className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline">Create {list.singular}</span>
      <span className="lg:hidden">Create</span>
    </Button>
  }
/>
```

#### 2. **CreateItemDrawer Integration**
```typescript
// Import at top of file
import { CreateItemDrawer } from '@/features/platform/components/CreateItemDrawer';

// In component JSX (usually at bottom)
<CreateItemDrawer
  listKey={list.key}
  open={isCreateDrawerOpen}
  onClose={() => setIsCreateDrawerOpen(false)}
  onCreate={(newItem) => {
    // Option 1: Simple refresh
    window.location.reload();
    
    // Option 2: Optimistic update (if using SWR/React Query)
    // mutate();
    
    // Option 3: Show success toast
    // toast.success(`${list.singular} created successfully`);
  }}
/>
```

#### 3. **Complete Client Component Example**
```typescript
'use client';

import { useState } from 'react';
import { PlatformFilterBar } from '../../components/PlatformFilterBar';
import { CreateItemDrawer } from '@/features/platform/components/CreateItemDrawer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function EntityListPageClient({ list, initialData, statusCounts }) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  
  return (
    <>
      <PlatformFilterBar 
        list={list}
        customCreateButton={
          <Button onClick={() => setIsCreateDrawerOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Create {list.singular}</span>
            <span className="lg:hidden">Create</span>
          </Button>
        }
      />
      
      {/* Status tabs, content, etc. */}
      
      <CreateItemDrawer
        listKey={list.key}
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onCreate={() => window.location.reload()}
      />
    </>
  );
}
```

### ⚠️ Critical Drawer Pattern Rules

1. **NO Create Pages**: Don't create `/create` routes for entities (except Orders/Products)
2. **ListKey Format**: Must match exact Keystone schema naming (e.g., "User", "giftCards")
3. **Shared Component**: CreateItemDrawer is already implemented at `/features/platform/components/CreateItemDrawer`
4. **Auto Fields**: Drawer automatically generates form fields from Keystone schema
5. **Consistent Buttons**: Use same button styling as Orders/Products for visual consistency

### 📋 Entity-Specific Notes

| Entity | Create Method | Notes |
|--------|--------------|-------|
| **Orders** | Dedicated Page | `/platform/orders/create` (complex multi-step) |
| **Products** | Dedicated Page | `/platform/products/create` (variant management) |
| **Users** | CreateItemDrawer | Simple user fields ✅ |
| **Inventory** | CreateItemDrawer | Stock entry fields ✅ |
| **Regions** | Custom Drawer + CreateItemDrawer | Geographic fields + popular templates ✅ |
| **All Others** | CreateItemDrawer | Standard drawer pattern |

### 🔧 PlatformFilterBar Props

The PlatformFilterBar must be updated to support custom buttons:

```typescript
interface PlatformFilterBarProps {
  list: ListConfig;
  customCreateButton?: React.ReactNode;  // Custom button element
  createMode?: 'link' | 'custom';        // How to handle create action
  onCreateClick?: () => void;            // Callback for create clicks
}
```

When `customCreateButton` is provided, it replaces the default link-based create button.

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

### Migration Status ✅

**Successfully Implemented** (3/19 - **FULLY CONSISTENT**): 
- ✅ **Orders** (`features/platform/orders/`) - Complete, consistent implementation
- ✅ **Products** (`features/platform/products/`) - Complete, consistent implementation  
- ✅ **Users** (`features/platform/users/`) - Complete, consistent implementation

**Currently In Progress** (2/19):
- 🔄 **Inventory** (`features/platform/inventory/`) - Being built by Editor
- 🔄 **Regions** (`features/platform/regions/`) - Being built by Editor

**Remaining Platform Pages** (14):
Analytics, Claims, Collections, Countries, Currencies, Discounts, Gift Cards, Payment Providers, Price Lists, Product Categories, Returns, Settings, Shipping, Stores

**Current Strategy**: **ARCHITECTURE VALIDATED** - Pattern is proven and ready for rapid scaling to remaining entities.

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

#### Step 2: Server Actions Pattern ✅

**CONSISTENT IMPLEMENTATION**: All platform pages now use the same pattern:

**Orders** (`features/platform/orders/actions/index.ts`):
- ✅ Dedicated server actions: `getOrders()`, `getFilteredOrders()`, `getOrderStatusCounts()`
- ✅ Proper error handling and type safety
- ✅ Optimized GraphQL queries

**Products** (`features/platform/products/actions/index.ts`):
- ✅ Dedicated server actions: `getProducts()`, `getFilteredProducts()`, `getProductStatusCounts()`
- ✅ Proper error handling and type safety
- ✅ Optimized GraphQL queries

**Users** (`features/platform/users/actions/index.ts`):
- ✅ Dedicated server actions: `getUsers()`, `getFilteredUsers()`, `getUserStatusCounts()`
- ✅ Proper error handling and type safety  
- ✅ Optimized GraphQL queries

**Pattern Established**: Copy any of these action implementations for new platform entities.

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

### Current State ✅ VALIDATED

**Architecture Status**: Platform pages pattern is **battle-tested and production-ready**.

**Successfully Validated** (3 complete implementations):

1. **✅ Orders** - Complete with consistent server actions, StatusTabs, and detail components
2. **✅ Products** - Complete with consistent server actions, StatusTabs, and detail components  
3. **✅ Users** - Complete with consistent server actions, StatusTabs, and detail components

**Currently In Progress**:
- **🔄 Inventory** - Being built using proven pattern
- **🔄 Regions** - Being built using proven pattern

**Ready for Rapid Scaling**: The pattern supports immediate migration of the remaining 14 platform entities with true consistency and reusability.

## 🎨 DetailsComponent Pattern - Line Items UI

**Purpose**: Standardized UI pattern for displaying related items (variants, products, orders) within detail components using a collapsible, paginated interface similar to OrderDetailsComponent's line items.

### Core UI Structure

```
EntityDetailsComponent (Main Accordion Item)
└── EntitySectionTabs (Container for sections)
    └── RelatedItemsContent (Collapsible section with pagination)
        ├── CollapsibleTrigger (Colored button showing count)
        ├── ItemPagination (Inline pagination controls)
        └── Item Cards (Individual item display)
```

### Implementation Pattern

#### 1. **CollapsibleContent Component**
```typescript
// Standard structure for any related items section
<CollapsibleContent
  entityId={entity.id}
  totalItems={itemsCount}
  items={entity.relatedItems || []}
  renderItem={(item) => <ItemCard item={item} />}
  triggerLabel="Related Items"
  colorScheme="blue" // blue, emerald, purple, orange
/>
```

#### 2. **Color Scheme by Entity**
- **Orders/Line Items**: Blue (`blue-500`, `bg-blue-50/30`)
- **Products/Variants**: Emerald (`emerald-500`, `bg-emerald-50/30`)
- **Users/Orders**: Purple (`purple-500`, `bg-purple-50/30`)
- **Categories/Products**: Orange (`orange-500`, `bg-orange-50/30`)
- **Collections/Products**: Indigo (`indigo-500`, `bg-indigo-50/30`)

#### 3. **Trigger Button Styling**
```typescript
const triggerClassName = 
  "flex items-center rounded-sm shadow-sm uppercase tracking-wide border max-w-fit gap-2 text-nowrap pl-2.5 pr-1 py-[3px] text-sm font-medium text-{color}-500 bg-white border-{color}-200 hover:bg-{color}-100 hover:text-{color}-700 dark:bg-{color}-950 dark:border-{color}-900 dark:text-{color}-300";
```

#### 4. **Pagination Rules**
- Show pagination only when items > 5
- Display format: "Page X / Y"
- Inline with trigger button
- Items per page: 5 (hardcoded for consistency)

### Required Updates

#### 1. **ProductDetailsComponent** ✅ Fixed
- Show variants using emerald color scheme
- Display: SKU, inventory quantity, manage inventory status
- Pagination for > 5 variants

#### 2. **CollectionDetailsComponent** (NEW)
- Create new component to replace JSON display
- Show products using indigo color scheme
- Display: Product thumbnail, title, status, variants count

#### 3. **CategoryDetailsComponent**
- Update to use orange color scheme
- Show products with same layout as collections
- Add proper pagination

#### 4. **UserDetailsComponent**
- Add orders section using purple color scheme
- Display: Order number, total, status, line items count
- Integrate with existing user info

### Implementation Example

```typescript
// In ProductDetailsComponent.tsx
import { VariantsContent } from './VariantsContent';

<AccordionContent>
  <ProductSectionTabs productId={product.id}>
    <VariantsContent
      productId={product.id}
      totalItems={product.productVariants?.length || 0}
      variants={product.productVariants || []}
    />
  </ProductSectionTabs>
</AccordionContent>
```

### Key Features
1. **Consistent Layout**: All entities use same collapsible card pattern
2. **Visual Hierarchy**: Color coding by entity type
3. **Performance**: Pagination prevents UI overload
4. **Mobile Friendly**: Responsive flex layouts
5. **Expandable**: Sections start expanded, user can collapse

### GraphQL Requirements

Ensure all queries include necessary relationships:
```graphql
# Products must include
productVariants {
  id
  title
  sku
  inventoryQuantity
  manageInventory
}

# Categories/Collections must include
products {
  id
  title
  status
  thumbnail
  productVariants {
    id
  }
}

# Users must include
orders {
  id
  displayId
  email
  total
  status
  lineItems {
    id
  }
}
```

### Status Display
- ✅ **Fixed**: Product variants/stock count now shows correctly
- 🔄 **In Progress**: Implementing line items UI pattern across all detail components
- 📋 **TODO**: Collections need proper component instead of JSON
- 📋 **TODO**: Categories need products section
- 📋 **TODO**: Users need orders section

## Development Notes

- GraphQL endpoint available at `/api/graphql`
- Both dashboards share the same Keystone backend
- Use server actions for data mutations in dashboard components
- Field implementations follow KeystoneJS controller patterns
- Permission checks integrated throughout the UI layer