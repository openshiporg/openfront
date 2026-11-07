import type { CartData } from '../types';

let counter = 0;

/** Ask the host chat to run a Marketplace tool. Resolves with the tool response; the host enforces the action policy. */
export function callTool(toolName: string, params: Record<string, unknown>): Promise<any> {
  const messageId = `${toolName}-${Date.now()}-${counter++}`;
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener('message', onMessage);
      reject(new Error('The request timed out.'));
    }, 90_000);
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (data?.messageId !== messageId || data?.type !== 'ui-message-response') return;
      window.clearTimeout(timer);
      window.removeEventListener('message', onMessage);
      if (data.payload?.error) reject(new Error(String(data.payload.error?.message ?? data.payload.error)));
      else resolve(data.payload?.response);
    }
    window.addEventListener('message', onMessage);
    window.parent.postMessage({ type: 'tool', messageId, payload: { toolName, params } }, '*');
  });
}

export function responseText(response: any): string | undefined {
  const text = response?.content?.[0]?.text;
  return typeof text === 'string' ? text : undefined;
}

/** True when the tool answered without an error payload. */
export function succeeded(response: any): boolean {
  const text = responseText(response);
  if (!text) return Boolean(response?.content?.[0]?.resource);
  try {
    return !JSON.parse(text)?.error;
  } catch {
    return !/^\s*(❌|error)/i.test(text);
  }
}

export function errorMessage(response: any, fallback: string): string {
  const text = responseText(response);
  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text);
    return String(parsed?.message || parsed?.error || fallback);
  } catch {
    return text.slice(0, 240) || fallback;
  }
}

/** viewCart answers with a card document; read the cart data back out of it. */
export function cartFromResponse(response: any): CartData | undefined {
  const html = response?.content?.[0]?.resource?.text;
  if (typeof html !== 'string') return undefined;
  const match = /<script type="application\/json" id="mcp-data">([\s\S]*?)<\/script>/.exec(html);
  if (!match) return undefined;
  try {
    const payload = JSON.parse(match[1]);
    return payload?.kind === 'cart' ? payload.data : undefined;
  } catch {
    return undefined;
  }
}
