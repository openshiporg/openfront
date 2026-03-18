# SYSmoAI - E-Commerce Platform

## Overview
SYSmoAI is a full-featured e-commerce platform built with Next.js and Keystone CMS, migrated from Openfront and branded with the SYSmoAI design system. It includes a storefront, admin dashboard, order management, payments (Stripe/PayPal), OAuth, API keys, webhooks, and more.

## Architecture
- **Framework**: Next.js 16 (App Router + Pages Router hybrid)
- **CMS/Backend**: Keystone 6 with GraphQL API
- **Database**: PostgreSQL (Replit Helium)
- **Styling**: Tailwind CSS v4 with SYSmoAI brand tokens
- **Auth**: Custom stateless sessions (Iron-based), OAuth support, API key auth

## Branding & Theme
- **Dark theme**: `app/globals.css` sets `--background: #0A0A0F`, `--foreground: #F8FAFC`, `--card: #13131A`, `--border: #1E1E2E`, `--primary: #6366F1`
- **Dashboard isolation**: `app/dashboard/globals.css` overrides root CSS vars back to white for the dashboard (child CSS loads after root, wins via cascade). Safe to darken root CSS.
- **Brand pack**: Stored at `brand-pack/` (excluded from Tailwind scan)
- **Logo SVG file**: `public/images/logo.svg` — horizontal lockup; served at `/images/logo.svg` (NOTE: `/logo.svg` → redirected to `/us/logo.svg` by middleware; use `/images/logo.svg`)
- **Colors**: BG `#0A0A0F`, surface `#13131A`, border `#1E1E2E`, primary `#6366F1`, WhatsApp `#25D366`, muted `#94A3B8`
- **Font**: Inter + Hind Siliguri via Google Fonts in `app/globals.css`
- **Storefront nav**: Rebuilt — logo left, center nav links (Home/Shop/Services/About/Contact), right side (WhatsApp pill, Account, Cart, mobile hamburger). Dark bg `#0A0A0F`.
- **Country-code middleware**: `proxy.ts` at root — prepends country code to all routes. Static assets must be under `/images/`, `/assets/`, etc.

## Storefront Pages
All pages at `app/(storefront)/[countryCode]/(main)/` with shared Nav+Footer from MainLayout:
- `/` → Homepage: Hero, Who We Help (7 cards), How It Works (2-col), Featured Products, CTA
- `/store` → Product listing
- `/services` → Service tiers (Quick Win, Sprint, Retainer) + FAQ
- `/about` → Founder story + company info
- `/contact` → WhatsApp CTA + contact form (client component `ContactForm.tsx`)
- `/privacy` → Privacy policy
- `/terms` → Terms of service
- `app/not-found.tsx` → 404 page
- `app/sitemap.ts` → XML sitemap (sysmoai.com URLs)

## Key Directories
- `app/` — Next.js App Router pages (dashboard, storefront, API routes)
- `pages/api/graphql.ts` — Keystone GraphQL API endpoint
- `features/keystone/` — Keystone models, mutations, queries, access control
- `features/storefront/` — Storefront-specific logic and modules
- `features/dashboard/` — Admin dashboard components
- `features/platform/` — Platform-level features (API keys, apps, onboarding)
- `migrations/` — Prisma migration files (21 applied)
- `components/ui/` — Shared UI components (shadcn/ui + SYSmoAI brand)
- `brand-pack/` — SYSmoAI brand assets (reference only, excluded from Tailwind scan)
- `lib/` — Utility functions

## Running the App
- **Dev**: `npm run dev` (runs Keystone build, migrations, then Next.js on port 5000)
- **Build**: `npm run build`
- **Start**: `npm run start` (port 5000, all hosts)

## Environment Variables Required
### Required
- `DATABASE_URL` — PostgreSQL connection string (Replit Helium)
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

## Important CSS Notes
- `app/globals.css` uses `@source not` directives to exclude `.local`, `brand-pack`, and `node_modules` from Tailwind's scanner (prevents Figma skill doc examples from leaking into compiled CSS)
- `next.config.ts` has `allowedDevOrigins: ['*.replit.dev', ...]` for Replit iframe compatibility
- `turbopack: {}` is set to silence the "no turbopack config" notice

## Notes
- Keystone overrides Next.js version to 14.x internally (via package overrides) while the storefront uses Next.js 16
- `typescript.ignoreBuildErrors: true` is set in next.config.ts as a workaround for Keystone view type divergence
- Database migrations run automatically on dev startup
- The `openfrontClient` class in `features/storefront/lib/config.ts` is an internal GraphQL client (not user-visible, kept as-is for stability)
