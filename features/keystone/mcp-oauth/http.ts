/**
 * Web-standard Request/Response helpers for the /oauth and /.well-known routes
 * and the MCP transport. Callers pass in the repo's keystoneContext.
 * Plain module: no @/ imports, no Next imports.
 */
import crypto from 'node:crypto'
import { MCP_RESOURCE_PATH, OAuthError, bearerToken, issuerFromHeaders, wwwAuthenticate } from './core'

export const SESSION_COOKIE = 'keystonejs-session'

export function issuerFromRequest(request: Request): string {
  return issuerFromHeaders(request.headers)
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, MCP-Protocol-Version',
  'Access-Control-Max-Age': '86400',
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...CORS_HEADERS, ...headers },
  })
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS })
}

export function oauthErrorJson(error: unknown): Response {
  if (error instanceof OAuthError) {
    return json({ error: error.code, error_description: error.description }, error.status)
  }
  console.error("[mcp-oauth] request failed")
  return json({ error: 'server_error', error_description: 'Internal server error' }, 500)
}

/** Form, multipart or JSON body as a flat object; never throws. */
export async function readParams(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('content-type') || ''
  try {
    if (type.includes('application/json')) {
      const body = await request.json()
      return body && typeof body === 'object' && !Array.isArray(body) ? body : {}
    }
    const form = await request.formData()
    const params: Record<string, unknown> = {}
    form.forEach((value, key) => {
      if (typeof value === 'string' && !(key in params)) params[key] = value
    })
    return params
  } catch {
    return {}
  }
}

/** Browser POSTs to our own pages must come from our own origin (blocks login and consent CSRF). */
export function isSameOrigin(request: Request, issuer: string): boolean {
  const origin = request.headers.get('origin')
  if (origin) return origin === new URL(issuer).origin
  return request.headers.get('sec-fetch-site') === 'same-origin'
}

export function newNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

export function html(
  body: string,
  { nonce, formTargets = [], status = 200, headers = {} }: { nonce: string; formTargets?: string[]; status?: number; headers?: Record<string, string> }
): Response {
  const targets = [...new Set(formTargets.filter(Boolean))].join(' ')
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src 'self' data:; form-action 'self'${targets ? ` ${targets}` : ''}; base-uri 'none'; frame-ancestors 'none'`,
      ...headers,
    },
  })
}

export function redirect(location: string, headers: Headers | Record<string, string> = {}): Response {
  const response = new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'no-store' } })
  new Headers(headers).forEach((value, key) => response.headers.append(key, value))
  return response
}

function nodeRequest(headers: Record<string, string>, url: string) {
  return { headers, method: 'POST', url } as any
}

/** Keystone context for a browser page: the session cookie only, never a bearer token. */
export async function cookieContext(keystoneContext: any, request: Request) {
  const cookie = request.headers.get('cookie') || ''
  return keystoneContext.withRequest(nodeRequest(cookie ? { cookie } : {}, new URL(request.url).pathname))
}

const SIGN_IN_FAILED = 'Unable to sign in. Check your email and password and try again.'

/**
 * Run the site's own authenticateUserWithPassword in-process and hand back the
 * Set-Cookie header Keystone's session strategy produced.
 */
export async function signInWithPassword(
  keystoneContext: any,
  email: string,
  password: string
): Promise<{ setCookie: string } | { error: string }> {
  const captured: Record<string, string> = {}
  const response = {
    setHeader(name: string, value: string | string[]) {
      captured[name.toLowerCase()] = Array.isArray(value) ? value[0] : value
    },
    getHeader(name: string) {
      return captured[name.toLowerCase()]
    },
  }
  try {
    const context = await keystoneContext.withRequest(nodeRequest({}, '/oauth/authorize'), response)
    const result = await context.graphql.raw({
      query: `mutation($email: String!, $password: String!) {
        authenticate: authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess { sessionToken }
          ... on UserAuthenticationWithPasswordFailure { message }
        }
      }`,
      variables: { email, password },
    })
    const token = result?.data?.authenticate?.sessionToken
    if (result?.errors?.length || !token) return { error: SIGN_IN_FAILED }
    const setCookie =
      captured['set-cookie'] ||
      `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    return { setCookie }
  } catch {
    console.error('[mcp-oauth] sign-in failed')
    return { error: SIGN_IN_FAILED }
  }
}

