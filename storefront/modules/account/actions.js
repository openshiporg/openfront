"use server";
import { revalidateTag } from "next/cache";
import { gql } from "graphql-request";
import { openfrontClient } from "@storefront/lib/config";

export async function signUp(_currentState, formData) {
  const customer = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("first_name"),
    lastName: formData.get("last_name"),
    phone: formData.get("phone")
  }

  try {
    // Create user and authenticate in one step
    const { authenticateUserWithPassword } = await openfrontClient.request(
      gql`
        mutation CreateAndAuthenticateUser($data: UserCreateInput!, $email: String!, $password: String!) {
          createUser(data: $data) {
            id
          }
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
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
      { 
        data: {
          email: customer.email,
          password: customer.password,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone
        },
        email: customer.email,
        password: customer.password
      }
    );

    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      throw new Error(authenticateUserWithPassword.message);
    }

    revalidateTag("customer");
  } catch (error) {
    return error.toString();
  }
}

export async function logCustomerIn(_currentState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const { authenticateUserWithPassword } = await openfrontClient.request(
      gql`
        mutation AuthenticateUser($email: String!, $password: String!) {
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
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
      { email, password }
    );

    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      throw new Error(authenticateUserWithPassword.message);
    }

    revalidateTag("customer");
  } catch (error) {
    return error.toString();
  }
}

export async function signOut() {
  try {
    await openfrontClient.request(
      gql`
        mutation EndSession {
          endSession
        }
      `
    );
    revalidateTag("customer");
    revalidateTag("auth");
  } catch (error) {
    console.error("Error signing out:", error);
  }
}
