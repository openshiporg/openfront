/**
 * MCP OAuth authorization server flows against a Keystone context: dynamic
 * client registration, consent → authorization code, code and refresh grants,
 * revocation and the user's connected-apps list.
 *
 * Reuses the OAuthApp / OAuthToken lists. Every token row stores only a digest.
 * Plain module: no @/ imports.
 */
import {
  ACCESS_TOKEN_TTL_SECONDS,
  AUTHORIZATION_CODE_TTL_MS,
  CONSENT_TICKET_TTL_MS,
  MCP_ACCESS_PREFIX,
  MCP_CLIENT_PREFIX,
  MCP_CODE_PREFIX,
  MCP_REFRESH_PREFIX,
  MCP_SCOPES,
  OAuthError,
  REFRESH_TOKEN_TTL_MS,
  digestToken,
  parseScopes,
  randomToken,
  resourceFor,
  sealTicket,
  storedScopes,
  validRedirectUri,
  validResource,
  verifyPkce,
  type ConsentTicket,
  type McpScope,
} from './core'

const MAX_REDIRECT_URIS = 10
const PUBLIC_METHOD = 'none'

type Params = Record<string, unknown>

function text(value: unknown, max = 2048): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function prismaOf(context: any): any {
  return context.sudo().prisma
}

function httpsUrl(value: unknown): string | undefined {
  const candidate = text(value)
  if (!candidate) return undefined
  try {
    return new URL(candidate).protocol === 'https:' ? candidate : undefined
  } catch {
    return undefined
  }
}

export type McpClient = {
  id: string
  clientId: string
  name: string
  redirectUris: string[]
  scopes: McpScope[]
}

/** An active public (PKCE) client. Confidential Openship apps never match. */
export async function findPublicClient(context: any, clientId: unknown): Promise<McpClient | null> {
  const id = text(clientId, 200)
  if (!id) return null
  const app = await prismaOf(context).oAuthApp.findUnique({ where: { clientId: id } })
  if (!app || app.status !== 'active' || app.tokenEndpointAuthMethod !== PUBLIC_METHOD) return null
  const scopes = storedScopes(app.scopes)
  if (!scopes.length) return null
  return {
    id: app.id,
    clientId: app.clientId,
    name: app.name || 'An app',
    redirectUris: Array.isArray(app.redirectUris) ? app.redirectUris.filter((uri: unknown) => typeof uri === 'string') : [],
    scopes,
  }
}

/** RFC 7591 registration for public clients; the same name and callbacks get the same client back. */
export async function registerClient(context: any, body: Params) {
  const redirectUris = Array.isArray(body.redirect_uris) ? [...new Set(body.redirect_uris)] : []
  if (!redirectUris.length || redirectUris.length > MAX_REDIRECT_URIS || !redirectUris.every(validRedirectUri)) {
    throw new OAuthError('invalid_redirect_uri', 'redirect_uris must be HTTPS callbacks, or loopback HTTP for local clients')
  }
  const method = body.token_endpoint_auth_method ?? PUBLIC_METHOD
  if (method !== PUBLIC_METHOD) {
    throw new OAuthError('invalid_client_metadata', 'Only public clients using PKCE are supported (token_endpoint_auth_method "none")')
  }
  const grantTypes = Array.isArray(body.grant_types) ? body.grant_types : ['authorization_code', 'refresh_token']
  if (grantTypes.some(grant => grant !== 'authorization_code' && grant !== 'refresh_token')) {
    throw new OAuthError('invalid_client_metadata', 'Only authorization_code and refresh_token grants are supported')
  }
  const responseTypes = Array.isArray(body.response_types) ? body.response_types : ['code']
  if (responseTypes.some(type => type !== 'code')) {
    throw new OAuthError('invalid_client_metadata', 'Only the code response type is supported')
  }

  const sortedUris = [...redirectUris].sort()
  const name = text(body.client_name, 120) || new URL(sortedUris[0]).host
  const prisma = prismaOf(context)
  const candidates = await prisma.oAuthApp.findMany({
    where: { name, tokenEndpointAuthMethod: PUBLIC_METHOD, status: 'active' },
    take: 50,
  })
  const existing = candidates.find((app: any) => {
    const uris = Array.isArray(app.redirectUris) ? [...app.redirectUris].sort() : []
    return uris.length === sortedUris.length && uris.every((uri: string, index: number) => uri === sortedUris[index])
  })
  const app =
    existing ??
    (await prisma.oAuthApp.create({
      data: {
        name,
        clientId: randomToken(MCP_CLIENT_PREFIX, 18),
        redirectUris: sortedUris,
        scopes: [...MCP_SCOPES],
        status: 'active',
        tokenEndpointAuthMethod: PUBLIC_METHOD,
        description: 'Connected through MCP dynamic client registration.',
        metadata: {
          registration: 'dynamic',
          clientUri: httpsUrl(body.client_uri),
          logoUri: httpsUrl(body.logo_uri),
          softwareId: text(body.software_id, 200) || undefined,
          softwareVersion: text(body.software_version, 100) || undefined,
        },
      },
    }))

  return {
    client_id: app.clientId,
    client_id_issued_at: Math.floor(new Date(app.createdAt ?? Date.now()).getTime() / 1000),
    client_name: app.name,
    redirect_uris: Array.isArray(app.redirectUris) ? app.redirectUris : sortedUris,
    token_endpoint_auth_method: PUBLIC_METHOD,
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: MCP_SCOPES.join(' '),
  }
}

