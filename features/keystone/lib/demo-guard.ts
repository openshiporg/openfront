/**
 * Demo-account guard. Public demo logins (env `DEMO_USER_EMAILS`, comma-separated,
 * case-insensitive) can try the whole admin, but cannot:
 *   1. change any user's password or email (their own included),
 *   2. change roles or permissions,
 *   3. create, delete or update users,
 *   4. change the store's name, logo, domain or URL settings.
 *
 * Enforced server-side as a `beforeOperation` hook wrapped around the lists named in
 * DEMO_GUARD_POLICY. List hooks also run for `context.sudo()` writes (the session is
 * kept), so custom mutations and server actions that write through Keystone are covered.
 * `useDemoGuardErrors()` turns the wrapped Keystone error into the exact copy.
 *
 * Plain module: no @/ imports, only `graphql`.
 */
import { GraphQLError } from 'graphql'

export const DEMO_GUARD_MESSAGE = "Demo accounts can't change this."

export type DemoListPolicy =
  /** Every create, update and delete is refused. */
  | { kind: 'locked' }
  /**
   * Login identities (User, staff Members). Create, delete and updates to any other
   * record are refused. On the demo user's own record only `protectedFields` are refused
   * (default email, password, role, name), so onboarding state and addresses still save.
   */
  | { kind: 'identity'; protectedFields?: string[] }
  /** Create and delete are refused unless allowed; updates are refused only when they touch `fields`. */
  | { kind: 'fields'; fields: string[]; allowCreateDelete?: boolean }

export type DemoGuardPolicy = Record<string, DemoListPolicy>

export const IDENTITY_FIELDS = ['email', 'password', 'role', 'name']

// E-commerce (openfront). Product, Order and every other list are not listed: unaffected.
export const DEMO_GUARD_POLICY: DemoGuardPolicy = {
  User: { kind: 'identity' },
  Role: { kind: 'locked' },
  Invite: { kind: 'locked' },
  Store: {
    kind: 'fields',
    fields: ['name', 'logoIcon', 'logoColor', 'swapLinkTemplate', 'paymentLinkTemplate', 'inviteLinkTemplate'],
  },
}

export function demoUserEmails(env: Record<string, string | undefined> = process.env): Set<string> {
  return new Set(
    String(env.DEMO_USER_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

export class DemoGuardError extends Error {
  constructor() {
    super(DEMO_GUARD_MESSAGE)
    this.name = 'DemoGuardError'
  }
}

/** The signed-in user's email, from session data or, failing that, the identity list. */
async function sessionEmail(context: any): Promise<string | null> {
  const session = context?.session
  if (!session?.itemId) return null
  const fromData = session.data?.email
  if (typeof fromData === 'string') return fromData
  try {
    const listKey = session.listKey || 'User'
    const item = await context.sudo().db[listKey].findOne({ where: { id: String(session.itemId) } })
    return typeof item?.email === 'string' ? item.email : null
  } catch {
    return null
  }
}

/** True when the request's session belongs to a demo login. */
export async function isDemoSession(context: any, env: Record<string, string | undefined> = process.env) {
  const emails = demoUserEmails(env)
  if (!emails.size) return false
  const email = await sessionEmail(context)
  return !!email && emails.has(email.trim().toLowerCase())
}

/** Throws DemoGuardError when a demo login tries to change something it may not. */
export async function assertNotDemo(context: any, env: Record<string, string | undefined> = process.env) {
  if (await isDemoSession(context, env)) throw new DemoGuardError()
}

function touches(inputData: Record<string, unknown> | undefined, fields: string[]) {
  return !!inputData && fields.some((field) => Object.hasOwn(inputData, field) && inputData[field] !== undefined)
}

/** Whether `policy` refuses this operation for a demo session. */
export function demoRefuses(
  policy: DemoListPolicy,
  { listKey, operation, item, inputData, session }: {
    listKey: string
    operation: 'create' | 'update' | 'delete'
    item?: { id?: unknown } | null
    inputData?: Record<string, unknown>
    session?: { itemId?: unknown; listKey?: string } | null
  }
): boolean {
  if (policy.kind === 'locked') return true
  if (policy.kind === 'identity') {
    if (operation !== 'update') return true
    const own = String(item?.id ?? '') === String(session?.itemId ?? '') && (session?.listKey || 'User') === listKey
    if (!own) return true
    return touches(inputData, policy.protectedFields ?? IDENTITY_FIELDS)
  }
  if (operation !== 'update') return !policy.allowCreateDelete
  return touches(inputData, policy.fields)
}

function runHook(hook: any, operation: string, args: any) {
  if (!hook) return
  if (typeof hook === 'function') return hook(args)
  return hook[operation]?.(args)
}

/** Wraps each list named in `policy` with the demo guard, keeping its existing hooks. */
export function withDemoGuard<T extends Record<string, any>>(
  lists: T,
  policy: DemoGuardPolicy = DEMO_GUARD_POLICY,
  env: Record<string, string | undefined> = process.env
): T {
  const guarded: Record<string, any> = { ...lists }
  for (const [listKey, listPolicy] of Object.entries(policy)) {
    const list = lists[listKey]
    if (!list) continue
    const previous = list.hooks?.beforeOperation
    guarded[listKey] = {
      ...list,
      hooks: {
        ...list.hooks,
        beforeOperation: async (args: any) => {
          if (
            demoRefuses(listPolicy, { ...args, listKey, session: args.context?.session }) &&
            (await isDemoSession(args.context, env))
          ) {
            throw new DemoGuardError()
          }
          return runHook(previous, args.operation, args)
        },
      },
    }
  }
  return guarded as T
}

function isDemoError(error: any) {
  return typeof error?.message === 'string' && error.message.includes(DEMO_GUARD_MESSAGE)
}

/** The exact copy, in place of Keystone's "An error occurred while running ..." wrapper. */
export function rewriteDemoErrors(result: any) {
  if (!result?.errors?.some?.(isDemoError)) return result
  return {
    ...result,
    errors: result.errors.map((error: any) =>
      isDemoError(error)
        ? new GraphQLError(DEMO_GUARD_MESSAGE, { path: error.path, extensions: { code: 'KS_ACCESS_DENIED' } })
        : error
    ),
  }
}

/** Yoga/envelop plugin for pages/api/graphql.ts. */
export function useDemoGuardErrors() {
  return {
    onExecute() {
      return {
        onExecuteDone({ result, setResult }: any) {
          if (result && !(Symbol.asyncIterator in result)) setResult(rewriteDemoErrors(result))
        },
      }
    },
  }
}
