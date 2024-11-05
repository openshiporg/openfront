import { GraphQLClient } from "graphql-request";

class RetryingGraphQLClient extends GraphQLClient {
  async request(query, variables = {}) {
    while (true) {
      try {
        const response = await super.request(query, variables);
        return response;
      } catch (error) {
        console.log(`GraphQL error: ${error.message}`);
        
        // Check for connection pool, timeout, or gateway errors
        if (
          error.message?.includes("connection pool") ||
          error.message?.includes("Timed out") ||
          error.code === "P2024" ||
          error.message?.includes("Code: 502") ||  // Gateway error
          error.response?.status === 502 ||        // Alternative way gateway errors appear
          (error.response?.errors || []).some(e => e.message?.includes("502"))  // GraphQL errors array
        ) {
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
  `${process.env.FRONTEND_URL}/api/graphql`
);
