"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ViewerTime } from "@/features/dashboard/components/ViewerTime";
import { processReturnRefundAction, updateReturnStatusAction } from "../actions/return-actions";

const STATUS: Record<string, string> = { requested: "Requested", received: "Refunded", requires_action: "Needs action", canceled: "Declined" };

/**
 * Returns on the order (Shopify "Return requests"): what the customer asked to send back, why, and
 * the refund priced from the order lines. Staff approve with one refund to the original payment,
 * or decline.
 */
export function OrderReturnsCard({ returns, payments, money }: { returns: any[]; payments: any[]; money: (cents: number) => string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState("");
  if (!returns?.length) return null;
  const payment = payments.find((p) => ["captured", "partially_refunded"].includes(p.status) && p.amount > (p.amountRefunded || 0));

  const refund = (row: any) => start(async () => {
    if (!payment) { toast.error("No captured payment left to refund."); return; }
    if (!window.confirm(`Refund ${money(row.refundAmount)} to the customer's original payment?`)) return;
    setBusy(row.id);
    const result: any = await processReturnRefundAction({ returnId: row.id, paymentId: payment.id, idempotencyKey: `return-refund:${row.id}` });
    setBusy("");
    if (!result?.success) { toast.error(result?.error || "The refund didn't go through."); return; }
    toast.success(`Refunded ${money(row.refundAmount)}.`);
    router.refresh();
  });
  const decline = (row: any) => start(async () => {
    if (!window.confirm("Decline this return request? The customer isn't refunded.")) return;
    setBusy(row.id);
    const result: any = await updateReturnStatusAction(row.id, "canceled");
    setBusy("");
    if (!result?.success) { toast.error(result?.error || "The return couldn't be updated."); return; }
    toast.success("Return declined.");
    router.refresh();
  });

  return (
    <div className="relative rounded-xl border border-transparent bg-card shadow ring-1 ring-foreground/5 dark:ring-white/10 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-muted/40">
        <CardTitle className="font-medium uppercase text-xs tracking-wider text-muted-foreground flex items-center gap-2">
          <Undo2 className="size-3.5 opacity-70" />
          Returns
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y">
        {returns.map((row) => {
          const meta = row.metadata || {};
          const items: any[] = Array.isArray(meta.orderLineItems) && meta.orderLineItems.length
            ? meta.orderLineItems
            : (row.returnItems || []).map((item: any) => ({ title: item.lineItem?.title, quantity: item.quantity }));
          return (
            <div key={row.id} className="grid gap-2 p-4 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium">{STATUS[row.status] || row.status} · {money(row.refundAmount || 0)}</span>
                <span className="text-xs text-muted-foreground"><ViewerTime value={row.createdAt} style="long" fallback="" /></span>
              </div>
              <ul className="text-sm">
                {items.map((item, index) => <li key={index}>{item.quantity} × {item.title}</li>)}
              </ul>
              {meta.reasonLabel || meta.reason ? <p className="text-xs text-muted-foreground">Reason: {meta.reasonLabel || meta.reason}{meta.note ? ` · “${meta.note}”` : ""}</p> : null}
              {meta.source === "customer" ? <p className="text-xs text-muted-foreground">Requested by the customer</p> : null}
              {row.status === "requested" ? (
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => decline(row)}>Decline</Button>
                  <Button size="sm" disabled={pending || !payment || !(row.refundAmount > 0)} onClick={() => refund(row)}>
                    {busy === row.id ? "Working…" : `Refund ${money(row.refundAmount || 0)}`}
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </div>
  );
}
