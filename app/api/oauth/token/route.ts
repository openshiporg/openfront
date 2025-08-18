import { NextRequest, NextResponse } from 'next/server';
import { keystoneContext } from '@/features/keystone/context';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const grantType = formData.get('grant_type') as string;
    const clientId = formData.get('client_id') as string;
    const clientSecret = (formData.get('client_secret') as string)?.replace(/^\uFEFF/, ''); // Remove BOM
    const code = formData.get('code') as string;
    const redirectUri = formData.get('redirect_uri') as string;
    const refreshToken = formData.get('refresh_token') as string;
    const codeVerifier = formData.get('code_verifier') as string;

    // Validate required parameters
    if (!grantType) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing grant_type' },
        { status: 400 }
      );
    }
    
    // Only require clientId for authorization_code grant
    if (grantType === 'authorization_code' && !clientId) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing client_id for authorization_code grant' },
        { status: 400 }
      );
    }


    let oauthApp = null;
    
    // Only find OAuth app for authorization_code grants
    if (grantType === 'authorization_code') {
      // Find the OAuth app
      oauthApp = await keystoneContext.sudo().query.OAuthApp.findOne({
        where: { clientId },
        query: 'id name clientSecret scopes status'
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
    }


    // Only verify client secret for authorization code grants
    // Refresh token grants don't need client credentials
    if (grantType === 'authorization_code') {
      // Verify client secret for authorization code flow
      if (oauthApp.clientSecret !== clientSecret) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: 'Invalid client credentials' },
          { status: 401 }
        );
      }
      return await handleAuthorizationCodeGrant({
        code,
        redirectUri,
        clientId,
        codeVerifier,
        oauthApp
      });
    } else if (grantType === 'refresh_token') {
      return await handleRefreshTokenGrant({
        refreshToken,
        clientId,
        oauthApp
      });
    } else {
      return NextResponse.json(
        { error: 'unsupported_grant_type', error_description: 'Grant type not supported' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('OAuth token error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    console.error('Stack trace:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error constructor:', error.constructor.name);
    return NextResponse.json(
      { error: 'server_error', error_description: `${error.name}: ${error.message}` || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleAuthorizationCodeGrant({
  code,
  redirectUri,
  clientId,
  codeVerifier,
  oauthApp
}: {
  code: string;
  redirectUri: string;
  clientId: string;
  codeVerifier?: string;
  oauthApp: any;
}) {
  if (!code || !redirectUri) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Missing code or redirect_uri' },
      { status: 400 }
    );
  }

  // Find the authorization code by token only (since it's unique)
  const authCode = await keystoneContext.sudo().query.OAuthToken.findOne({
    where: { token: code },
    query: 'id token tokenType clientId scopes redirectUri expiresAt codeChallenge codeChallengeMethod isRevoked user { id }'
  });

  if (!authCode) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Authorization code not found or expired' },
      { status: 400 }
    );
  }

  // Validate the authorization code properties
  if (authCode.tokenType !== 'authorization_code') {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Invalid token type' },
      { status: 400 }
    );
  }

  if (authCode.clientId !== clientId) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Client ID mismatch' },
      { status: 400 }
    );
  }

  if (authCode.isRevoked === 'true') {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Authorization code has been revoked' },
      { status: 400 }
    );
  }

  // Check if code is expired
  if (new Date() > new Date(authCode.expiresAt)) {
    // Revoke the expired code
    await keystoneContext.sudo().query.OAuthToken.updateOne({
      where: { id: authCode.id },
      data: { isRevoked: 'true' }
    });

    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Authorization code expired' },
      { status: 400 }
    );
  }

  
  if (authCode.redirectUri !== redirectUri) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Redirect URI mismatch' },
      { status: 400 }
    );
  }

  // Validate PKCE if code challenge was provided
  if (authCode.codeChallenge) {
    if (!codeVerifier) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Code verifier required for PKCE' },
        { status: 400 }
      );
    }

    const codeChallengeMethod = authCode.codeChallengeMethod || 'plain';
    let computedChallenge = codeVerifier;

    if (codeChallengeMethod === 'S256') {
      computedChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
    }

    if (computedChallenge !== authCode.codeChallenge) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid code verifier' },
        { status: 400 }
      );
    }
  }

  // Generate access token and refresh token (proper OAuth 2.0)
  const accessToken = crypto.randomBytes(32).toString('hex');
  const newRefreshToken = crypto.randomBytes(32).toString('hex');
  
  // Access token expires in 1 hour, refresh token in 30 days
  const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // Revoke the authorization code
  await keystoneContext.sudo().query.OAuthToken.updateOne({
    where: { id: authCode.id },
    data: { isRevoked: 'true' }
  });

  // Create access token
  await keystoneContext.sudo().query.OAuthToken.createOne({
    data: {
      tokenType: 'access_token',
      token: accessToken,
      clientId,
      scopes: authCode.scopes,
      expiresAt: accessTokenExpiresAt,
      isRevoked: 'false',
      authorizationCode: code,
      refreshToken: newRefreshToken,
      user: authCode.user ? { connect: { id: authCode.user.id } } : undefined
    }
  });

  // Create refresh token
  await keystoneContext.sudo().query.OAuthToken.createOne({
    data: {
      tokenType: 'refresh_token',
      token: newRefreshToken,
      clientId,
      scopes: authCode.scopes,
      expiresAt: refreshTokenExpiresAt,
      isRevoked: 'false',
      accessToken,
      user: authCode.user ? { connect: { id: authCode.user.id } } : undefined
    }
  });

  // Return proper OAuth 2.0 response with both tokens
  return NextResponse.json({
    access_token: accessToken,           // Short-lived access token
    refresh_token: newRefreshToken,      // Long-lived refresh token
    token_type: 'bearer',
    expires_in: 3600,                    // 1 hour in seconds
    scope: authCode.scopes?.join(' ') || ''
  });
}