export type AuthorizationRequest = Omit<ConsentTicket, 'userId' | 'expiresAt'>

/**
 * Validate an /oauth/authorize request. Errors are shown on our own page; we
 * never redirect to a callback that has not been matched to a registration.
 */
export async function validateAuthorization(
  context: any,
  params: Params,
  issuer: string
): Promise<{ client: McpClient; request: AuthorizationRequest }> {
  const client = await findPublicClient(context, params.client_id)
  if (!client) throw new OAuthError('invalid_client', 'This app is not registered here, or it has been turned off.')
  const redirectUri = text(params.redirect_uri)
  if (!redirectUri || !client.redirectUris.includes(redirectUri)) {
    throw new OAuthError('invalid_request', 'The return address for this app does not match its registration.')
  }
  if (params.response_type !== 'code') {
    throw new OAuthError('unsupported_response_type', 'Only the authorization code flow is supported.')
  }
  const codeChallenge = text(params.code_challenge, 128)
  if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(codeChallenge) || params.code_challenge_method !== 'S256') {
    throw new OAuthError('invalid_request', 'PKCE with S256 is required.')
  }
  const requested = parseScopes(params.scope)
  const scopes = requested?.filter(scope => client.scopes.includes(scope))
  if (!scopes?.length) throw new OAuthError('invalid_scope', 'The app asked for permissions this site does not offer.')
  const resource = params.resource === undefined || params.resource === '' ? resourceFor(issuer) : params.resource
  if (!validResource(resource, issuer)) throw new OAuthError('invalid_target', 'The app asked for a different server.')
  return {
    client,
    request: {
      clientId: client.clientId,
      redirectUri,
      state: text(params.state, 1024),
      codeChallenge,
      scopes,
      resource,
    },
  }
}

export function consentTicket(request: AuthorizationRequest, userId: string): string {
  return sealTicket({ ...request, userId, expiresAt: Date.now() + CONSENT_TICKET_TTL_MS })
}

function callback(redirectUri: string, values: Record<string, string>, issuer: string): string {
  const target = new URL(redirectUri)
  for (const [key, value] of Object.entries(values)) if (value) target.searchParams.set(key, value)
  target.searchParams.set('iss', issuer)
  return target.toString()
}

/** Approve: store a single-use authorization code for the signed-in user. */
export async function approveAuthorization(
  context: any,
  ticket: ConsentTicket,
  { allowWrite, issuer }: { allowWrite: boolean; issuer: string }
): Promise<string> {
  const client = await findPublicClient(context, ticket.clientId)
  if (!client || !client.redirectUris.includes(ticket.redirectUri)) {
    throw new OAuthError('invalid_client', 'This app is no longer registered here.')
  }
  const scopes = ticket.scopes.filter(
    scope => client.scopes.includes(scope) && (scope !== 'mcp:write' || allowWrite)
  )
  if (!scopes.includes('mcp:read') && client.scopes.includes('mcp:read')) scopes.unshift('mcp:read')
  const code = randomToken(MCP_CODE_PREFIX)
  await prismaOf(context).oAuthToken.create({
    data: {
      tokenType: 'authorization_code',
      token: digestToken(code),
      clientId: client.clientId,
      userId: ticket.userId,
      scopes,
      redirectUri: ticket.redirectUri,
      resource: ticket.resource,
      expiresAt: new Date(Date.now() + AUTHORIZATION_CODE_TTL_MS),
      isRevoked: 'false',
      codeChallenge: ticket.codeChallenge,
      codeChallengeMethod: 'S256',
    },
  })
  return callback(ticket.redirectUri, { code, state: ticket.state }, issuer)
}

