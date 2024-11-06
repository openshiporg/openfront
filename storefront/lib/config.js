import { keystoneContext } from "@keystone/keystoneContext";
import { GraphQLClient } from "graphql-request";
import { Client, cacheExchange, fetchExchange } from "urql";



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
          error.message?.includes("Code: 502") || // Gateway error
          error.response?.status === 502 || // Alternative way gateway errors appear
          (error.response?.errors || []).some((e) => e.message?.includes("502")) // GraphQL errors array
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



const urqlClient = new Client({
  // url: `https://openfront.up.railway.app/api/graphql`,
  url: `${process.env.FRONTEND_URL}/api/graphql`,
  exchanges: [cacheExchange, fetchExchange],
  suspense 
});

// openfront client using urql and api route
export const openfrontClientURQL = {
  request: async (query, variables = {}) => {
    const result = await urqlClient.query(query, variables).toPromise();

    if (result.error) {
      throw result.error;
    }

    return result.data;
  },
};

// openfront client using graphql-request and api route
export const openfrontClientGQL = new RetryingGraphQLClient(
  `${process.env.FRONTEND_URL}/api/graphql`
);

// openfront client using keystoneContext
export const openfrontClient = {
  request: async (query, variables) => {
    // Remove undefined values from variables
    const cleanVariables = Object.fromEntries(
      Object.entries(variables || {}).filter(
        ([_, value]) => value !== undefined
      )
    );

    // Only include variables if there are any
    const options = {
      query,
      ...(Object.keys(cleanVariables).length > 0 && {
        variables: cleanVariables,
      }),
    };

    while (true) {
      try {
        const { data, errors } = await keystoneContext.graphql.raw(options);

        if (errors) {
          console.log(errors);
          const prismaError = errors.find(
            (e) =>
              e.message?.includes("Prisma") ||
              e.message?.includes("connection pool") ||
              e.message?.includes("P2024")
          );

          if (prismaError) {
            console.log(`Prisma error, retrying in 1s: ${prismaError.message}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }

          throw errors[0];
        }

        return JSON.parse(JSON.stringify(data));
      } catch (error) {
        if (
          error.message?.includes("Prisma") ||
          error.message?.includes("connection pool") ||
          error.code === "P2024"
        ) {
          console.log(`Retrying in 1s: ${error.message}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }
  },
};