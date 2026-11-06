// Abandoned-cart recovery emails, sent from inside the production server process (no separate worker).
// Each cart is claimed once via Cart.abandonedEmailSent, so replicas can run side by side.
const INTERVAL_MS = 15 * 60_000

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NODE_ENV !== 'production') return
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) return
  const globalState = globalThis as unknown as { abandonedCartLoop?: boolean }
  if (globalState.abandonedCartLoop) return
  globalState.abandonedCartLoop = true

  let running = false
  const pass = async () => {
    if (running) return
    running = true
    try {
      const [{ keystoneContext }, { sendAbandonedCartEmails }] = await Promise.all([
        import('./features/keystone/context'),
        import('./features/keystone/lib/abandoned-cart'),
      ])
      await sendAbandonedCartEmails((keystoneContext.sudo() as any).prisma)
    } catch {
      console.error('[abandoned-cart] pass failed; retrying on the next interval')
    } finally {
      running = false
    }
  }
  setInterval(() => { void pass() }, INTERVAL_MS).unref?.()
  setTimeout(() => { void pass() }, 60_000).unref?.()
}
