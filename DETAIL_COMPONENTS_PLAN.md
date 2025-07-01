# Detail Components Plan

## 🎯 Ready-to-Implement Detail Components

Based on the battle-tested OrderDetailsComponent and ProductDetailsComponent patterns, here are the complete specifications for all remaining platform entity detail components:

### 1. AnalyticsDetailsComponent

**Summary Header**:
- **Primary**: Metric name (link to detail page)
- **Secondary**: Time period, calculation method, last updated date
- **Metadata**: Current value, percentage change, trend direction
- **Status Badge**: `trending_up` (green), `trending_down` (red), `stable` (blue)

**Expanded Sections**:
- **Metric Details**: Chart visualization, data points, calculation formula
- **Historical Data**: Time series data with trend analysis
- **Related Metrics**: Connected analytics with correlation indicators

```typescript
interface Analytics {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  changePercentage: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  calculationMethod: string;
  updatedAt: string;
  chartData: Array<{
    date: string;
    value: number;
  }>;
  relatedMetrics: Array<{
    id: string;
    name: string;
    correlation: number;
  }>;
}
```

### 2. ClaimDetailsComponent

**Summary Header**:
- **Primary**: Claim ID with "CLAIM" badge (link to detail page)
- **Secondary**: Order reference link, creation date, claim type
- **Metadata**: Claimed amount, refund status, items count
- **Status Badge**: `pending` (yellow), `approved` (green), `rejected` (red), `resolved` (blue)

**Expanded Sections**:
- **Claim Information**: Type, amount, reason, customer message
- **Claimed Items**: Product cards with quantities and refund amounts
- **Resolution Details**: Admin notes, refund transactions, fulfillment updates

```typescript
interface Claim {
  id: string;
  displayId: string;
  type: 'replace' | 'refund';
  status: 'pending' | 'approved' | 'rejected' | 'resolved';
  claimedAmount: number;
  refundAmount?: number;
  createdAt: string;
  order: {
    id: string;
    displayId: string;
    user: { name: string; email: string };
  };
  claimItems: Array<{
    id: string;
    quantity: number;
    reason: string;
    note?: string;
    lineItem: {
      id: string;
      title: string;
      unitPrice: number;
      productVariant: {
        product: { title: string; thumbnail?: string };
      };
    };
  }>;
  currency: { code: string; symbol: string };
}
```

### 3. ReturnDetailsComponent

**Summary Header**:
- **Primary**: Return ID with "RETURN" badge (link to detail page)
- **Secondary**: Order reference link, creation date, return status
- **Metadata**: Return amount, shipping status, items count
- **Status Badge**: `requested` (yellow), `received` (blue), `completed` (green), `canceled` (red)

**Expanded Sections**:
- **Return Information**: Status, shipping details, return reason
- **Returned Items**: Product cards with condition notes and refund amounts
- **Processing Timeline**: Status updates, shipping tracking, refund processing

```typescript
interface Return {
  id: string;
  displayId: string;
  status: 'requested' | 'received' | 'completed' | 'canceled';
  returnAmount: number;
  refundAmount?: number;
  createdAt: string;
  receivedAt?: string;
  order: {
    id: string;
    displayId: string;
    user: { name: string; email: string };
  };
  returnItems: Array<{
    id: string;
    quantity: number;
    condition: 'new' | 'used' | 'damaged';
    note?: string;
    lineItem: {
      id: string;
      title: string;
      unitPrice: number;
      productVariant: {
        product: { title: string; thumbnail?: string };
      };
    };
  }>;
  shippingMethod?: {
    name: string;
    trackingNumber?: string;
  };
  currency: { code: string; symbol: string };
}
```

### 4. SystemDetailsComponent

**Summary Header**:
- **Primary**: Setting name with "SYSTEM" badge (link to detail page)
- **Secondary**: Setting category, last modified date, environment
- **Metadata**: Value type, scope, default value status
- **Status Badge**: `active` (green), `disabled` (zinc), `deprecated` (orange)

**Expanded Sections**:
- **Setting Information**: Description, value type, validation rules
- **Current Configuration**: Active value, environment overrides, inheritance
- **Change History**: Modification log with user attribution and timestamps

