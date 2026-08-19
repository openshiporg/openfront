import crypto from "node:crypto";
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

export function sealOAuthInstallation(payload: Record<string, unknown>): string {
  if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required");
  const key = crypto.createHash("sha256").update(process.env.SESSION_SECRET).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify({ ...payload, expiresAt: Date.now() + 10 * 60 * 1000 }));
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openOAuthInstallation(ticket: string): Record<string, any> {
  if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is required");
  const packed = Buffer.from(ticket, "base64url");
  if (packed.length < 29) throw new Error("Invalid installation ticket");
  const key = crypto.createHash("sha256").update(process.env.SESSION_SECRET).digest();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, packed.subarray(0, 12));
  decipher.setAuthTag(packed.subarray(12, 28));
  const value = JSON.parse(
    Buffer.concat([decipher.update(packed.subarray(28)), decipher.final()]).toString("utf8")
  );
  if (!value.expiresAt || value.expiresAt < Date.now()) throw new Error("Installation ticket expired");
  return value;
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
