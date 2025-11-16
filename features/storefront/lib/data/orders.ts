"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { getAuthHeaders } from "./cookies"
import { cache } from "react"

export const retrieveOrder = cache(async function(id: string, secretKey?: string | null) {
  try {
    const query = gql`
      query GetCustomerOrder($id: ID!, $secretKey: String) {
        getCustomerOrder(orderId: $id, secretKey: $secretKey)
      }
    `;

    const { getCustomerOrder } = await openfrontClient.request(
      query,
      { id, secretKey },
      await getAuthHeaders()
    );

    return getCustomerOrder;
  } catch (error) {
    console.error("Error retrieving order:", error);
    return null;
  }
});

export const listCustomerOrders = cache(async function(limit: number = 10, offset: number = 0) {
  try {
    const { getCustomerOrders } = await openfrontClient.request(
      gql`
        query GetCustomerOrders($limit: Int, $offset: Int) {
          getCustomerOrders(limit: $limit, offset: $offset)
        }
      `,
      { limit, offset },
      await getAuthHeaders()
    );

    return getCustomerOrders;
  } catch (error) {
    console.error("Error listing orders:", error);
    return null;
  }
});

// Placeholder function for accepting order transfer
export async function acceptTransferRequest(id: string, token: string): Promise<{ success: boolean; error: string | null }> {
  console.warn(`Placeholder: acceptTransferRequest called for order ${id} with token ${token}. Implement GraphQL mutation.`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, error: null };
}

// Placeholder function for declining order transfer
export async function declineTransferRequest(id: string, token: string): Promise<{ success: boolean; error: string | null }> {
  console.warn(`Placeholder: declineTransferRequest called for order ${id} with token ${token}. Implement GraphQL mutation.`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true, error: null };
}

// Placeholder function for creating order transfer request
export async function createTransferRequest(
  prevState: { success: boolean; error: string | null; order?: { id: string; email: string } | null },
  formData: FormData
): Promise<{ success: boolean; error: string | null; order?: { id: string; email: string } | null }> {
  const orderId = formData.get("orderId") as string;
  const email = formData.get("email") as string;

  console.warn(`Placeholder: createTransferRequest called for order ${orderId} with email ${email}. Implement GraphQL mutation.`);

  if (!orderId || !email) {
    return { success: false, error: "Order ID and Email are required.", order: null };
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  return { success: true, error: null, order: { id: orderId, email: email } };
}
