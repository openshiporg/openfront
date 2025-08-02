# Openfront Final 2 Platform Architecture

## Overview

Openfront Final 2 is a comprehensive, enterprise-grade e-commerce platform built with Next.js 15 and KeystoneJS 6. It provides a complete commerce solution with advanced features including multi-regional support, sophisticated payment and shipping integrations, analytics, gift cards, claims processing, and comprehensive order management.

## Core Architecture

### Data Layer (KeystoneJS 6)
- **78+ Data Models** covering every aspect of e-commerce operations
- **GraphQL API** with comprehensive mutations and queries  
- **Advanced Access Control** with role-based permissions
- **Virtual Fields** for computed data and complex business logic
- **Event System** for order tracking and audit trails

### Application Layer (Next.js 15)
- **Platform Admin** - Comprehensive back-office management interface
- **Storefront** - Modern customer-facing e-commerce experience  
- **API Layer** - GraphQL and REST endpoints for integrations
- **Integration System** - Payment and shipping provider adapters

## KeystoneJS Schema (78+ Models)

### Core Commerce Models

#### Product Management
```typescript
Product {
  title: string
  description: document
  handle: string (unique)
  subtitle: string
  isGiftcard: boolean
  status: "draft" | "proposed" | "published" | "rejected"
  metadata: json
  discountable: boolean
  externalId: string
  
  // Virtual fields for computed data
  thumbnail: virtual (first product image)
  dimensionsRange: virtual (min/max dimensions from variants)
  defaultDimensions: virtual (dimensions from first variant)
  
  // Relationships
  productCollections: [→ ProductCollection]
  productCategories: [→ ProductCategory] 
  shippingProfile: → ShippingProfile
  productType: → ProductType
  productImages: [→ ProductImage]
  productOptions: [→ ProductOption]
  productTags: [→ ProductTag]
  productVariants: [→ ProductVariant]
  taxRates: [→ TaxRate]
  discountConditions: [→ DiscountCondition]
  discountRules: [→ DiscountRule]
}
```

#### Product Variants & Options
```typescript
ProductVariant {
  title: string
  sku: string (unique)
  barcode: string
  ean: string
  upc: string
  inventoryQuantity: integer
  allowBackorder: boolean
  manageInventory: boolean
  weight: integer
  length: integer
  height: integer
  width: integer
  originCountry: string
  metadata: json
  
  product: → Product
  measurements: [→ Measurement]
  moneyAmounts: [→ MoneyAmount]
  optionValues: [→ ProductOptionValue]
  lineItems: [→ OrderLineItem]
  stockMovements: [→ StockMovement]
}

ProductOption {
  title: string
  
  product: → Product
  values: [→ ProductOptionValue]
}

ProductOptionValue {
  value: string
  
  option: → ProductOption
  variant: → ProductVariant
}
```

#### Order Management
```typescript
Order {
  status: "pending" | "completed" | "archived" | "canceled" | "requires_action"
  displayId: integer (unique)
  email: string
  taxRate: float
  canceledAt: timestamp
  metadata: json
  idempotencyKey: string
  noNotification: boolean
  externalId: string
  secretKey: string (auto-generated)
  note: text
  
  // Virtual fields for computed totals
  subtotal: virtual (formatted currency)
  shipping: virtual (formatted currency)
  discount: virtual (formatted currency) 
  tax: virtual (formatted currency)
  total: virtual (formatted currency)
  rawTotal: virtual (integer amount)
  
  // Virtual fields for order analysis
  fulfillmentDetails: virtual (fulfillment history)
  unfulfilled: virtual (remaining items to fulfill)
  fulfillmentStatus: virtual (fulfillment progress)
  paymentDetails: virtual (payment information)
  totalPaid: virtual (amount paid)
  formattedTotalPaid: virtual (formatted paid amount)
  
  // Relationships
  shippingAddress: → Address
  billingAddress: → Address
  currency: → Currency
  draftOrder: → DraftOrder
  cart: → Cart
  user: → User
  region: → Region
  claimOrders: [→ ClaimOrder]
  fulfillments: [→ Fulfillment]
  giftCards: [→ GiftCard]
  giftCardTransactions: [→ GiftCardTransaction]
  lineItems: [→ OrderLineItem]
  discounts: [→ Discount]
  payments: [→ Payment]
  returns: [→ Return]
  shippingMethods: [→ ShippingMethod]
  swaps: [→ Swap]
  events: [→ OrderEvent]
  shippingLabels: [→ ShippingLabel]
}
```

