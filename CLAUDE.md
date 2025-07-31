# OpenFront Final 2 - AI Assistant Guide

## Overview

OpenFront Final 2 is a comprehensive, enterprise-grade e-commerce platform built with Next.js 15 and KeystoneJS 6. This is the main codebase for the OpenFront Final 2 application, providing a complete commerce solution with advanced features.

## Platform Understanding

For comprehensive technical details about the OpenFront platform architecture, schema, and features, refer to:
**`features/platform/PLATFORM.md`**

This platform documentation explains:
- 78+ KeystoneJS data models and relationships
- Payment and shipping adapter systems
- Advanced e-commerce features (analytics, claims, gift cards)
- Multi-regional commerce capabilities
- GraphQL API structure and operations
- Access control and security model

## Application Architecture

OpenFront Final 2 provides a complete e-commerce solution with sophisticated business logic and enterprise-level capabilities.

## Core Features

### Comprehensive E-commerce Platform
OpenFront Final 2 includes enterprise-level features:

#### Product Management
- Complete product catalog with variants, options, and collections
- Advanced inventory management with multi-location support
- Sophisticated pricing system with regional and customer-specific pricing
- Product images, categories, tags, and metadata

#### Order Management
- Full order lifecycle from creation to fulfillment
- Advanced order processing with claims and returns
- Draft orders for quote-to-order workflows
- Comprehensive order events and audit trails

#### Payment System
- Multiple payment providers (Stripe, PayPal, manual)
- Payment adapter pattern for flexible integrations
- Multi-currency support with automatic conversion
- Advanced payment sessions and webhook processing

#### Shipping System
- Multiple shipping providers (Shippo, ShipEngine, manual)
- Real-time rate calculation and address validation
- Shipping label generation and tracking
- Sophisticated shipping options and requirements

#### Advanced Features
- **Analytics Dashboard**: Real-time business insights and reporting
- **Gift Cards**: Complete gift card lifecycle management
- **Claims & Returns**: Sophisticated return and refund processing
- **Discounts**: Flexible promotion and discount system
- **Multi-Regional**: Global commerce with currency and tax support

### Application Structure
```
openfront-final2/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Admin interface
│   ├── (storefront)/      # Customer-facing pages
│   └── api/              # API endpoints
├── features/
│   ├── keystone/         # Backend models and GraphQL API
│   ├── platform/         # Admin platform components
│   ├── storefront/       # Frontend components and screens
│   └── integrations/     # Payment and shipping adapters
└── components/           # Shared UI components
```

### Integration Adapters

#### Payment Adapter Pattern
```typescript
// Payment provider integration
const paymentResult = await paymentProviderAdapter.createPaymentFunction({
  cart,
  amount: cart.total,
  currency: cart.currency.code,
  customer: cart.customer
});
```

#### Shipping Adapter Pattern
```typescript
// Shipping provider integration
const rates = await shippingProviderAdapter.getRatesFunction({
  provider,
  fromAddress: warehouse.address,
  toAddress: order.shippingAddress,
  packages: order.packages
});
```

## Platform Features

### Admin Platform (`/dashboard/platform/`)
- **Analytics**: Real-time business insights and reporting
- **Orders**: Comprehensive order management and fulfillment
- **Products**: Product catalog with variants and inventory
- **Customers**: Customer management and segmentation
- **Gift Cards**: Gift card lifecycle management
- **Discounts**: Promotion and discount management
- **Regional Settings**: Multi-regional commerce configuration
- **Payment Providers**: Payment integration management
- **Shipping Providers**: Shipping integration management

### Storefront (`/storefront/`)
- **Product Browsing**: Advanced search and filtering
- **Shopping Cart**: Persistent cart with guest checkout
- **Checkout**: Multi-step checkout with payment and shipping
- **Account Management**: Customer accounts and order history
- **Order Tracking**: Real-time order and shipping status

## GraphQL API

### Core Mutations
- `createOrder` - Create new order
- `updateOrder` - Update order details
- `createCart` - Initialize shopping cart
- `addToCart` - Add products to cart
- `completeCart` - Convert cart to order
- `capturePayment` - Capture payment
- `createClaim` - Create return/exchange claim

### Core Queries
- `products` - Get product catalog
- `orders` - Get order list
- `getAnalytics` - Get business analytics
- `customers` - Get customer data
- `giftCards` - Get gift card information

## Development Guidelines

### AI Assistant Instructions

When working on OpenFront Final 2:

1. **Read Platform Documentation**: Always reference the `features/platform/PLATFORM.md` file for technical details
2. **Verify Implementation**: Check actual code rather than making assumptions about features
3. **Focus on Real Features**: Work with implemented capabilities, not planned features
4. **Use Established Patterns**: Follow existing adapter patterns for integrations
5. **Maintain Code Quality**: Follow TypeScript best practices and testing standards

### Code Organization
- Follow established feature slice architecture
- Use proper TypeScript types and interfaces
- Implement comprehensive error handling
- Write tests for business logic
- Document complex functionality

### Integration Development
- Use adapter patterns for external services
- Implement proper webhook handling
- Include error recovery and retry logic
- Validate all external data
- Maintain security best practices

## Access Control & Security

### Role-Based Permissions
- `canManageProducts` - Product catalog management
- `canManageOrders` - Order processing
- `canManageCustomers` - Customer management
- `canManagePayments` - Payment processing
- `canViewAnalytics` - Analytics access

### Security Features
- Session-based authentication
- API key authentication
- Data encryption for sensitive information
- Webhook signature verification
- Comprehensive audit trails

## Important Notes

- OpenFront Final 2 is a production-ready enterprise e-commerce platform
- Contains 78+ sophisticated data models with comprehensive business logic
- Includes advanced features often missing from basic e-commerce solutions
- Uses modern architecture with Next.js 15 and KeystoneJS 6
- Provides complete flexibility and customization capabilities
- Supports multi-regional commerce with currency and tax management

## Performance & Scalability

### Optimization Features
- Database query optimization with proper indexing
- Virtual fields for computed data
- Efficient GraphQL query processing
- Background job processing for long-running operations
- Comprehensive caching strategies

### Scalability Considerations
- Multi-regional deployment support
- Database optimization for large datasets
- Background processing for intensive operations
- CDN integration for static assets
- Monitoring and alerting capabilities

This platform provides enterprise-level e-commerce capabilities suitable for businesses of all sizes, from startups to large enterprises, with comprehensive features and modern architecture.