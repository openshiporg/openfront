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
import addDiscountToActiveCart from './addDiscountToActiveCart';
import removeDiscountFromActiveCart from './removeDiscountFromActiveCart';
import createActiveCartPaymentSessions from './createActiveCartPaymentSessions';
import setActiveCartPaymentSession from './setActiveCartPaymentSession';
import completeActiveCart from './completeActiveCart';
import addActiveCartShippingMethod from './addActiveCartShippingMethod';
import activeCartShippingOptions from '../queries/activeCartShippingOptions';
import activeCartPaymentProviders from '../queries/activeCartPaymentProviders';
import activeCartRegion from '../queries/activeCartRegion';
import initiatePaymentSession from './initiatePaymentSession';
import handleStripeWebhook from './handleStripeWebhook';
import handlePayPalWebhook from './handlePayPalWebhook';

const graphql = String.raw;

export const extendGraphqlSchema = (schema) =>
  mergeSchemas({
    schemas: [schema],
    typeDefs: graphql`
      input CartCodeInput {
        code: String!
      }

      type Query {
        redirectToInit: Boolean
        activeCart(cartId: ID!): JSON
        activeCartShippingOptions(cartId: ID!): [ShippingOption!]
        activeCartPaymentProviders(regionId: ID!): [PaymentProvider!]
        activeCartRegion(countryCode: String!): Region
      }

      input UserUpdateProfileInput {
        email: String
        name: String
        phone: String
        billingAddress: String
        password: String
      }

      type WebhookResult {
        success: Boolean!
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
        addDiscountToActiveCart(cartId: ID!, code: String!): Cart
        removeDiscountFromActiveCart(cartId: ID!, code: String!): Cart
        createActiveCartPaymentSessions(cartId: ID!): Cart
        setActiveCartPaymentSession(cartId: ID!, providerId: ID!): Cart
        completeActiveCart(cartId: ID!): Order
        addActiveCartShippingMethod(cartId: ID!, shippingMethodId: ID!): Cart
        initiatePaymentSession(
          cartId: ID!
          paymentProviderId: String!
        ): PaymentSession
        handleStripeWebhook(event: JSON!, headers: JSON!): WebhookResult!
        handlePayPalWebhook(event: JSON!, headers: JSON!): WebhookResult!
      }
    `,
    resolvers: {
      Query: { 
        redirectToInit,
        activeCart,
        activeCartShippingOptions,
        activeCartPaymentProviders,
        activeCartRegion,
      },
      Mutation: {
        updateActiveUserPassword,
        updateActiveCart,
        updateActiveCartLineItem,
        updateActiveUser,
        createActiveUserAddress,
        updateActiveUserAddress,
        seedStorefront,
        deleteActiveUserAddress,
        addDiscountToActiveCart,
        removeDiscountFromActiveCart,
        createActiveCartPaymentSessions,
        setActiveCartPaymentSession,
        completeActiveCart,
        addActiveCartShippingMethod,
        initiatePaymentSession,
        handleStripeWebhook,
        handlePayPalWebhook,
      }
    },
  });
