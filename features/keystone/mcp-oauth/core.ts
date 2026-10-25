/**
 * MCP OAuth: pure helpers shared by the Keystone session strategy, the GraphQL
 * guard and the /oauth routes. Identical in every Openfront; see site.ts for the
 * only per-repo settings.
 *
 * Plain module: no 'use server', no @/ imports, no I/O at import time.
 */
import crypto from 'node:crypto'

export const MCP_SCOPES = ['mcp:read', 'mcp:write'] as const
export type McpScope = (typeof MCP_SCOPES)[number]

export const MCP_ACCESS_PREFIX = 'mcp_at_'
export const MCP_REFRESH_PREFIX = 'mcp_rt_'
export const MCP_CODE_PREFIX = 'mcp_ac_'
export const MCP_CLIENT_PREFIX = 'mcp_cl_'

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000
export const AUTHORIZATION_CODE_TTL_MS = 5 * 60 * 1000
export const CONSENT_TICKET_TTL_MS = 10 * 60 * 1000

/** The MCP endpoint every family member serves; [transport] is always `http` for remote clients. */
export const MCP_RESOURCE_PATH = '/api/mcp-transport/http'
export const MCP_TRANSPORT_PREFIX = '/api/mcp-transport/'

// Matches the starter's own development fallback so local installs work without setup.
const DEVELOPMENT_SECRET = 'this secret should only be used in testing'

function secret(): string {
  return process.env.SESSION_SECRET || DEVELOPMENT_SECRET
}

export function randomToken(prefix: string, bytes = 32): string {
  return `${prefix}${crypto.randomBytes(bytes).toString('base64url')}`
}

/** Tokens, codes and client secrets are stored only as keyed digests. */
export function digestToken(token: string, purpose = 'mcp-oauth-token'): string {
  return crypto.createHmac('sha256', secret()).update(`${purpose}\0${token}`, 'utf8').digest('hex')
}

export function bearerToken(header: unknown): string | null {
  const value = Array.isArray(header) ? header[0] : header
  if (typeof value !== 'string') return null
  const match = /^Bearer\s+(\S+)\s*$/i.exec(value)
  return match ? match[1] : null
}

export function isMcpAccessToken(token: string | null | undefined): token is string {
  return typeof token === 'string' && token.startsWith(MCP_ACCESS_PREFIX) && token.length > MCP_ACCESS_PREFIX.length
}

export function pkceChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url')
}

export function verifyPkce(verifier: unknown, challenge: unknown): boolean {
  if (typeof verifier !== 'string' || typeof challenge !== 'string') return false
  if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(verifier)) return false
  const actual = Buffer.from(pkceChallenge(verifier))
  const expected = Buffer.from(challenge)
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

