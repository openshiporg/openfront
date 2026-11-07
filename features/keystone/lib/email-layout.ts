// Shared transactional email layout: plain HTML strings with inline styles, no dependencies.
// 600px table layout that survives Gmail/Outlook/Apple Mail. Every wrapper sets an explicit background so
// clients that invert colours in dark mode keep text readable, and the prefers-color-scheme block gives
// Apple Mail / iOS a proper dark palette.

export const SUPPORT_EMAIL = "hello@e-commerce.openship.org";

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const C = {
  canvas: "#f4f4f5",
  card: "#ffffff",
  text: "#18181b",
  muted: "#52525b",
  subtle: "#71717a",
  line: "#e4e4e7",
  panel: "#fafafa",
  button: "#18181b",
  buttonText: "#ffffff",
  link: "#18181b",
};

export const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Store name for the header: the display name in SMTP_FROM ("Acme <hello@acme.com>"), else a fallback. */
export function storeNameFromEnv(fallback = "Openfront") {
  const match = /^\s*"?([^"<]+?)"?\s*</.exec(process.env.SMTP_FROM || "");
  return match?.[1]?.trim() || fallback;
}

const p = (html: string, style = "") =>
  `<p class="em-text" style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:24px;color:${C.text};${style}">${html}</p>`;

export const emailParagraph = p;
export const emailMuted = (html: string) =>
  `<p class="em-muted" style="margin:0 0 16px;font-family:${FONT};font-size:14px;line-height:22px;color:${C.muted};">${html}</p>`;

/** Bulletproof button: a table cell with bgcolor so it renders even where padding on <a> is ignored. */
export function emailButton(label: string, href: string) {
  return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
<tr><td class="em-btn" align="center" bgcolor="${C.button}" style="border-radius:8px;background:${C.button};">
<a class="em-btn-a" href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:16px;font-weight:600;line-height:20px;color:${C.buttonText};text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

export function emailHeading(text: string) {
  return `<h2 class="em-text" style="margin:24px 0 12px;font-family:${FONT};font-size:13px;line-height:18px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:${C.subtle};">${escapeHtml(text)}</h2>`;
}

/** A boxed panel, e.g. for a gift card code or a list of returned items. */
export function emailPanel(html: string, align: "left" | "center" = "left") {
  return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 20px;">
<tr><td class="em-panel" align="${align}" bgcolor="${C.panel}" style="padding:16px 18px;background:${C.panel};border:1px solid ${C.line};border-radius:8px;font-family:${FONT};font-size:15px;line-height:22px;color:${C.text};">${html}</td></tr></table>`;
}

export type EmailLineItem = { title: string; detail?: string; quantity: number; amount?: string };

/** Item rows: title, muted detail line and quantity on the left, the line total on the right. */
export function emailItems(items: EmailLineItem[]) {
  const rows = items
    .map(
      (item) => `<tr>
<td class="em-line" style="padding:14px 0;border-bottom:1px solid ${C.line};font-family:${FONT};vertical-align:top;">
<div class="em-text" style="font-size:15px;line-height:21px;font-weight:600;color:${C.text};">${escapeHtml(item.title)}</div>
<div class="em-muted" style="font-size:13px;line-height:19px;color:${C.muted};">${[item.detail, `Qty ${item.quantity}`].filter(Boolean).map(escapeHtml).join(" · ")}</div>
</td>
<td class="em-line em-text" align="right" style="padding:14px 0 14px 12px;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:15px;line-height:21px;color:${C.text};vertical-align:top;white-space:nowrap;">${escapeHtml(item.amount || "")}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:0 0 8px;border-top:1px solid ${C.line};" class="em-line">${rows}</table>`;
}

/** Totals block: label/value rows, the last row emphasised as the total. */
export function emailTotals(rows: { label: string; value: string }[]) {
  const last = rows.length - 1;
  const body = rows
    .map((row, i) => {
      const strong = i === last;
      const style = strong
        ? `padding:12px 0 0;border-top:1px solid ${C.line};font-size:17px;line-height:24px;font-weight:700;color:${C.text};`
        : `padding:4px 0;font-size:14px;line-height:20px;color:${C.muted};`;
      const cls = strong ? "em-line em-text" : "em-muted";
      return `<tr><td class="${cls}" style="font-family:${FONT};${style}">${escapeHtml(row.label)}</td><td class="${cls}" align="right" style="font-family:${FONT};${style}white-space:nowrap;">${escapeHtml(row.value)}</td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:8px 0 8px;">${body}</table>`;
}

export function emailLayout(input: {
  storeName?: string;
  preheader?: string;
  title: string;
  body: string;
  footerNote?: string;
  supportEmail?: string;
}) {
  const store = escapeHtml(input.storeName || storeNameFromEnv());
  const support = escapeHtml(input.supportEmail || SUPPORT_EMAIL);
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(input.title)}</title>
<style>
:root { color-scheme: light dark; supported-color-schemes: light dark; }
body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
a { color:${C.link}; }
@media (max-width: 620px) { .em-pad { padding-left:20px !important; padding-right:20px !important; } }
@media (prefers-color-scheme: dark) {
  .em-canvas { background:#09090b !important; }
  .em-card { background:#18181b !important; border-color:#27272a !important; }
  .em-text { color:#fafafa !important; }
  .em-muted { color:#a1a1aa !important; }
  .em-line { border-color:#3f3f46 !important; }
  .em-panel { background:#27272a !important; border-color:#3f3f46 !important; color:#fafafa !important; }
  .em-btn { background:#fafafa !important; }
  .em-btn-a { color:#18181b !important; }
  .em-link { color:#fafafa !important; }
}
[data-ogsc] .em-text { color:#fafafa !important; }
[data-ogsc] .em-muted { color:#a1a1aa !important; }
[data-ogsb] .em-canvas { background:#09090b !important; }
[data-ogsb] .em-card { background:#18181b !important; }
</style>
</head>
<body class="em-canvas" style="margin:0;padding:0;background:${C.canvas};">
${input.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${escapeHtml(input.preheader)}</div>` : ""}
<table role="presentation" class="em-canvas" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="${C.canvas}" style="background:${C.canvas};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;">
<tr><td class="em-pad" style="padding:8px 32px 20px;font-family:${FONT};font-size:18px;line-height:24px;font-weight:700;letter-spacing:-0.01em;"><span class="em-text" style="color:${C.text};">${store}</span></td></tr>
<tr><td class="em-card" bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.line};border-radius:12px;">
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
<tr><td class="em-pad" style="padding:32px 32px 16px;">
<h1 class="em-text" style="margin:0 0 16px;font-family:${FONT};font-size:24px;line-height:32px;font-weight:700;letter-spacing:-0.02em;color:${C.text};">${escapeHtml(input.title)}</h1>
${input.body}
</td></tr>
</table>
</td></tr>
<tr><td class="em-pad" style="padding:20px 32px 8px;font-family:${FONT};font-size:13px;line-height:20px;color:${C.subtle};">
<span class="em-muted" style="color:${C.subtle};">${input.footerNote ? `${input.footerNote}<br>` : ""}Questions? Email <a class="em-link" href="mailto:${support}" style="color:${C.muted};text-decoration:underline;">${support}</a>.<br>${store}</span>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
