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
      const apiKey = context.req.headers["x-api-key"];
      // console.log({ apiKey });
      if (apiKey) {
        try {
          const data = await context.sudo().query.ApiKey.findOne({
            where: {
              id: apiKey,
            },
            query: `id user { id }`,
          });
          // console.log({ data });
          if (!data?.user?.id) return;
          return { itemId: data.user.id, listKey };
        } catch (err) {
          console.log({ err });
          return;
        }
      }
      const cookies = cookie.parse(context.req.headers.cookie || "");
      const bearer = context.req.headers.authorization?.replace("Bearer ", "");
      const token = bearer || cookies[cookieName];
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
export default withAuth(
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
);
