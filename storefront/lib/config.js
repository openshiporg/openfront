import { keystoneContext } from "@keystone/keystoneContext";
import { GraphQLClient } from "graphql-request";
import { parse } from "graphql";
import Iron from "@hapi/iron";

const shouldRetry = (error) =>
  error.message?.includes("connection pool") ||
  error.message?.includes("Timed out") ||
  error.code === "P2024" ||
  error.message?.includes("Code: 502") ||
  error.response?.status === 502 ||
  error.message?.includes("too many clients already") ||
  (error.response?.errors || []).some((e) => e.message?.includes("502"));

const isEndpointUnreachable = (error) =>
  error.code === "ECONNREFUSED" ||
  error.type === "system" ||
  error.message?.includes("request to") ||
  error.message?.includes("failed, reason") ||
  error.message?.includes("DEPLOYMENT_NOT_FOUND") ||
  error.response?.error?.includes("DEPLOYMENT_NOT_FOUND") ||
  error.message?.includes("Code: 404");

const getEmptyResponseForQuery = (query) => {
  const document = typeof query === "string" ? parse(query) : query;
  const emptyResponse = {};

  document.definitions.forEach((def) => {
    if (def.kind === "OperationDefinition") {
      def.selectionSet.selections.forEach((selection) => {
        if (selection.kind === "Field") {
          const name = selection.name.value;
          const isPlural = name.endsWith("s");
          emptyResponse[name] = isPlural ? [] : null;
        }
      });
    }
  });

  return emptyResponse;
};

class RetryingGraphQLClient extends GraphQLClient {
  async request(query, variables, requestHeaders) {
    try {
      const response = await super.request(query, variables, requestHeaders);
      return response;
    } catch (error) {
      console.log(`GraphQL error: ${error.message}`);
      return getEmptyResponseForQuery(query);
    }
  }
}

export const openfrontClient2 = new RetryingGraphQLClient(
  `${process.env.FRONTEND_URL}/api/graphql`
  // { fetch }
);

const sessionSecret =
  process.env.SESSION_SECRET || "this secret should only be used in testing";
const ironOptions = Iron.defaults;

export const openfrontClient = {
  request: async (query, variables = {}, headers) => {
    try {
      const cleanVariables = Object.fromEntries(
        Object.entries(variables).filter(([_, value]) => value !== undefined)
      );

      let context = keystoneContext;

      // Only attempt to handle session if headers were provided
      if (headers?.authorization) {
        const sessionToken = headers.authorization.replace("Bearer ", "");
        try {
          const session = await Iron.unseal(
            sessionToken,
            sessionSecret,
            ironOptions
          );
          context = keystoneContext.withSession({
            ...session,
            data: {},
          });
        } catch (err) {
          console.log("Failed to unseal session token:", err);
          context = keystoneContext;
          // Continue with base context if session unsealing fails
        }
      }

      const { data, errors } = await context.graphql.raw({
        query,
        variables: cleanVariables,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.log(`GraphQL error: ${error.message}`);
      return getEmptyResponseForQuery(query);
    }
  },
};
