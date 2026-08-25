import crypto from 'node:crypto';

export type WebhookScope = 'STORE' | 'USER';

export function normalizeWebhookUrl(value: unknown): string {
  let url: URL;
  try {
    url = new URL(String(value || '').trim());
  } catch {
    throw new Error('Webhook URL must be an absolute URL');
  }

  const localDevelopment =
    process.env.NODE_ENV !== 'production' &&
    (url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '::1' ||
      url.hostname.endsWith('.local'));
  if (url.protocol !== 'https:' && !(localDevelopment && url.protocol === 'http:')) {
    throw new Error('Webhook URL must use HTTPS');
  }
  if (url.username || url.password || url.hash) {
    throw new Error('Webhook URL cannot contain credentials or a fragment');
  }

  return url.toString();
}

export function normalizeWebhookEvents(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('At least one webhook event is required');
  }
  const events = value.map((event) => String(event || '').trim()).filter(Boolean);
  if (events.length !== value.length) throw new Error('Webhook event names cannot be empty');
  return [...new Set(events)].sort();
}

export function normalizeWebhookRegistrationKey(value: unknown): string {
  const key = String(value || '').trim();
  if (!key || key.length > 255) {
    throw new Error('Webhook registration key must be between 1 and 255 characters');
  }
  return key;
}

export function requireWebhookScope(actual: WebhookScope, required: unknown): void {
  if (required === undefined || required === null || required === '') return;
  const expected = String(required).trim().toUpperCase();
  if (expected !== 'STORE' && expected !== 'USER') {
    throw new Error('Required webhook scope must be STORE or USER');
  }
  if (expected !== actual) {
    throw new Error(`Webhook registration requires ${expected} scope`);
  }
}

export function webhookSubscriptionKey(
  scope: WebhookScope,
  ownerId: string | null,
  registrationKey: string
): string {
  if (scope === 'USER' && !ownerId) throw new Error('USER webhook subscriptions require an owner');
  const principal = scope === 'USER' ? ownerId : 'store';
  return crypto
    .createHash('sha256')
    .update(`webhook-subscription:v1\0${scope}\0${principal}\0${registrationKey}`)
    .digest('hex');
}
