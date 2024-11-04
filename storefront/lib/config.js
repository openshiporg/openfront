import { GraphQLClient } from 'graphql-request';

function gqlClient(req) {
  return new GraphQLClient(`${process.env.FRONTEND_URL}/api/graphql`, {
    headers: req ? { cookie: req.cookies } : undefined,
    credentials: "include",
    fetch,
  });
}

export const openfrontClient = gqlClient();