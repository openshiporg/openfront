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
  `${process.env.FRONTEND_URL}/api/graphql`,
  // { fetch }
);

export const openfrontClient = {
  request: async (query, variables = {}) => {
    const maxRetries = 12; // Try for up to 1 minute
    let attempt = 0;

    while (attempt < maxRetries) {
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
          throw new Error(errors[0].message);
        }

        const result = JSON.parse(JSON.stringify(data));
        
        // Explicitly disconnect after successful query
        if (keystoneContext.prisma?.$disconnect) {
          await keystoneContext.prisma.$disconnect();
        }
        
        return result;
      } catch (error) {
        console.log(`Attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);
        
        if (error.message?.includes("too many clients already")) {
          attempt++;
          if (attempt < maxRetries) {
            console.log("Too many clients, waiting 5 seconds before retry...");
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }
        }
        
        console.log("Returning empty response due to error");
        return getEmptyResponseForQuery(query);
      }
    }

    console.log("Max retries reached, returning empty response");
    return getEmptyResponseForQuery(query);
  },
};