```typescript
interface SystemSetting {
  id: string;
  name: string;
  key: string;
  value: any;
  defaultValue: any;
  valueType: 'string' | 'number' | 'boolean' | 'json' | 'array';
  category: string;
  description?: string;
  scope: 'global' | 'tenant' | 'user';
  isActive: boolean;
  isDeprecated: boolean;
  updatedAt: string;
  updatedBy?: {
    id: string;
    name: string;
    email: string;
  };
  validationRules?: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  changeHistory: Array<{
    id: string;
    oldValue: any;
    newValue: any;
    changedAt: string;
    changedBy: { name: string; email: string };
    reason?: string;
  }>;
}
```

### 5. CollectionDetailsComponent ⭐ **ENHANCED VISUAL**

**Summary Header**:
- **Primary**: Collection title with "COLLECTION" badge (link to detail page)
- **Secondary**: Handle, creation date, visibility status
- **Metadata**: Products count, published status, featured status
- **Status Badge**: `published` (green), `draft` (zinc), `scheduled` (blue)

**Expanded Sections**:
- **Collection Information**: Description, SEO metadata, visibility settings
- **Products**: Enhanced product grid with thumbnails, prices, stock status
- **Collection Rules**: Automated inclusion rules, manual selections

```typescript
interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  products: Array<{
    id: string;
    title: string;
    handle: string;
    status: string;
    thumbnail?: string;
    price?: number;
    compareAtPrice?: number;
    inventoryQuantity?: number;
    productType?: { value: string };
  }>;
  collectionRules?: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  currency: { code: string; symbol: string };
}
```

### 6. CategoryDetailsComponent ⭐ **HIERARCHICAL DISPLAY**

**Summary Header**:
- **Primary**: Category name with hierarchy breadcrumb (link to detail page)
- **Secondary**: Handle, creation date, parent category
- **Metadata**: Products count, subcategories count, depth level
- **Status Badge**: `active` (green), `inactive` (zinc), `internal` (blue)

**Expanded Sections**:
- **Category Hierarchy**: Parent/child relationships with visual tree
- **Products**: Product grid with category-specific filters
- **Category Management**: Visibility settings, SEO configuration

```typescript
interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  description?: string;
  isActive: boolean;
  isInternal: boolean;
  rank: number;
  createdAt: string;
  parentCategory?: {
    id: string;
    name: string;
    handle: string;
  };
  categoryChildren: Array<{
    id: string;
    name: string;
    handle: string;
    productsCount: number;
    isActive: boolean;
  }>;
  products: Array<{
    id: string;
    title: string;
    handle: string;
    status: string;
    thumbnail?: string;
    inventoryQuantity?: number;
  }>;
  categoryPath: Array<{
    id: string;
    name: string;
    handle: string;
  }>;
}
```

### 7. ShippingDetailsComponent ⭐ **COMPREHENSIVE CONFIGURATION**

**Summary Header**:
- **Primary**: Shipping option name with region badge (link to detail page)
- **Secondary**: Provider name, creation date, price type
- **Metadata**: Price amount, requirements count, tax rates
- **Status Badge**: `active` (green), `disabled` (zinc), `admin_only` (orange)

**Expanded Sections**:
- **Shipping Configuration**: Price details, calculation method, provider settings
- **Requirements & Restrictions**: Order minimums, weight limits, geographic restrictions
- **Tax & Fulfillment**: Tax rates, fulfillment provider integration, tracking settings

```typescript
interface ShippingOption {
  id: string;
  name: string;
  priceType: 'flat_rate' | 'calculated';
  amount?: number;
  isReturn: boolean;
  adminOnly: boolean;
  isActive: boolean;
  createdAt: string;
  region: {
    id: string;
    name: string;
    currency: { code: string; symbol: string };
  };
  fulfillmentProvider: {
    id: string;
    name: string;
    isInstalled: boolean;
  };
  shippingProfile: {
    id: string;
    name: string;
    type: string;
  };
  requirements: Array<{
    type: 'min_subtotal' | 'max_subtotal' | 'weight' | 'dimensions';
    amount?: number;
    unit?: string;
  }>;
  taxRates: Array<{
    id: string;
    name: string;
    rate: number;
    region: { name: string };
  }>;
  metadata?: Record<string, any>;
}
```

### 8. InventoryDetailsComponent ⭐ **STOCK MANAGEMENT**

