# SYSmoAI — B2B AI Systems Platform

## Overview
SYSmoAI is a Bangladesh-focused B2B AI systems company website built with Next.js (App Router). **NO shop, cart, or product catalog** — pure services/lead-gen site targeting business owners in Bangladesh.

## Brand
- **Company**: SYSmoAI Private Limited
- **Tagline**: AI-powered operating systems for Bangladesh businesses
- **Founder**: Emon Hossain (Founder & CEO)
- **Address**: Flat 12-1/C, Swapno Nagar, Pallabi, Dhaka-1216
- **Phone**: +880 1711-638693 (all WA links: `8801711638693`)
- **Email**: accounts@sysmoai.com (all email aliases point here)
- **Colors**: #000000 bg · #0A0A0F dark bg · #1E3A8A System Blue · #2563EB Motion Blue · #60A5FA AI Core · #25D366 WhatsApp green

## Architecture
- **Framework**: Next.js 16 (App Router)
- **Backend**: Keystone 6 + PostgreSQL (kept for infra, not linked from frontend)
- **Styling**: Tailwind CSS v4 (custom brand colors)
- **Package Manager**: npm with `--legacy-peer-deps`
- **TypeScript**: `typescript.ignoreBuildErrors: true` in next.config.ts
- **Routing**: Country-code middleware routes all traffic to `/bd/[page]`

## Page Structure
All pages live at `app/(storefront)/[countryCode]/(main)/`:

| Route | File | Description |
|-------|------|-------------|
| `/bd` | `page.tsx` → `features/storefront/screens/HomePage.tsx` | 8-section B2B homepage |
| `/bd/services` | `services/page.tsx` | Service tiers + industries grid + FAQ |
| `/bd/services/agencies` | `services/agencies/page.tsx` | Agencies industry page |
| `/bd/services/ecommerce` | `services/ecommerce/page.tsx` | E-commerce industry page |
| `/bd/services/coaching` | `services/coaching/page.tsx` | Coaching industry page |
| `/bd/services/accounting` | `services/accounting/page.tsx` | Accounting industry page |
| `/bd/services/clinics` | `services/clinics/page.tsx` | Clinics industry page |
| `/bd/services/trading` | `services/trading/page.tsx` | Trading industry page |
| `/bd/about` | `about/page.tsx` | About + founder story |
| `/bd/contact` | `contact/page.tsx` | Contact + ContactForm.tsx |
| `/bd/privacy` | `privacy/page.tsx` | Privacy policy |
| `/bd/terms` | `terms/page.tsx` | Terms of service |
| `/bd/refund` | `refund/page.tsx` | Refund policy |
| `/bd/cookie-policy` | `cookie-policy/page.tsx` | Cookie policy |

## Key Files
- `lib/constants/contact.ts` — **CANONICAL** phone, email, WA links, address
- `features/storefront/modules/layout/templates/nav/index.tsx` — B2B nav (no shop)
- `features/storefront/modules/layout/templates/footer/index.tsx` — 5-column footer
- `features/storefront/screens/MainLayout.tsx` — wraps all pages + FloatingWhatsApp + CookieConsent
- `features/storefront/components/FloatingWhatsApp.tsx` — floating WA button
- `features/storefront/components/CookieConsent.tsx` — cookie consent banner
- `app/sitemap.ts` — all 14 routes listed
- `app/robots.ts` — search-engine optimised robots rules

## Services & Pricing
| Service | Price | Duration |
|---------|-------|----------|
| AI Profit Audit | ৳7,500–12,000 | 1–2 days |
| Implementation Sprint | ৳25,000–50,000 | 5 working days |
| Monthly Retainer | ৳8,000–15,000/mo | Ongoing |

## Global Components
- **FloatingWhatsApp**: Fixed bottom-right WA bubble on all pages
- **CookieConsent**: Bottom banner with Accept/Reject, persists in localStorage
- **Nav**: B2B links (Home, Services, Industries, About, Contact) + WhatsApp CTA
- **Footer**: 5 columns (Brand, Services, Industries, Company, Contact)

## DO NOT
- Add shop, cart, checkout, or product catalog links
- Target students, general public, or freelancers
- Make revenue guarantees or fake testimonials
- Use indigo colors (use blues only: #2563EB, #60A5FA, #1E3A8A)
- Hardcode phone number — always import from `lib/constants/contact.ts`

## SEO
- All pages have `metadata` export with title, description, canonical URL, and OpenGraph
- Industry pages have FAQPage schema (JSON-LD)
- Homepage has LocalBusiness schema
- Services page has Service schema
- `app/sitemap.ts` lists all 14 routes
- `app/robots.ts` allows indexing, disallows /api /dashboard /account /cart /checkout
