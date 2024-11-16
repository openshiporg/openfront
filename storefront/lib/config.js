import { keystoneContext } from "@keystone/keystoneContext";
import { GraphQLClient } from "graphql-request";
import { parse } from "graphql";
import PQueue from "p-queue";

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

// class RetryingGraphQLClient extends GraphQLClient {
//   async request(query, variables, requestHeaders) {
//     try {
//       return await super.request(query, variables, requestHeaders);
//     } catch (error) {
//       if (error.response?.status === 429) {
//         const retryAfter = parseInt(error.response.headers.get("retry-after") || "5");
//         await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
//         return await super.request(query, variables, requestHeaders);
//       }
//       throw error;
//     }
//   }
// }

class RetryingGraphQLClient extends GraphQLClient {
  async request(query, variables, requestHeaders) {
    while (true) {
      try {
        const response = await super.request(query, variables, requestHeaders);
        return response;
      } catch (error) {
        console.log(`GraphQL error: ${error.message}`);

        if (isEndpointUnreachable(error)) {
          console.log("Endpoint unreachable, returning empty data");
          return getEmptyResponseForQuery(query);
        }

        if (shouldRetry(error)) {
          console.log(`Retrying in 1s: ${error.message}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        throw error;
      }
    }
  }
}

export const openfrontClient = new RetryingGraphQLClient(
  `${process.env.FRONTEND_URL}/api/graphql`,
  { fetch }
);

// export const openfrontClientKeystone = {
//   request: async (query, variables = {}) => {
//     while (true) {
//       try {
//         const cleanVariables = Object.fromEntries(
//           Object.entries(variables).filter(([_, value]) => value !== undefined)
//         );

//         const { data, errors } = await keystoneContext.graphql.raw({
//           query,
//           ...(Object.keys(cleanVariables).length > 0 && {
//             variables: cleanVariables,
//           }),
//         });

//         if (errors) {
//           const error = new Error(errors[0].message);
//           error.response = { errors };

//           if (shouldRetry(error)) {
//             console.log(
//               `Retrying in 1s due to GraphQL error: ${error.message}`
//             );
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//             continue;
//           }

//           throw error;
//         }

//         return JSON.parse(JSON.stringify(data));
//       } catch (error) {
//         console.log(`Caught error: ${error.message}`);

//         if (shouldRetry(error)) {
//           console.log(`Retrying in 1s: ${error.message}`);
//           await new Promise((resolve) => setTimeout(resolve, 1000));
//           continue;
//         }

//         throw error;
//       }
//     }
//   },
// };

// Create a single queue instance for all Keystone GraphQL requests
const keystoneQueue = new PQueue({
  concurrency: 3, // Reduced from 5 to limit concurrent connections
  interval: 1000,
  intervalCap: 5, // Reduced from 10 to be more conservative
  carryoverConcurrencyCount: true
});

export const openfrontClientKeystone = {
  request: async (query, variables = {}) => {
    return keystoneQueue.add(async () => {
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
        throw error;
      }

      return JSON.parse(JSON.stringify(data));
    });
  },
};
