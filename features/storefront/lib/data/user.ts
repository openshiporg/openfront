"use server";
import { revalidateTag } from "next/cache";
import { gql } from "graphql-request";
import { openfrontClient } from "@/features/storefront/lib/config";
import { redirect } from "next/navigation";
import {
  getAuthHeaders,
  removeAuthToken,
  setAuthToken,
  setCartId,
} from "@/features/storefront/lib/data/cookies";
import {
  CreateCustomerData,
  UpdateCustomerData,
  AddShippingAddressData,
  UpdateShippingAddressData,
} from "../../types/storefront";
import { cache } from "react";

export async function getUser() {
  try {
    const headers = await getAuthHeaders();
    const { authenticatedItem } = await openfrontClient.request(
      gql`
        query GetAuthenticatedItem {
          authenticatedItem {
            ... on User {
              id
              email
              firstName
              lastName
              phone
              customerToken
              orderWebhookUrl
              billingAddress {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                postalCode
                country {
                  id
                  iso2
                  name
                }
                phone
              }
              addresses(orderBy: [{ isBilling: desc }]) {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                postalCode
                country {
                  id
                  iso2
                  name
                }
                phone
                isBilling
              }
            }
          }
        }
      `,
      {},
      headers
    );
    return authenticatedItem;
  } catch (error) {
    return null;
  }
}

export async function authenticate({ email, password }: { email: string, password: string }) {
  const headers = await getAuthHeaders();
  const { authenticateUserWithPassword } = await openfrontClient.request(
    gql`
      mutation Authenticate($email: String!, $password: String!) {
        authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            item {
              id
            }
          }
          ... on UserAuthenticationWithPasswordFailure {
            message
          }
        }
      }
    `,
    { email, password },
    headers
  );

  if (
    authenticateUserWithPassword.__typename ===
    "UserAuthenticationWithPasswordFailure"
  ) {
    throw new Error(authenticateUserWithPassword.message);
  }

  return true;
}

export const getUserWithOrders = cache(async function () {
  const headers = await getAuthHeaders();
  const { authenticatedItem, orders } = await openfrontClient.request(
    gql`
      query GetUserAndOrders {
        authenticatedItem {
          ... on User {
            id
            email
            firstName
            lastName
            phone
            billingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              province
              postalCode
              country {
                id
                iso2
              }
              phone
            }
            addresses {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              province
              postalCode
              country {
                id
                iso2
              }
              phone
            }
          }
        }
        orders: getCustomerOrders
      }
    `,
    {},
    headers
  );

  return { ...authenticatedItem, orders };
});

export async function createCustomer(data: CreateCustomerData) {
  const headers = await getAuthHeaders();
  const { createUser } = await openfrontClient.request(
    gql`
      mutation CreateUser($data: UserCreateInput!) {
        createUser(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    },
    headers
  );

  return createUser;
}

export async function updateCustomer(data: UpdateCustomerData) {
  const headers = await getAuthHeaders();
  const { updateUser } = await openfrontClient.request(
    gql`
      mutation UpdateUser($data: UserUpdateInput!) {
        updateUser(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    },
    headers
  );

  return updateUser;
}

export async function addShippingAddress(data: AddShippingAddressData) {
  const headers = await getAuthHeaders();
  const { addShippingAddress } = await openfrontClient.request(
    gql`
      mutation AddShippingAddress($data: ShippingAddressCreateInput!) {
        addShippingAddress(data: $data) {
          id
        }
      }
    `,
    {
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        countryCode: data.countryCode,
        phone: data.phone,
      },
    },
    headers
  );

  return addShippingAddress;
}

export async function updateShippingAddress(addressId: string, data: UpdateShippingAddressData) {
  const headers = await getAuthHeaders();
  const { updateShippingAddress } = await openfrontClient.request(
    gql`
      mutation UpdateShippingAddress(
        $addressId: ID!
        $data: ShippingAddressUpdateInput!
      ) {
        updateShippingAddress(addressId: $addressId, data: $data) {
          id
        }
      }
    `,
    {
      addressId,
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        province: data.province,
        postalCode: data.postalCode,
        countryCode: data.countryCode,
        phone: data.phone,
      },
    },
    headers
  );

  return updateShippingAddress;
}

export async function deleteShippingAddress(addressId: string) {
  const headers = await getAuthHeaders();
  const { deleteShippingAddress } = await openfrontClient.request(
    gql`
      mutation DeleteShippingAddress($addressId: ID!) {
        deleteShippingAddress(addressId: $addressId) {
          id
        }
      }
    `,
    {
      addressId,
    },
    headers
  );

  return deleteShippingAddress;
}

export const getUserAddresses = cache(async function () {
  const headers = await getAuthHeaders();
  const { authenticatedItem } = await openfrontClient.request(
    gql`
      query GetUserAddresses {
        authenticatedItem {
          ... on User {
            id
            email
            firstName
            lastName
            phone
            billingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              province
              postalCode
              country {
                id
                iso2
              }
              phone
            }
            addresses {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              province
              postalCode
              country {
                id
                iso2
              }
              phone
            }
          }
        }
      }
    `,
    {},
    headers
  );

  return authenticatedItem;
});

