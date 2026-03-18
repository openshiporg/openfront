/**
 * SYSmoAI — Official Contact Constants
 *
 * CANONICAL SOURCE: Notion CEOA Instructions
 * OWNER: Emon Hossain (CEO)
 *
 * ⚠️ NEVER hardcode phone numbers in components.
 * ⚠️ ALWAYS import from this file.
 * ⚠️ Change the number here → updates everywhere.
 */

// ─── Phone ────────────────────────────────────────
export const PHONE_RAW = "8801711638693"
export const PHONE_DISPLAY = "+880 1711-638693"
export const PHONE_LOCAL = "01711-638693"

// ─── WhatsApp Base ────────────────────────────────
const WA_BASE = `https://wa.me/${PHONE_RAW}`

// ─── WhatsApp Links (context-specific) ───────────
export const WA = {
  general:    `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20need%20help`,
  navbar:     `${WA_BASE}?text=Hi%20SYSmoAI`,
  floating:   `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20need%20help`,
  hero:       `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20want%20to%20learn%20more`,
  services:   `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20want%20to%20know%20about%20your%20services`,
  fcommerce:  `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20have%20an%20F-commerce%20business`,
  agencies:   `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20run%20a%20digital%20agency`,
  freelancer: `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20am%20a%20freelancer`,
  student:    `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20am%20a%20student`,
  coaching:   `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20run%20a%20coaching%20business`,
  accounting: `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20run%20an%20accounting%20firm`,
  clinics:    `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20run%20a%20clinic`,
  trading:    `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20run%20a%20trading%20business`,
  quickwin:   `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20want%20to%20book%20a%20Quick%20Win`,
  sprint:     `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20want%20to%20book%20a%20Sprint`,
  retainer:   `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20want%20to%20book%20a%20Retainer`,
  payment:    `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20have%20made%20a%20payment`,
  contact:    `${WA_BASE}?text=Hi%20SYSmoAI%2C%20I%20want%20to%20get%20in%20touch`,
}

// ─── Payment Numbers (same as phone) ─────────────
export const PAYMENT = {
  bkash:  PHONE_LOCAL,
  nagad:  PHONE_LOCAL,
  rocket: PHONE_LOCAL,
  bank:   "Contact us on WhatsApp for bank details",
}

// ─── Email ────────────────────────────────────────
export const EMAIL = {
  hello:    "hello@sysmoai.com",
  support:  "support@sysmoai.com",
  billing:  "billing@sysmoai.com",
  accounts: "accounts@sysmoai.com",
  privacy:  "privacy@sysmoai.com",
}

// ─── Company ──────────────────────────────────────
export const COMPANY = {
  name:         "SYSmoAI",
  fullName:     "SYSmoAI Private Limited",
  tagline:      "The AI Platform Built for Bangladesh",
  location:     "Dhaka, Bangladesh",
  website:      "https://sysmoai.com",
  founded:      "2026",
  founder:      "Emon Hossain",
  founderTitle: "Founder & CEO",
}