#### Order Line Items
```typescript
OrderLineItem {
  title: string
  description: text
  thumbnail: text
  isReturn: boolean
  isGiftcard: boolean
  shouldMerge: boolean
  allowDiscounts: boolean
  hasShipping: boolean
  unitPrice: integer
  quantity: integer
  fulfilled: integer
  returned: integer
  swapped: integer
  canceled: integer
  metadata: json
  
  // Virtual fields
  formattedUnitPrice: virtual
  formattedTotal: virtual
  
  order: → Order
  variant: → ProductVariant
  moneyAmount: → MoneyAmount
  taxLines: [→ LineItemTaxLine]
  adjustments: [→ LineItemAdjustment]
  fulfillmentItems: [→ FulfillmentItem]
  returnItems: [→ ReturnItem]
  claimItems: [→ ClaimItem]
}
```

### Payment System

#### Payment Providers
```typescript
PaymentProvider {
  name: string
  code: string (unique, pp_*)
  isInstalled: boolean
  credentials: json
  metadata: json
  
  // Adapter function names
  createPaymentFunction: string
  capturePaymentFunction: string  
  refundPaymentFunction: string
  getPaymentStatusFunction: string
  generatePaymentLinkFunction: string
  handleWebhookFunction: string
  
  regions: [→ Region]
  sessions: [→ PaymentSession]
}
```

#### Payment Processing
```typescript
Payment {
  amount: integer
  currencyCode: string
  amountRefunded: integer
  providerId: string
  data: json
  capturedAt: timestamp
  canceledAt: timestamp
  
  order: → Order
  paymentCollection: → PaymentCollection
  currency: → Currency
  refunds: [→ Refund]
  captures: [→ Capture]
}

PaymentSession {
  providerId: string
  amount: integer
  data: json
  status: "pending" | "authorized" | "captured" | "canceled"
  
  cart: → Cart
  paymentProvider: → PaymentProvider
  paymentCollection: → PaymentCollection
}
```

### Shipping System

#### Shipping Providers
```typescript
ShippingProvider {
  name: string
  code: string (unique, sp_*)
  isInstalled: boolean
  credentials: json
  metadata: json
  
  // Adapter function names
  getRatesFunction: string
  createLabelFunction: string
  cancelLabelFunction: string
  validateAddressFunction: string
  trackShipmentFunction: string
  
  regions: [→ Region]
  shippingOptions: [→ ShippingOption]
}
```

#### Shipping Operations
```typescript
ShippingOption {
  name: string
  regionId: string
  profileId: string
  providerId: string
  priceType: "flat_rate" | "calculated"
  amount: integer
  isReturn: boolean
  adminOnly: boolean
  metadata: json
  
  region: → Region
  shippingProfile: → ShippingProfile
  provider: → ShippingProvider
  requirements: [→ ShippingOptionRequirement]
  methods: [→ ShippingMethod]
}

ShippingLabel {
  labelId: string
  trackingNumber: string
  trackingUrl: string
  labelUrl: string
  carrier: string
  service: string
  
  order: → Order
  fulfillment: → Fulfillment
}
```

### Advanced Features

#### Gift Cards System
```typescript
GiftCard {
  code: string (unique)
  value: integer
  balance: integer
  isDisabled: boolean
  expiresAt: timestamp
  metadata: json
  
  region: → Region
  order: → Order
  transactions: [→ GiftCardTransaction]
}

GiftCardTransaction {
  amount: integer
  
  giftCard: → GiftCard
  order: → Order
}
```

#### Claims & Returns
```typescript
ClaimOrder {
  paymentStatus: "na" | "not_refunded" | "refunded"
  fulfillmentStatus: "not_fulfilled" | "partially_fulfilled" | "fulfilled"
  type: "replace" | "refund"
  metadata: json
  
  order: → Order
  returnOrder: → Return
  claimItems: [→ ClaimItem]
  additionalItems: [→ OrderLineItem]
  fulfillments: [→ Fulfillment]
}

Return {
  status: "requested" | "received" | "requires_action" | "canceled"
  refundAmount: integer
  receivedAt: timestamp
  metadata: json
  
  order: → Order
  returnItems: [→ ReturnItem]
  refund: → Refund
  claimOrder: → ClaimOrder
  reason: → ReturnReason
  location: → Location
}

ClaimItem {
  images: [→ ClaimImage]
  tags: [→ ClaimTag]
  reason: "missing_item" | "wrong_item" | "production_failure" | "other"
  note: text
  quantity: integer
  
  claimOrder: → ClaimOrder
  item: → OrderLineItem
  variant: → ProductVariant
}
```

