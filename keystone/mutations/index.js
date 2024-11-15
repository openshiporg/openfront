import { mergeSchemas } from "@graphql-tools/schema";
import redirectToInit from "./redirectToInit";
import activeCart from "./activeCart";
import updateActiveCart from "./updateActiveCart";
import updateActiveCartLineItem from "./updateActiveCartLineItem";
import updateActiveUser from "./updateActiveUser";
import updateActiveUserPassword from "./updateActiveUserPassword";
import updateActiveUserBillingAddress from "./updateActiveUserBillingAddress";

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

      input UserUpdateProfileInput {
        email: String
        name: String
        phone: String
        billingAddress: String
        password: String
      }

      input BillingAddressInput {
        firstName: String!
        lastName: String!
        company: String
        address1: String!
        address2: String
        city: String!
        province: String
        postalCode: String!
        countryCode: String!
        phone: String
      }

      type Mutation {
        updateActiveUser(data: UserUpdateProfileInput!): User
        updateActiveCart(cartId: ID!, data: CartUpdateInput, code: String): Cart
        updateActiveCartLineItem(cartId: ID!, lineId: ID!, quantity: Int!): Cart
        updateActiveUserPassword(
          oldPassword: String!
          newPassword: String!
          confirmPassword: String!
        ): User
        updateActiveUserBillingAddress(address: BillingAddressInput!): User
      }
    `,
    resolvers: {
      Query: { 
        redirectToInit,
        activeCart,
      },
      Mutation: {
        updateActiveUserPassword,
        updateActiveCart,
        updateActiveCartLineItem,
        updateActiveUser,
        updateActiveUserBillingAddress
      }
    },
  });
