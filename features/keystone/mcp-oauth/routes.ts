/**
 * The /oauth and /.well-known route handlers. app/oauth/* and app/.well-known/*
 * are thin files that pass in the repo's keystoneContext.
 * Plain module: no @/ imports.
 */
import {
  MCP_TRANSPORT_PREFIX,
  OAuthError,
  authorizationServerMetadata,
  openTicket,
  protectedResourceMetadata,
  resourceFor,
} from './core'
import {
  clearSessionCookie,
  cookieContext,
  createAccount,
  html,
  isSameOrigin,
  issuerFromRequest,
  json,
  newNonce,
  oauthErrorJson,
  readParams,
  redirect,
  signInWithPassword,
} from './http'
import { renderConnections, renderConsent, renderMessage, renderSignIn } from './pages'
import {
  approveAuthorization,
  consentTicket,
  denyAuthorization,
  exchangeAuthorizationCode,
  exchangeRefreshToken,
  listConnections,
  registerClient,
  revokeConnection,
  revokeToken,
  validateAuthorization,
} from './service'
import { allowAccountCreation, capabilityLines, isStaffSession, roleLabel, siteDisplayName } from './site'

async function siteName(keystoneContext: any, issuer: string): Promise<string> {
  try {
    return (await siteDisplayName(keystoneContext)) || new URL(issuer).host
  } catch {
    return new URL(issuer).host
  }
}

function withScreen(url: URL, screen?: 'signin' | 'signup'): string {
  const target = new URL(url.pathname + url.search, 'http://local')
  if (screen) target.searchParams.set('screen', screen)
  else target.searchParams.delete('screen')
  return target.pathname + target.search
}

function callbackHost(redirectUri: string): string {
  try {
    return new URL(redirectUri).host
  } catch {
    return redirectUri
  }
}

function callbackOrigin(redirectUri: string): string {
  try {
    return new URL(redirectUri).origin
  } catch {
    return ''
  }
}

function messagePage(name: string, title: string, message: string, status = 400): Response {
  const nonce = newNonce()
  return html(renderMessage({ title, message, siteName: name, nonce }), { nonce, status })
}

type SignInContext = { clientName: string | null; callbackHost: string | null }

function signInPage(
  url: URL,
  name: string,
  target: SignInContext,
  mode: 'signin' | 'signup',
  values: { error?: string | null; email?: string; name?: string } = {},
  status = 200
): Response {
  const nonce = newNonce()
  return html(
    renderSignIn({
      siteName: name,
      ...target,
      mode,
      allowSignUp: allowAccountCreation(),
      ...values,
      signInHref: withScreen(url, 'signin'),
      signUpHref: withScreen(url, 'signup'),
      nonce,
    }),
    { nonce, status }
  )
}

/** Shared sign-in / create-account POST for the consent and connections screens. */
async function accountForm(
  keystoneContext: any,
  url: URL,
  params: Record<string, unknown>,
  name: string,
  target: SignInContext
): Promise<Response> {
  const intent = params.intent === 'signup' ? 'signup' : 'signin'
  const email = typeof params.email === 'string' ? params.email.trim().slice(0, 320) : ''
  const password = typeof params.password === 'string' ? params.password.slice(0, 1024) : ''
  const displayName = typeof params.name === 'string' ? params.name.trim().slice(0, 120) : ''
  if (!email || !password) {
    return signInPage(url, name, target, intent, { error: 'Enter your email and password.', email, name: displayName }, 400)
  }
  if (intent === 'signup') {
    if (!allowAccountCreation()) {
      return signInPage(url, name, target, 'signin', { error: 'New accounts cannot be created here. Sign in with an existing account.', email }, 403)
    }
    const created = await createAccount(keystoneContext, { name: displayName, email, password })
    if ('error' in created) return signInPage(url, name, target, 'signup', { error: created.error, email, name: displayName }, 400)
  }
  const signedIn = await signInWithPassword(keystoneContext, email, password)
  if ('error' in signedIn) return signInPage(url, name, target, intent, { error: signedIn.error, email, name: displayName }, 400)
  return redirect(withScreen(url), { 'Set-Cookie': signedIn.setCookie })
}

export async function authorizeGET(keystoneContext: any, request: Request): Promise<Response> {
  const issuer = issuerFromRequest(request)
  const url = new URL(request.url)
  const name = await siteName(keystoneContext, issuer)
  const params = Object.fromEntries(url.searchParams)
  let validated
  try {
    validated = await validateAuthorization(keystoneContext, params, issuer)
  } catch (error) {
    if (error instanceof OAuthError) return messagePage(name, 'This connection cannot continue', error.description)
    console.error('[mcp-oauth] authorize failed')
    return messagePage(name, 'Something went wrong', 'Return to the app you were connecting and try again.', 500)
  }
  const { client, request: authorization } = validated
  const target = { clientName: client.name, callbackHost: callbackHost(authorization.redirectUri) }
  const context = await cookieContext(keystoneContext, request)
  const session = context.session
  const screen = params.screen === 'signup' ? 'signup' : params.screen === 'signin' ? 'signin' : null
  if (!session?.itemId || screen) return signInPage(url, name, target, screen ?? 'signin')

  const nonce = newNonce()
  return html(
    renderConsent({
      siteName: name,
      clientName: client.name,
      callbackHost: target.callbackHost,
      userName: session.data?.name || '',
      userEmail: session.data?.email || '',
      accountLabel: isStaffSession(session) ? `Staff · ${roleLabel(session)}` : roleLabel(session),
      capabilities: capabilityLines(session, authorization.scopes.includes('mcp:write')),
      offerWrite: authorization.scopes.includes('mcp:write'),
      ticket: consentTicket(authorization, String(session.itemId)),
      switchAccountHref: withScreen(url, 'signin'),
      nonce,
    }),
    { nonce, formTargets: [callbackOrigin(authorization.redirectUri)] }
  )
}