export function denyAuthorization(ticket: ConsentTicket, issuer: string): string {
  return callback(ticket.redirectUri, { error: 'access_denied', state: ticket.state }, issuer)
}

type Grant = { clientId: string; userId: string; scopes: McpScope[]; resource: string; authorizationCode?: string }

async function issueTokens(tx: any, grant: Grant) {
  const accessToken = randomToken(MCP_ACCESS_PREFIX)
  const refreshToken = randomToken(MCP_REFRESH_PREFIX)
  const now = Date.now()
  const shared = {
    clientId: grant.clientId,
    userId: grant.userId,
    scopes: grant.scopes,
    resource: grant.resource,
    isRevoked: 'false',
  }
  await tx.oAuthToken.create({
    data: {
      ...shared,
      tokenType: 'access_token',
      token: digestToken(accessToken),
      refreshToken: digestToken(refreshToken),
      authorizationCode: grant.authorizationCode ?? '',
      expiresAt: new Date(now + ACCESS_TOKEN_TTL_SECONDS * 1000),
    },
  })
  await tx.oAuthToken.create({
    data: {
      ...shared,
      tokenType: 'refresh_token',
      token: digestToken(refreshToken),
      accessToken: digestToken(accessToken),
      authorizationCode: grant.authorizationCode ?? '',
      expiresAt: new Date(now + REFRESH_TOKEN_TTL_MS),
    },
  })
  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_TTL_SECONDS,
    refresh_token: refreshToken,
    scope: grant.scopes.join(' '),
  }
}

async function revokeGrant(context: any, userId: string, clientId: string): Promise<number> {
  const result = await prismaOf(context).oAuthToken.updateMany({
    where: { userId, clientId, isRevoked: 'false' },
    data: { isRevoked: 'true' },
  })
  return result.count
}

async function requireClient(context: any, clientId: unknown): Promise<McpClient> {
  const client = await findPublicClient(context, clientId)
  if (!client) throw new OAuthError('invalid_client', 'Unknown or inactive client', 401)
  return client
}

function invalidGrant(description: string): never {
  throw new OAuthError('invalid_grant', description)
}

export async function exchangeAuthorizationCode(context: any, body: Params, issuer: string) {
  const client = await requireClient(context, body.client_id)
  const code = text(body.code, 512)
  if (!code) throw new OAuthError('invalid_request', 'Missing code')
  const prisma = prismaOf(context)
  const digest = digestToken(code)
  const record = await prisma.oAuthToken.findUnique({ where: { token: digest } })
  if (!record || record.tokenType !== 'authorization_code' || record.clientId !== client.clientId) {
    invalidGrant('Invalid authorization code')
  }
  if (record.isRevoked !== 'false') {
    // A replayed code means it leaked: revoke what it issued (RFC 6749 §4.1.2).
    await prisma.oAuthToken.updateMany({
      where: { authorizationCode: digest, isRevoked: 'false' },
      data: { isRevoked: 'true' },
    })
    invalidGrant('Authorization code has already been used')
  }
  if (!record.expiresAt || new Date(record.expiresAt).getTime() <= Date.now()) invalidGrant('Authorization code expired')
  if (record.redirectUri !== text(body.redirect_uri)) invalidGrant('redirect_uri does not match the authorization request')
  if (body.resource !== undefined && body.resource !== '' && body.resource !== record.resource) {
    throw new OAuthError('invalid_target', 'resource does not match the authorization request')
  }
  if (!verifyPkce(body.code_verifier, record.codeChallenge)) invalidGrant('PKCE verification failed')
  if (!record.userId) invalidGrant('The account that approved this app no longer exists')

  return prisma.$transaction(async (tx: any) => {
    const consumed = await tx.oAuthToken.updateMany({
      where: { id: record.id, isRevoked: 'false' },
      data: { isRevoked: 'true' },
    })
    if (consumed.count !== 1) invalidGrant('Authorization code has already been used')
    return issueTokens(tx, {
      clientId: client.clientId,
      userId: record.userId,
      scopes: storedScopes(record.scopes),
      resource: record.resource || resourceFor(issuer),
      authorizationCode: digest,
    })
  })
}

