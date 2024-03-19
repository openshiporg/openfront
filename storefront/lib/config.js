import { Client, cacheExchange, fetchExchange } from "urql";

export const openfrontClient = new Client({
  url: "/api/graphql",
  exchanges: [cacheExchange, fetchExchange],
});
