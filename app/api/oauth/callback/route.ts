import { NextRequest, NextResponse } from 'next/server';
import { keystoneContext } from '@/features/keystone/context';
import crypto from 'crypto';
import {
  findOAuthToken,
  openOAuthInstallation,
  storedOAuthToken,
} from '@/features/keystone/security/oauth-credentials';

function escapeHtml(value: string | null): string {
  return String(value || '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]!);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      // OAuth error occurred
      const errorPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authorization Error</title>
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
              text-align: center;
            }
            .error-icon {
              width: 60px;
              height: 60px;
              background: #dc3545;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              margin: 0 auto 20px;
            }
            h1 {
              color: #dc3545;
              margin: 0 0 15px;
            }
            .error-code {
              background: #f8d7da;
              color: #721c24;
              padding: 10px;
              border-radius: 4px;
              margin: 15px 0;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="error-icon">⚠</div>
            <h1>Authorization Failed</h1>
            <p>The authorization request was not successful.</p>
            <div class="error-code">
              <strong>Error:</strong> ${escapeHtml(error)}<br>
              ${errorDescription ? `<strong>Description:</strong> ${escapeHtml(errorDescription)}` : ''}
            </div>
            <p>Please try again or contact the application developer for assistance.</p>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(errorPage, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!code) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing authorization code' },
        { status: 400 }
      );
    }

    // Check if this is an Openship setup redirect by examining state
    let stateData = null;
    if (state) {
      try {
        stateData = JSON.parse(atob(state));
      } catch (e) {
        console.error('Failed to decode state:', e);
      }
    }

    // If this is an Openship setup redirect, handle it differently
    if (stateData && stateData.redirect_type === 'openship_setup') {
      let installation;
      try {
        installation = openOAuthInstallation(stateData.installation_ticket);
      } catch {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Invalid or expired installation ticket' },
          { status: 400 }
        );
      }
      if (installation.clientId !== stateData.client_id) {
        return NextResponse.json(
          { error: 'invalid_request', error_description: 'Installation client mismatch' },
          { status: 400 }
        );
      }
      
      // Find the authorization code to validate it
      const authCode = await findOAuthToken(
        keystoneContext,
        code,
        'id clientId redirectUri state tokenType isRevoked scopes user { id }'
      );

      if (!authCode || authCode.tokenType !== 'authorization_code' || authCode.isRevoked !== 'false') {
        return NextResponse.json(
          { error: 'invalid_grant', error_description: 'Invalid authorization code' },
          { status: 400 }
        );
      }

      // The client secret is returned only during initial installation and may
      // be carried in this one-time authorization state. It is never read back
      // from storage.
      const app = await keystoneContext.sudo().query.OAuthApp.findOne({
        where: { clientId: stateData.client_id },
        query: 'clientId name'
      });

      if (!app) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: 'OAuth app not found' },
          { status: 400 }
        );
      }

      const accessToken = crypto.randomBytes(32).toString('hex');
      const refreshToken = crypto.randomBytes(32).toString('hex');
      const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await keystoneContext.sudo().prisma.$transaction(async (tx) => {
        const consumed = await tx.oAuthToken.updateMany({
          where: { id: authCode.id, isRevoked: 'false' },
          data: { isRevoked: 'true' },
        });
        if (consumed.count !== 1) throw new Error('Authorization code already consumed');
        await tx.oAuthToken.create({
          data: {
            token: storedOAuthToken(accessToken),
            tokenType: 'access_token',
            clientId: authCode.clientId,
            scopes: authCode.scopes || [],
            redirectUri: authCode.redirectUri,
            state: '',
            isRevoked: 'false',
            expiresAt: accessTokenExpiresAt,
            refreshToken: storedOAuthToken(refreshToken),
            userId: authCode.user?.id,
          },
        });
        await tx.oAuthToken.create({
          data: {
            token: storedOAuthToken(refreshToken),
            tokenType: 'refresh_token',
            clientId: authCode.clientId,
            scopes: authCode.scopes || [],
            redirectUri: authCode.redirectUri,
            state: '',
            isRevoked: 'false',
            expiresAt: refreshTokenExpiresAt,
            accessToken: storedOAuthToken(accessToken),
            userId: authCode.user?.id,
          },
        });
      });

      // Build Openship URL with platform auto-create parameters
      const openshipUrl = installation.openshipUrl;
      
      // Determine the correct endpoint based on app type
      const appType = installation.appType || 'shop'; // default to shop for backward compatibility
      const endpoint = appType === 'channel' ? 'channels' : 'shops';
      const setupUrl = new URL(`${openshipUrl}/dashboard/platform/${endpoint}`);
      
      // Use correct parameter based on app type
      const setupParam = appType === 'channel' ? 'showCreateChannelAndChannelAndPlatform' : 'showCreateShopAndChannelAndPlatform';
      setupUrl.searchParams.set(setupParam, 'true');
      setupUrl.searchParams.set('client_id', app.clientId);
      setupUrl.searchParams.set('client_secret', installation.clientSecret);
      setupUrl.searchParams.set('app_name', app.name);
      setupUrl.searchParams.set('accessToken', accessToken);
      setupUrl.searchParams.set('refreshToken', refreshToken);
      setupUrl.searchParams.set('tokenExpiresAt', accessTokenExpiresAt.toISOString());
      const configuredPublicOrigin = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
      setupUrl.searchParams.set(
        'domain',
        configuredPublicOrigin ? new URL(configuredPublicOrigin).origin : new URL(request.url).origin
      ); // OpenFront domain
      
      
      // Redirect to Openship for auto-platform/shop creation
      return NextResponse.redirect(setupUrl.toString());
    }

    // Original flow - find the authorization code to get redirect information
    const authCode = await findOAuthToken(
      keystoneContext,
      code,
      'id clientId redirectUri state tokenType isRevoked'
    );

    if (!authCode || authCode.tokenType !== 'authorization_code' || authCode.isRevoked !== 'false') {
      const errorPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Code</title>
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
              text-align: center;
            }
            .error-icon {
              width: 60px;
              height: 60px;
              background: #dc3545;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              margin: 0 auto 20px;
            }
            h1 {
              color: #dc3545;
              margin: 0 0 15px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="error-icon">⚠</div>
            <h1>Invalid Code</h1>
            <p>The authorization code is invalid or has expired.</p>
            <p>Please try the authorization process again.</p>
          </div>
        </body>
        </html>
      `;

      return new NextResponse(errorPage, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Success page - shows that authorization was successful
    const successPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authorization Successful</title>
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
            text-align: center;
          }
          .success-icon {
            width: 60px;
            height: 60px;
            background: #28a745;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            margin: 0 auto 20px;
          }
          h1 {
            color: #28a745;
            margin: 0 0 15px;
          }
          .auth-code {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
          }
          .copy-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
          }
          .copy-btn:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="success-icon">✓</div>
          <h1>Authorization Successful!</h1>
          <p>You have successfully authorized the application to access your OpenFront store.</p>
          
          <div class="auth-code">
            <strong>Authorization Code:</strong><br>
            <span id="auth-code">${code}</span>
            <br>
            <button class="copy-btn" onclick="copyToClipboard()">Copy Code</button>
          </div>
          
          ${state ? `<p><small><strong>State:</strong> ${state}</small></p>` : ''}
          
          <p><small>You can now close this window and return to the application.</small></p>
        </div>

        <script>
          function copyToClipboard() {
            const codeElement = document.getElementById('auth-code');
            const code = codeElement.textContent;
            
            if (navigator.clipboard) {
              navigator.clipboard.writeText(code).then(() => {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                  btn.textContent = originalText;
                }, 2000);
              });
            } else {
              // Fallback for older browsers
              const textArea = document.createElement('textarea');
              textArea.value = code;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              
              const btn = event.target;
              const originalText = btn.textContent;
              btn.textContent = 'Copied!';
              setTimeout(() => {
                btn.textContent = originalText;
              }, 2000);
            }
          }

          // Auto-close after 30 seconds if opened in a popup
          if (window.opener) {
            setTimeout(() => {
              window.close();
            }, 30000);
          }
        </script>
      </body>
      </html>
    `;

    return new NextResponse(successPage, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}