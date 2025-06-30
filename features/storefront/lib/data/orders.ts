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

// Add other order-related functions...

// Placeholder function for accepting order transfer
export async function acceptTransferRequest(id: string, token: string): Promise<{ success: boolean; error: string | null }> {
  console.warn(`Placeholder: acceptTransferRequest called for order ${id} with token ${token}. Implement GraphQL mutation.`);
  // Simulate success for now, replace with actual GraphQL call later
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return { success: true, error: null };
  // Example error return:
  // return { success: false, error: "Accepting order transfer not implemented yet." };
}

// Placeholder function for declining order transfer
export async function declineTransferRequest(id: string, token: string): Promise<{ success: boolean; error: string | null }> {
  console.warn(`Placeholder: declineTransferRequest called for order ${id} with token ${token}. Implement GraphQL mutation.`);
  // Simulate success for now, replace with actual GraphQL call later
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return { success: true, error: null };
  // Example error return:
  // return { success: false, error: "Declining order transfer not implemented yet." };
}

// Placeholder function for creating order transfer request (adjusted for useActionState)
export async function createTransferRequest(
  prevState: { success: boolean; error: string | null; order?: { id: string; email: string } | null }, // Add prevState and optional order
  formData: FormData
): Promise<{ success: boolean; error: string | null; order?: { id: string; email: string } | null }> { // Match return type
  const orderId = formData.get("orderId") as string;
  const email = formData.get("email") as string;

  console.warn(`Placeholder: createTransferRequest called for order ${orderId} with email ${email}. Implement GraphQL mutation.`);

  // Basic validation example
  if (!orderId || !email) {
    return { success: false, error: "Order ID and Email are required.", order: null };
  }

  // Simulate success for now, replace with actual GraphQL call later
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // Simulate returning some order info on success
  return { success: true, error: null, order: { id: orderId, email: email } };

  // Example error return:
  // return { success: false, error: "Creating order transfer request not implemented yet.", order: null };
}