"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Divider from "@/features/storefront/modules/common/components/divider"
import { requestOrderReturn } from "@/features/storefront/lib/data/orders"
import { RETURN_REASONS, RETURN_WINDOW_DAYS, returnableLines, returnWindow } from "@/features/keystone/lib/return-request"

const statusCopy: Record<string, string> = {
  requested: "Requested. We'll email you when your refund is issued.",
  received: "Received. Your refund is on its way to your original payment method.",
  requires_action: "We're reviewing this return and will be in touch.",
  canceled: "Cancelled.",
}

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

export default function ReturnRequest({ order, secretKey }: { order: any; secretKey?: string | null }) {
  const router = useRouter()
  const lines = useMemo(() => returnableLines(order), [order])
  const window = useMemo(() => returnWindow(order), [order])
  const returns: any[] = order.returns || []
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState<Record<string, number>>({})
  const [reason, setReason] = useState("")
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const shippedAny = lines.some((l) => l.shipped > 0)
  const returnable = lines.filter((l) => l.returnable > 0)
  if (!shippedAny && !returns.length) return null

  const submit = async () => {
    setError(null)
    const items = Object.entries(qty).filter(([, q]) => q > 0).map(([lineItemId, quantity]) => ({ lineItemId, quantity }))
    if (!items.length) return setError("Choose at least one item to return.")
    if (!reason) return setError("Choose a reason for the return.")
    setSending(true)
    const result = await requestOrderReturn({ orderId: order.id, secretKey: secretKey || null, items, reason, note })
    setSending(false)
    if (!result.success) return setError(result.error)
    setOpen(false)
    setQty({})
    setReason("")
    setNote("")
    router.refresh()
  }

  return (
    <div data-testid="order-returns">
      <h2 className="flex flex-row text-3xl font-medium my-6">Returns</h2>

      {returns.length > 0 && (
        <ul className="mb-6 space-y-3">
          {returns.map((ret) => (
            <li key={ret.id} className="border rounded-lg p-4">
              <p className="text-sm font-medium">Return requested {formatDate(ret.createdAt)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(ret.metadata?.orderLineItems || []).map((l: any) => `${l.quantity} × ${l.title || "Item"}`).join(", ")}
              </p>
              <p className="text-sm mt-1">{statusCopy[ret.status] || ret.status}</p>
            </li>
          ))}
        </ul>
      )}

      {window.open && returnable.length > 0 && !open && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Return shipped items until {formatDate(window.closesAt!)}. Refunds go back to your original payment method.
          </p>
          <Button variant="outline" onClick={() => setOpen(true)} data-testid="start-return">
            Return items
          </Button>
        </div>
      )}

      {!window.open && window.reason === "window_closed" && (
        <p className="text-sm text-muted-foreground">The {RETURN_WINDOW_DAYS}-day return window for this order closed on {formatDate(window.closesAt!)}.</p>
      )}

      {open && (
        <div className="border rounded-lg p-4 space-y-5" data-testid="return-form">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium mb-2">Which items?</legend>
            {returnable.map((line) => (
              <div key={line.id} className="flex items-center justify-between gap-3">
                <label htmlFor={`rq-${line.id}`} className="text-sm min-w-0">
                  <span className="block truncate font-medium">{line.title}</span>
                  {line.variantTitle && <span className="block text-muted-foreground">{line.variantTitle}</span>}
                </label>
                <select
                  id={`rq-${line.id}`}
                  className="h-11 rounded-md border bg-background px-3 text-base sm:text-sm"
                  value={qty[line.id] || 0}
                  onChange={(e) => setQty((q) => ({ ...q, [line.id]: Number(e.target.value) }))}
                >
                  {Array.from({ length: line.returnable + 1 }, (_, n) => (
                    <option key={n} value={n}>{n === 0 ? "Keep" : `Return ${n}`}</option>
                  ))}
                </select>
              </div>
            ))}
          </fieldset>

          <div className="space-y-2">
            <label htmlFor="return-reason" className="text-sm font-medium block">Reason</label>
            <select
              id="return-reason"
              className="h-11 w-full rounded-md border bg-background px-3 text-base sm:text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Choose a reason</option>
              {RETURN_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="return-note" className="text-sm font-medium block">Anything else? <span className="font-normal text-muted-foreground">(optional)</span></label>
            <textarea
              id="return-note"
              maxLength={500}
              rows={3}
              className="w-full rounded-md border bg-background px-3 py-2 text-base sm:text-sm"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => { setOpen(false); setError(null) }} disabled={sending}>Cancel</Button>
            <Button onClick={submit} disabled={sending} data-testid="submit-return">
              {sending ? "Sending…" : "Request return"}
            </Button>
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}
