import { mergeSchemas } from "@graphql-tools/schema";
import redirectToInit from "./redirectToInit";
import activeCart from "./activeCart";
import updateActiveCart from "./updateActiveCart";
import updateActiveCartLineItem from "./updateActiveCartLineItem";
import updateActiveUser from "./updateActiveUser";
import updateActiveUserPassword from "./updateActiveUserPassword";
import updateActiveUserAddress from "./updateActiveUserAddress";
import createActiveUserAddress from "./createActiveUserAddress";
import seedStorefront from './seedStorefront';
import deleteActiveUserAddress from "./deleteActiveUserAddress";

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


      type Mutation {
        updateActiveUser(data: UserUpdateProfileInput!): User
        updateActiveCart(cartId: ID!, data: CartUpdateInput, code: String): Cart
        updateActiveCartLineItem(cartId: ID!, lineId: ID!, quantity: Int!): Cart
        updateActiveUserPassword(
          oldPassword: String!
          newPassword: String!
          confirmPassword: String!
        ): User
        updateActiveUserAddress(where: AddressWhereUniqueInput!, data: AddressUpdateInput!): User
        createActiveUserAddress(data: AddressCreateInput!): User
        seedStorefront: Boolean
        deleteActiveUserAddress(where: AddressWhereUniqueInput!): Address
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
        createActiveUserAddress,
        updateActiveUserAddress,
        seedStorefront,
        deleteActiveUserAddress
      }
    },
  });
