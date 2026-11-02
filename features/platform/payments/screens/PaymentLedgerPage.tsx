import { ViewerTime } from '@/features/dashboard/components/ViewerTime';
import Link from 'next/link'
import { keystoneClient } from '@/features/dashboard/lib/keystoneClient'
import { PageBreadcrumbs } from '@/features/dashboard/components/PageBreadcrumbs'

interface Props { searchParams: Promise<Record<string, string | string[] | undefined>> }
const money = (amount: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount / 100)

async function Ledger({ searchParams, refunds = false }: Props & { refunds?: boolean }) {
  const params = await searchParams
  const page = Math.max(1, Math.min(100000, Number.parseInt(String(params.page || '1'), 10) || 1))
  const title = refunds ? 'Refunds' : 'Payments'
  const result = await keystoneClient(refunds ? `query RefundLedger($skip: Int!) {
    items: refunds(take: 25, skip: $skip, orderBy: [{createdAt: desc}, {id: desc}]) {
      id amount note reason createdAt payment { currencyCode order { id displayId } }
    }
    count: refundsCount
  }` : `query PaymentLedger($skip: Int!) {
    items: payments(take: 25, skip: $skip, orderBy: [{createdAt: desc}, {id: desc}]) {
      id amount amountRefunded status currencyCode createdAt order { id displayId }
      refunds { id amount }
    }
    count: paymentsCount
  }`, { skip: (page - 1) * 25 })
  const items = result.success ? result.data?.items || [] : []
  return <>
    <PageBreadcrumbs items={[{ type: 'link', label: 'Dashboard', href: '' }, { type: 'page', label: 'Platform' }, { type: 'page', label: title }]} />
    <main className="min-w-0 max-w-6xl p-4 md:p-6 space-y-6 text-sm">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {!result.success ? <p role="alert" className="text-destructive">{result.error || `Unable to load ${title.toLowerCase()}`}</p> : <>
        {!items.length && <p className="text-muted-foreground">No {title.toLowerCase()} found.</p>}
        <div className="divide-y rounded-xl border">
          {items.map((item: any) => {
            const order = refunds ? item.payment?.order : item.order
            const currency = refunds ? item.payment?.currencyCode : item.currencyCode
            const settledRefund = item.refunds?.reduce((n: number, r: any) => n + r.amount, 0) || 0
            const status = refunds ? 'Refunded' : settledRefund >= item.amount && item.amount > 0 ? 'Refunded' : settledRefund > 0 ? 'Partially refunded' : item.status
            return <article key={item.id} className="min-w-0 p-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="min-w-0 space-y-1">
                {order ? <Link className="font-medium underline underline-offset-4" href={`/dashboard/platform/orders/${order.id}`}>Order #{order.displayId}</Link> : <p className="font-medium">Unassigned payment</p>}
                <p className="capitalize">{status}</p>
                {refunds && <p className="break-words">{item.note || item.reason}</p>}
                <p className="text-xs text-muted-foreground"><ViewerTime value={item.createdAt} style="datetime" /></p>
              </div>
              <div className="space-y-1 sm:text-right"><p className="font-medium">{money(item.amount, currency)}</p>{!refunds && item.amountRefunded > 0 && <p className="text-muted-foreground">{money(item.amountRefunded, currency)} refunded or reserved</p>}</div>
            </article>
          })}
        </div>
        <nav aria-label="Pagination" className="flex flex-wrap items-center gap-4">
          {page > 1 && <Link className="underline" href={`?page=${page - 1}`}>Previous</Link>}
          <span>Page {page}</span>
          {page * 25 < (result.data?.count || 0) && <Link className="underline" href={`?page=${page + 1}`}>Next</Link>}
        </nav>
      </>}
    </main>
  </>
}
export function PaymentsPage(props: Props) { return <Ledger {...props} /> }
export function RefundsPage(props: Props) { return <Ledger {...props} refunds /> }