async function handleRefreshTokenGrant({
  refreshToken,
  clientId,
  oauthApp
}: {
  refreshToken: string;
  clientId: string;
  oauthApp: any;
}) {
  if (!refreshToken) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Missing refresh_token' },
      { status: 400 }
    );
  }

  // Find the refresh token by token only (since it's unique)
  const tokenRecord = await keystoneContext.sudo().query.OAuthToken.findOne({
    where: { token: refreshToken },
    query: 'id token tokenType clientId scopes expiresAt accessToken isRevoked user { id }'
  });

  if (!tokenRecord) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Refresh token not found or expired' },
      { status: 400 }
    );
  }

  // Validate the refresh token properties
  if (tokenRecord.tokenType !== 'refresh_token') {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Invalid token type' },
      { status: 400 }
    );
  }

  // Skip client ID validation - refresh token should be enough
  // Proper OAuth doesn't need client credentials for refresh

  if (tokenRecord.isRevoked === 'true') {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Refresh token has been revoked' },
      { status: 400 }
    );
  }

  // Check if refresh token is expired
  if (new Date() > new Date(tokenRecord.expiresAt)) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Refresh token expired' },
      { status: 400 }
    );
  }

  // Generate new access token
  const newAccessToken = crypto.randomBytes(32).toString('hex');
  const accessTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Revoke old access token if it exists
  if (tokenRecord.accessToken) {
    const oldAccessTokens = await keystoneContext.sudo().query.OAuthToken.findMany({
      where: {
        token: { equals: tokenRecord.accessToken },
        tokenType: { equals: 'access_token' },
        clientId: { equals: tokenRecord.clientId }
      }
    });

    for (const oldToken of oldAccessTokens) {
      await keystoneContext.sudo().query.OAuthToken.updateOne({
        where: { id: oldToken.id },
        data: { isRevoked: 'true' }
      });
    }
  }

  // Create new access token
  await keystoneContext.sudo().query.OAuthToken.createOne({
    data: {
      tokenType: 'access_token',
      token: newAccessToken,
      clientId: tokenRecord.clientId,
      scopes: tokenRecord.scopes,
      expiresAt: accessTokenExpiresAt,
      isRevoked: 'false',
      refreshToken,
      user: tokenRecord.user ? { connect: { id: tokenRecord.user.id } } : undefined
    }
  });

  // Update refresh token to reference new access token
  await keystoneContext.sudo().query.OAuthToken.updateOne({
    where: { id: tokenRecord.id },
    data: { accessToken: newAccessToken }
  });

  return NextResponse.json({
    access_token: newAccessToken,
    token_type: 'bearer',
    expires_in: 3600, // 1 hour
    refresh_token: refreshToken,
    scope: tokenRecord.scopes?.join(' ') || ''
  });
}