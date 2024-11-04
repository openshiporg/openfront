// import { GraphQLClient } from 'graphql-request';

// function gqlClient(req) {
//   return new GraphQLClient(`${process.env.FRONTEND_URL}/api/graphql`, {
//     headers: req ? { cookie: req.cookies } : undefined,
//     credentials: "include",
//     fetch,
//   });
// }

// export const openfrontClient = gqlClient();

import { keystoneContext } from "@keystone/keystoneContext";

export const openfrontClient = {
  request: async (query, variables) => {
    // Remove undefined values from variables
    const cleanVariables = Object.fromEntries(
      Object.entries(variables || {}).filter(([_, value]) => value !== undefined)
    );

    // Only include variables if there are any
    const options = {
      query,
      ...(Object.keys(cleanVariables).length > 0 && { variables: cleanVariables })
    };

    const { data, errors } = await keystoneContext.graphql.raw(options);

    // Convert the data to a plain object before returning
    const plainData = JSON.parse(JSON.stringify(data));

    if (errors) {
      throw errors[0];
    }

    return plainData;
  },
};
