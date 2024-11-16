"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { getAuthHeaders } from "./cookies"
import { cache } from "react"

export const retrieveOrder = cache(async function (id) {
  const RETRIEVE_ORDER_QUERY = gql`
    query RetrieveOrder($id: ID!) {
      order(where: { id: $id }) {
        id
        status
        total
        items {
          id
          title
          quantity
        }
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(RETRIEVE_ORDER_QUERY, { id }, headers);
});

export const listCustomerOrders = cache(async function (limit = 10, offset = 0) {
  const LIST_CUSTOMER_ORDERS_QUERY = gql`
    query ListCustomerOrders($limit: Int!, $offset: Int!) {
      orders(
        where: { user: { id: { equals: "currentCustomerId" } } }
        take: $limit
        skip: $offset
        orderBy: { createdAt: desc }
      ) {
        id
        total
        status
        createdAt
      }
    }
  `;

  const headers = getAuthHeaders();
  return openfrontClient.request(LIST_CUSTOMER_ORDERS_QUERY, { limit, offset }, headers);
});

// Add other order-related functions... 