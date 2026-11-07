/**
 * Keystone 6.5 wraps its Prisma client in a query extension that catches every failed query, logs it and *returns*
 * a GraphQLError (extensions.code KS_PRISMA_ERROR) instead of throwing. Prisma runs query extensions outermost-first,
 * so Keystone's catch always runs last and an app-level `$extends` cannot undo it. Inside a transaction a failed
 * update (P2025) or unique conflict therefore does not stop the writer: later statements still run and commit, a
 * serializable conflict never reaches its retry, and the caller treats the error value as a row.
 *
 * `throwKeystonePrismaErrors` wraps the client Keystone hands to `db.extendPrismaClient` (and every transaction client
 * derived from it) so model and raw queries throw again. The thrown value is Keystone's own GraphQLError, unchanged
 * apart from the Prisma `code`/`meta` restored on it, so GraphQL masking keyed on KS_PRISMA_ERROR and constraint
 * mappers reading `error.code` both keep working. Successful results pass through untouched, and model calls stay
 * PrismaPromises so batch `$transaction([...])` still works.
 */
const RAW_METHOD = /^\$(queryRaw|executeRaw|queryRawUnsafe|executeRawUnsafe|queryRawTyped|runCommandRaw)$/
const clients = new WeakMap<object, any>()
const delegates = new WeakMap<object, any>()

export function isKeystonePrismaError(value: unknown): value is Error & { extensions: Record<string, any> } {
  return value instanceof Error && (value as any).extensions?.code === 'KS_PRISMA_ERROR'
}

export function rethrowKeystonePrismaError<T>(value: T): T {
  if (!isKeystonePrismaError(value)) return value
  const prisma = (value.extensions.prisma ?? {}) as Record<string, unknown>
  throw Object.assign(value, { code: prisma.code, meta: prisma.meta, clientVersion: prisma.clientVersion })
}

/** Keeps the (lazy) PrismaPromise itself, so batch transactions accept it, but settles through the rethrow. */
function throwing<T>(result: T): T {
  if (!result || typeof (result as any).then !== 'function') return rethrowKeystonePrismaError(result)
  const settled = () => (result as any).then(rethrowKeystonePrismaError)
  return new Proxy(result as any, {
    get(target, key) {
      if (key === 'then') return (ok?: any, fail?: any) => settled().then(ok, fail)
      if (key === 'catch') return (fail?: any) => settled().catch(fail)
      if (key === 'finally') return (done?: any) => settled().finally(done)
      const value = Reflect.get(target, key, target)
      return typeof value === 'function' ? value.bind(target) : value
    },
  })
}

function throwingDelegate<T extends object>(delegate: T): T {
  const cached = delegates.get(delegate)
  if (cached) return cached
  const wrapped = new Proxy(delegate as any, {
    get(target, key) {
      const value = Reflect.get(target, key, target)
      return typeof value === 'function' ? (...args: unknown[]) => throwing(value.apply(target, args)) : value
    },
  })
  delegates.set(delegate, wrapped)
  return wrapped
}

export function throwKeystonePrismaErrors<T extends object>(client: T): T {
  const cached = clients.get(client)
  if (cached) return cached
  const wrapped = new Proxy(client as any, {
    get(target, key) {
      const value = Reflect.get(target, key, target)
      if (key === '$transaction' && typeof value === 'function') {
        return (work: unknown, ...options: unknown[]) => {
          if (typeof work === 'function') return value.call(target, (tx: object) => (work as any)(throwKeystonePrismaErrors(tx)), ...options)
          return Promise.resolve(value.call(target, work, ...options)).then((results: unknown) => (Array.isArray(results) ? results.map(rethrowKeystonePrismaError) : results))
        }
      }
      if (key === '$extends' && typeof value === 'function') return (...args: unknown[]) => throwKeystonePrismaErrors(value.apply(target, args))
      if (typeof key === 'string' && RAW_METHOD.test(key) && typeof value === 'function') return (...args: unknown[]) => throwing(value.apply(target, args))
      if (typeof value === 'function') return value.bind(target)
      if (typeof key === 'string' && !key.startsWith('$') && value && typeof value === 'object' && typeof (value as any).findFirst === 'function') return throwingDelegate(value)
      return value
    },
  })
  clients.set(client, wrapped)
  return wrapped
}