#### Analytics & Reporting
```typescript
// Analytics data computed via virtual fields and mutations
Analytics {
  salesMetrics: {
    totalRevenue: number
    orderCount: number
    averageOrderValue: number
    conversionRate: number
  }
  customerMetrics: {
    totalCustomers: number
    newCustomers: number
    returningCustomers: number
    customerLifetimeValue: number
  }
  productMetrics: {
    topSellingProducts: Product[]
    categoryPerformance: Category[]
    inventoryTurnover: number
  }
}
```

#### Discounts & Promotions
```typescript
Discount {
  code: string (unique)
  isDynamic: boolean
  usageLimit: integer
  usageCount: integer
  startsAt: timestamp
  endsAt: timestamp
  validDuration: string
  metadata: json
  
  rule: → DiscountRule
  regions: [→ Region]
  orders: [→ Order]
}

DiscountRule {
  type: "fixed" | "percentage" | "free_shipping"
  value: integer
  allocation: "item" | "total"
  
  discounts: [→ Discount]
  conditions: [→ DiscountCondition]
  products: [→ Product]
  productTypes: [→ ProductType]
  productCollections: [→ ProductCollection]
  customerGroups: [→ CustomerGroup]
}
```

#### Multi-Regional Commerce
```typescript
Region {
  name: string
  currencyCode: string
  taxRate: float
  taxCode: string
  giftCardsTaxable: boolean
  automaticTaxes: boolean
  taxInclusivePricing: boolean
  metadata: json
  
  currency: → Currency
  countries: [→ Country]
  paymentProviders: [→ PaymentProvider]
  fulfillmentProviders: [→ FulfillmentProvider]
  shippingOptions: [→ ShippingOption]
  orders: [→ Order]
  carts: [→ Cart]
  giftCards: [→ GiftCard]
  discounts: [→ Discount]
  taxRates: [→ TaxRate]
}

Currency {
  code: string (unique, ISO 4217)
  symbol: string
  symbolNative: string
  name: string
  includesTax: boolean
  noDivisionCurrency: boolean
  
  regions: [→ Region]
  orders: [→ Order]
  carts: [→ Cart]
  payments: [→ Payment]
  moneyAmounts: [→ MoneyAmount]
}
```

## Platform Features

### Admin Platform (`/dashboard/platform/`)

#### Analytics Dashboard (`analytics/`)
- **Real-time Metrics**: Sales, revenue, customer insights
- **Performance Charts**: Revenue trends, order volume, conversion rates
- **Regional Analytics**: Geographic performance breakdown
- **Customer Insights**: Lifetime value, retention, acquisition

#### Order Management (`orders/`)
- **Order Processing**: Create, edit, fulfill orders
- **Claims Processing**: Handle returns, replacements, refunds
- **Fulfillment Management**: Multi-location inventory, shipping
- **Payment Processing**: Capture, refund, track payments

#### Product Management (`products/`)
- **Product Catalog**: Products, variants, options, categories
- **Inventory Management**: Stock tracking, movements, locations
- **Pricing Management**: Multi-currency, regional pricing
- **Media Management**: Images, galleries, digital assets

#### Customer Management (`users/`)
- **Customer Profiles**: Account management, order history
- **Customer Groups**: Segmentation, targeted pricing
- **Address Management**: Shipping, billing addresses
- **Communication**: Notes, notifications, support

#### Payment Providers (`payment-providers/`)
- **Provider Management**: Configure Stripe, PayPal, manual payments
- **Adapter Functions**: Payment creation, capture, refunds
- **Webhook Handling**: Real-time payment status updates
- **Regional Assignment**: Provider availability by region

#### Shipping Providers (`shipping-providers/`)
- **Provider Management**: Configure Shippo, ShipEngine, manual shipping
- **Rate Calculation**: Real-time shipping rates
- **Label Generation**: Shipping labels, tracking numbers
- **Address Validation**: Address verification and normalization

