'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { refundOrderPaymentAction } from '../actions/refund'

export interface RefundablePayment {
  id: string; status: string; amount: number; amountRefunded: number; currencyCode: string
  refunds?: { id: string; amount: number; note: string; createdAt: string }[]
}

export function RefundOrderDialog({ orderId, payments }: { orderId: string; payments: RefundablePayment[] }) {
  const router = useRouter()
  const available = payments.filter(p => (p.status === 'captured' || p.status === 'partially_refunded') && p.amount > p.amountRefunded)
  const [paymentId, setPaymentId] = useState(available[0]?.id || '')
  const payment = available.find(p => p.id === paymentId)
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(payment ? ((payment.amount - payment.amountRefunded) / 100).toFixed(2) : '')
  const [reason, setReason] = useState('')
  const [restock, setRestock] = useState(true)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Keep the exact request/key after an uncertain outcome; changing the payload must not risk a second refund.
  const request = useRef<Parameters<typeof refundOrderPaymentAction>[0] | null>(null)
  const money = (value: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value / 100)
  const minorAmount = Math.round(Number(amount) * 100)
  const remainingAll = available.reduce((sum, p) => sum + p.amount - p.amountRefunded, 0)
  const bringsFullyRefunded = /^\d+(\.\d{1,2})?$/.test(amount) && minorAmount > 0 && minorAmount >= remainingAll
  const refunded = payments.reduce((sum, p) => sum + (p.refunds || []).reduce((n, r) => n + r.amount, 0), 0)

  return <div className="space-y-3 text-sm">
    {refunded > 0 && <p className="font-medium">{available.length ? 'Partially refunded' : 'Refunded'} · {payments.filter(p => p.refunds?.length).map(p => money((p.refunds || []).reduce((n, r) => n + r.amount, 0), p.currencyCode)).join(' + ')}</p>}
    {(!!available.length || !!notice) && <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value) }}>
      {!!available.length && <DialogTrigger asChild><Button variant="outline" size="sm" onClick={() => setNotice('')}>Refund</Button></DialogTrigger>}
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md text-sm">
        <DialogHeader><DialogTitle>Refund payment</DialogTitle><DialogDescription>Refund to the original payment method.</DialogDescription></DialogHeader>
        {notice ? <div className="space-y-4"><p role="status" className="text-sm break-words">{notice}</p><DialogFooter><Button type="button" variant="outline" onClick={() => { setOpen(false); setNotice('') }}>Close</Button></DialogFooter></div> : <form className="space-y-4" onSubmit={async event => {
          event.preventDefault()
          if (busy || !payment) return
          const minor = Math.round(Number(amount) * 100)
          if (!/^\d+(\.\d{1,2})?$/.test(amount) || minor <= 0 || minor > payment.amount - payment.amountRefunded || !reason.trim()) { setError('Enter an available amount and a reason.'); return }
          request.current ||= { orderId, paymentId, amount: minor, reason: reason.trim(), idempotencyKey: crypto.randomUUID(), restock: bringsFullyRefunded && restock }
          setBusy(true); setError('')
          try {
            const result = await refundOrderPaymentAction(request.current)
            if (!result.success) { setError(result.error || 'Refund not confirmed. Retry this request to reconcile.'); return }
            request.current = null; router.refresh()
            if (result.restock && !result.restock.restocked) { setNotice(`Refunded. Items were not returned to stock: ${result.restock.reason || 'unknown error'}`); return }
            setOpen(false)
          } catch { setError('Refund not confirmed. Retry this request to reconcile.') }
          finally { setBusy(false) }
        }}>
          <div className="space-y-2"><Label htmlFor="refund-payment">Payment</Label>
            <Select value={paymentId} disabled={busy || !!request.current} onValueChange={id => { setPaymentId(id); const p = available.find(p => p.id === id)!; setAmount(((p.amount - p.amountRefunded) / 100).toFixed(2)) }}><SelectTrigger id="refund-payment"><SelectValue /></SelectTrigger><SelectContent>{available.map(p => <SelectItem key={p.id} value={p.id}>{money(p.amount - p.amountRefunded, p.currencyCode)} available</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-2"><Label htmlFor="refund-amount">Amount ({payment?.currencyCode})</Label><Input id="refund-amount" inputMode="decimal" value={amount} disabled={busy || !!request.current} onChange={e => setAmount(e.target.value)} required /></div>
          <div className="space-y-2"><Label htmlFor="refund-reason">Reason</Label><Textarea id="refund-reason" value={reason} maxLength={1000} disabled={busy || !!request.current} onChange={e => setReason(e.target.value)} required /></div>
          {bringsFullyRefunded && <div className="flex items-center gap-2"><Checkbox id="refund-restock" checked={request.current ? !!request.current.restock : restock} disabled={busy || !!request.current} onCheckedChange={v => setRestock(v === true)} /><Label htmlFor="refund-restock" className="text-sm font-normal">Return items to stock (cancels any fulfilment and the order)</Label></div>}
          {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Refunding…' : request.current ? 'Retry refund' : 'Confirm refund'}</Button></DialogFooter>
        </form>}
      </DialogContent>
    </Dialog>}
  </div>
}
