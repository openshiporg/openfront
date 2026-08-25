import {
  oauthClientSecretDigest,
  oauthTokenDigest,
  verifyCredentialDigest,
} from "./token-crypto";

export function storedOAuthToken(rawToken: string): string {
  return oauthTokenDigest(rawToken);
}

export function storedOAuthClientSecret(rawSecret: string): string {
  return oauthClientSecretDigest(rawSecret);
}

export function verifyOAuthClientSecret(
  rawSecret: string | undefined,
  storedSecret: string | undefined
): boolean {
  if (!rawSecret || !storedSecret) return false;
  if (verifyCredentialDigest(rawSecret, storedSecret, "oauth-client-secret")) {
    return true;
  }
  return process.env.NODE_ENV !== "production" && rawSecret === storedSecret;
}

export async function findOAuthToken(
  context: any,
  rawToken: string,
  query: string
): Promise<any | null> {
  if (!rawToken) return null;
  let token = await context.sudo().query.OAuthToken.findOne({
    where: { token: storedOAuthToken(rawToken) },
    query,
  });

  if (!token && process.env.NODE_ENV !== "production") {
    token = await context.sudo().query.OAuthToken.findOne({
      where: { token: rawToken },
      query,
    });
  }
  return token;
}
