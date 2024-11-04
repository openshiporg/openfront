import { mergeSchemas } from "@graphql-tools/schema";
import redirectToInit from "./redirectToInit";
import activeCart from "./activeCart";
import updateActiveCart from "./updateActiveCart";

const graphql = String.raw;
export const extendGraphqlSchema = (schema) =>
  mergeSchemas({
    schemas: [schema],
    typeDefs: graphql`
      type CartResponse {
        cart: Cart
        lineItems: [LineItem!]!
      }

      type Query {
        redirectToInit: Boolean
        activeCart(cartId: ID!): CartResponse
      }
      
      type Mutation {
        updateActiveCart(
          cartId: ID!
          data: CartUpdateInput!
        ): Cart
      }
    `,
    resolvers: {
      Query: { 
        redirectToInit,
        activeCart,
      },
      Mutation: {
        updateActiveCart,
      }
    },
  });
