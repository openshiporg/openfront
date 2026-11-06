"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { returnGiftCardPaymentAction } from "../../gift-cards/actions/gift-card-actions";

/**
 * What gift cards paid on this order (a tender, shown beside the card payment). Staff can put that
 * amount back on the card, the store-credit half of a refund (Shopify refunds gift-card tender to the card).
 */
export function OrderGiftCardsPaid({ orderId, transactions, money }: { orderId: string; transactions: any[]; money: (cents: number) => string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  if (!transactions?.length) return null;

  const byCard = new Map<string, { card: any; amount: number }>();
  for (const row of transactions) {
    if (!row.giftCard?.id) continue;
    const entry = byCard.get(row.giftCard.id) || { card: row.giftCard, amount: 0 };
    entry.amount += row.amount;
    byCard.set(row.giftCard.id, entry);
  }

  const returnToCard = async (card: any, paid: number) => {
    const ledger: any[] = Array.isArray(card.metadata?.ledger) ? card.metadata.ledger : [];
    const returned = ledger.filter((r) => r.type === "return" && r.ref === `order:${orderId}`).reduce((s, r) => s + r.amount, 0);
    const left = paid - returned;
    if (left <= 0) { toast.error("This order's gift card amount is already back on the card."); return; }
    const input = window.prompt(`Put how much back on gift card ${card.code}? (up to ${money(left)})`, (left / 100).toFixed(2));
    if (!input) return;
    if (!/^\d+(\.\d{1,2})?$/.test(input.trim())) { toast.error("Enter an amount like 12.50"); return; }
    const cents = Math.round(Number(input) * 100);
    if (cents <= 0 || cents > left) { toast.error(`Enter up to ${money(left)}`); return; }
    const reason = window.prompt("Reason", "Order refund");
    if (!reason?.trim()) return;
    setBusy(card.id);
    const result: any = await returnGiftCardPaymentAction(orderId, card.id, cents, reason);
    setBusy("");
    if (!result?.success) { toast.error(result?.error || "That didn't work."); return; }
    toast.success(`${money(cents)} is back on gift card ${card.code}.`);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {[...byCard.values()].map(({ card, amount }) => {
        const ledger: any[] = Array.isArray(card.metadata?.ledger) ? card.metadata.ledger : [];
        const returned = ledger.filter((r) => r.type === "return" && r.ref === `order:${orderId}`).reduce((s, r) => s + r.amount, 0);
        return (
          <div key={card.id} className="flex flex-wrap items-center justify-between gap-2">
            <span className="min-w-0">
              Gift card <span className="font-mono">{card.code}</span>
              {returned > 0 && <span className="block text-xs text-muted-foreground">{money(returned)} returned to the card</span>}
            </span>
            <span className="flex items-center gap-2">
              <span className="tabular-nums">{money(amount)}</span>
              {returned < amount && (
                <Button size="sm" variant="outline" className="h-7" disabled={!!busy} onClick={() => returnToCard(card, amount)}>
                  {busy === card.id ? "Working…" : "Return to card"}
                </Button>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