**Summary Header**:
- **Primary**: Product variant title with SKU (link to product)
- **Secondary**: Product name, last updated date, inventory policy
- **Metadata**: Current stock, reserved quantity, locations count
- **Status Badge**: `in_stock` (green), `low_stock` (yellow), `out_of_stock` (red), `discontinued` (zinc)

**Expanded Sections**:
- **Stock Levels**: Available, reserved, incoming with location breakdown
- **Inventory History**: Stock movements, adjustments, transfers
- **Location Management**: Warehouse-specific quantities, reorder points

```typescript
interface InventoryItem {
  id: string;
  sku: string;
  hsCode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  origin: {
    countryCode: string;
    province?: string;
  };
  midCode?: string;
  material?: string;
  updatedAt: string;
  productVariant: {
    id: string;
    title: string;
    inventoryQuantity: number;
    manageInventory: boolean;
    allowBackorder: boolean;
    product: {
      id: string;
      title: string;
      thumbnail?: string;
    };
  };
  inventoryLevels: Array<{
    id: string;
    stockedQuantity: number;
    reservedQuantity: number;
    incomingQuantity: number;
    salesChannel: {
      id: string;
      name: string;
      isActive: boolean;
    };
  }>;
  stockMovements: Array<{
    id: string;
    quantity: number;
    type: 'adjustment' | 'sale' | 'return' | 'transfer';
    createdAt: string;
    reason?: string;
    reference?: string;
  }>;
}
```

## Overview

This plan provides complete specifications for creating rich detail components for all platform entities. Each component follows the proven OrderDetailsComponent and ProductDetailsComponent patterns with entity-specific data and functionality.

## Reference Examples

### OrderDetailsComponent Pattern (Target Standard)
```typescript
// Accordion-based layout with rich content sections
<Accordion type="single" collapsible>
  <AccordionItem>
    {/* Summary header with key info + actions */}
    <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[120px]">
      <div className="flex items-start gap-4">
        {/* Primary content: customer, order number, date */}
        {/* Secondary content: status badges, metadata */}
      </div>
      <div className="flex flex-col justify-between h-full">
        {/* Action buttons: MoreVertical + AccordionTrigger */}
      </div>
    </div>
    <AccordionContent>
      {/* OrderSectionTabs with line items, returns, claims */}
      {/* Rich nested components for complex data */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### ProductDetailsComponent Pattern (Visual Focus)
```typescript
// Product-focused layout with image and organization
<div className="flex items-start gap-4">
  {/* Product image or fallback icon */}
  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 bg-muted rounded-lg">
    <Image src={imageUrl} alt={product.title} />
  </div>
  
  {/* Product information hierarchy */}
  <div className="flex flex-col items-start text-left gap-2">
    {/* Primary: title + date */}
    {/* Secondary: subtitle, handle */}
    {/* Metadata: variants, inventory, images */}
    {/* Organization: categories, collections as badges */}
  </div>
