/**
 * Explicit lifecycles for records that used to be steered by whoever wrote `status` last.
 * Every writer (Keystone hooks, mutations, provider webhooks) asks these maps first.
 * A same-state write is always allowed so retries and replays stay idempotent.
 */
export type TransitionMap<S extends string> = Readonly<Record<S, readonly S[]>>;

export function canTransition<S extends string>(map: TransitionMap<S>, from: string | null | undefined, to: string): boolean {
  if (!from) return Object.prototype.hasOwnProperty.call(map, to);
  if (from === to) return Object.prototype.hasOwnProperty.call(map, to);
  const allowed = (map as Record<string, readonly string[]>)[from];
  return Boolean(allowed && allowed.includes(to));
}

export function assertTransition<S extends string>(name: string, map: TransitionMap<S>, from: string | null | undefined, to: string): void {
  if (!canTransition(map, from, to)) {
    throw new Error(`${name} cannot move from "${from ?? "none"}" to "${to}"`);
  }
}

export type PaymentStatus = "pending" | "authorized" | "captured" | "partially_refunded" | "refunded" | "failed" | "canceled";
// A provider can retry a failed intent, so failed may recover. Captured money is only ever refunded, never "failed" or "canceled" by a late event.
export const PAYMENT_TRANSITIONS: TransitionMap<PaymentStatus> = {
  pending: ["authorized", "captured", "failed", "canceled"],
  authorized: ["captured", "failed", "canceled"],
  captured: ["partially_refunded", "refunded"],
  partially_refunded: ["refunded"],
  refunded: [],
  failed: ["authorized", "captured"],
  canceled: [],
};

export type ReturnStatus = "requested" | "received" | "requires_action" | "canceled";
export const RETURN_TRANSITIONS: TransitionMap<ReturnStatus> = {
  requested: ["received", "requires_action", "canceled"],
  requires_action: ["requested", "received", "canceled"],
  received: [],
  canceled: [],
};
// Only these returns can still be refunded.
export const RETURN_REFUNDABLE: readonly string[] = ["requested", "requires_action"];

export type BusinessAccountRequestStatus = "pending" | "approved" | "not_approved" | "requires_info";
export const BUSINESS_ACCOUNT_REQUEST_TRANSITIONS: TransitionMap<BusinessAccountRequestStatus> = {
  pending: ["approved", "not_approved", "requires_info"],
  requires_info: ["pending", "approved", "not_approved"],
  not_approved: ["pending", "requires_info", "approved"],
  approved: [], // an account has been generated; suspend the account instead
};
