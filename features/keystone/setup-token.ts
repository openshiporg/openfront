/**
 * Claiming a fresh install. Keystone's `createInitialUser` is public: whoever
 * reaches a just-deployed site first becomes its admin. When SETUP_TOKEN is
 * set (a deploy template can generate it, e.g. `${{secret(32)}}`), creating the
 * first user also needs that token, sent as the `x-setup-token` header (the
 * dashboard's /init form sends it for you). Without SETUP_TOKEN nothing changes.
 *
 * Plain module: no @/ imports, so the GraphQL route and tests can load it.
 */
import { createHash, timingSafeEqual } from 'node:crypto'
import { Kind, type DocumentNode, type OperationDefinitionNode } from 'graphql'

export const SETUP_TOKEN_HEADER = 'x-setup-token'
export const SETUP_TOKEN_MESSAGE =
  'This site needs its setup token to create the first admin. Find SETUP_TOKEN in your deployment’s variables.'

export function setupTokenRequired(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.SETUP_TOKEN && env.SETUP_TOKEN.trim())
}

export function setupTokenMatches(
  supplied: string | null | undefined,
  env: Record<string, string | undefined> = process.env
): boolean {
  const expected = env.SETUP_TOKEN?.trim()
  if (!expected) return true
  if (!supplied) return false
  // Hash both so the comparison is constant-time whatever their lengths.
  const a = createHash('sha256').update(String(supplied).trim()).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

/** True when the operation that will run asks for createInitialUser. */
export function createsInitialUser(document: DocumentNode, operationName?: string | null): boolean {
  const operations = document.definitions.filter(
    (d): d is OperationDefinitionNode => d.kind === Kind.OPERATION_DEFINITION
  )
  const chosen = operationName
    ? operations.filter(o => o.name?.value === operationName)
    : operations
  return chosen.some(
    op =>
      op.operation === 'mutation' &&
      op.selectionSet.selections.some(s => s.kind === Kind.FIELD && s.name.value === 'createInitialUser')
  )
}

function header(headers: any, name: string): string | null {
  if (!headers) return null
  if (typeof headers.get === 'function') return headers.get(name)
  const value = headers[name] ?? headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value ?? null
}

/** graphql-yoga plugin: refuse createInitialUser without the setup token. */
export function useSetupTokenGuard(env: Record<string, string | undefined> = process.env) {
  return {
    onExecute({ args, setResultAndStopExecution }: any) {
      if (!setupTokenRequired(env)) return
      if (!createsInitialUser(args.document, args.operationName)) return
      const req = args?.contextValue?.req
      if (setupTokenMatches(header(req?.headers, SETUP_TOKEN_HEADER), env)) return
      setResultAndStopExecution({
        errors: [{ message: SETUP_TOKEN_MESSAGE, extensions: { code: 'FORBIDDEN' } }],
      })
    },
  }
}