</div>
```

---

## Regional Settings Consolidation

### 1. RegionDetailsComponent

**Summary Header**:
- **Primary**: Region name (link to detail page)
- **Secondary**: Region code, creation date
- **Metadata**: Countries count, payment providers count, tax rate
- **Status Badge**: `active` (green) if countries assigned, `draft` (zinc) otherwise

**Expanded Sections**:
- **Region Overview**: Code, currency with symbol, tax configuration
- **Countries**: Badge list with country flags/names
- **Payment Providers**: Provider status with installation badges
- **Shipping Options**: Linked shipping configuration count

**Data Structure**:
```typescript
interface Region {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt?: string;
  taxRate: number;
  automaticTaxes: boolean;
  currency: {
    id: string;
    code: string;
    symbol: string;
    symbolNative: string;
  };
  countries: Array<{
    id: string;
    iso2: string;
    displayName: string;
    flagUrl?: string;
  }>;
  paymentProviders: Array<{
    id: string;
    name: string;
    code: string;
    isInstalled: boolean;
  }>;
  shippingOptionsCount: number;
}
```

**Key UI Elements**:
- Tax rate percentage badge (e.g., "20% TAX")
- Currency symbol prominent display
- Country flags in badge layout
- Payment provider status indicators

---

### 2. CountryDetailsComponent

**Summary Header**:
- **Primary**: Country display name (link to detail page)
- **Secondary**: ISO2 code (uppercase), creation date
- **Metadata**: Region assignment, ISO3 code, numeric code
- **Status Badge**: `assigned` (green) if in region, `unassigned` (zinc) otherwise

**Expanded Sections**:
- **Country Information**: ISO codes (monospace), numeric code
- **Regional Assignment**: Single region badge or "Unassigned" message
- **Geographic Data**: Full country name, any additional metadata

**Data Structure**:
```typescript
interface Country {
  id: string;
  displayName: string;
  name: string;
  iso2: string;
  iso3: string;
  numCode: number;
  createdAt: string;
  flagUrl?: string;
  region: {
    id: string;
    name: string;
    currency: { code: string; symbol: string };
  } | null;
}
```

**Key UI Elements**:
- Country flag icon (16x16 or 20x20)
- ISO codes in monospace font
- Regional assignment as clickable badge
- Numeric code display

---

### 3. CurrencyDetailsComponent

**Summary Header**:
- **Primary**: Currency name (link to detail page)
- **Secondary**: Currency code (uppercase), symbol, creation date
- **Metadata**: Regions using count, native symbol
- **Status Badge**: `active` (green) if used by regions, `unused` (zinc) otherwise

**Expanded Sections**:
- **Currency Details**: Large symbol display, native symbol, code
- **Usage Information**: Regions using this currency as badges
- **Exchange Rates**: If applicable, current rates or last updated

**Data Structure**:
```typescript
interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  symbolNative: string;
  createdAt: string;
  exchangeRate?: number;
  lastRateUpdate?: string;
  regions: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}
