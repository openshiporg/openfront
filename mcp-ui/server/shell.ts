import type { CardPayload } from '../types';
import { MCP_UI_RUNTIME_VERSION } from './version';

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c);
const scriptJson = (value: unknown) => (JSON.stringify(value) ?? 'null').replace(/[<>&\u2028\u2029]/g, (c) => ({ '<': '\\u003c', '>': '\\u003e', '&': '\\u0026', '\u2028': '\\u2028', '\u2029': '\\u2029' })[c] || c);

/**
 * A small HTML document per MCP card. The data travels as inert JSON; the TuffUI runtime
 * (public/images/mcp-ui/runtime.{js,css}, built by scripts/build-mcp-ui.mjs) renders it in the sandboxed iframe.
 */
export function renderMcpCard(payload: CardPayload, title: string, origin: string): string {
  const base = escapeHtml(origin.replace(/\/$/, ''));
  const v = MCP_UI_RUNTIME_VERSION;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="${base}/images/mcp-ui/runtime.css?v=${v}">
</head>
<body>
<div id="root"></div>
<script type="application/json" id="mcp-data">${scriptJson(payload)}</script>
<script src="${base}/images/mcp-ui/runtime.js?v=${v}"></script>
</body>
</html>`;
}
