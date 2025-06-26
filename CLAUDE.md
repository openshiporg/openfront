# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

**Purpose**: This pattern enables migration of Dasher 7 platform pages to OpenFrontFinal2 while maintaining existing dashboard functionality.

### Architecture Pattern
Platform pages use the **Dashboard Extension Pattern**:
- **Base Structure**: Uses OpenFrontFinal2's dashboard list page as foundation
- **Specialized Components**: Replaces field selection with platform-specific UI components
- **Enhanced Filtering**: Abstracts common filters (like status) into dedicated tab components
- **Component Reuse**: Most UI components can be copied directly if they don't use external utilities

### Key Components

#### PlatformFilterBar
- **Based on**: Dashboard FilterBar but without field selection
- **Features**: Search, sorting, filtering, custom create button via render prop
- **Usage**: `<PlatformFilterBar list={list} customCreateButton={<CustomButton />} />`

#### StatusTabs
- **Purpose**: Abstract status filtering into visual tabs with counts
- **Integration**: Changes URL parameters exactly like dashboard filtering
- **Benefits**: Better UX for status-based filtering, shows counts per status

#### List Page Structure
```
OrderListPage (Server Component)
├── Parse search params (status, search, pagination, sort)
├── Fetch data using platform actions
├── Get status counts for tabs
└── Pass to OrderListPageClient

OrderListPageClient (Client Component)
├── PlatformFilterBar (search, sort, create)
├── StatusTabs (status filtering with counts)
└── OrderDetailsComponent (renders each order)
```

### Migration Steps

1. **Copy Dashboard List Pages**:
   - Use `ListPage/index.tsx` as server component template
   - Use `ListPageClient.tsx` as client component template
   - Adapt imports and list key ("orders" vs dynamic)

2. **Create Platform-Specific Actions**:
   - Copy action patterns from Dasher 7
   - Adapt GraphQL queries to match OpenFrontFinal2 schema
   - Maintain same function signatures for compatibility

3. **Port UI Components**:
   - Copy components directly if they don't use external utilities
   - Adapt import paths to OpenFrontFinal2 structure
   - Components that can be copied as-is: OrderDetailsComponent, ProductDetailsCollapsible, etc.

4. **Integrate Platform Components**:
   - Replace Dashboard FilterBar with PlatformFilterBar
   - Add StatusTabs for status-based filtering
   - Use custom create buttons (like OrderCreateButton)

### Component Compatibility

**Can Copy Directly**:
- UI components using only @/components/ui
- Components with self-contained logic
- Components using standard React hooks

**Require Adaptation**:
- Components using Dasher 7-specific utilities
- Components with hardcoded import paths
- Components using external APIs that differ between projects

### Benefits

- **Maintains Dashboard Functionality**: Core dashboard remains unchanged
- **Code Reuse**: Maximum reuse of existing Dasher 7 UI components
- **Consistent UX**: Platform pages feel integrated with dashboard
- **Scalable**: Pattern can be applied to other platform pages (products, customers, etc.)

## Development Notes

- GraphQL endpoint available at `/api/graphql`
- Both dashboards share the same Keystone backend
- Use server actions for data mutations in dashboard components
- Field implementations follow KeystoneJS controller patterns
- Permission checks integrated throughout the UI layer