```

**Key UI Elements**:
- Large currency symbol display (2xl font)
- Code in monospace uppercase
- Region usage badges
- Exchange rate indicators if available

---

## Pricing & Promotions Consolidation

### 4. DiscountDetailsComponent ⭐ **COMPLEX COMPONENT**

**Summary Header**:
- **Primary**: Discount code (link to detail page)
- **Secondary**: Creation date, description preview
- **Metadata**: Usage count, discount value, date range, rule type
- **Status Badge**: `active` (green) if enabled and valid, `disabled` (zinc) otherwise

**Expanded Sections**:
- **Discount Information**: Type, value, description, validity period, usage limits
- **Orders Using Discount**: ScrollArea with order cards showing customer, total, date

**Data Structure**:
```typescript
interface Discount {
  id: string;
  code: string;
  description?: string;
  createdAt: string;
  isDisabled: boolean;
  usageCount: number;
  usageLimit?: number;
  startsAt?: string;
  endsAt?: string;
  discountRule: {
    id: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    description: string;
    allocation: 'total' | 'item';
  };
  orders: Array<{
    id: string;
    displayId: string;
    createdAt: string;
    status: string;
    total: number;
    currency: { code: string; symbol: string };
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}
```

**Key UI Elements**:
- Discount value formatting (percentage vs fixed amount)
- Usage progress bar (count / limit)
- Date range validity indicator
- Order cards with customer information

---

### 5. PriceListDetailsComponent

**Summary Header**:
- **Primary**: Price list name (link to detail page)
- **Secondary**: Creation date, description preview
- **Metadata**: Prices count, customer groups count, schedule
- **Status Badge**: `active` (green), `scheduled` (blue), `expired` (zinc)

**Expanded Sections**:
- **Price List Information**: Type, status, schedule, customer groups
- **Product Prices**: ScrollArea with pricing cards showing discounts, variants

**Data Structure**:
```typescript
interface PriceList {
  id: string;
  name: string;
  description?: string;
  type: 'sale' | 'override';
  status: 'active' | 'draft';
  createdAt: string;
  startsAt?: string;
  endsAt?: string;
  customerGroups: Array<{
    id: string;
    name: string;
  }>;
  moneyAmounts: Array<{
    id: string;
    amount: number;
    compareAmount?: number;
    minQuantity?: number;
    maxQuantity?: number;
    currency: { code: string; symbol: string };
    productVariant: {
      id: string;
      title: string;
      sku?: string;
      product: {
        id: string;
        title: string;
        thumbnail?: string;
      };
    };
  }>;
}
```

**Key UI Elements**:
- Schedule validity indicators
- Discount percentage calculations
- Customer group badges
- Product variant pricing with compare prices

---

### 6. GiftCardDetailsComponent

**Summary Header**:
- **Primary**: Gift card code (link to detail page)
- **Secondary**: Creation date, purchase order link
- **Metadata**: Balance, original value, transactions count, expiration
- **Status Badge**: `active` (green), `expired` (zinc), `disabled` (red)

**Expanded Sections**:
- **Gift Card Information**: Balance (large), original value, expiration, region
- **Transaction History**: ScrollArea with transaction cards showing order links

**Data Structure**:
```typescript
interface GiftCard {
  id: string;
  code: string;
  createdAt: string;
  isDisabled: boolean;
  balance: number;
  value: number;
  endsAt?: string;
  region: {
    id: string;
    name: string;
    currency: { code: string; symbol: string };
  };
  order?: {
    id: string;
    displayId: string;
  };
  giftCardTransactions: Array<{
    id: string;
    amount: number; // Positive for purchase, negative for use
    createdAt: string;
    order?: {
      id: string;
      displayId: string;
      status: string;
      total: number;
      user: { name: string; email: string };
    };
  }>;
}
```

**Key UI Elements**:
- Balance in large text with currency
- Transaction flow with +/- indicators
- Expiration countdown or status
- Purchase order linkage

---

## System Configuration Consolidation

### 7. StoreDetailsComponent

**Summary Header**:
- **Primary**: Store name with "Store" badge (link to detail page)
- **Secondary**: Default currency, creation date
- **Metadata**: Supported currencies count, region assignments
- **Status Badge**: `active` (green), `draft` (zinc)

**Expanded Sections**:
- **Store Information**: Name, default currency, link templates
- **Configuration**: Supported currencies, metadata, settings

**Data Structure**:
```typescript
interface Store {
  id: string;
  name: string;
  defaultCurrencyCode: string;
  createdAt: string;
  updatedAt?: string;
  swapLinkTemplate?: string;
  paymentLinkTemplate?: string;
  inviteLinkTemplate?: string;
  metadata?: Record<string, any>;
  currencies: Array<{
    id: string;
    code: string;
    symbol: string;
  }>;
  regions?: Array<{
    id: string;
    name: string;
  }>;
}
```

**Key UI Elements**:
- Store icon in colored circle
- Currency badges for supported currencies
- Link template configuration display
- JSON metadata in code blocks

---

### 8. PaymentProviderDetailsComponent ⭐ **TABBED INTERFACE**

**Summary Header**:
- **Primary**: Provider name with icon (link to detail page)
- **Secondary**: Provider code, installation status
- **Metadata**: Regions enabled, sessions count, functions configured
- **Status Badge**: `installed` (green), `available` (blue), `disabled` (zinc)

**Expanded Sections** (Tabs):
- **Overview**: Stats, enabled regions, adapter functions
- **Configuration**: Settings, credentials (masked), metadata
- **Sessions**: Payment session history
- **Webhooks**: Webhook configuration

**Data Structure**:
```typescript
interface PaymentProvider {
  id: string;
  name: string;
  code: string;
  isInstalled: boolean;
  createdAt: string;
  credentials?: Record<string, any>;
  metadata?: Record<string, any>;
  // Function availability
  createPaymentFunction?: string;
  capturePaymentFunction?: string;
  refundPaymentFunction?: string;
  getPaymentStatusFunction?: string;
  generatePaymentLinkFunction?: string;
  handleWebhookFunction?: string;
  
  regions: Array<{
    id: string;
    name: string;
    currency: { code: string; symbol: string };
  }>;
  
