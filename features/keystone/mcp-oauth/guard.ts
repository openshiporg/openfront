/**
 * MCP OAuth scopes only narrow what the signed-in user can already do. This guard
 * runs on every GraphQL operation from an MCP-token session:
 *
 * - without `mcp:write`, mutations are refused;
 * - a connected app can never manage credentials: auth, password, token, API key
 *   and OAuth mutations are refused, and so are user updates that set a password
 *   or email.
 *
 * Everything else is decided by the user's own Keystone access control.
 * Plain module: no @/ imports.
 */
import {
  GraphQLError,
  Kind,
  valueFromASTUntyped,
  type DocumentNode,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type FieldNode,
} from 'graphql'
import { mcpSessionMarker } from './session'

export const READ_ONLY_MESSAGE =
  'This connection is read-only. Reconnect the app and allow changes to make updates.'
export const CREDENTIAL_MESSAGE =
  'Connected apps cannot sign in, sign out or change passwords, emails, tokens or keys. Do this in the site itself.'

const CREDENTIAL_MUTATION = /password|passcode|magicauth|apikey|oauth|token|endsession|initialuser|^authenticate/i
const USER_UPDATE_MUTATION = /^update.*user/i
const CREDENTIAL_FIELDS = ['password', 'email']

function rootFields(
  selectionSet: SelectionSetNode,
  fragments: Map<string, FragmentDefinitionNode>,
  seen = new Set<string>()
): FieldNode[] {
  const fields: FieldNode[] = []
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) fields.push(selection)
    else if (selection.kind === Kind.INLINE_FRAGMENT) fields.push(...rootFields(selection.selectionSet, fragments, seen))
    else if (selection.kind === Kind.FRAGMENT_SPREAD && !seen.has(selection.name.value)) {
      seen.add(selection.name.value)
      const fragment = fragments.get(selection.name.value)
      if (fragment) fields.push(...rootFields(fragment.selectionSet, fragments, seen))
    }
  }
  return fields
}

function setsCredential(field: FieldNode, variables: Record<string, unknown>): boolean {
  const dataArg = field.arguments?.find(argument => argument.name.value === 'data')
  if (!dataArg) return false
  const value = valueFromASTUntyped(dataArg.value, variables)
  const entries = Array.isArray(value) ? value.map(entry => entry?.data ?? entry) : [value]
  return entries.some(
    entry => entry && typeof entry === 'object' && CREDENTIAL_FIELDS.some(key => Object.hasOwn(entry, key))
  )
}

/** Why this operation is refused for the given MCP scopes, or null when it may run. */
export function mcpOperationProblem({
  document,
  operationName,
  variables,
  scopes,
}: {
  document: DocumentNode
  operationName?: string | null
  variables?: Record<string, unknown> | null
  scopes: readonly string[]
}): string | null {
  const operations = document.definitions.filter(
    (definition): definition is OperationDefinitionNode => definition.kind === Kind.OPERATION_DEFINITION
  )
  const operation = operationName
    ? operations.find(definition => definition.name?.value === operationName)
    : operations.length === 1 ? operations[0] : undefined
  // GraphQL execution rejects these itself; refuse rather than guess.
  if (!operation) return operations.some(definition => definition.operation !== 'query') ? READ_ONLY_MESSAGE : null
  if (operation.operation === 'query') return null
  if (operation.operation !== 'mutation' || !scopes.includes('mcp:write')) return READ_ONLY_MESSAGE

  const fragments = new Map(
    document.definitions
      .filter((definition): definition is FragmentDefinitionNode => definition.kind === Kind.FRAGMENT_DEFINITION)
      .map(fragment => [fragment.name.value, fragment])
  )
  for (const field of rootFields(operation.selectionSet, fragments)) {
    const name = field.name.value
    if (CREDENTIAL_MUTATION.test(name)) return CREDENTIAL_MESSAGE
    if (USER_UPDATE_MUTATION.test(name) && setsCredential(field, variables ?? {})) return CREDENTIAL_MESSAGE
  }
  return null
}

/** Yoga/envelop plugin for pages/api/graphql.ts. */
export function useMcpScopeGuard() {
  return {
    onExecute({ args, setResultAndStopExecution }: any) {
      const marker = mcpSessionMarker(args?.contextValue?.session)
      if (!marker) return
      let problem: string | null
      try {
        problem = mcpOperationProblem({
          document: args.document,
          operationName: args.operationName,
          variables: args.variableValues,
          scopes: marker.scopes,
        })
      } catch {
        problem = READ_ONLY_MESSAGE
      }
      if (problem) {
        setResultAndStopExecution({
          errors: [new GraphQLError(problem, { extensions: { code: 'FORBIDDEN' } })],
        })
      }
    },
  }
}