export async function exchangeRefreshToken(context: any, body: Params, issuer: string) {
  const client = await requireClient(context, body.client_id)
  const token = text(body.refresh_token, 512)
  if (!token) throw new OAuthError('invalid_request', 'Missing refresh_token')
  const prisma = prismaOf(context)
  const record = await prisma.oAuthToken.findUnique({ where: { token: digestToken(token) } })
  if (!record || record.tokenType !== 'refresh_token' || record.clientId !== client.clientId) {
    invalidGrant('Invalid refresh token')
  }
  if (record.isRevoked !== 'false') {
    // Refresh tokens rotate; a reused one means it was copied. End the whole connection.
    if (record.userId) await revokeGrant(context, record.userId, record.clientId)
    invalidGrant('Refresh token has already been used; reconnect the app')
  }
  if (!record.expiresAt || new Date(record.expiresAt).getTime() <= Date.now()) invalidGrant('Refresh token expired')
  if (!record.userId) invalidGrant('The account that approved this app no longer exists')
  if (body.resource !== undefined && body.resource !== '' && body.resource !== record.resource) {
    throw new OAuthError('invalid_target', 'resource does not match the original grant')
  }
  const granted = storedScopes(record.scopes)
  let scopes = granted
  if (typeof body.scope === 'string' && body.scope.trim()) {
    const requested = parseScopes(body.scope)
    if (!requested || requested.some(scope => !granted.includes(scope))) {
      throw new OAuthError('invalid_scope', 'A refresh can only keep or narrow the granted scopes')
    }
    scopes = requested
  }

  return prisma.$transaction(async (tx: any) => {
    const rotated = await tx.oAuthToken.updateMany({
      where: { id: record.id, isRevoked: 'false' },
      data: { isRevoked: 'true' },
    })
    if (rotated.count !== 1) invalidGrant('Refresh token has already been used; reconnect the app')
    if (record.accessToken) {
      await tx.oAuthToken.updateMany({
        where: { token: record.accessToken, tokenType: 'access_token', clientId: record.clientId },
        data: { isRevoked: 'true' },
      })
    }
    // Keep the table small: drop this connection's expired rows on every rotation.
    await tx.oAuthToken.deleteMany({
      where: { userId: record.userId, clientId: record.clientId, expiresAt: { lt: new Date() } },
    })
    return issueTokens(tx, {
      clientId: record.clientId,
      userId: record.userId,
      scopes,
      resource: record.resource || resourceFor(issuer),
      authorizationCode: record.authorizationCode || undefined,
    })
  })
}

/** RFC 7009. Possession of the token is the proof; always succeeds. */
export async function revokeToken(context: any, token: unknown): Promise<void> {
  const value = text(token, 512)
  if (!value) return
  const prisma = prismaOf(context)
  const record = await prisma.oAuthToken.findUnique({ where: { token: digestToken(value) } })
  if (!record || !record.resource) return
  if (record.tokenType === 'refresh_token' && record.userId) {
    await revokeGrant(context, record.userId, record.clientId)
    return
  }
  await prisma.oAuthToken.updateMany({ where: { id: record.id }, data: { isRevoked: 'true' } })
}

export type Connection = {
  clientId: string
  name: string
  callbackHost: string
  scopes: McpScope[]
  connectedAt: string | null
}

/** Apps that can still act for this user (a live refresh or access token). */
export async function listConnections(context: any, userId: string): Promise<Connection[]> {
  const prisma = prismaOf(context)
  const tokens = await prisma.oAuthToken.findMany({
    where: {
      userId,
      isRevoked: 'false',
      tokenType: { in: ['refresh_token', 'access_token'] },
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'asc' },
    take: 500,
  })
  const byClient = new Map<string, any[]>()
  for (const token of tokens) byClient.set(token.clientId, [...(byClient.get(token.clientId) ?? []), token])
  if (!byClient.size) return []
  const apps = await prisma.oAuthApp.findMany({ where: { clientId: { in: [...byClient.keys()] } } })
  return [...byClient.entries()].map(([clientId, rows]) => {
    const app = apps.find((candidate: any) => candidate.clientId === clientId)
    const uris: string[] = Array.isArray(app?.redirectUris) ? app.redirectUris : []
    let callbackHost = ''
    try {
      callbackHost = uris[0] ? new URL(uris[0]).host : ''
    } catch {}
    const scopes = storedScopes(rows.flatMap(row => (Array.isArray(row.scopes) ? row.scopes : [])))
    return {
      clientId,
      name: app?.name || 'Unknown app',
      callbackHost,
      scopes,
      connectedAt: rows[0]?.createdAt ? new Date(rows[0].createdAt).toISOString() : null,
    }
  })
}

export async function revokeConnection(context: any, userId: string, clientId: unknown): Promise<number> {
  const id = text(clientId, 200)
  return id ? revokeGrant(context, userId, id) : 0
}