  sessions: Array<{
    id: string;
    status: string;
    amount: number;
    currency: { code: string; symbol: string };
    createdAt: string;
  }>;
}
```

**Key UI Elements**:
- Provider logo/icon display
- Installation toggle with confirmation
- Function availability indicators
- Credential masking for security
- Session volume statistics

---

## Standalone Entities

### 9. CollectionDetailsComponent

**Summary Header**:
- **Primary**: Collection title (link to detail page)
- **Secondary**: Handle, creation date
- **Metadata**: Products count, status
- **Status Badge**: Static "COLLECTION" badge

**Expanded Sections**:
- **Collection Information**: Title, handle, metadata
- **Products**: Product grid with thumbnails, titles, status

**Data Structure**:
```typescript
interface Collection {
  id: string;
  title: string;
  handle: string;
  createdAt: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
  products: Array<{
    id: string;
    title: string;
    handle: string;
    status: string;
    thumbnail?: string;
    productType?: { value: string };
    productVariants?: Array<{
      title: string;
      sku?: string;
      inventoryQuantity?: number;
    }>;
  }>;
}
```

**Key UI Elements**:
- Product thumbnails in grid layout
- Handle display in monospace
- Product count badge
- Status indicators for products

---

### 10. CategoryDetailsComponent

**Summary Header**:
- **Primary**: Category name (link to detail page)
- **Secondary**: Handle, creation date
- **Metadata**: Products count, subcategories count, parent category
- **Status Badge**: `active` (green) if has products, `empty` (zinc) otherwise

**Expanded Sections**:
- **Category Information**: Name, handle, description, hierarchy
- **Products**: Product grid similar to collections
- **Subcategories**: Nested category badges if applicable

**Data Structure**:
```typescript
interface ProductCategory {
  id: string;
  name: string;
  handle: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  isInternal: boolean;
  isActive: boolean;
  parentCategory?: {
    id: string;
    name: string;
    handle: string;
  };
  categoryChildren: Array<{
    id: string;
    name: string;
    handle: string;
    productsCount: number;
  }>;
  products: Array<{
    id: string;
    title: string;
    handle: string;
    status: string;
    thumbnail?: string;
  }>;
}
```

**Key UI Elements**:
- Hierarchical breadcrumb for parent categories
- Subcategory badges with product counts
- Internal/public status indicators
- Product grid layout

---

### 11. ShippingDetailsComponent ⭐ **MOST COMPREHENSIVE**

**Summary Header**:
- **Primary**: Region name with shipping badge (link to detail page)
- **Secondary**: Region code, creation date
- **Metadata**: Shipping options count, providers count, countries served
- **Status Badge**: `configured` (green), `partial` (yellow), `unconfigured` (zinc)

**Expanded Sections**:
- **Region Overview**: Code, currency, countries served
- **Shipping Options**: Detailed option cards with pricing, requirements
- **Fulfillment Providers**: Provider configuration and status

**Data Structure**:
```typescript
interface ShippingConfiguration {
  region: {
    id: string;
    name: string;
    code: string;
    createdAt: string;
    currency: { code: string; symbol: string };
    countries: Array<{ id: string; iso2: string; displayName: string }>;
  };
  
  shippingOptions: Array<{
    id: string;
    name: string;
    priceType: 'flat_rate' | 'calculated';
    amount?: number;
    isReturn: boolean;
    adminOnly: boolean;
    fulfillmentProvider: {
      id: string;
      name: string;
      isInstalled: boolean;
    };
    shippingProfile: { name: string };
    requirements: Array<{
      type: 'min_subtotal' | 'max_subtotal';
      amount: number;
    }>;
    taxRates: Array<{
      name: string;
      rate: number;
    }>;
  }>;
  
  fulfillmentProviders: Array<{
    id: string;
    name: string;
    code: string;
    isInstalled: boolean;
    credentials?: Record<string, any>;
    shippingProviders: Array<{
      id: string;
      name: string;
      isActive: boolean;
    }>;
  }>;
}
```

**Key UI Elements**:
- Shipping option pricing with currency formatting
- Provider installation status
- Tax rate percentages
- Requirements validation indicators

---

### 12. InventoryDetailsComponent

**Summary Header**:
- **Primary**: Product variant title (link to product)
- **Secondary**: SKU, last updated date
- **Metadata**: Current stock, reserved quantity, incoming stock
- **Status Badge**: `in_stock` (green), `low_stock` (yellow), `out_of_stock` (red)

**Expanded Sections**:
- **Inventory Levels**: Available, reserved, incoming with location breakdown
- **Stock Movements**: Recent inventory transactions
- **Locations**: Warehouse/location-specific stock levels

**Data Structure**:
```typescript
interface InventoryItem {
  id: string;
  sku: string;
  updatedAt: string;
  quantity: number;
  reservedQuantity: number;
  incomingQuantity?: number;
  locationLevels: Array<{
    location: {
      id: string;
      name: string;
      type: 'warehouse' | 'store' | 'dropship';
    };
    stockedQuantity: number;
    reservedQuantity: number;
    incomingQuantity: number;
  }>;
  productVariant: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      thumbnail?: string;
    };
  };
}
```

**Key UI Elements**:
- Stock level progress bars
- Location breakdown badges
- Movement history timeline
- Alert indicators for low stock

---

### 13. UserDetailsComponent (Enhanced)

**Summary Header**:
- **Primary**: User name (link to detail page)
- **Secondary**: Email, registration date
- **Metadata**: Orders count, total spent, last order date
- **Status Badge**: `active` (green), `inactive` (zinc), `banned` (red)

**Expanded Sections**:
- **User Information**: Contact details, preferences, addresses
- **Order History**: Recent orders with totals and status
- **Customer Metrics**: Lifetime value, average order, frequency

**Data Structure**:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  
  // Customer metrics
  ordersCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt?: string;
  
  // Profile information
  billingAddress?: Address;
  shippingAddresses: Array<Address>;
  
  // Recent orders
  orders: Array<{
    id: string;
    displayId: string;
    createdAt: string;
    status: string;
    total: number;
    currency: { code: string; symbol: string };
  }>;
}
```

