# Openfront - E-Commerce Platform

## Overview
Openfront is a full-featured e-commerce platform built with Next.js and Keystone CMS. It includes a storefront, admin dashboard, order management, payments (Stripe/PayPal), OAuth, API keys, webhooks, and more.

## Architecture
- **Framework**: Next.js 16 (App Router + Pages Router hybrid)
- **CMS/Backend**: Keystone 6 with GraphQL API
- **Database**: PostgreSQL (via Prisma)
- **Styling**: Tailwind CSS v4
- **Auth**: Custom stateless sessions (Iron-based), OAuth support, API key auth

## Key Directories
- `app/` — Next.js App Router pages (dashboard, storefront, API routes)
- `pages/api/graphql.ts` — Keystone GraphQL API endpoint
- `features/keystone/` — Keystone models, mutations, queries, access control
- `features/storefront/` — Storefront-specific logic
- `features/dashboard/` — Admin dashboard components
- `migrations/` — Prisma migration files
- `components/ui/` — Shared UI components (shadcn/ui)
- `lib/` — Utility functions

## Running the App
- **Dev**: `npm run dev` (runs Keystone build, migrations, then Next.js on port 5000)
- **Build**: `npm run build`
- **Start**: `npm run start` (port 5000, all hosts)

## Environment Variables Required
### Required
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — At least 32 chars, used for session encryption

### Optional (payment/media/email)
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_API_URL`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `NEXT_PUBLIC_PAYPAL_SANDBOX`
- `S3_BUCKET_NAME`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_ENDPOINT`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_STORE_LINK`
- `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_MAX_TOKENS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`
- `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_DEFAULT_REGION`
- `PUBLIC_SIGNUPS_ALLOWED`, `HIDE_OPENFRONT_BRANDING`

## Replit Configuration
- Port: **5000** (webview)
- Workflow: `npm run dev`
- Package manager: npm
- Node version: >=20.0.0

## Notes
- Keystone overrides Next.js version to 14.x internally (via package overrides) while the storefront uses Next.js 16
- `typescript.ignoreBuildErrors: true` is set in next.config.ts as a workaround for Keystone view type divergence
- Database migrations run automatically on dev startup
