# Unified Regions Management Page Design

## Overview
This document outlines the design for a unified page that consolidates the management of regions, currencies, countries, and shipping configurations - replacing the current fragmented approach with a cohesive interface similar to the onboarding experience.

## Current State Analysis

### Existing Navigation Structure
- **Regions** (`/platform/regions`) - Manage regions, countries, currencies, and tax configurations
- **Countries** (`/platform/countries`) - Manage country configurations and settings  
- **Currencies** (`/platform/currencies`) - Manage currency configurations and exchange rates
- **Shipping** (`/platform/shipping`) - Currently shows shipping providers (duplicate of shipping-providers)
- **Shipping Providers** (`/platform/shipping-providers`) - Manage shipping provider configurations

### Onboarding Pattern
The onboarding process demonstrates the interconnected nature of these models:
```json
{
  "regions": [
    {
      "code": "na",
      "name": "North America", 
      "currencyCode": "usd",
      "currencySymbol": "$",
      "currencyName": "US Dollar",
      "taxRate": 0.05,
      "paymentProviders": { "connect": [...] },
      "fulfillmentProviders": { "connect": [...] },
      "countries": [
        { "iso2": "us", "name": "United States" },
        { "iso2": "ca", "name": "Canada" }
      ]
    }
  ]
}
```

## Proposed Unified Page Design

### Page Structure: `/platform/regions-management`

#### 1. Page Container with Breadcrumbs
Following the existing `PageContainer` pattern:
```
┌─────────────────────────────────────────────────────────────┐
│ ☰ Dashboard > Platform > Regions                           │
│ ─────────────────────────────────────────────────────────── │
│ Regions & Market Configuration                              │
│ Manage your global markets, currencies, and shipping setup  │
└─────────────────────────────────────────────────────────────┘
```

#### 2. Platform Filter Bar
Following the existing `PlatformFilterBar` pattern from other platform pages:
```
┌─────────────────────────────────────────────────────────────┐
│ [🔍 Search regions...]  [🎚️ Filters] [↕️ Sort] [+ New Region] │
│ ─────────────────────────────────────────────────────────── │
│ [All] [Active] [Inactive] [🔄 Clear filters]                │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Status Tabs
Following the existing `StatusTabs` pattern (like Users, Orders, etc.):
```
┌─────────────────────────────────────────────────────────────┐
│ All (4)    Active (3)    Inactive (1)                      │
└─────────────────────────────────────────────────────────────┘
```

#### 4. Regions List with Detail Components
Following the existing platform pattern with accordion-style detail components:
```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ North America (na)                             [⋮] [▼] │ │
│ │ 🇺🇸 🇨🇦 • USD ($) • 2 countries • 3 providers         │ │
│ │ Created Jan 15, 2024 • Tax Rate: 5%                   │ │
│ │ [🟢 ACTIVE]                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Europe (eu)                                    [⋮] [▼] │ │
│ │ 🇩🇪 🇫🇷 🇪🇸 🇮🇹 • EUR (€) • 4 countries • 3 providers  │ │
│ │ Created Jan 15, 2024 • Tax Rate: 21%                  │ │
│ │ [🟢 ACTIVE]                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ United Kingdom (uk)                            [⋮] [▼] │ │
│ │ 🇬🇧 • GBP (£) • 1 country • 2 providers               │ │
│ │ Created Jan 15, 2024 • Tax Rate: 20%                  │ │
│ │ [🟢 ACTIVE]                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Note**: Following the existing platform pattern (like `UserDetailsComponent`, `OrderDetailsComponent`, etc.), each region row includes:
- **Vertical ellipsis (⋮) menu**: Opens a custom `RegionEditDrawer` (not the standard `EditItemDrawerClientWrapper`)
- **Accordion trigger (▼)**: Expands to show detailed region information
- **Badge status**: Shows region status like other platform components

**Create Region**: The [+ New Region] button in the `PlatformFilterBar` opens a custom `RegionCreateDrawer` following the same pattern as `CreateItemDrawerClientWrapper`.

#### 5. Expandable Region Detail View
Following the existing `AccordionContent` pattern from detail components:

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ North America (na)                                   [⋮] │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ CURRENCY CONFIGURATION                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Currency: USD ($) - US Dollar                           │ │
│ │ Tax Rate: 5%                                           │ │
│ │ Exchange Rate: 1.0 (Base Currency)                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ COUNTRIES                                                   │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🇺🇸 United States (US) • ISO: 840                      │ │
│ │ 🇨🇦 Canada (CA) • ISO: 124                             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ PAYMENT PROVIDERS                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ Stripe (pp_stripe_stripe)                            │ │
│ │ ✓ PayPal (pp_paypal_paypal)                            │ │
│ │ ✓ Manual Payment (pp_system_default)                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ SHIPPING & FULFILLMENT                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Manual Fulfillment (fp_manual)                         │ │
│ │ Standard processing times apply                        │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Note**: Following the existing `AccordionContent` pattern, the expanded view shows comprehensive region information in a collapsible format, similar to how `UserDetailsComponent` shows order details or `GiftCardDetailsComponent` shows transaction details.

#### 6. Pagination
Following the existing `Pagination` component pattern:
```
┌─────────────────────────────────────────────────────────────┐
│ Showing 1-10 of 3 regions                                  │
│ [←] [1] [2] [3] [→]                                        │
└─────────────────────────────────────────────────────────────┘
```

