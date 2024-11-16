"use server";
import { revalidateTag } from "next/cache";
import { gql } from "graphql-request";
import { openfrontClient } from "@storefront/lib/config";
import { redirect } from "next/navigation";
import { getAuthHeaders, removeAuthToken, setAuthToken } from "@storefront/lib/data/cookies";

export async function signUp(_currentState, formData) {
  const customer = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("first_name"),
    lastName: formData.get("last_name"),
    phone: formData.get("phone")
  }

  try {
    const headers = getAuthHeaders();

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
          phone: customer.phone
        }
      },
      headers
    );

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
            }
          }
        }
      `,
      {
        email: customer.email,
        password: customer.password
      },
      headers
    );

    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      throw new Error(authenticateUserWithPassword.message);
    }

    // Set auth token with same settings as login
    setAuthToken(authenticateUserWithPassword.sessionToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    revalidateTag("customer");
  } catch (error) {
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
            }
          }
        }
      `,
      { email, password },
      headers
    );


    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      throw new Error(authenticateUserWithPassword.message);
    }

    // Set auth token with same settings as Keystone
    setAuthToken(authenticateUserWithPassword.sessionToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    
    revalidateTag("customer");
  } catch (error) {
    console.log({error})
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
    redirect(`/${countryCode}/account`)
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
        }
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    console.log({error})
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
          email: formData.get("email")
        }
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
          name: formData.get("firstName") + " " + formData.get("lastName")
        }
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
        mutation UpdatePassword($oldPassword: String!, $newPassword: String!, $confirmPassword: String!) {
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
        confirmPassword: formData.get("confirmPassword")
      },
      headers
    );
    
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    // Extract just the error message from the GraphQL error
    const message = error.response?.errors?.[0]?.extensions?.originalError?.message || "An error occurred";
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
          phone: formData.get("phone")
        }
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function addCustomerShippingAddress(prevState, formData) {
  try {
    const headers = getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation CreateAddress($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            addresses {
              id
            }
          }
        }
      `,
      {
        data: {
          addresses: {
            create: [{
              firstName: formData.get("first_name"),
              lastName: formData.get("last_name"),
              company: formData.get("company"),
              address1: formData.get("address_1"),
              address2: formData.get("address_2"),
              city: formData.get("city"),
              province: formData.get("province"),
              postalCode: formData.get("postal_code"),
              countryCode: formData.get("country_code"),
              phone: formData.get("phone")
            }]
          }
        }
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function updateCustomerShippingAddress(prevState, formData) {
  try {
    const headers = getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation UpdateAddress($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            addresses {
              id
            }
          }
        }
      `,
      {
        data: {
          addresses: {
            update: [{
              where: { id: prevState.addressId },
              data: {
                firstName: formData.get("first_name"),
                lastName: formData.get("last_name"),
                company: formData.get("company"),
                address1: formData.get("address_1"),
                address2: formData.get("address_2"),
                city: formData.get("city"),
                province: formData.get("province"),
                postalCode: formData.get("postal_code"),
                countryCode: formData.get("country_code"),
                phone: formData.get("phone")
              }
            }]
          }
        }
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

export async function deleteCustomerShippingAddress(addressId) {
  try {
    const headers = getAuthHeaders();

    await openfrontClient.request(
      gql`
        mutation DeleteAddress($data: UserUpdateProfileInput!) {
          updateActiveUser(data: $data) {
            id
            addresses {
              id
            }
          }
        }
      `,
      {
        data: {
          addresses: {
            disconnect: [{ id: addressId }]
          }
        }
      },
      headers
    );
    revalidateTag("customer");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
