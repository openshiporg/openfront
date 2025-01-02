"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { getAuthHeaders } from "./cookies"
import { cache } from "react"

export const retrieveOrder = cache(async function(id, secretKey) {
  try {
    const query = gql`
      query GetCustomerOrder($id: ID!, $secretKey: String) {
        getCustomerOrder(orderId: $id, secretKey: $secretKey)
      }
    `;

    const { getCustomerOrder } = await openfrontClient.request(
      query,
      { id, secretKey },
      getAuthHeaders()
    );

    return getCustomerOrder;
  } catch (error) {
    console.error("Error retrieving order:", error);
    return null;
  }
});

export const listCustomerOrders = cache(async function(limit = 10, offset = 0) {
  try {
    const { getCustomerOrders } = await openfrontClient.request(
      gql`
        query GetCustomerOrders($limit: Int, $offset: Int) {
          getCustomerOrders(limit: $limit, offset: $offset)
        }
      `,
      { limit, offset },
      getAuthHeaders()
    );

    return getCustomerOrders;
  } catch (error) {
    console.error("Error listing orders:", error);
    return null;
  }
});

// Add other order-related functions... 