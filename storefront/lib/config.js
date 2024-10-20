import { GraphQLClient } from 'graphql-request';

export const openfrontClient = new GraphQLClient(`${process.env.FRONTEND_URL}/api/graphql`, {
  credentials: 'include',
});
