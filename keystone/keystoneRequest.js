"use server";

import { cookies } from "next/headers";
import { keystoneContext } from "@keystone/keystoneContext";

export async function keystoneRequest(query, variables = {}, headers = {}) {
  try {
    const cleanVariables = Object.entries(variables).filter(([_, value]) => value !== undefined);

    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    const cookieHeader = allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');

    const req = {
      headers: {
        ...headers,
        cookie: cookieHeader,
      },
    };
    const res = {
      setHeader: () => {},
      end: () => {},
    };

    const context = await keystoneContext.withRequest(req, res);

    const { data, errors } = await context.graphql.raw({
      query,
      variables: Object.fromEntries(cleanVariables),
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.log(`GraphQL error: ${error.message}`);
    throw new Error(error.message);
  }
}