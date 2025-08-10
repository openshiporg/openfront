import { keystoneContext } from '../context';
import { getPermissionsForScopes, hasPermission, OAuthScope, Permission } from './scopes';

/**
 * OAuth token validation and permission checking middleware
 */

export interface OAuthContext {
  accessToken: string;
  scopes: OAuthScope[];
  clientId: string;
  isValid: boolean;
  permissions: Permission[];
}

/**
 * Validates an OAuth access token and returns the associated context
 */
export async function validateOAuthToken(accessToken: string): Promise<OAuthContext | null> {
  try {
    // Find the access token in the database
    const tokenRecord = await keystoneContext.sudo().query.OAuthToken.findOne({
      where: {
        token: accessToken,
        tokenType: 'access_token',
        isRevoked: 'false'
      },
      query: 'id clientId scopes expiresAt'
    });

    if (!tokenRecord) {
      return null;
    }

    // Check if token is expired
    if (new Date() > new Date(tokenRecord.expiresAt)) {
      return null;
    }

    // Get app information
    const oauthApp = await keystoneContext.sudo().query.OAuthApp.findOne({
      where: { clientId: tokenRecord.clientId },
      query: 'id name status scopes'
    });

    if (!oauthApp || oauthApp.status !== 'active') {
      return null;
    }

    const scopes = tokenRecord.scopes as OAuthScope[];
    const permissions = getPermissionsForScopes(scopes);

    return {
      accessToken,
      scopes,
      clientId: tokenRecord.clientId,
      isValid: true,
      permissions
    };

  } catch (error) {
    console.error('OAuth token validation error:', error);
    return null;
  }
}

/**
 * Extracts OAuth token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Checks if OAuth context has required permission
 */
export function checkOAuthPermission(
  oauthContext: OAuthContext | null, 
  requiredPermission: Permission
): boolean {
  if (!oauthContext || !oauthContext.isValid) {
    return false;
  }

  return hasPermission(oauthContext.scopes, requiredPermission);
}

/**
 * Middleware factory for protecting API routes with OAuth
 */
export function requireOAuthPermission(permission: Permission) {
  return async (request: Request): Promise<OAuthContext | null> => {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return null;
    }

    const oauthContext = await validateOAuthToken(token);

    if (!checkOAuthPermission(oauthContext, permission)) {
      return null;
    }

    return oauthContext;
  };
}

/**
 * Creates a permission session for use with Keystone access control
 * This allows OAuth tokens to work with existing Keystone permissions
 */
export function createOAuthSession(oauthContext: OAuthContext) {
  const session: Record<string, boolean> = {
    itemId: `oauth_${oauthContext.clientId}`,
    listKey: 'OAuthApp',
    data: {
      // Always grant dashboard access for OAuth apps
      canAccessDashboard: true,
    }
  };

  // Map OAuth permissions to session permissions
  oauthContext.permissions.forEach(permission => {
    session.data[permission] = true;
  });

  return session;
}

/**
 * Error responses for OAuth failures
 */
export const OAUTH_ERRORS = {
  INVALID_TOKEN: {
    error: 'invalid_token',
    error_description: 'The access token provided is expired, revoked, malformed, or invalid'
  },
  INSUFFICIENT_SCOPE: {
    error: 'insufficient_scope',
    error_description: 'The request requires higher privileges than provided by the access token'
  },
  MISSING_TOKEN: {
    error: 'invalid_request',
    error_description: 'Missing access token'
  }
} as const;