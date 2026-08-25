export const WEBHOOK_DELIVERY_MAX_ATTEMPTS = 12;
export const WEBHOOK_DELIVERY_TIMEOUT_MS = 15_000;
export const WEBHOOK_DELIVERY_LEASE_MS = 2 * 60_000;

export function webhookDeliveryLease(now = Date.now()): Date {
  return new Date(now + WEBHOOK_DELIVERY_LEASE_MS);
}

export function nextWebhookAttempt(attempts: number, now = Date.now()): Date | null {
  if (attempts >= WEBHOOK_DELIVERY_MAX_ATTEMPTS) return null;
  const delay = Math.min(Math.pow(2, attempts) * 60_000, 24 * 60 * 60 * 1000);
  return new Date(now + delay);
}