/** Create an account through the public createUser mutation, so the list's own access rules decide. */
export async function createAccount(
  keystoneContext: any,
  { name, email, password }: { name: string; email: string; password: string }
): Promise<{ ok: true } | { error: string }> {
  try {
    const context = await keystoneContext.withRequest(nodeRequest({}, '/oauth/authorize'))
    const result = await context.graphql.raw({
      query: `mutation($data: UserCreateInput!) { createUser(data: $data) { id } }`,
      variables: { data: { name: name || email.split('@')[0], email, password } },
    })
    if (!result?.errors?.length && result?.data?.createUser?.id) return { ok: true }
    const error = result?.errors?.[0]
    const message = typeof error?.message === 'string' ? error.message : ''
    const code = error?.extensions?.code
    if (/unique constraint/i.test(message)) return { error: 'An account with this email already exists. Sign in instead.' }
    if (code === 'KS_ACCESS_DENIED') return { error: 'New accounts cannot be created here. Sign in with an existing account.' }
    if (code === 'KS_VALIDATION_FAILURE') {
      const detail = message.replace(/^[\s\S]*?:\s*-\s*\w+\.\w+:\s*/m, '').split('\n')[0].trim()
      if (detail && detail.length < 200 && !/prisma|invocation/i.test(detail)) return { error: detail }
    }
    return { error: 'Unable to create the account. Please try again.' }
  } catch {
    console.error('[mcp-oauth] account creation failed')
    return { error: 'Unable to create the account. Please try again.' }
  }
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}

/**
 * MCP transport gate. A request is served when it carries a session: an MCP
 * bearer token (forwarded alone) or the browser's cookie (the built-in
 * assistant, forwarded as before). Anything else gets the OAuth challenge that
 * makes ChatGPT and Claude start sign-in.
 */
export async function authorizeMcpRequest(
  keystoneContext: any,
  request: Request,
  body: any
): Promise<{ forwardHeaders: Record<string, string> } | Response> {
  const token = bearerToken(request.headers.get('authorization'))
  const cookie = request.headers.get('cookie') || ''
  const headers: Record<string, string> = token ? { authorization: `Bearer ${token}` } : cookie ? { cookie } : {}
  let signedIn = false
  try {
    const context = await keystoneContext.withRequest(nodeRequest(headers, new URL(request.url).pathname))
    signedIn = Boolean(context.session?.itemId)
  } catch {
    signedIn = false
  }
  if (signedIn) return { forwardHeaders: token ? { Authorization: `Bearer ${token}` } : { Cookie: cookie } }

  const issuer = issuerFromRequest(request)
  const path = new URL(request.url).pathname || MCP_RESOURCE_PATH
  const message = token ? 'Access token is invalid, expired or revoked; reconnect the app' : 'Sign in required'
  const id = body && typeof body === 'object' && 'id' in body ? body.id : null
  if (body?.method === 'tools/call') {
    // ChatGPT links tools from a successful transport response whose result
    // carries the challenge (the shape VibeGhost uses); keep 401 for the rest.
    return json({
      jsonrpc: '2.0',
      id,
      result: {
        content: [{ type: 'text', text: message }],
        isError: true,
        _meta: { 'mcp/www_authenticate': [wwwAuthenticate(issuer, token ? 'invalid_token' : 'invalid_request', path)] },
      },
    })
  }
  const challenge = wwwAuthenticate(issuer, token ? 'invalid_token' : undefined, path)
  return json(
    { jsonrpc: '2.0', id, error: { code: -32001, message }, _meta: { 'mcp/www_authenticate': [challenge] } },
    401,
    { 'WWW-Authenticate': challenge, 'Access-Control-Expose-Headers': 'WWW-Authenticate' }
  )
}
