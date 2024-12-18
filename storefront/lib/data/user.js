"use server";
import { revalidateTag } from "next/cache";
import { gql } from "graphql-request";
import { openfrontClient } from "@storefront/lib/config";
import { redirect } from "next/navigation";
import {
  getAuthHeaders,
  removeAuthToken,
  setAuthToken,
} from "@storefront/lib/data/cookies";
import { cache } from "react";

export async function getUser() {
  try {
    const headers = getAuthHeaders();
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
                countryCode
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
                countryCode
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

export async function authenticate({ email, password }) {
  const headers = getAuthHeaders();
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
  const headers = getAuthHeaders();
  const { authenticatedItem } = await openfrontClient.request(
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
              countryCode
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
              countryCode
              phone
            }
            orders {
              id
              total
              status
              createdAt
              displayId
              shippingAddress {
                firstName
                lastName
                address1
                city
                postalCode
                countryCode
              }
              paymentStatus
              fulfillmentStatus
              lineItems {
                id
                title
                quantity
                unitPrice
                total
              }
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

export async function createCustomer(data) {
  const headers = getAuthHeaders();
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

export async function updateCustomer(data) {
  const headers = getAuthHeaders();
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

export async function addShippingAddress(data) {
  const headers = getAuthHeaders();
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

export async function updateShippingAddress(addressId, data) {
  const headers = getAuthHeaders();
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

export async function deleteShippingAddress(addressId) {
  const headers = getAuthHeaders();
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
  const headers = getAuthHeaders();
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
              countryCode
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
              countryCode
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

export async function signUp(_currentState, formData) {
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
      setAuthToken(authenticateUserWithPassword.sessionToken, {
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
    if (error.message.includes("Unique constraint failed on the fields: (`email`)")) {
      return "An account with this email already exists";
    }
    return error.toString();
  }
}

export async function login(_currentState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const headers = getAuthHeaders();
    const { authenticateUserWithPassword } = await openfrontClient.request(
      gql`
        mutation AuthenticateUser($email: String!, $password: String!) {
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
              sessionToken
              item {
                id
                email
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

    // Only set auth token if authentication was successful
    if (authenticateUserWithPassword.sessionToken) {
      setAuthToken(authenticateUserWithPassword.sessionToken, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      revalidateTag("customer");
      return null; // Success case returns null (no error)
    }

    return "An unexpected error occurred";
  } catch (error) {
    console.error("Login error:", error);
    return error.toString();
  }
}

export async function signOut(countryCode) {
  try {
    const headers = getAuthHeaders();

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
    removeAuthToken();
    revalidateTag("auth");
    revalidateTag("customer");
    redirect(`/${countryCode}/account`);
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

export async function updateCustomerBillingAddress(prevState, formData) {
  try {
    const headers = getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdateBillingAddress($address: BillingAddressInput!) {
          updateActiveUserBillingAddress(address: $address) {
            id
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
              countryCode
              phone
              metadata
            }
          }
        }
      `,
      {
        address: {
          firstName: formData.get("billingAddress.firstName"),
          lastName: formData.get("billingAddress.lastName"),
          company: formData.get("billingAddress.company"),
          address1: formData.get("billingAddress.address1"),
          address2: formData.get("billingAddress.address2"),
          city: formData.get("billingAddress.city"),
          province: formData.get("billingAddress.province"),
          postalCode: formData.get("billingAddress.postalCode"),
          countryCode: formData.get("billingAddress.countryCode"),
        },
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    console.log({ error });
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerEmail(prevState, formData) {
  try {
    const headers = getAuthHeaders();

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
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerName(prevState, formData) {
  try {
    const headers = getAuthHeaders();

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
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerPassword(prevState, formData) {
  try {
    const headers = getAuthHeaders();

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
      error.response?.errors?.[0]?.extensions?.originalError?.message ||
      "An error occurred";
    return { success: false, error: message };
  }
}

export async function updateCustomerPhone(prevState, formData) {
  try {
    const headers = getAuthHeaders();

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
    return { success: false, error: error.toString() };
  }
}

export async function createCustomerAddress(prevState, formData) {
  try {
    const headers = getAuthHeaders();
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
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerAddress(prevState, formData) {
  try {
    const headers = getAuthHeaders();
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
    return { success: false, error: error.toString() };
  }
}

export async function deleteCustomerShippingAddress(addressId) {
  try {
    const headers = getAuthHeaders();

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
    return { success: false, error: error.toString() };
  }
}
