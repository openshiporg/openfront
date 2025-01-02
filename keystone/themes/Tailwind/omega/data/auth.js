"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { keystoneClient } from "@keystone/keystoneClient";

export async function getAuthenticatedItem() {
  try {
    // First get the typename
    const typeData = await keystoneClient.request(
      `
      query {
        authenticatedItem {
          __typename
        }
      }
    `,
      null,
      {
        next: { tags: ["auth"] },
      }
    );

    if (!typeData?.authenticatedItem?.__typename) {
      return null;
    }

    // Then fetch the actual data based on the type
    const data = await keystoneClient.request(
      `
      query {
        authenticatedItem {
          ... on ${typeData.authenticatedItem.__typename} {
            id
            name
            email
          }
        }
      }
    `,
      null,
      {
        next: { tags: ["auth"] },
      }
    );

    return data?.authenticatedItem;
  } catch (err) {
    console.error("Error getting authenticated item:", err);
    return null;
  }
}

export async function endSession() {
  try {
    await keystoneClient.request(`
      mutation {
        endSession
      }
    `);
    const cookieStore = cookies();
    cookieStore.delete("keystonejs-session");
    revalidateTag("auth");
  } catch (err) {
    console.error("Error ending session:", err);
    throw err;
  }
}

export async function authenticate(
  prevState,
  formData,
  {
    mutationName = "authenticateUserWithPassword",
    successTypename = "UserAuthenticationWithPasswordSuccess",
    failureTypename = "UserAuthenticationWithPasswordFailure",
    identityField = "email",
    secretField = "password",
  } = {}
) {
  try {
    const result = await keystoneClient.request(
      `
      mutation($identity: String!, $secret: String!) {
        authenticate: ${mutationName}(${identityField}: $identity, ${secretField}: $secret) {
          ... on ${successTypename} {
            __typename
            sessionToken
            item {
              id
            }
          }
          ... on ${failureTypename} {
            __typename
            message
          }
        }
      }
    `,
      {
        identity: formData.get(identityField),
        secret: formData.get(secretField),
      }
    );

    if (result.authenticate?.__typename === failureTypename) {
      return {
        __typename: failureTypename,
        message: result.authenticate.message,
      };
    }

    // Set the session token cookie
    const cookieStore = cookies();
    cookieStore.set("keystonejs-session", result.authenticate.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    revalidateTag("auth");
    return { success: true };
  } catch (err) {
    console.error("Error authenticating:", err);
    return {
      message: err.message,
    };
  }
}

export async function createUser(
  prevState,
  formData,
  {
    mutationName = "createUser",
    listKey = "User",
  } = {}
) {
  try {
    const result = await keystoneClient.request(
      `
      mutation($data: ${listKey}CreateInput!) {
        item: ${mutationName}(data: $data) {
          id
          name
          email
        }
      }
    `,
      {
        data: {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        },
      }
    );

    if (!result.item?.id) {
      return {
        message: "Failed to create user",
      };
    }

    // Now authenticate the user
    return authenticate(prevState, formData);
  } catch (err) {
    console.error("Error creating user:", err);
    return {
      message: err.message,
    };
  }
}
