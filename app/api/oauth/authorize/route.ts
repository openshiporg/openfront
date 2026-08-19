import crypto from "node:crypto";
import type { IncomingMessage } from "node:http";
import { NextRequest, NextResponse } from "next/server";
import { keystoneContext } from "@/features/keystone/context";
import {
  AVAILABLE_SCOPES,
  OAuthScope,
  SCOPE_DESCRIPTIONS,
} from "@/features/keystone/oauth/scopes";
import { permissions } from "@/features/keystone/access";
import {
  escapeHtml,
  openAuthorizationRequest,
  sealAuthorizationRequest,
} from "./security";

const RESPONSE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
};

function requestHeaders(request: NextRequest): Record<string, string> {
  return Object.fromEntries(request.headers.entries());
}

async function authenticatedContext(request: NextRequest) {
  const nodeRequest = {
    headers: requestHeaders(request),
    method: request.method,
    url: request.nextUrl.pathname + request.nextUrl.search,
  } as IncomingMessage;
  return keystoneContext.withRequest(nodeRequest);
}

function oauthError(error: string, description: string, status = 400) {
  return NextResponse.json(
    { error, error_description: description },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function parseScopes(scope: string): string[] {
  return [...new Set(scope.split(/[ ,]+/).map(value => value.trim()).filter(Boolean))];
}

type OAuthAppRecord = {
  name?: string | null;
  description?: string | null;
  redirectUris?: string[] | null;
  scopes?: string[] | null;
  status?: string | null;
};

function validateAppRequest(
  app: OAuthAppRecord | null | undefined,
  redirectUri: string | null,
  requestedScopes: string[]
): string | null {
  if (!app || app.status !== "active") return "Client is not active";
  if (!redirectUri || !app.redirectUris?.includes(redirectUri)) {
    return "Redirect URI not registered";
  }
  if (requestedScopes.some(scope => !AVAILABLE_SCOPES.includes(scope as OAuthScope))) {
    return "One or more requested scopes are unknown";
  }
  if (requestedScopes.some(scope => !app.scopes?.includes(scope))) {
    return "App is not authorized for one or more requested scopes";
  }
  return null;
}

function redirectToClient(
  redirectUri: string,
  values: Record<string, string | null | undefined>
) {
  const target = new URL(redirectUri);
  for (const [key, value] of Object.entries(values)) {
    if (value) target.searchParams.set(key, value);
  }
  return NextResponse.redirect(target, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  try {
    const context = await authenticatedContext(request);
    if (!context.session?.itemId) {
      return oauthError("access_denied", "Sign in before authorizing an application", 401);
    }
    if (!permissions.canAccessDashboard({ session: context.session })) {
      return oauthError("access_denied", "Store operator access is required", 403);
    }

    const clientId = request.nextUrl.searchParams.get("client_id");
    const responseType = request.nextUrl.searchParams.get("response_type");
    const requestedRedirect = request.nextUrl.searchParams.get("redirect_uri");
    const state = request.nextUrl.searchParams.get("state");
    const codeChallenge = request.nextUrl.searchParams.get("code_challenge");
    const requestedChallengeMethod = request.nextUrl.searchParams.get("code_challenge_method");
    const requestedScopes = parseScopes(
      request.nextUrl.searchParams.get("scope") || "read_products"
    );

    if (!clientId || responseType !== "code") {
      return oauthError("invalid_request", "A client_id and response_type=code are required");
    }
    if (
      requestedChallengeMethod &&
      requestedChallengeMethod !== "plain" &&
      requestedChallengeMethod !== "S256"
    ) {
      return oauthError("invalid_request", "Unsupported PKCE code challenge method");
    }
    if (requestedChallengeMethod && !codeChallenge) {
      return oauthError("invalid_request", "PKCE code challenge is required");
    }

    const app = await context.sudo().query.OAuthApp.findOne({
      where: { clientId },
      query: "id name redirectUris scopes status description",
    });
    const redirectUri = requestedRedirect || app?.redirectUris?.[0] || null;
    const validationError = validateAppRequest(app, redirectUri, requestedScopes);
    if (validationError) return oauthError("invalid_request", validationError);

    const authorizationRequest = sealAuthorizationRequest({
      clientId,
      redirectUri: redirectUri!,
      scopes: requestedScopes,
      state,
      codeChallenge,
      codeChallengeMethod: requestedChallengeMethod as "plain" | "S256" | null,
      ownerId: context.session.itemId,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    const permissionRows = requestedScopes.map(scope => `
      <li>${escapeHtml(SCOPE_DESCRIPTIONS[scope as OAuthScope] || `Access to ${scope}`)}</li>
    `).join("");
    const appName = escapeHtml(app.name);
    const description = app.description
      ? `<p><small>${escapeHtml(app.description)}</small></p>`
      : "";

    const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Authorize ${appName}</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:440px;margin:48px auto;padding:20px;background:#f5f5f5}
    main{background:#fff;border-radius:10px;padding:28px;box-shadow:0 2px 12px #0001}
    h1{font-size:24px}.actions{display:flex;gap:12px;margin-top:24px}.actions form{flex:1}
    button{width:100%;padding:11px;border:0;border-radius:6px;cursor:pointer}.allow{background:#111;color:#fff}.deny{background:#ddd}
  </style>
</head>
<body>
  <main>
    <h1>Authorize ${appName}</h1>
    <p>This application is requesting these permissions:</p>
    <ul>${permissionRows}</ul>
    ${description}
    <div class="actions">
      <form method="post">
        <input type="hidden" name="authorization_request" value="${escapeHtml(authorizationRequest)}">
        <input type="hidden" name="action" value="authorize">
        <button class="allow" type="submit">Authorize</button>
      </form>
      <form method="post">
        <input type="hidden" name="authorization_request" value="${escapeHtml(authorizationRequest)}">
        <input type="hidden" name="action" value="deny">
        <button class="deny" type="submit">Deny</button>
      </form>
    </div>
  </main>
</body>
</html>`;

    return new NextResponse(page, { headers: RESPONSE_HEADERS });
  } catch (error) {
    console.error("OAuth authorization error:", error instanceof Error ? error.message : "Unknown error");
    return oauthError("server_error", "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await authenticatedContext(request);
    if (!context.session?.itemId) {
      return oauthError("access_denied", "Sign in before authorizing an application", 401);
    }
    if (!permissions.canAccessDashboard({ session: context.session })) {
      return oauthError("access_denied", "Store operator access is required", 403);
    }

    const formData = await request.formData();
    const action = formData.get("action");
    const ticket = formData.get("authorization_request");
    if ((action !== "authorize" && action !== "deny") || typeof ticket !== "string") {
      return oauthError("invalid_request", "Invalid authorization response");
    }

    let authorizationRequest;
    try {
      authorizationRequest = openAuthorizationRequest(ticket);
    } catch {
      return oauthError("invalid_request", "Invalid or expired authorization request");
    }
    if (authorizationRequest.ownerId !== context.session.itemId) {
      return oauthError("access_denied", "Authorization request belongs to another user", 403);
    }

    const app = await context.sudo().query.OAuthApp.findOne({
      where: { clientId: authorizationRequest.clientId },
      query: "id redirectUris scopes status",
    });
    const validationError = validateAppRequest(
      app,
      authorizationRequest.redirectUri,
      authorizationRequest.scopes
    );
    if (validationError) return oauthError("invalid_request", validationError);

    if (action === "deny") {
      return redirectToClient(authorizationRequest.redirectUri, {
        error: "access_denied",
        error_description: "User denied authorization",
        state: authorizationRequest.state,
      });
    }

    const authorizationCode = crypto.randomBytes(32).toString("hex");
    await context.sudo().query.OAuthToken.createOne({
      data: {
        tokenType: "authorization_code",
        token: authorizationCode,
        clientId: authorizationRequest.clientId,
        scopes: authorizationRequest.scopes,
        redirectUri: authorizationRequest.redirectUri,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        state: authorizationRequest.state,
        codeChallenge: authorizationRequest.codeChallenge,
        codeChallengeMethod: authorizationRequest.codeChallengeMethod,
        isRevoked: "false",
        user: { connect: { id: context.session.itemId } },
      },
      query: "id",
    });

    return redirectToClient(authorizationRequest.redirectUri, {
      code: authorizationCode,
      state: authorizationRequest.state,
    });
  } catch (error) {
    console.error("OAuth authorization POST error:", error instanceof Error ? error.message : "Unknown error");
    return oauthError("server_error", "Internal server error", 500);
  }
}
