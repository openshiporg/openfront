import { NextRequest, NextResponse } from 'next/server';
import { keystoneContext } from '@/features/keystone/context';

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
              <strong>Error:</strong> ${error}<br>
              ${errorDescription ? `<strong>Description:</strong> ${errorDescription}` : ''}
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

    // Find the authorization code to get redirect information
    const authCode = await keystoneContext.sudo().query.OAuthToken.findOne({
      where: {
        token: code,
        tokenType: 'authorization_code',
        isRevoked: 'false'
      },
      query: 'id clientId redirectUri state'
    });

    if (!authCode) {
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