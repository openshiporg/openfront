import { keystoneContext } from "@lib/keystoneContext";
import { createYoga } from "graphql-yoga";
import processRequest from "graphql-upload/processRequest.js";

export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
};

// Use Keystone API to create GraphQL handler
// export default createYoga({
//   multipart: false,
//   schema: keystoneContext.graphql.schema,
//   context: ({ req, res }) => keystoneContext.withRequest(req, res),
//   graphqlEndpoint: "/api/graphql",
//   graphiql: {
//     defaultQuery: /* GraphQL */ `
//       query authenticatedItem {
//         authenticatedItem {
//           ... on User {
//             id
//           }
//         }
//       }
//     `,
//   },
// });

// eslint-disable-next-line import/no-unresolved
// export { default, config } from '.keystone/next/graphql-api';

export default async function handler(req, res) {
  const contentType = req.headers["content-type"];
  if (contentType?.startsWith("multipart/form-data")) {
    req.body = await processRequest(req, res);
  }
  return createYoga({
    graphqlEndpoint: "/api/graphql",
    schema: keystoneContext.graphql.schema,
    /*
      `keystoneContext` object doesn't have user's session information.
      You need an authenticated context to CRUD data behind access control.
      keystoneContext.withRequest(req, res) automatically unwraps the session cookie
      in the request object and gives you a `context` object with session info
      and an elevated sudo context to bypass access control if needed (context.sudo()).
    */
    context: ({ req, res }) => keystoneContext.withRequest(req, res),
    /*
      For some reason graphql-yoga upload implementation does not work with keystone
      out-of-the-box. Need to process request manually with graphql-upload
    */
    multipart: false,
    // renderGraphiQL: () => renderGraphiQL({ title: "Openfront" }),
    // plugins: [
    //   useSofaWithSwaggerUI({
    //     basePath: '/rest',
    //     swaggerUIEndpoint: '/swagger',
    //     servers: [
    //       {
    //         url: '/', // Specify Server's URL.
    //         description: 'Development server'
    //       }
    //     ],
    //     info: {
    //       title: 'Example API',
    //       version: '1.0.0'
    //     }
    //   })
    // ]
  })(req, res);
}