#### 7. Custom Drawers
Following the existing drawer patterns but with specialized content:

**RegionCreateDrawer** (similar to `CreateItemDrawerClientWrapper` but custom):
```
┌─────────────────────────────────────────────────────────────┐
│ [×] Create Region                                           │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ BASIC INFORMATION                                           │
│ Name: [North America                    ]                   │
│ Code: [na                               ]                   │
│ Tax Rate: [5%                           ]                   │
│                                                             │
│ CURRENCY                                                    │
│ Currency: [USD - US Dollar           ▼]                     │
│ Symbol: [$                              ]                   │
│                                                             │
│ COUNTRIES                                                   │
│ [☑] United States                                          │
│ [☑] Canada                                                 │
│ [☐] Mexico                                                 │
│                                                             │
│ PAYMENT PROVIDERS                                           │
│ [☑] Stripe                                                 │
│ [☑] PayPal                                                 │
│ [☑] Manual Payment                                         │
│                                                             │
│ SHIPPING PROVIDERS                                          │
│ [☑] Manual Fulfillment                                     │
│                                                             │
│ [Cancel] [Create Region]                                    │
└─────────────────────────────────────────────────────────────┘
```

**RegionEditDrawer** (similar to `EditItemDrawerClientWrapper` but custom):
- Same structure as create drawer but pre-populated with existing region data
- Additional options for managing existing relationships

## Key Features

### 1. Hierarchical Data Management
- **Region as Master**: Regions are the top-level container
- **Currency Assignment**: Each region has exactly one currency
- **Country Assignment**: Countries can belong to multiple regions
- **Provider Configuration**: Payment and shipping providers per region

### 2. Custom Edit/Create Drawers
- **Specialized Region Drawer**: Custom drawer for editing regions (not the standard EditItemDrawer)
- **Comprehensive Region Form**: Shows region details, countries, currencies, and shipping configuration
- **Create Region Drawer**: Custom drawer for creating new regions with all related models
- **Consistent UX**: Follows existing platform pattern with vertical ellipsis (⋮) menu

### 3. Smart Defaults and Validation
- Currency validation per region
- Country-currency compatibility checks
- Shipping provider availability per region
- Tax rate inheritance and overrides

## Implementation Strategy

### Phase 1: Core Region Management
1. Create unified region list page
2. Build custom region create/edit drawers (not standard EditItemDrawer)
3. Implement comprehensive region form with countries, currencies, and shipping
4. Add vertical ellipsis (⋮) menu integration

### Phase 2: Advanced Features
1. Implement shipping rules management within drawers
2. Add currency exchange rate tracking
3. Create enhanced validation and error handling
4. Add mobile-responsive design for drawers

### Phase 3: Enhancements
1. Add visual relationship indicators
2. Implement advanced region configuration options
3. Add analytics and reporting
4. Create region templates and presets

## Technical Considerations

### Data Model Integration
- Leverage existing Region, Country, Currency, and ShippingProvider models
- Maintain backward compatibility with current implementations
- Use GraphQL relationships for efficient data fetching

### UI Components
- **Reuse existing components**:
  - `PageContainer` with breadcrumbs
  - `PlatformFilterBar` with search, filters, and sort
  - `StatusTabs` for region status filtering
  - `Pagination` for navigation
  - `Accordion` and `AccordionContent` for expandable details
  - `Badge` components for status indicators
  - `Button` with `MoreVertical` icon for ellipsis menu
  - `Drawer`, `DrawerContent`, `DrawerHeader` for custom drawers
  
- **Create custom components**:
  - `RegionCreateDrawer` (custom, not standard `CreateItemDrawerClientWrapper`)
  - `RegionEditDrawer` (custom, not standard `EditItemDrawerClientWrapper`)
  - `RegionDetailsComponent` (similar to `UserDetailsComponent` pattern)
  - `RegionListPageClient` (similar to `UserListPageClient` pattern)
  - `RegionStatusTabs` (similar to `StatusTabs` pattern)
  
- **Build specialized forms**:
  - Multi-section region forms with countries, currencies, and shipping
  - Checkbox lists for country and provider selection
  - Currency selector with symbol display
  - Validation for region-currency-country relationships

### Performance
- Implement lazy loading for region details
- Use optimistic updates for quick interactions
- Cache frequently accessed data (countries, currencies)

## Benefits

### For Users
- **Single Source of Truth**: All related configuration in one place
- **Reduced Complexity**: No need to navigate between multiple pages
- **Consistent UX**: Familiar vertical ellipsis (⋮) menu pattern from other platform pages
- **Comprehensive Editing**: Edit all region aspects in one specialized drawer

### For Developers
- **Maintainability**: Consolidated logic in one place
- **Consistency**: Unified patterns across all related models
- **Scalability**: Easy to add new regions or modify existing ones
- **Reduced Duplication**: Eliminates redundant pages and components

## Navigation Update

Replace current navigation items:
```javascript
// Remove these separate items
{ title: 'Regions', href: '/platform/regions' },
{ title: 'Countries', href: '/platform/countries' }, 
{ title: 'Currencies', href: '/platform/currencies' },
{ title: 'Shipping', href: '/platform/shipping' },

// Replace with unified item
{ 
  title: 'Regions & Markets', 
  href: '/platform/regions-management',
  description: 'Manage regions, currencies, countries, and shipping in one place'
}
```

This unified approach mirrors the onboarding experience while providing comprehensive management capabilities for ongoing operations.