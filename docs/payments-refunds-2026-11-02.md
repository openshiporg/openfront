# Payments and refunds repair — 2026-11-02

## Root cause and reuse decision

Capability IDs: C02, C09, C19, C21. The catalog/index now live under `../fleet-docs/`, not their obsolete `~/Code/` skill paths.

`app/dashboard/(admin)/platform/payments/page.tsx` and the refunds equivalent were absent. The generic `app/dashboard/(admin)/[listKey]/[id]/page.tsx:1` instead resolves these URLs as list `platform`, item `payments` or `refunds`. `features/dashboard/screens/ItemPage/index.tsx:24-27` cannot find that list. The live browser showed the generic error screen, with console `Dashboard operation failed (details redacted)`. Recent read-only Railway logs contained unrelated duplicate-user constraints, stream aborts and transformAlgorithm failures, not a payments-page client crash.

There were **no existing platform payments/refunds nav links** in origin/master. `features/dashboard/components/Sidebar.tsx:97` derives the Models links as `/dashboard/${list.path}`; the live Models menu correctly linked `/dashboard/payments` and `/dashboard/refunds`. New explicit platform navigation now exposes the operational ledgers. Existing Payment/Refund Lists supply the rows, with session-aware GraphQL, 25-row pagination, stable ordering, no editable financial CRUD or sensitive provider fields. No dedicated payment/refund list view existed to reuse; generic CRUD remains available under Models.

`features/platform/orders/screens/OrderPageClient.tsx` had no refund action. `features/platform/orders/actions/orders.ts:getOrder` did not select Payment IDs/balances.

Donors inspected:
- E-commerce `features/keystone/mutations/processReturnRefund.ts`, `utils/idempotency.ts`, `utils/paymentProviderAdapter.ts`, `features/integrations/payment/stripe.ts`.
- E-commerce Payment, Refund, Return, IdempotencyKey, Order models; generic ListPage/ItemPage, session-aware keystoneClient; generated schema and dependency declarations.
- Restaurant `features/keystone/mutations/refundPayment.ts`: refund reservation/replay pattern, but incompatible status/schema and independent manager-approval policy, so not copied.

Decision: adapt E-commerce's existing refund orchestration for a direct payment refund. Permission checks → fingerprinted durable attempt → atomic captured-balance reservation → existing provider adapter outside transaction → validated provider receipt → Refund/audit/outbox finalization. Do not create a physical return or restock inventory. UI uses existing shadcn Dialog and Select popover and the platform raised button track. No migration, dependency or shared dashboard code changes; NKS C10 port is not applicable.

Retained invariants: positive integer minor units, captured tender, order/payment binding, reason, both payment/return management permissions, available balance including in-flight reservations, same-key payload binding, retry serialization, provider idempotency, unknown reservation retention, no fabricated success, durable refund receipt, audit and outbox. Finalization locks the durable attempt row and completes atomically. Old uncertain attempts require provider reconciliation after one hour. Current direct UI assumes two-decimal currencies, matching the existing storefront's minor-unit convention.

Demo guard unchanged: its identity/role/store restrictions do not cover Payment, Refund or OrderEvent. Live impossible@ login has both required refund permissions.

## Verification before release

- `node --test tests/order-refund.test.cjs tests/demo-guard.test.cjs`: 19/19 passed (8 refund + 11 existing guard tests).
- Behavioral refund tests: full/partial, upper bound including reservations, same-key concurrent double-click and sequential retry, different-key full-balance race, changed payload, authorization/order binding/state/invalid amount/reason, unknown provider outcome, impossible@ demo policy.
- `tsc --noEmit --pretty false`: repository has 1015 existing diagnostic lines; zero diagnostics start with any touched/new TypeScript path.
- `git diff --check`: passed.
- Dirty canonical checkout preserved; isolated `/tmp` worktree off origin/master.
- Live Stripe TEST admin refund, deployment and screenshots: pending at this checkpoint; worker reports final evidence to Lead 2 only.