**Key UI Elements**:
- Customer lifetime value display
- Order frequency indicators
- Address management cards
- Spending pattern visualization

---

## Implementation Guidelines

### Universal Component Structure

```typescript
interface DetailComponentProps<T> {
  entity: T;
  list: any; // List configuration for EditItemDrawer
  loadingActions?: Record<string, Record<string, boolean>>;
  removeEditItemButton?: boolean;
  renderButtons?: () => React.ReactNode;
}

export function EntityDetailsComponent<T>({ 
  entity, 
  list, 
  loadingActions = {},
  removeEditItemButton,
  renderButtons 
}: DetailComponentProps<T>) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  
  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={entity.id} className="border-0">
          {/* Summary header with universal layout */}
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[120px]">
            {/* Entity-specific content */}
          </div>
          
          <AccordionContent className="pb-0">
            {/* Entity-specific expanded sections */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawer
        listKey={list.key}
        itemId={entity.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
```

### Universal Action Pattern

```typescript
// Consistent dropdown menu for all entities
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="secondary" size="icon" className="border [&_svg]:size-3 h-6 w-6">
      <MoreVertical className="stroke-muted-foreground" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => setIsEditDrawerOpen(true)}>
      <Edit className="w-4 h-4 mr-2" />
      Edit {entityName}
    </DropdownMenuItem>
    {/* Entity-specific actions */}
    <DropdownMenuItem onClick={handleDuplicate}>
      <Copy className="w-4 h-4 mr-2" />
      Duplicate
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
      <Trash className="w-4 h-4 mr-2" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Status Badge Helper

```typescript
const getStatusBadgeProps = (entity: any, entityType: string) => {
  switch (entityType) {
    case 'region':
      return entity.countries?.length > 0 
        ? { color: 'emerald', text: 'ACTIVE' }
        : { color: 'zinc', text: 'DRAFT' };
    
    case 'discount':
      return entity.isDisabled || (entity.endsAt && new Date(entity.endsAt) < new Date())
        ? { color: 'zinc', text: 'DISABLED' }
        : { color: 'emerald', text: 'ACTIVE' };
    
    case 'giftCard':
      return entity.isDisabled
        ? { color: 'destructive', text: 'DISABLED' }
        : entity.balance <= 0
        ? { color: 'zinc', text: 'DEPLETED' }
        : { color: 'emerald', text: 'ACTIVE' };
    
    // Add more entity types as needed
    default:
      return { color: 'zinc', text: 'UNKNOWN' };
  }
};
```

### Formatting Helpers

```typescript
// Currency formatting with region support
const formatCurrency = (amount: number, currency: { code: string; symbol: string }) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
  }).format(amount);
};

// Date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Percentage formatting
const formatPercentage = (value: number) => {
  return `${value}%`;
};

// Count formatting with pluralization
const formatCount = (count: number, singular: string, plural?: string) => {
  const noun = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${noun}`;
};
```

This comprehensive plan provides all the data structures, UI patterns, and implementation guidelines needed to create rich, consistent detail components for every platform entity. Each component follows the proven patterns from OrderDetailsComponent and ProductDetailsComponent while showcasing entity-specific information in an intuitive, actionable interface.