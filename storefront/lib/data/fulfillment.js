"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { getAuthHeaders } from "./cookies"

export async function createFulfillment(orderId, items) {
  const CREATE_FULFILLMENT_MUTATION = gql`
    mutation CreateFulfillment($orderId: ID!, $items: [FulfillmentItemInput!]!) {
      createFulfillment(orderId: $orderId, items: $items) {
        id
        status
        trackingNumbers
        items {
          id
          quantity
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(CREATE_FULFILLMENT_MUTATION, { orderId, items }, headers);
} 