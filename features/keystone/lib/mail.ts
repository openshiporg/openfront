'use server' 

import { createTransport, getTestMessageUrl } from "nodemailer";
import { basePath } from "..";
import { emailButton, emailHeading, emailItems, emailLayout, emailMuted, emailPanel, emailParagraph, emailTotals, escapeHtml } from "./email-layout";

// Utility function to get base URL for emails
function getBaseUrlForEmails(): string {
  if (process.env.SMTP_STORE_LINK) {
    return process.env.SMTP_STORE_LINK;
  }
  
  // Fallback warning - this should be set in production
  console.warn('SMTP_STORE_LINK not set. Please add SMTP_STORE_LINK to your environment variables for email links to work properly.');
  return '';
}

const transport = createTransport({
  // @ts-ignore
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/** Plain transactional send through the store's SMTP transport (used by the abandoned-cart loop). */
export async function sendStoreEmail(message: { to: string; subject: string; html: string; text?: string }) {
  return transport.sendMail({ ...message, from: process.env.SMTP_FROM });
}

function passwordResetEmail({ url }: { url: string }): string {
  return emailLayout({
    preheader: "Use this link to choose a new password.",
    title: "Reset your password",
    body: `${emailParagraph("We received a request to reset the password for your account. Use the button below to choose a new one.")}
${emailButton("Reset password", url)}
${emailMuted("If you didn't ask for this, you can ignore this email and your password won't change.")}`,
  });
}

export async function sendPasswordResetEmail(resetToken: string, to: string, baseUrl?: string): Promise<void> {
  // Use provided baseUrl or fall back to utility function
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  
  // email the user a token
  const info = await transport.sendMail({
    to,
    from: process.env.SMTP_FROM,
    subject: "Reset your password",
    html: passwordResetEmail({
      url: `${frontendUrl}${basePath && basePath}/reset?token=${resetToken}`,
    }),
  });
  if (process.env.MAIL_USER?.includes("ethereal.email")) {
    console.log(`📧 Message Sent!  Preview it at ${getTestMessageUrl(info as any)}`);
  }
}

function addressHtml(address: any): string {
  if (!address) return "";
  const lines = [
    `${address.firstName || ""} ${address.lastName || ""}`.trim(),
    address.company,
    address.address1,
    address.address2,
    `${address.city || ""}${address.province ? `, ${address.province}` : ""} ${address.postalCode || ""}`.trim(),
    address.country?.displayName || address.country?.iso2?.toUpperCase(),
    address.phone,
  ].filter(Boolean);
  return `${emailHeading("Shipping to")}${emailPanel(lines.map(escapeHtml).join("<br>"))}`;
}

const lineDetail = (item: any) => [item.variantTitle, item.sku ? `SKU ${item.sku}` : ""].filter(Boolean).join(" · ");
const isZero = (value: any) => !value || /^\D*0(\.0+)?$/.test(String(value).trim());

function orderConfirmationEmail({ order, orderUrl }: { order: any; orderUrl: string }): string {
  const items = emailItems((order.lineItems || []).map((item: any) => ({
    title: item.title,
    detail: lineDetail(item),
    quantity: item.quantity,
    amount: item.formattedTotal,
  })));
  const totals = emailTotals([
    { label: "Subtotal", value: order.subtotal },
    ...(!isZero(order.shipping) ? [{ label: "Shipping", value: order.shipping }] : []),
    ...(!isZero(order.discount) ? [{ label: "Discount", value: `-${order.discount}` }] : []),
    ...(!isZero(order.tax) ? [{ label: "Tax", value: order.tax }] : []),
    { label: "Total", value: order.total },
  ]);
  return emailLayout({
    preheader: `Order #${order.displayId} is confirmed. Total ${order.total}.`,
    title: `Thanks for your order`,
    body: `${emailParagraph(`Order <strong>#${escapeHtml(order.displayId)}</strong> is confirmed. We'll email you again when it ships.`)}
${emailButton("View order", orderUrl)}
${emailHeading("Order summary")}
${items}
${totals}
${addressHtml(order.shippingAddress)}`,
  });
}

function orderFulfillmentEmail({ order, fulfillment, orderUrl }: { order: any; fulfillment: any; orderUrl: string }): string {
  const items = emailItems((fulfillment.items || []).map((item: any) => ({
    title: item.lineItem.title,
    detail: lineDetail(item.lineItem),
    quantity: item.quantity,
    amount: item.lineItem.formattedTotal,
  })));
  const labels = (fulfillment.shippingLabels || []).filter((label: any) => label?.trackingNumber || label?.carrier);
  const tracking = labels.length
    ? `${emailHeading("Tracking")}${emailPanel(labels.map((label: any) =>
        `<strong>${escapeHtml(label.carrier || "Carrier")}</strong><br><span class="em-muted" style="color:#52525b;">${escapeHtml(label.trackingNumber || "")}</span>${label.trackingUrl ? `<br><a class="em-link" href="${escapeHtml(label.trackingUrl)}" target="_blank" style="color:#18181b;text-decoration:underline;">Track package</a>` : ""}`,
      ).join("<br><br>"))}`
    : "";
  const primary = labels.find((label: any) => label.trackingUrl);
  return emailLayout({
    preheader: `Order #${order.displayId} is on its way.`,
    title: "Your order is on its way",
    body: `${emailParagraph(`Good news: order <strong>#${escapeHtml(order.displayId)}</strong> has shipped.`)}
${primary ? emailButton("Track package", primary.trackingUrl) : emailButton("View order", orderUrl)}
${tracking}
${emailHeading("In this shipment")}
${items}
${addressHtml(order.shippingAddress)}
${primary ? emailMuted(`<a class="em-link" href="${escapeHtml(orderUrl)}" target="_blank" style="color:#52525b;text-decoration:underline;">View your order</a>`) : ""}`,
  });
}

export async function sendOrderConfirmationEmail(
  order: any,
  baseUrl?: string
): Promise<{ sent: boolean; error?: string; messageId?: string; response?: string }> {
  if (!order.email) {
    console.warn('No email address found for order', order.id);
    return { sent: false, error: 'no_recipient' };
  }

  const countryCode = order.shippingAddress?.country?.iso2?.toLowerCase() || 'us';
  
  // Use provided baseUrl or fall back to utility function
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  const orderUrl = order.secretKey 
    ? `${frontendUrl}/${countryCode}/order/confirmed/${order.id}?secretKey=${order.secretKey}`
    : `${frontendUrl}/${countryCode}/order/confirmed/${order.id}`;

  try {
    const info = await transport.sendMail({
      to: order.email,
      from: process.env.SMTP_FROM,
      subject: `Order Confirmation - Order #${order.displayId}`,
      html: orderConfirmationEmail({ order, orderUrl }),
    });

    if (process.env.SMTP_USER?.includes("ethereal.email")) {
      console.log(`📧 Order confirmation email sent! Preview it at ${getTestMessageUrl(info as any)}`);
    } else {
      console.log(`📧 Order confirmation email sent to ${order.email}`);
    }
    return {
      sent: true,
      messageId: typeof (info as any)?.messageId === 'string' ? (info as any).messageId : undefined,
      response: typeof (info as any)?.response === 'string' ? (info as any).response.slice(0, 500) : undefined,
    };
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return { sent: false, error: error instanceof Error ? error.message : 'send_failed' };
  }
}

export async function sendOrderFulfillmentEmail(order: any, fulfillment: any, baseUrl?: string): Promise<{ sent: boolean; error?: string; messageId?: string; response?: string }> {
  if (!order.email) {
    console.warn('No email address found for order', order.id);
    return { sent: false, error: 'no_recipient' };
  }

  const countryCode = order.shippingAddress?.country?.iso2?.toLowerCase() || 'us';
  
  // Use provided baseUrl or fall back to utility function
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  const orderUrl = order.secretKey 
    ? `${frontendUrl}/${countryCode}/order/confirmed/${order.id}?secretKey=${order.secretKey}`
    : `${frontendUrl}/${countryCode}/order/confirmed/${order.id}`;

  try {
    const info = await transport.sendMail({
      to: order.email,
      from: process.env.SMTP_FROM,
      subject: `Order Shipped - Order #${order.displayId}`,
      html: orderFulfillmentEmail({ order, fulfillment, orderUrl }),
    });

    if (process.env.SMTP_USER?.includes("ethereal.email")) {
      console.log(`📧 Order fulfillment email sent! Preview it at ${getTestMessageUrl(info as any)}`);
    } else {
      console.log(`📧 Order fulfillment email sent to ${order.email}`);
    }
    return {
      sent: true,
      messageId: typeof (info as any)?.messageId === 'string' ? (info as any).messageId : undefined,
      response: typeof (info as any)?.response === 'string' ? (info as any).response.slice(0, 500) : undefined,
    };
  } catch (error) {
    console.error('Failed to send order fulfillment email:', error);
    return { sent: false, error: error instanceof Error ? error.message : 'send_failed' };
  }
}
