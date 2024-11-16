"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { getAuthHeaders } from "./cookies"

export async function createPayment(orderId, amount) {
  const CREATE_PAYMENT_MUTATION = gql`
    mutation CreatePayment($orderId: ID!, $amount: Int!) {
      createPayment(orderId: $orderId, amount: $amount) {
        id
        amount
        status
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(CREATE_PAYMENT_MUTATION, { orderId, amount }, headers);
} 