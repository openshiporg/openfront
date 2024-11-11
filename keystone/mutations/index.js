import { mergeSchemas } from "@graphql-tools/schema";
import redirectToInit from "./redirectToInit";
import activeCart from "./activeCart";
import updateActiveCart from "./updateActiveCart";
import updateActiveCartLineItem from "./updateActiveCartLineItem";

const graphql = String.raw;

export const extendGraphqlSchema = (schema) =>
  mergeSchemas({
    schemas: [schema],
    typeDefs: graphql`
      type CartResponse {
        cart: Cart
        lineItems: [LineItem!]!
        giftCards: [GiftCard!]!
        discounts: [Discount!]!
      }

      input CartCodeInput {
        code: String!
      }

      type Query {
        redirectToInit: Boolean
        activeCart(cartId: ID!): CartResponse
      }
      
      type Mutation {
        updateActiveCart(
          cartId: ID!
          data: CartUpdateInput
          code: String
        ): Cart
        updateActiveCartLineItem(cartId: ID!, lineId: ID!, quantity: Int!): Cart
      }
    `,
    resolvers: {
      Query: { 
        redirectToInit,
        activeCart,
      },
      Mutation: {
        updateActiveCart,
        updateActiveCartLineItem
      }
    },
  });
