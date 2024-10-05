import { Client, cacheExchange, fetchExchange } from "urql";

export const openfrontClient = new Client({
  url: `${process.env.FRONTEND_URL}/api/graphql`,
  exchanges: [cacheExchange, fetchExchange],
});
