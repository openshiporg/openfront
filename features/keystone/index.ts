import { createAuth } from "@keystone-6/auth";
import { config } from "@keystone-6/core";
// import { statelessSessions } from "@keystone-6/core/session";
import { permissionsList } from "./models/fields";
import "dotenv/config";
import { extendGraphqlSchema } from "./mutations";
import { models } from "./models";
import { sendPasswordResetEmail } from "./lib/mail";
import Iron from "@hapi/iron";
import * as cookie from "cookie";
import { permissions } from "./access";
import bcryptjs from "bcryptjs";
import { withWebhooks } from "../webhooks/webhook-plugin";
import { customerTokenDigest } from "./security/token-crypto";
import { findOAuthToken } from "./security/oauth-credentials";
import "./config/launch-policy";
// Add rate limiting on storefront queries and mutations
// import { ApolloArmor } from "@escape.tech/graphql-armor";
// import { applyMiddleware } from "graphql-middleware";
// import { RateLimiterMemory } from "rate-limiter-flexible";
// import { applyRateLimiting } from "./applyRateLimiting";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function productionEnv(name: string, developmentFallback: string): string {
  if (process.env[name]) return process.env[name]!;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production`);
  }
  return developmentFallback;
}

const databaseURL = requiredEnv("DATABASE_URL");
const sessionSecret = requiredEnv("SESSION_SECRET");
if (sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long");
}

const listKey = "User";
const trustedProxyIps = new Set(
  (process.env.TRUSTED_PROXY_IPS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

function requestClientIp(req: any): string {
  const remote = String(
    req.socket?.remoteAddress || req.connection?.remoteAddress || ""
  ).replace(/^::ffff:/, "");
  if (trustedProxyIps.has(remote)) {
    const forwarded = req.headers["x-forwarded-for"];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (typeof first === "string" && first.trim()) {
      return first.split(",")[0].trim().replace(/^::ffff:/, "");
    }
    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  }
  return remote;
}

export const basePath = "/dashboard";

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 30,
  secret: sessionSecret,
};

const bucketName = productionEnv("S3_BUCKET_NAME", "keystone-test");
const region = productionEnv("S3_REGION", "ap-southeast-2");
const accessKeyId = productionEnv("S3_ACCESS_KEY_ID", "keystone");
const secretAccessKey = productionEnv("S3_SECRET_ACCESS_KEY", "keystone");
const endpoint = productionEnv("S3_ENDPOINT", "https://sfo3.digitaloceanspaces.com");

export function statelessSessions({
  secret,
  maxAge = 60 * 60 * 24 * 360,
  path = "/",
  secure = process.env.NODE_ENV === "production",
  ironOptions = Iron.defaults,
  domain,
  sameSite = "lax" as const,
  cookieName = "keystonejs-session",
}: {
  secret: string;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  ironOptions?: any;
  domain?: string;
  sameSite?: "lax" | "none" | "strict" | boolean;
  cookieName?: string;
}) {
  if (!secret) {
    throw new Error("You must specify a session secret to use sessions");
  }
  if (secret.length < 32) {
    throw new Error("The session secret must be at least 32 characters long");
  }

  return {
    async get({ context }: { context: any }) {
      if (!context?.req) return;
      
      // Check for OAuth Bearer token authentication
      const authHeader = context.req.headers.authorization;
      
      if (authHeader?.startsWith("Bearer ")) {
        const accessToken = authHeader.replace("Bearer ", "");
        
        // Try to validate as API key first
        if (accessToken.startsWith("of_")) {
          try {
            // Forwarded headers are honored only from an explicitly trusted
            // proxy connection; direct clients cannot spoof an allowed IP.
            const actualClientIP = requestClientIp(context.req);
            
            
            // Get all active API keys and test the token against each one
            const apiKeys = await context.sudo().query.ApiKey.findMany({
              where: { status: { equals: 'active' } },
              query: `
                id
                name
                scopes
                status
                expiresAt
                usageCount
                restrictedToIPs
                tokenSecret { isSet }
                user { id }
              `,
            });
            
            
            let matchingApiKey = null;
            
            // Test token against each API key using bcryptjs (same as Keystone's default KDF)
            for (const apiKey of apiKeys) {
              try {
                if (!apiKey.tokenSecret?.isSet) continue;
                
                // Get the full API key item with the tokenSecret value
                const fullApiKey = await context.sudo().db.ApiKey.findOne({
                  where: { id: apiKey.id },
                });
                
                if (!fullApiKey || typeof fullApiKey.tokenSecret !== 'string') {
                  continue;
                }
                
                // Use bcryptjs to compare - this is exactly what Keystone does internally
                const isValid = await bcryptjs.compare(accessToken, fullApiKey.tokenSecret);
                
                if (isValid) {
                  matchingApiKey = apiKey;
                  break;
                }
              } catch (error) {
                continue;
              }
            }
            
            if (!matchingApiKey) {
              return; // API key not found or invalid
            }
            
            // Check IP restrictions if configured
            if (matchingApiKey.restrictedToIPs && Array.isArray(matchingApiKey.restrictedToIPs) && matchingApiKey.restrictedToIPs.length > 0) {
              const allowedIPs = matchingApiKey.restrictedToIPs;
              const isAllowedIP = allowedIPs.includes(actualClientIP);
              
              
              if (!isAllowedIP) {
                return; // IP not in allowed list
              }
            }
            
            if (matchingApiKey.status !== 'active') {
              return; // API key is inactive
            }
            
            if (matchingApiKey.expiresAt && new Date() > new Date(matchingApiKey.expiresAt)) {
              // Auto-revoke expired keys
              await context.sudo().query.ApiKey.updateOne({
                where: { id: matchingApiKey.id },
                data: { status: 'revoked' },
              });
              return; // API key has expired
            }
            
            // Update usage statistics (async, don't wait)
            const today = new Date().toISOString().split('T')[0];
            const usage = matchingApiKey.usageCount || { total: 0, daily: {} };
            usage.total = (usage.total || 0) + 1;
            usage.daily[today] = (usage.daily[today] || 0) + 1;
            
            context.sudo().query.ApiKey.updateOne({
              where: { id: matchingApiKey.id },
              data: {
                lastUsedAt: new Date(),
                usageCount: usage,
              },
            }).catch(console.error);
            
            // Return user session with API key scopes attached
            if (matchingApiKey.user?.id) {
              const session = { 
                itemId: matchingApiKey.user.id, 
                listKey,
                apiKeyScopes: matchingApiKey.scopes || [] // Attach scopes for permission checking
              };
              return session;
            }
          } catch (err) {
            return;
          }
        }
        
        // Try to validate as OAuth token first
        try {
          const oauthToken = await findOAuthToken(
            context,
            accessToken,
            `id clientId scopes expiresAt tokenType isRevoked user { id }`
          );
          
          
          if (oauthToken) {
            
            // Check token type and revoked status
            if (oauthToken.tokenType !== "access_token") {
              return; // Not an access token
            }
            
            if (oauthToken.isRevoked === "true") {
              return; // Token revoked
            }
            
            // Check if token is expired
            if (new Date() > new Date(oauthToken.expiresAt)) {
              return; // Token expired
            }
            
            // Check if app is active
            const oauthApp = await context.sudo().query.OAuthApp.findOne({
              where: { clientId: oauthToken.clientId },
              query: `id status`
            });
            
            
            if (!oauthApp || oauthApp.status !== 'active') {
              return; // App not active
            }
            
            // Return user session with OAuth scopes attached
            if (oauthToken.user?.id) {
              
              return { 
                itemId: oauthToken.user.id, 
                listKey,
                oauthScopes: oauthToken.scopes // Attach scopes for permission checking
              };
            }
          }
        } catch (err) {
          // Not an OAuth token, try as customer token below
        }
        
        // Try as customer token (for invoice/Openship integration)
        if (accessToken.startsWith('ctok_')) {
          try {
            const digest = customerTokenDigest(accessToken);
            let users = await context.sudo().query.User.findMany({
              where: { customerToken: { equals: digest } },
              take: 1,
              query: `
                id
                tokenGeneratedAt
                accounts(where: { status: { equals: "active" }, accountType: { equals: "business" } }) {
                  id
                  status
                }
              `
            });

            // Development-only compatibility for owner-controlled legacy data.
            // Production requires rotation to hashed, expiring tokens.
            if (!users[0] && process.env.NODE_ENV !== 'production') {
              users = await context.sudo().query.User.findMany({
                where: { customerToken: { equals: accessToken } },
                take: 1,
                query: `id tokenGeneratedAt accounts(where: { status: { equals: "active" }, accountType: { equals: "business" } }) { id status }`
              });
            }

            const user = users[0];
            const activeAccount = user?.accounts?.[0];
            if (!user || !activeAccount || !user.tokenGeneratedAt) return;

            const maxAgeDays = Number(process.env.CUSTOMER_TOKEN_MAX_AGE_DAYS || 90);
            const expiresAt = new Date(user.tokenGeneratedAt).getTime() + maxAgeDays * 24 * 60 * 60 * 1000;
            if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return;

            return {
              itemId: user.id,
              listKey,
              customerToken: true,
              activeAccountId: activeAccount.id
            };
          } catch (err) {
            return;
          }
        }
        
        // If not OAuth or customer token, try as regular session token
        try {
          return await Iron.unseal(accessToken, secret, ironOptions);
        } catch (err) {}
      }
      
      // Check for session cookie
      const cookies = cookie.parse(context.req.headers.cookie || "");
      const token = cookies[cookieName];
      if (!token) return;
      try {
        return await Iron.unseal(token, secret, ironOptions);
      } catch (err) {}
    },
    async end({ context }: { context: any }) {
      if (!context?.res) return;

      context.res.setHeader(
        "Set-Cookie",
        cookie.serialize(cookieName, "", {
          maxAge: 0,
          expires: new Date(),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain,
        })
      );
    },
    async start({ context, data }: { context: any; data: any }) {
      if (!context?.res) return;

      const sealedData = await Iron.seal(data, secret, {
        ...ironOptions,
        ttl: maxAge * 1000,
      });
      context.res.setHeader(
        "Set-Cookie",
        cookie.serialize(cookieName, sealedData, {
          maxAge,
          expires: new Date(Date.now() + maxAge * 1000),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain,
        })
      );

      return sealedData;
    },
  };
}

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"],
    itemData: {
      /*
        This creates a related role with full permissions, so that when the first user signs in
        they have complete access to the system (without this, you couldn't do anything)
      */
      role: {
        create: {
          name: "Admin",
          canAccessDashboard: true,
          canReadOrders: true,
          canManageOrders: true,
          canReadProducts: true,
          canManageProducts: true,
          canReadFulfillments: true,
          canManageFulfillments: true,
          canReadUsers: true,
          canManageUsers: true,
          canReadRoles: true,
          canManageRoles: true,
          canReadCheckouts: true,
          canManageCheckouts: true,
          canReadDiscounts: true,
          canManageDiscounts: true,
          canReadGiftCards: true,
          canManageGiftCards: true,
          canReadReturns: true,
          canManageReturns: true,
          canReadSalesChannels: true,
          canManageSalesChannels: true,
          canReadPayments: true,
          canManagePayments: true,
          canReadIdempotencyKeys: true,
          canManageIdempotencyKeys: true,
          canReadApps: true,
          canManageApps: true,
          canManageKeys: true,
          canManageOnboarding: true,
          canReadWebhooks: true,
          canManageWebhooks: true,
        },
      },
    },
    // TODO: Add in inital roles here
  },
  passwordResetLink: {
    async sendToken(args) {
      // send the email
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
  sessionData: `id name email role { ${permissionsList.join(" ")} }`,
});

// const armor = new ApolloArmor();

// Modify the export statement
// Apply webhook plugin to the config
export default withAuth(
  withWebhooks(
    config({
      db: {
        provider: "postgresql",
        url: databaseURL,
      },
      lists: models,
      storage: {
        my_images: {
          kind: "s3",
          type: "image",
          bucketName,
          region,
          accessKeyId,
          secretAccessKey,
          endpoint,
          signed: { expiry: 5000 },
          forcePathStyle: true,
        },
      },
      graphql: {
        // apolloConfig: {
        //   ...armor.protect()
        // },
        // extendGraphqlSchema: (schema) => {
        //   const extendedSchema = extendGraphqlSchema(schema);
        //   return applyMiddleware(extendedSchema,
        //     applyRateLimiting
        //   );
        // }
        extendGraphqlSchema,
      },
      ui: {
        // Show the UI only for users who have canAccessDashboard permission
        // (min access scope needed to access Admin UI)
        isAccessAllowed: ({ session }) => permissions.canAccessDashboard({ session }),
        basePath
      },
      session: statelessSessions(sessionConfig),
    })
  )
);
