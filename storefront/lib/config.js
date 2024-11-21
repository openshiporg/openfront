import { keystoneContext } from "@keystone/keystoneContext";
import { GraphQLClient } from "graphql-request";
import { parse } from "graphql";

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

export const openfrontClient = {
  request: async (query, variables = {}, headers = {}) => {
    try {
      const cleanVariables = Object.entries(variables).filter(([_, value]) => value !== undefined);

      // Basic req/res objects that Keystone needs
      const req = {
        headers,
      };
      const res = {
        setHeader: () => {},
        end: () => {},
      };

      // Create context with request
      const context = await keystoneContext.withRequest(req, res);

      const { data, errors } = await context.graphql.raw({
        query,
        variables: Object.fromEntries(cleanVariables),
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.log(`GraphQL error: ${error.message}`);
      throw new Error(error.message);
    }
  },
};