/** HTTPS callbacks, or loopback HTTP for local clients (Claude Code, Inspector). */
export function validRedirectUri(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    const url = new URL(value)
    if (url.username || url.password || url.hash) return false
    if (url.protocol === 'http:') {
      return url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '[::1]'
    }
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Space- or comma-separated scopes; empty means all MCP scopes. Unknown scopes → null. */
export function parseScopes(value: unknown): McpScope[] | null {
  const requested =
    typeof value === 'string' && value.trim()
      ? [...new Set(value.trim().split(/[\s,]+/).filter(Boolean))]
      : [...MCP_SCOPES]
  if (requested.some(scope => !(MCP_SCOPES as readonly string[]).includes(scope))) return null
  return MCP_SCOPES.filter(scope => requested.includes(scope))
}

export function storedScopes(value: unknown): McpScope[] {
  return Array.isArray(value) ? MCP_SCOPES.filter(scope => value.includes(scope)) : []
}

type HeaderSource = { get(name: string): string | null }

/**
 * The public origin this request reached, from forwarded headers like getBaseUrl
 * and VibeGhost. There is deliberately no URL setting.
 */
export function issuerFromHeaders(headers: HeaderSource): string {
  const host = headers.get('x-forwarded-host')?.split(',')[0]?.trim() || headers.get('host')?.trim() || 'localhost'
  const hostname = host.replace(/:\d+$/, '')
  const local = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
  const proto = headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || (local ? 'http' : 'https')
  return `${proto === 'http' ? 'http' : 'https'}://${host}`
}

export function resourceFor(issuer: string): string {
  return `${issuer}${MCP_RESOURCE_PATH}`
}

/** RFC 8707: a resource, when sent, must be one of this deployment's MCP endpoints. */
export function validResource(resource: unknown, issuer: string): resource is string {
  if (typeof resource !== 'string') return false
  try {
    const url = new URL(resource)
    const origin = new URL(issuer)
    return (
      url.origin === origin.origin &&
      url.pathname.startsWith(MCP_TRANSPORT_PREFIX) &&
      url.pathname.length > MCP_TRANSPORT_PREFIX.length &&
      !url.search &&
      !url.hash
    )
  } catch {
    return false
  }
}

export function protectedResourceMetadata(issuer: string, resource = resourceFor(issuer)) {
  return {
    resource,
    authorization_servers: [issuer],
    scopes_supported: [...MCP_SCOPES],
    bearer_methods_supported: ['header'],
    resource_name: new URL(issuer).host,
  }
}

export function authorizationServerMetadata(issuer: string) {
  return {
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    registration_endpoint: `${issuer}/oauth/register`,
    revocation_endpoint: `${issuer}/oauth/revoke`,
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['none'],
    revocation_endpoint_auth_methods_supported: ['none'],
    code_challenge_methods_supported: ['S256'],
    scopes_supported: [...MCP_SCOPES],
    authorization_response_iss_parameter_supported: true,
    client_id_metadata_document_supported: false,
  }
}

/** RFC 6750 / RFC 9728 challenge pointing clients at this resource's metadata. */
export function wwwAuthenticate(
  issuer: string,
  error?: 'invalid_request' | 'invalid_token' | 'insufficient_scope',
  resourcePath = MCP_RESOURCE_PATH
): string {
  const parts: string[] = []
  if (error === 'invalid_token') {
    parts.push('error="invalid_token"', 'error_description="The access token is invalid, expired or revoked"')
  } else if (error) {
    parts.push(`error="${error}"`)
  }
  parts.push(`resource_metadata="${issuer}/.well-known/oauth-protected-resource${resourcePath}"`)
  parts.push(`scope="${MCP_SCOPES.join(' ')}"`)
  return `Bearer ${parts.join(', ')}`
}

export type ConsentTicket = {
  clientId: string
  redirectUri: string
  state: string
  codeChallenge: string
  scopes: McpScope[]
  resource: string
  userId: string
  expiresAt: number
}

function ticketKey(): Buffer {
  return crypto.createHash('sha256').update(`openfront:mcp-oauth-consent:${secret()}`).digest()
}

/** AES-256-GCM, so the consent form cannot be edited or replayed for another user. */
export function sealTicket(ticket: ConsentTicket): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', ticketKey(), iv)
  const body = Buffer.concat([cipher.update(JSON.stringify(ticket), 'utf8'), cipher.final()])
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url')
}

export function openTicket(value: unknown, now = Date.now()): ConsentTicket | null {
  if (typeof value !== 'string' || value.length > 8192) return null
  try {
    const packed = Buffer.from(value, 'base64url')
    if (packed.length < 29) return null
    const decipher = crypto.createDecipheriv('aes-256-gcm', ticketKey(), packed.subarray(0, 12))
    decipher.setAuthTag(packed.subarray(12, 28))
    const ticket = JSON.parse(
      Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString('utf8')
    ) as ConsentTicket
    if (!ticket || typeof ticket.expiresAt !== 'number' || ticket.expiresAt <= now) return null
    if (!ticket.clientId || !ticket.redirectUri || !ticket.userId || !ticket.codeChallenge) return null
    if (!Array.isArray(ticket.scopes)) return null
    return ticket
  } catch {
    return null
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!)
}

export class OAuthError extends Error {
  constructor(
    readonly code: string,
    readonly description: string,
    readonly status = 400
  ) {
    super(description)
  }
}
