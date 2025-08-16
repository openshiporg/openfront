import { NextRequest, NextResponse } from 'next/server';
import { keystoneContext } from '@/features/keystone/context';
import { SCOPE_DESCRIPTIONS, OAuthScope, AVAILABLE_SCOPES } from '@/features/keystone/oauth/scopes';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const sessionContext = await keystoneContext.withRequest(request as any, {} as any);
    if (!sessionContext.session?.itemId) {
      // User not logged in - redirect to login with return URL
      const currentUrl = request.url;
      // Get the base URL from the request
      const { protocol, host } = new URL(request.url);
      const baseUrl = `${protocol}//${host}`;
      const loginUrl = `${baseUrl}/dashboard/signin?from=${encodeURIComponent(currentUrl)}`;
      return NextResponse.redirect(loginUrl);
    }
    
    const { searchParams } = new URL(request.url);
    
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const responseType = searchParams.get('response_type');
    const scope = searchParams.get('scope') || 'read_products';
    const state = searchParams.get('state');
    const codeChallenge = searchParams.get('code_challenge');
    const codeChallengeMethod = searchParams.get('code_challenge_method');

    // Validate required parameters
    if (!clientId || !redirectUri || !responseType) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (responseType !== 'code') {
      return NextResponse.json(
        { error: 'unsupported_response_type', error_description: 'Only authorization code flow is supported' },
        { status: 400 }
      );
    }

    // Find the OAuth app
    const oauthApp = await keystoneContext.sudo().query.OAuthApp.findOne({
      where: { clientId },
      query: 'id name redirectUris scopes status description'
    });

    if (!oauthApp) {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Client not found' },
        { status: 401 }
      );
    }

    if (oauthApp.status !== 'active') {
      return NextResponse.json(
        { error: 'unauthorized_client', error_description: 'Client is not active' },
        { status: 401 }
      );
    }

    // Validate redirect URI
    if (!oauthApp.redirectUris?.includes(redirectUri)) {
      return NextResponse.json(
        { error: 'invalid_redirect_uri', error_description: 'Redirect URI not registered' },
        { status: 400 }
      );
    }

    // Validate scopes (handle both space-separated and comma-separated)
    const requestedScopes = scope.includes(',') ? scope.split(',') : scope.split(' ');
    const allowedScopes = oauthApp.scopes || [];
    
    // Check if requested scopes are valid OAuth scopes
    const invalidScopes = requestedScopes.filter(s => !AVAILABLE_SCOPES.includes(s as OAuthScope));
    if (invalidScopes.length > 0) {
      return NextResponse.json(
        { error: 'invalid_scope', error_description: `Unknown scopes: ${invalidScopes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if app is allowed to request these scopes
    const unauthorizedScopes = requestedScopes.filter(s => !allowedScopes.includes(s));
    if (unauthorizedScopes.length > 0) {
      return NextResponse.json(
        { error: 'invalid_scope', error_description: `App not authorized for scopes: ${unauthorizedScopes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate authorization code
    const authorizationCode = crypto.randomBytes(32).toString('hex');
    
    // Store authorization code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await keystoneContext.sudo().query.OAuthToken.createOne({
      data: {
        tokenType: 'authorization_code',
        token: authorizationCode,
        clientId,
        scopes: requestedScopes,
        redirectUri,
        expiresAt,
        state,
        codeChallenge,
        codeChallengeMethod,
        isRevoked: 'false',
        user: { connect: { id: sessionContext.session.itemId } } // Connect to the logged-in user
      }
    });

    // Return authorization page HTML
    const authorizationPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorize ${oauthApp.name}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .card {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .app-icon {
            width: 60px;
            height: 60px;
            background: #007bff;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin: 0 auto 20px;
          }
          h1 {
            text-align: center;
            margin: 0 0 20px;
            font-size: 24px;
          }
          .permissions {
            background: #f8f9fa;
            border-radius: 4px;
            padding: 15px;
            margin: 20px 0;
          }
          .permission-item {
            margin: 8px 0;
            display: flex;
            align-items: center;
          }
          .permission-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
            color: #28a745;
          }
          .buttons {
            display: flex;
            gap: 10px;
            margin-top: 30px;
          }
          .btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
          }
          .btn-primary {
            background: #007bff;
            color: white;
          }
          .btn-secondary {
            background: #6c757d;
            color: white;
          }
          .btn:hover {
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="app-icon">${oauthApp.name.charAt(0).toUpperCase()}</div>
          <h1>Authorize ${oauthApp.name}</h1>
          <p>This application is requesting access to your OpenFront store with the following permissions:</p>
          
          <div class="permissions">
            ${requestedScopes.map(scope => `
              <div class="permission-item">
                <span class="permission-icon">✓</span>
                <span>${getScopeDescription(scope)}</span>
              </div>
            `).join('')}
          </div>

          ${oauthApp.description ? `<p><small>${oauthApp.description}</small></p>` : ''}
          
          <div class="buttons">
            <form method="POST" style="flex: 1;">
              <input type="hidden" name="client_id" value="${clientId}">
              <input type="hidden" name="redirect_uri" value="${redirectUri}">
              <input type="hidden" name="scope" value="${scope}">
              <input type="hidden" name="state" value="${state || ''}">
              <input type="hidden" name="code_challenge" value="${codeChallenge || ''}">
              <input type="hidden" name="code_challenge_method" value="${codeChallengeMethod || ''}">
              <input type="hidden" name="authorization_code" value="${authorizationCode}">
              <input type="hidden" name="action" value="authorize">
              <button type="submit" class="btn btn-primary">Authorize</button>
            </form>
            
            <form method="POST" style="flex: 1;">
              <input type="hidden" name="client_id" value="${clientId}">
              <input type="hidden" name="redirect_uri" value="${redirectUri}">
              <input type="hidden" name="state" value="${state || ''}">
              <input type="hidden" name="action" value="deny">
              <button type="submit" class="btn btn-secondary">Deny</button>
            </form>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(authorizationPage, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('OAuth authorization error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const clientId = formData.get('client_id') as string;
    const redirectUri = formData.get('redirect_uri') as string;
    const state = formData.get('state') as string;
    const action = formData.get('action') as string;
    const authorizationCode = formData.get('authorization_code') as string;

    if (action === 'deny') {
      // User denied authorization
      const params = new URLSearchParams({
        error: 'access_denied',
        error_description: 'User denied authorization',
        ...(state && { state })
      });

      return NextResponse.redirect(`${redirectUri}?${params}`);
    }

    if (action === 'authorize') {
      // User approved authorization
      const params = new URLSearchParams({
        code: authorizationCode,
        ...(state && { state })
      });

      return NextResponse.redirect(`${redirectUri}?${params}`);
    }

    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('OAuth authorization POST error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getScopeDescription(scope: string): string {
  return SCOPE_DESCRIPTIONS[scope as OAuthScope] || `Access to ${scope}`;
}