export async function authorizePOST(keystoneContext: any, request: Request): Promise<Response> {
  const issuer = issuerFromRequest(request)
  const url = new URL(request.url)
  const name = await siteName(keystoneContext, issuer)
  if (!isSameOrigin(request, issuer)) return messagePage(name, 'Request blocked', 'This form must be sent from this site.', 403)
  const params = await readParams(request)

  if (params.intent === 'approve' || params.intent === 'deny') {
    const ticket = openTicket(params.ticket)
    if (!ticket) return messagePage(name, 'This approval has expired', 'Return to the app you were connecting and start again.')
    const context = await cookieContext(keystoneContext, request)
    if (!context.session?.itemId || String(context.session.itemId) !== ticket.userId) {
      return messagePage(name, 'Signed in as someone else', 'You changed accounts. Return to the app and start the connection again.', 403)
    }
    try {
      const location =
        params.intent === 'approve'
          ? await approveAuthorization(keystoneContext, ticket, { allowWrite: params.allow_write === '1', issuer })
          : denyAuthorization(ticket, issuer)
      return redirect(location)
    } catch (error) {
      if (error instanceof OAuthError) return messagePage(name, 'This connection cannot continue', error.description)
      console.error('[mcp-oauth] approval failed')
      return messagePage(name, 'Something went wrong', 'Return to the app you were connecting and try again.', 500)
    }
  }

  let target: SignInContext
  try {
    const { client, request: authorization } = await validateAuthorization(keystoneContext, Object.fromEntries(url.searchParams), issuer)
    target = { clientName: client.name, callbackHost: callbackHost(authorization.redirectUri) }
  } catch (error) {
    if (error instanceof OAuthError) return messagePage(name, 'This connection cannot continue', error.description)
    return messagePage(name, 'Something went wrong', 'Return to the app you were connecting and try again.', 500)
  }
  return accountForm(keystoneContext, url, params, name, target)
}

export async function tokenPOST(keystoneContext: any, request: Request): Promise<Response> {
  const issuer = issuerFromRequest(request)
  const params = await readParams(request)
  try {
    if (params.grant_type === 'authorization_code') return json(await exchangeAuthorizationCode(keystoneContext, params, issuer))
    if (params.grant_type === 'refresh_token') return json(await exchangeRefreshToken(keystoneContext, params, issuer))
    throw new OAuthError('unsupported_grant_type', 'Only authorization_code and refresh_token are supported')
  } catch (error) {
    return oauthErrorJson(error)
  }
}

export async function registerPOST(keystoneContext: any, request: Request): Promise<Response> {
  const params = await readParams(request)
  try {
    return json(await registerClient(keystoneContext, params), 201)
  } catch (error) {
    return oauthErrorJson(error)
  }
}

export async function revokePOST(keystoneContext: any, request: Request): Promise<Response> {
  const params = await readParams(request)
  try {
    await revokeToken(keystoneContext, params.token)
  } catch {
    console.error('[mcp-oauth] revoke failed')
  }
  return json({})
}

export async function connectionsGET(keystoneContext: any, request: Request): Promise<Response> {
  const issuer = issuerFromRequest(request)
  const url = new URL(request.url)
  const name = await siteName(keystoneContext, issuer)
  const context = await cookieContext(keystoneContext, request)
  const session = context.session
  const screen = url.searchParams.get('screen') === 'signup' ? 'signup' : 'signin'
  const target = { clientName: null, callbackHost: null }
  if (!session?.itemId) return signInPage(url, name, target, screen)
  const nonce = newNonce()
  return html(
    renderConnections({
      siteName: name,
      userName: session.data?.name || '',
      userEmail: session.data?.email || '',
      connections: await listConnections(keystoneContext, String(session.itemId)),
      notice: url.searchParams.get('disconnected') ? 'Disconnected. That app can no longer act for you.' : null,
      nonce,
    }),
    { nonce }
  )
}

export async function connectionsPOST(keystoneContext: any, request: Request): Promise<Response> {
  const issuer = issuerFromRequest(request)
  const url = new URL(request.url)
  const name = await siteName(keystoneContext, issuer)
  if (!isSameOrigin(request, issuer)) return messagePage(name, 'Request blocked', 'This form must be sent from this site.', 403)
  const params = await readParams(request)
  if (params.intent === 'signout') return redirect(url.pathname, { 'Set-Cookie': clearSessionCookie() })
  if (params.intent === 'revoke') {
    const context = await cookieContext(keystoneContext, request)
    if (!context.session?.itemId) return redirect(url.pathname)
    await revokeConnection(keystoneContext, String(context.session.itemId), params.client_id)
    return redirect(`${url.pathname}?disconnected=1`)
  }
  return accountForm(keystoneContext, url, params, name, { clientName: null, callbackHost: null })
}

/** RFC 9728. The optional path suffix names the MCP endpoint the client reached. */
export function protectedResourceGET(request: Request, segments: string[] = []): Response {
  const issuer = issuerFromRequest(request)
  const path = segments.length ? `/${segments.map(encodeURIComponent).join('/')}` : ''
  if (path && (!`${path}/`.startsWith(MCP_TRANSPORT_PREFIX) || path.length <= MCP_TRANSPORT_PREFIX.length)) {
    return json({ error: 'not_found' }, 404)
  }
  return json(protectedResourceMetadata(issuer, path ? `${issuer}${path}` : resourceFor(issuer)))
}

/** RFC 8414 (also served as openid-configuration for clients that only try that). */
export function authorizationServerGET(request: Request): Response {
  return json(authorizationServerMetadata(issuerFromRequest(request)))
}
