'use server' 

import { createTransport, getTestMessageUrl } from "nodemailer";
import { basePath } from "..";

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

function passwordResetEmail({ url }: { url: string }): string {
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";

  return `
    <body style="background: ${backgroundColor};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Please click below to reset your password
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Reset Password</a></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            If you did not request this email you can safely ignore it.
          </td>
        </tr>
      </table>
    </body>
  `;
}

export async function sendPasswordResetEmail(resetToken: string, to: string, baseUrl?: string): Promise<void> {
  // Use provided baseUrl or fall back to utility function
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  
  // email the user a token
  const info = await transport.sendMail({
    to,
    from: process.env.SMTP_FROM,
    subject: "Your password reset token!",
    html: passwordResetEmail({
      url: `${frontendUrl}${basePath && basePath}/reset?token=${resetToken}`,
    }),
  });
  if (process.env.MAIL_USER?.includes("ethereal.email")) {
    console.log(`� Message Sent!  Preview it at ${getTestMessageUrl(info)}`);
  }
}

function orderConfirmationEmail({ order, orderUrl }: { order: any; orderUrl: string }): string {
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";
  const headerColor = "#333333";

  const itemsHtml = order.lineItems?.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.title}</strong><br>
        ${item.variantTitle ? `<span style="color: #666; font-size: 14px;">${item.variantTitle}</span><br>` : ''}
        ${item.sku ? `<span style="color: #666; font-size: 14px;">SKU: ${item.sku}</span><br>` : ''}
        Quantity: ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.formattedUnitPrice}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.formattedTotal}
      </td>
    </tr>
  `).join('') || '';

  return `
    <body style="background: ${backgroundColor};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center" style="padding: 20px 0px 0px 0px; font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; font-weight: bold;">
            Order Confirmation
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Thank you for your order! Your order #${order.displayId} has been confirmed.
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #eee;">
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Item</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Price</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Total</th>
              </tr>
              ${itemsHtml}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding: 5px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                  Subtotal: ${order.subtotal}
                </td>
              </tr>
              ${order.shipping && order.shipping !== '$0.00' ? `
              <tr>
                <td style="padding: 5px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                  Shipping: ${order.shipping}
                </td>
              </tr>
              ` : ''}
              ${order.discount && order.discount !== '$0.00' ? `
              <tr>
                <td style="padding: 5px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                  Discount: -${order.discount}
                </td>
              </tr>
              ` : ''}
              ${order.tax && order.tax !== '$0.00' ? `
              <tr>
                <td style="padding: 5px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                  Tax: ${order.tax}
                </td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 10px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; font-weight: bold; font-size: 18px; border-top: 2px solid #eee;">
                  Total: ${order.total}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${order.shippingAddress ? `
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; margin: 0 0 10px 0;">Shipping Address</h3>
            <p style="font-family: Helvetica, Arial, sans-serif; color: ${textColor}; margin: 0; line-height: 1.4;">
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.company ? `${order.shippingAddress.company}<br>` : ''}
              ${order.shippingAddress.address1}<br>
              ${order.shippingAddress.address2 ? `${order.shippingAddress.address2}<br>` : ''}
              ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country?.displayName || order.shippingAddress.country?.iso2}<br>
              ${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ''}
            </p>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}">
                  <a href="${orderUrl}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 12px 24px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">
                    View Order Details
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0px 0px 20px 0px; font-size: 14px; line-height: 20px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            We'll send you another email when your order ships. If you have any questions, please contact us.
          </td>
        </tr>
      </table>
    </body>
  `;
}

function orderFulfillmentEmail({ order, fulfillment, orderUrl }: { order: any; fulfillment: any; orderUrl: string }): string {
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";
  const headerColor = "#333333";

  const itemsHtml = fulfillment.items?.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.lineItem.title}</strong><br>
        ${item.lineItem.variantTitle ? `<span style="color: #666; font-size: 14px;">${item.lineItem.variantTitle}</span><br>` : ''}
        ${item.lineItem.sku ? `<span style="color: #666; font-size: 14px;">SKU: ${item.lineItem.sku}</span><br>` : ''}
        Quantity: ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.lineItem.formattedUnitPrice}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.lineItem.formattedTotal}
      </td>
    </tr>
  `).join('') || '';

  const trackingHtml = fulfillment.shippingLabels?.map((label: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${label.carrier}</strong><br>
        Tracking: ${label.trackingNumber}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${label.url ? `<a href="${label.url}" target="_blank" style="color: ${buttonBackgroundColor}; text-decoration: none;">Track Package</a>` : ''}
      </td>
    </tr>
  `).join('') || '';

  return `
    <body style="background: ${backgroundColor};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center" style="padding: 20px 0px 0px 0px; font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; font-weight: bold;">
            Order Shipped
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Good news! Your order #${order.displayId} has been shipped.
          </td>
        </tr>
        ${trackingHtml ? `
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; margin: 0 0 10px 0;">Tracking Information</h3>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #eee;">
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Carrier & Tracking</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Track</th>
              </tr>
              ${trackingHtml}
            </table>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; margin: 0 0 10px 0;">Items Shipped</h3>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #eee;">
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Item</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Price</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Total</th>
              </tr>
              ${itemsHtml}
            </table>
          </td>
        </tr>
        ${order.shippingAddress ? `
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; margin: 0 0 10px 0;">Shipping Address</h3>
            <p style="font-family: Helvetica, Arial, sans-serif; color: ${textColor}; margin: 0; line-height: 1.4;">
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.company ? `${order.shippingAddress.company}<br>` : ''}
              ${order.shippingAddress.address1}<br>
              ${order.shippingAddress.address2 ? `${order.shippingAddress.address2}<br>` : ''}
              ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country?.displayName || order.shippingAddress.country?.iso2}<br>
              ${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ''}
            </p>
          </td>
        </tr>
        ` : ''}
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}">
                  <a href="${orderUrl}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 12px 24px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">
                    View Order Details
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0px 0px 20px 0px; font-size: 14px; line-height: 20px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Thank you for your order! If you have any questions, please contact us.
          </td>
        </tr>
      </table>
    </body>
  `;
}

export async function sendOrderConfirmationEmail(order: any, baseUrl?: string): Promise<void> {
  if (!order.email) {
    console.warn('No email address found for order', order.id);
    return;
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
      console.log(`✉️ Order confirmation email sent! Preview it at ${getTestMessageUrl(info)}`);
    } else {
      console.log(`✉️ Order confirmation email sent to ${order.email} for order #${order.displayId}`);
    }
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

export async function sendOrderFulfillmentEmail(order: any, fulfillment: any, baseUrl?: string): Promise<void> {
  if (!order.email) {
    console.warn('No email address found for order', order.id);
    return;
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
      console.log(`✉️ Order fulfillment email sent! Preview it at ${getTestMessageUrl(info)}`);
    } else {
      console.log(`✉️ Order fulfillment email sent to ${order.email} for order #${order.displayId}`);
    }
  } catch (error) {
    console.error('Failed to send order fulfillment email:', error);
  }
}
