import { NextRequest, NextResponse } from 'next/server';
import { keystoneContext } from '@/features/keystone/context';

export async function POST(request: NextRequest) {
  try {
    const { client_id, client_secret } = await request.json();

    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Missing client_id or client_secret' },
        { status: 400 }
      );
    }

    // Verify client credentials
    const oauthApp = await keystoneContext.sudo().query.OAuthApp.findOne({
      where: { clientId: client_id },
      query: 'id name clientSecret status'
    });

    if (!oauthApp || oauthApp.clientSecret !== client_secret || oauthApp.status !== 'active') {
      return NextResponse.json(
        { error: 'invalid_client', error_description: 'Invalid client credentials' },
        { status: 401 }
      );
    }

    // Find the most recent non-revoked access token for this client
    const accessTokens = await keystoneContext.sudo().query.OAuthToken.findMany({
      where: {
        clientId: { equals: client_id },
        tokenType: { equals: 'access_token' },
        isRevoked: { equals: 'false' }
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
      query: 'id token expiresAt'
    });

    if (accessTokens.length === 0) {
      return NextResponse.json({
        is_valid: false,
        message: 'No access token found'
      });
    }

    const accessToken = accessTokens[0];
    const now = new Date();
    const expiresAt = new Date(accessToken.expiresAt);

    // Check if token is still valid (not expired)
    const isValid = now < expiresAt;

    return NextResponse.json({
      is_valid: isValid,
      access_token: isValid ? accessToken.token : null,
      expires_at: accessToken.expiresAt,
      message: isValid ? 'Token is valid' : 'Token has expired'
    });

  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}