export async function signUp(_currentState: any, formData: FormData) {
  const customer = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("first_name"),
    lastName: formData.get("last_name"),
    phone: formData.get("phone"),
  };

  try {
    // First create the user
    const { createUser } = await openfrontClient.request(
      gql`
        mutation CreateUser($data: UserCreateInput!) {
          createUser(data: $data) {
            id
            email
          }
        }
      `,
      {
        data: {
          email: customer.email,
          password: customer.password,
          name: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
        },
      }
    );

    if (!createUser?.id) {
      return "Failed to create account";
    }

    // Then authenticate them
    const { authenticateUserWithPassword } = await openfrontClient.request(
      gql`
        mutation SignIn($email: String!, $password: String!) {
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
              sessionToken
              item {
                id
              }
            }
            ... on UserAuthenticationWithPasswordFailure {
              message
              __typename
            }
          }
        }
      `,
      {
        email: customer.email,
        password: customer.password,
      }
    );

    // Check for authentication failure
    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      return authenticateUserWithPassword.message;
    }

    // Only set auth token if authentication was successful
    if (authenticateUserWithPassword.sessionToken) {
      await setAuthToken(authenticateUserWithPassword.sessionToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      revalidateTag("customer");
      return null; // Success case returns null (no error)
    }

    return "An unexpected error occurred during sign up";
  } catch (error) {
    console.error("Sign up error:", error);
    // Handle specific error cases
    if (error instanceof Error && error.message.includes("Unique constraint failed on the fields: (`email`)")) {
      return "An account with this email already exists";
    }
    return error instanceof Error ? error.message : String(error);
  }
}

export async function login(_currentState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const headers = await getAuthHeaders();
    const { authenticateUserWithPassword } = await openfrontClient.request(
      gql`
        mutation AuthenticateUser($email: String!, $password: String!) {
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
              sessionToken
              item {
                id
                email
                activeCartId
              }
            }
            ... on UserAuthenticationWithPasswordFailure {
              message
              __typename
            }
          }
        }
      `,
      { email, password },
      headers
    );

    // Check for authentication failure
    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      return authenticateUserWithPassword.message;
    }

    // Only set auth token and cart if authentication was successful
    if (authenticateUserWithPassword.sessionToken) {
      // Set the auth token
      await setAuthToken(authenticateUserWithPassword.sessionToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      // Set the cart ID if it exists
      const activeCartId = authenticateUserWithPassword.item?.activeCartId;
      if (activeCartId) {
        await setCartId(activeCartId, {
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
      }

      revalidateTag("customer");
      return null; // Success case returns null (no error)
    }

    return "An unexpected error occurred";
  } catch (error) {
    console.error("Login error:", error);
    return error instanceof Error ? error.message : String(error);
  }
}

export async function signOut(countryCode: string) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation EndSession {
          endSession
        }
      `,
      {},
      headers
    );

    // Remove the auth token cookie
    await removeAuthToken();
    revalidateTag("auth");
    revalidateTag("customer");
    redirect(`/${countryCode}/account`);
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

export async function updateCustomerEmail(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdateUser($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            email
          }
        }
      `,
      {
        data: {
          email: formData.get("email"),
        },
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateCustomerName(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdateUser($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            name
          }
        }
      `,
      {
        data: {
          name: formData.get("firstName") + " " + formData.get("lastName"),
        },
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateCustomerPassword(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdatePassword(
          $oldPassword: String!
          $newPassword: String!
          $confirmPassword: String!
        ) {
          updateActiveUserPassword(
            oldPassword: $oldPassword
            newPassword: $newPassword
            confirmPassword: $confirmPassword
          ) {
            id
          }
        }
      `,
      {
        oldPassword: formData.get("oldPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
      },
      headers
    );

    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    // Extract just the error message from the GraphQL error
    const message =
      (error instanceof Error && (error as any).response?.errors?.[0]?.extensions?.originalError?.message) ||
      "An error occurred";
    return { success: false, error: message };
  }
}

export async function updateCustomerPhone(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdateUser($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            phone
          }
        }
      `,
      {
        data: {
          phone: formData.get("phone"),
        },
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function createCustomerAddress(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();
    const addressData = {
      firstName: formData.get("first_name"),
      lastName: formData.get("last_name"),
      company: formData.get("company"),
      address1: formData.get("address_1"),
      address2: formData.get("address_2"),
      city: formData.get("city"),
      province: formData.get("province"),
      postalCode: formData.get("postal_code"),
      country: {
        connect: {
          iso2: formData.get("country_code")
        }
      },
      phone: formData.get("phone"),
      isBilling: formData.get("is_billing") === "true"
    };

    await openfrontClient.request(
      gql`
        mutation CreateAddress($data: AddressCreateInput!) {
          createActiveUserAddress(data: $data) {
            id
            addresses {
              id
              isBilling
            }
          }
        }
      `,
      {
        data: addressData
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateCustomerAddress(prevState: any, formData: FormData) {
  try {
    const headers = await getAuthHeaders();
    const addressData = {
      firstName: formData.get("first_name"),
      lastName: formData.get("last_name"),
      company: formData.get("company"),
      address1: formData.get("address_1"),
      address2: formData.get("address_2"),
      city: formData.get("city"),
      province: formData.get("province"),
      postalCode: formData.get("postal_code"),
      countryCode: formData.get("country_code"),
      phone: formData.get("phone"),
      isBilling: formData.get("is_billing") === "true"
    };

    await openfrontClient.request(
      gql`
        mutation UpdateAddress($where: AddressWhereUniqueInput!, $data: AddressUpdateInput!) {
          updateActiveUserAddress(where: $where, data: $data) {
            id
            addresses {
              id
              isBilling
            }
          }
        }
      `,
      {
        where: { id: prevState.addressId },
        data: addressData
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null, addressId: prevState.addressId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteCustomerShippingAddress(addressId: string) {
  try {
    const headers = await getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation DeleteAddress($where: AddressWhereUniqueInput!) {
          deleteActiveUserAddress(where: $where) {
            id
          }
        }
      `,
      {
        where: { id: addressId }
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
