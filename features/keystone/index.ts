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
// Add rate limiting on storefront queries and mutations
// import { ApolloArmor } from "@escape.tech/graphql-armor";
// import { applyMiddleware } from "graphql-middleware";
// import { RateLimiterMemory } from "rate-limiter-flexible";
// import { applyRateLimiting } from "./applyRateLimiting";

const databaseURL = process.env.DATABASE_URL || "file:./keystone.db";

const listKey = "User";

export const basePath = "/dashboard";

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long they stay signed in?
  secret:
    process.env.SESSION_SECRET || "this secret should only be used in testing",
};

const {
  S3_BUCKET_NAME: bucketName = "keystone-test",
  S3_REGION: region = "ap-southeast-2",
  S3_ACCESS_KEY_ID: accessKeyId = "keystone",
  S3_SECRET_ACCESS_KEY: secretAccessKey = "keystone",
  S3_ENDPOINT: endpoint = "https://sfo3.digitaloceanspaces.com",
} = process.env;

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
          console.log('🔑 API KEY DETECTED, VALIDATING...');
          try {
            // Get client IP address for IP restriction validation
            const clientIP = context.req.headers['x-forwarded-for'] || 
                           context.req.headers['x-real-ip'] ||
                           context.req.connection?.remoteAddress ||
                           context.req.socket?.remoteAddress ||
                           (context.req.connection?.socket as any)?.remoteAddress ||
                           '127.0.0.1';
            
            // Handle comma-separated IPs from x-forwarded-for (use first one)
            const actualClientIP = typeof clientIP === 'string' ? clientIP.split(',')[0].trim() : '127.0.0.1';
            
            console.log('🔑 CLIENT IP:', actualClientIP);
            
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
            
            console.log('🔑 CHECKING AGAINST', apiKeys.length, 'ACTIVE API KEYS');
            
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
                  console.log('🔑 FOUND MATCHING API KEY:', apiKey.id);
                  break;
                }
              } catch (error) {
                console.log('🔑 ERROR VERIFYING API KEY:', error);
                continue;
              }
            }
            
            if (!matchingApiKey) {
              console.log('🔑 NO MATCHING API KEY FOUND');
              return; // API key not found or invalid
            }
            
            // Check IP restrictions if configured
            if (matchingApiKey.restrictedToIPs && Array.isArray(matchingApiKey.restrictedToIPs) && matchingApiKey.restrictedToIPs.length > 0) {
              const allowedIPs = matchingApiKey.restrictedToIPs;
              const isAllowedIP = allowedIPs.includes(actualClientIP);
              
              console.log('🔑 IP RESTRICTION CHECK:');
              console.log('🔑 Client IP:', actualClientIP);
              console.log('🔑 Allowed IPs:', allowedIPs);
              console.log('🔑 Is Allowed:', isAllowedIP);
              
              if (!isAllowedIP) {
                console.log('🔑 API KEY BLOCKED: IP NOT ALLOWED');
                return; // IP not in allowed list
              }
            }
            
            if (matchingApiKey.status !== 'active') {
              console.log('🔑 API KEY NOT ACTIVE:', matchingApiKey.status);
              return; // API key is inactive
            }
            
            if (matchingApiKey.expiresAt && new Date() > new Date(matchingApiKey.expiresAt)) {
              console.log('🔑 API KEY EXPIRED');
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
              console.log('🔑 RETURNING SESSION:', JSON.stringify(session, null, 2));
              return session;
            }
          } catch (err) {
            console.log('🔑 API Key validation error:', err);
            return;
          }
        }
        
        // Try to validate as OAuth token first
        try {
          const oauthToken = await context.sudo().query.OAuthToken.findOne({
            where: { token: accessToken },
            query: `id clientId scopes expiresAt tokenType isRevoked user { id }`
          });
          
          console.log('🔵 OAUTH TOKEN FOUND:', !!oauthToken);
          
          if (oauthToken) {
            console.log('🔵 OAUTH TOKEN DETAILS:', JSON.stringify(oauthToken, null, 2));
            
            // Check token type and revoked status
            if (oauthToken.tokenType !== "access_token") {
              return; // Not an access token
            }
            
            if (oauthToken.isRevoked === "true") {
              console.log('🔵 TOKEN REVOKED');
              return; // Token revoked
            }
            
            // Check if token is expired
            if (new Date() > new Date(oauthToken.expiresAt)) {
              console.log('🔵 TOKEN EXPIRED');
              return; // Token expired
            }
            
            // Check if app is active
            const oauthApp = await context.sudo().query.OAuthApp.findOne({
              where: { clientId: oauthToken.clientId },
              query: `id status`
            });
            
            console.log('🔵 OAUTH APP:', oauthApp);
            
            if (!oauthApp || oauthApp.status !== 'active') {
              console.log('🔵 OAUTH APP NOT ACTIVE');
              return; // App not active
            }
            
            // Return user session with OAuth scopes attached
            if (oauthToken.user?.id) {
              console.log('🔵 CREATING OAUTH SESSION:');
              console.log('🔵 User ID:', oauthToken.user.id);
              console.log('🔵 OAuth Scopes:', oauthToken.scopes);
              console.log('🔵 List Key:', listKey);
              
              return { 
                itemId: oauthToken.user.id, 
                listKey,
                oauthScopes: oauthToken.scopes // Attach scopes for permission checking
              };
            }
          }
        } catch (err) {
          console.log('🔵 OAUTH TOKEN LOOKUP ERROR:', err.message);
          // Not an OAuth token, try as customer token below
        }
        
        // Try as customer token (for invoice/Openship integration)
        if (accessToken.startsWith('ctok_')) {
          console.log('🟢 CUSTOMER TOKEN DETECTED, VALIDATING...');
          try {
            const users = await context.sudo().query.User.findMany({
              where: { customerToken: { equals: accessToken } },
              take: 1,
              query: `
                id
                email
                name
                accounts(where: { status: { equals: "active" }, accountType: { equals: "business" } }) {
                  id
                  status
                  availableCredit
                }
              `
            });
            
            const user = users[0];
            if (!user) {
              console.log('🟢 CUSTOMER TOKEN NOT FOUND');
              return; // Token not found
            }
            
            // Check if user has active account
            const activeAccount = user.accounts?.[0];
            if (!activeAccount) {
              console.log('🟢 NO ACTIVE ACCOUNT FOUND FOR USER');
              return; // No active account
            }
            
            console.log('🟢 CUSTOMER TOKEN VALID, CREATING SESSION');
            console.log('🟢 User:', user.email);
            console.log('🟢 Active Account:', activeAccount.id);
            
            // Return user session with customer token flag
            return { 
              itemId: user.id, 
              listKey,
              customerToken: true, // Flag for permission checking
              activeAccountId: activeAccount.id
            };
          } catch (err) {
            console.log('🟢 CUSTOMER TOKEN VALIDATION ERROR:', err.message);
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
