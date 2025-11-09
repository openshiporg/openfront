# Openfront

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopenship-org%2Fopenfront%2F&stores=[{"type"%3A"postgres"}])

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/openfront)

Openfront is a comprehensive e-commerce platform that provides everything you need to build and manage online stores. It includes a powerful admin dashboard, customer storefront, payment processing, inventory management, and advanced e-commerce features.

## Demo Video

[![Watch Openfront Demo](https://img.youtube.com/vi/jz0ZZmtBHgo/maxresdefault.jpg)](https://youtu.be/jz0ZZmtBHgo)

*Watch a complete demo of Openfront's checkout and admin features*

Built on top of [next-keystone-starter](https://github.com/junaid33/next-keystone-starter), which provides the foundational architecture for modern full-stack applications with KeystoneJS and Next.js.

## Core Features

### Admin Dashboard
The admin dashboard is your control center for managing all aspects of your e-commerce business. From here you can manage products, process orders, handle customers, configure payments, and analyze your store's performance.

### Storefront
Your customer-facing storefront provides a complete shopping experience. Customers can browse products, add items to cart, complete checkout, create accounts, and manage their orders. The storefront is fully customizable and mobile-responsive.

### Payment & Fulfillment
Integrated payment processing with support for multiple payment providers including Stripe and PayPal. Built-in order fulfillment with shipping integrations, inventory tracking, and automated order processing workflows.

### Enterprise Features
- **Multi-Regional Commerce**: Global support with multiple currencies and regional pricing
- **Advanced Inventory**: Multi-location inventory with stock movements and backorder management
- **Gift Cards**: Complete lifecycle management from creation to redemption
- **Claims & Returns**: Sophisticated return and refund processing workflows
- **Analytics**: Real-time business insights and comprehensive reporting
- **Discount System**: Flexible promotions, discount rules, and automated campaigns

## Architecture

### Technology Stack
- **Frontend**: Next.js 15 with App Router
- **Backend**: KeystoneJS 6 with GraphQL API
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Session-based with role-based permissions
- **Foundation**: Built on [next-keystone-starter](https://github.com/junaid33/next-keystone-starter)

### Application Structure
```
openfront/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Admin platform interface
│   ├── (storefront)/      # Customer-facing pages
│   └── api/              # API endpoints and webhooks
├── features/
│   ├── keystone/         # Backend models and GraphQL schema
│   ├── platform/         # Admin platform components
│   ├── storefront/       # Frontend components and screens
│   └── integrations/     # Payment and shipping adapters
└── components/           # Shared UI components
```

### Data Models
Openfront includes 78+ sophisticated data models covering:
- Product catalog and variants
- Order management and fulfillment
- Customer and user management
- Payment and shipping processing
- Analytics and reporting
- Gift cards and discounts
- Claims and returns
- Multi-regional settings

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm, yarn, pnpm, or bun

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/openship-org/openfront.git
   cd openfront
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Required - Database Connection
   DATABASE_URL="postgresql://username:password@localhost:5432/openfront"
   
   # Required - Session Security (must be at least 32 characters)
   SESSION_SECRET="your-very-long-session-secret-key-here-32-chars-minimum"
   
   # Optional - Payment Providers (Stripe)
   STRIPE_SECRET_KEY="sk_test_51..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # Optional - Payment Providers (PayPal)
   PAYPAL_CLIENT_ID="your-paypal-client-id"
   PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
   
   # Optional - Shipping Provider (Shippo)
   SHIPPO_API_KEY="shippo_test_..."
   
   # Optional - File Storage (S3-compatible)
   S3_BUCKET_NAME="your-bucket-name"
   S3_REGION="us-east-1"
   S3_ACCESS_KEY_ID="your-access-key"
   S3_SECRET_ACCESS_KEY="your-secret-key"
   
   # Optional - Email Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   FROM_EMAIL="noreply@yourstore.com"
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   This will:
   - Build KeystoneJS schema
   - Run database migrations
   - Start Next.js development server with Turbopack

4. **Access the application:**
   - **Storefront**: [http://localhost:3000](http://localhost:3000) - Customer-facing store
   - **Admin Panel**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard) - Management interface
   - **GraphQL API**: [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql) - Interactive API explorer

5. **Create your first admin user:**
   On first visit to the admin panel, you'll be prompted to create an admin user account at `/dashboard/init`

6. **Run store onboarding:**
   After creating your admin account, use the onboarding process to set up your store with sample data

## Development Commands

- `npm run dev` - Build Keystone + migrate + start Next.js dev server
- `npm run build` - Build Keystone + migrate + build Next.js for production
- `npm run migrate:gen` - Generate and apply new database migrations
- `npm run migrate` - Deploy existing migrations to database
- `npm run lint` - Run ESLint

### Payment Integration
Configure payment providers using the adapter pattern:

```typescript
// Payment provider integration
const paymentResult = await paymentProviderAdapter.createPaymentFunction({
  cart,
  amount: cart.total,
  currency: cart.currency.code,
  customer: cart.customer
});
```

### Shipping Integration
Set up shipping providers with flexible adapter system:

```typescript
// Shipping provider integration
const rates = await shippingProviderAdapter.getRatesFunction({
  provider,
  fromAddress: warehouse.address,
  toAddress: order.shippingAddress,
  packages: order.packages
});
```

## Documentation

For comprehensive technical documentation, see [docs.openship.org/docs/openfront/ecommerce](https://docs.openship.org/docs/openfront/ecommerce/) which covers:
- Complete data model specifications (78+ models)
- GraphQL API reference and operations
- Payment and shipping adapter systems
- Access control and security model
- Advanced e-commerce features

## Security & Permissions

### Role-Based Access Control
- `canManageProducts` - Product catalog management
- `canManageOrders` - Order processing and fulfillment
- `canManageCustomers` - Customer management
- `canManagePayments` - Payment processing
- `canViewAnalytics` - Business analytics access

### Security Features
- Session-based authentication
- API key authentication for integrations
- Data encryption for sensitive information
- Webhook signature verification
- Comprehensive audit trails

## Platform Components

### Admin Platform (`/dashboard`)
- **Analytics**: Real-time business insights and KPI tracking
- **Orders**: Complete order management with fulfillment workflows
- **Products**: Advanced catalog management with variants and inventory
- **Customers**: Customer profiles with order history and segmentation
- **Gift Cards**: Lifecycle management from creation to redemption
- **Discounts**: Flexible promotion engine with rule-based discounts
- **Settings**: Multi-regional configuration and provider management

### Storefront Experience
- **Product Discovery**: Advanced search, filtering, and categorization
- **Shopping Cart**: Persistent cart with guest and authenticated checkout
- **Checkout Flow**: Multi-step process with payment and shipping options
- **Account Management**: Customer accounts with order tracking
- **Responsive Design**: Mobile-first design with modern UI/UX

## Deployment

### Production Deployment
Openfront is production-ready and can be deployed to:

- **Vercel**: One-click deployment with the button above
- **Docker**: Containerized deployment with included Dockerfile
- **Self-hosted**: Deploy to any Node.js hosting environment

### Scaling Considerations
- Multi-regional deployment support
- Database optimization for large datasets
- Background processing for intensive operations
- CDN integration for static assets
- Comprehensive monitoring and alerting

## Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code standards and conventions
- Testing requirements
- Pull request process
- Issue reporting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check our comprehensive documentation at [docs.openship.org/docs/openfront/ecommerce](https://docs.openship.org/docs/openfront/ecommerce/)
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Community**: Join our community discussions
- **Enterprise**: Contact us for enterprise support and custom development

---

**Openfront** - Enterprise E-commerce Platform  
Built with Next.js 15 and KeystoneJS 6