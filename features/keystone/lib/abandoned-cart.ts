// Abandoned-checkout recovery email (Shopify default: one email ~10 hours after the cart goes idle).
// A cart qualifies when it has an email and items, no order, and was last touched 10h–48h ago (older
// carts are not chased, so turning this on never mails a backlog). The resume link is a signed cart proof
// valid for 7 days. Reserved test domains (example.com, .test, .invalid) are never mailed. Cart.abandonedEmailSent is claimed atomically
// before sending, so replicas and repeated passes email a cart at most once.
import { createCartProof } from "../security/token-crypto";
import { emailButton, emailLayout, emailMuted, emailPanel, emailParagraph } from "./email-layout";

export const ABANDONED_AFTER_HOURS = 10;
const LOOKBACK_HOURS = 48;
const MAX_AGE_DAYS = 7;
const RESERVED = /@(example\.(com|org|net)|[^@]*\.(test|invalid|example))$/i;
const BATCH = 25;

export type AbandonedCartMessage = { to: string; subject: string; html: string; text: string };
type Send = (message: AbandonedCartMessage) => Promise<unknown>;

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export function abandonedCartMessage(cart: { email: string; countryCode: string; items: { title: string; quantity: number }[] }, resumeUrl: string, storeName = "our store"): AbandonedCartMessage {
  const lines = cart.items.map((item) => `${item.quantity} × ${item.title}`);
  const text = `You left something in your cart at ${storeName}.\n\n${lines.join("\n")}\n\nPick up where you left off: ${resumeUrl}`;
  const html = emailLayout({
    storeName: storeName === "our store" ? undefined : storeName,
    preheader: "Your cart is saved. Pick up where you left off.",
    title: "You left something in your cart",
    body: `${emailParagraph("Your items are still waiting. Pick up right where you left off.")}
${emailPanel(lines.map(escapeHtml).join("<br>"))}
${emailButton("Return to your cart", resumeUrl)}
${emailMuted("The link works for 7 days. If you already checked out, you can ignore this email.")}`,
  });
  return { to: cart.email, subject: "You left something in your cart", html, text };
}

export async function sendAbandonedCartEmails(prisma: any, now = new Date(), send?: Send, storeLink = process.env.SMTP_STORE_LINK || "") {
  if (!storeLink) return { sent: 0 };
  const deliver: Send = send || (async (message) => (await import("./mail")).sendStoreEmail(message));
  const carts = await prisma.cart.findMany({
    where: {
      orderId: null,
      abandonedEmailSent: false,
      email: { contains: "@" },
      updatedAt: { lte: new Date(now.getTime() - ABANDONED_AFTER_HOURS * 3600_000), gte: new Date(now.getTime() - LOOKBACK_HOURS * 3600_000) },
      lineItems: { some: { quantity: { gt: 0 } } },
    },
    select: {
      id: true, email: true, updatedAt: true,
      region: { select: { countries: { select: { iso2: true }, take: 1 } } },
      lineItems: { where: { quantity: { gt: 0 } }, select: { quantity: true, productVariant: { select: { title: true, product: { select: { title: true } } } } } },
    },
    orderBy: { updatedAt: "asc" },
    take: BATCH,
  });
  let sent = 0;
  for (const cart of carts) {
    if (RESERVED.test(cart.email.trim())) {
      await prisma.cart.updateMany({ where: { id: cart.id, abandonedEmailSent: false }, data: { abandonedEmailSent: true } });
      continue;
    }
    // Claim first; the unchanged updatedAt guard skips a cart the shopper touched since it was read.
    const claim = await prisma.cart.updateMany({ where: { id: cart.id, abandonedEmailSent: false, orderId: null, updatedAt: cart.updatedAt }, data: { abandonedEmailSent: true } });
    if (claim.count !== 1) continue;
    const countryCode = (cart.region?.countries?.[0]?.iso2 || "us").toLowerCase();
    const proof = createCartProof(cart.id, { expiresAt: Math.floor(now.getTime() / 1000) + MAX_AGE_DAYS * 86400 });
    const resumeUrl = `${storeLink.replace(/\/$/, "")}/api/cart-recover?c=${encodeURIComponent(countryCode)}&p=${encodeURIComponent(proof)}`;
    const items = cart.lineItems.map((line: any) => ({
      quantity: line.quantity,
      title: [line.productVariant?.product?.title, line.productVariant?.title && line.productVariant.title !== "Default" ? line.productVariant.title : ""].filter(Boolean).join(" – ") || "Item",
    }));
    try {
      await deliver(abandonedCartMessage({ email: cart.email, countryCode, items }, resumeUrl));
      sent += 1;
    } catch {
      // One attempt per cart (Shopify sends one); a failed send is logged, not retried into a spam loop.
      console.error("[abandoned-cart] send failed for a cart");
    }
  }
  return { sent };
}
