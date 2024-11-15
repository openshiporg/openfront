import { keystoneContext } from "@keystone/keystoneContext";
import { GraphQLClient } from "graphql-request";
import { parse } from "graphql";
import { getAuthHeaders } from "@lib/cookies";

const shouldRetry = (error) =>
  error.message?.includes("connection pool") ||
  error.message?.includes("Timed out") ||
  error.code === "P2024" ||
  error.message?.includes("Code: 502") ||
  error.response?.status === 502 ||
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
          // Check if field type suggests an array
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
    // Get auth headers and merge with any passed headers
    const authHeaders = getAuthHeaders();
    const headers = {
      ...authHeaders,
      ...requestHeaders
    };

    try {
      return await super.request(query, variables, headers);
    } catch (error) {
      if (error.response?.status === 429) { // Too Many Requests
        const retryAfter = parseInt(error.response.headers.get("retry-after") || "5");
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return await super.request(query, variables, headers);
      }
      throw error;
    }
  }
}

export const openfrontClient = new RetryingGraphQLClient(
  `${process.env.FRONTEND_URL}/api/graphql`,
);

export const openfrontClientKeystone = {
  request: async (query, variables = {}) => {
    while (true) {
      try {
        const cleanVariables = Object.fromEntries(
          Object.entries(variables).filter(([_, value]) => value !== undefined)
        );

        const { data, errors } = await keystoneContext.graphql.raw({
          query,
          ...(Object.keys(cleanVariables).length > 0 && {
            variables: cleanVariables,
          }),
        });

        if (errors) {
          const error = new Error(errors[0].message);
          error.response = { errors };

          if (shouldRetry(error)) {
            console.log(
              `Retrying in 1s due to GraphQL error: ${error.message}`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }

          throw error;
        }

        return JSON.parse(JSON.stringify(data));
      } catch (error) {
        console.log(`Caught error: ${error.message}`);

        if (shouldRetry(error)) {
          console.log(`Retrying in 1s: ${error.message}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        throw error;
      }
    }
  },
};