#### Gift Cards (`gift-cards/`)
- **Gift Card Management**: Create, edit, disable gift cards
- **Transaction Tracking**: Usage history, balance management
- **Regional Restrictions**: Country/region-specific availability
- **Redemption Tracking**: Customer usage patterns

#### Discounts (`discounts/`)
- **Promotion Management**: Create complex discount rules
- **Conditions Engine**: Product, customer, order-based conditions
- **Usage Tracking**: Redemption limits, analytics
- **A/B Testing**: Multiple discount strategies

#### Regional Settings (`regions/`)
- **Multi-Region Setup**: Country, currency, tax configuration
- **Localization**: Region-specific settings and compliance
- **Tax Management**: Rate calculation, inclusive/exclusive pricing
- **Provider Assignment**: Regional payment and shipping options

### Storefront (`/storefront/`)

#### Customer Experience
- **Product Browsing**: Advanced search, filtering, categorization
- **Shopping Cart**: Persistent cart, guest checkout
- **Checkout Process**: Multi-step checkout with address validation
- **Account Management**: Order history, address book, preferences
- **Order Tracking**: Real-time order and shipping status

#### Payment Integration
- **Multiple Providers**: Stripe, PayPal, manual payments
- **Secure Processing**: PCI-compliant payment handling
- **Gift Card Support**: Redemption during checkout
- **Multi-Currency**: Regional currency and pricing

## Integration Architecture

### Payment Adapter System
Payment providers use a standardized adapter pattern:

```typescript
// Example: Stripe payment creation
const paymentResult = await paymentProviderAdapter.createPaymentFunction({
  cart,
  amount: cart.total,
  currency: cart.currency.code,
  customer: cart.customer,
  billing_address: cart.billingAddress
});
```

### Shipping Adapter System
Shipping providers use a standardized adapter pattern:

```typescript
// Example: Shippo rate calculation
const rates = await shippingProviderAdapter.getRatesFunction({
  provider,
  fromAddress: warehouse.address,
  toAddress: order.shippingAddress,
  packages: order.packages
});
```

## GraphQL API

### Order Mutations
- `createOrder` - Create new order
- `updateOrder` - Update order details
- `fulfillOrder` - Create fulfillment
- `capturePayment` - Capture authorized payment
- `refundPayment` - Process refund
- `createClaim` - Create claim/return

### Cart Mutations  
- `createCart` - Initialize shopping cart
- `addToCart` - Add products to cart
- `updateCart` - Update cart contents
- `completeCart` - Convert cart to order
- `addShippingMethod` - Add shipping to cart
- `createPaymentSessions` - Initialize payment

### Product Queries
- `products` - Get product catalog
- `product` - Get single product details
- `productVariants` - Get product variants
- `productCollections` - Get product collections
- `productCategories` - Get product categories

### Analytics Queries
- `getAnalytics` - Get dashboard analytics
- `getSalesData` - Get sales metrics
- `getCustomerMetrics` - Get customer insights
- `getProductPerformance` - Get product analytics

## Access Control & Security

### Role-Based Permissions
- `canManageProducts` - Product catalog management
- `canManageOrders` - Order processing and fulfillment
- `canManageCustomers` - Customer account management
- `canManagePayments` - Payment processing and refunds
- `canManageShipping` - Shipping and fulfillment
- `canViewAnalytics` - Analytics and reporting access

### Data Security
- **Authentication**: Session-based and API key auth
- **Authorization**: Fine-grained permission system
- **Data Encryption**: Sensitive data protection
- **Audit Trails**: Order events and change tracking
- **Webhook Verification**: Provider webhook security

## Performance & Scalability

### Database Optimization
- **Indexed Fields**: Critical lookups optimized
- **Virtual Fields**: Computed data for performance
- **Relationship Loading**: Efficient data fetching
- **Query Optimization**: GraphQL query analysis

### Caching Strategy
- **Provider Adapters**: Function result caching
- **Product Data**: Catalog information caching
- **Analytics**: Dashboard data caching
- **Session Management**: User session optimization

### Background Processing
- **Batch Jobs**: Long-running operations
- **Event Processing**: Order event handling
- **Webhook Processing**: Provider notifications
- **Analytics Computation**: Data aggregation

This platform architecture enables sophisticated enterprise e-commerce operations while maintaining flexibility, scalability, and developer experience.