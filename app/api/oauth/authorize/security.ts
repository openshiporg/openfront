import crypto from "node:crypto";

export type OAuthAuthorizationRequest = {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state: string | null;
  codeChallenge: string | null;
  codeChallengeMethod: "plain" | "S256" | null;
  ownerId: string;
  expiresAt: number;
};

function authorizationKey(secret = process.env.SESSION_SECRET): Buffer {
  if (!secret) throw new Error("SESSION_SECRET is required");
  return crypto
    .createHash("sha256")
    .update(`openfront:oauth-authorization:${secret}`)
    .digest();
}

export function sealAuthorizationRequest(
  request: OAuthAuthorizationRequest,
  secret?: string
): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", authorizationKey(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(request), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64url");
}

export function openAuthorizationRequest(
  ticket: string,
  options: { secret?: string; now?: number } = {}
): OAuthAuthorizationRequest {
  const packed = Buffer.from(ticket, "base64url");
  if (packed.length < 29) throw new Error("Invalid authorization request");

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    authorizationKey(options.secret),
    packed.subarray(0, 12)
  );
  decipher.setAuthTag(packed.subarray(12, 28));
  const request = JSON.parse(
    Buffer.concat([
      decipher.update(packed.subarray(28)),
      decipher.final(),
    ]).toString("utf8")
  ) as OAuthAuthorizationRequest;

  if (!request.expiresAt || request.expiresAt <= (options.now ?? Date.now())) {
    throw new Error("Authorization request expired");
  }
  if (
    !request.clientId ||
    !request.redirectUri ||
    !request.ownerId ||
    !Array.isArray(request.scopes)
  ) {
    throw new Error("Invalid authorization request");
  }
  return request;
}

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}
