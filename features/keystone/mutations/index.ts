import { mergeSchemas } from "@graphql-tools/schema";
import type { GraphQLSchema } from 'graphql'
import redirectToInit from "./redirectToInit";
import activeCart from "./activeCart";
import updateActiveCart from "./updateActiveCart";
import updateActiveCartLineItem from "./updateActiveCartLineItem";
import updateActiveUser from "./updateActiveUser";
import updateActiveUserPassword from "./updateActiveUserPassword";
import updateActiveUserAddress from "./updateActiveUserAddress";
import createActiveUserAddress from "./createActiveUserAddress";
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
import handlePaymentProviderWebhook from './handlePaymentProviderWebhook';
import getCustomerOrder from "./getCustomerOrder";
import getCustomerOrders from "./getCustomerOrders";
import getAnalytics from './getAnalytics';
import importInventory from './importInventory';
import getRatesForOrder from './getRatesForOrder';
import validateShippingAddress from './validateShippingAddress';
import trackShipment from './trackShipment';
import cancelShippingLabel from './cancelShippingLabel';
import createProviderShippingLabel from './createProviderShippingLabel';
import regenerateCustomerToken from './regenerateCustomerToken';
import getCustomerAccount from './getCustomerAccount';
import getCustomerAccounts from './getCustomerAccounts';
import payInvoice from './payInvoice';
import createInvoiceFromLineItems from './createInvoiceFromLineItems';
import getInvoicePaymentSessions from './getInvoicePaymentSessions';
import getUnpaidLineItemsByRegion from './getUnpaidLineItemsByRegion';
import createInvoicePaymentSessions from './createInvoicePaymentSessions';
import completeInvoicePayment from './completeInvoicePayment';
import initiateInvoicePaymentSession from './initiateInvoicePaymentSession';
import setInvoicePaymentSession from './setInvoicePaymentSession';
import activeInvoice from './activeInvoice';
import getCustomerPaidInvoices from './getCustomerPaidInvoices';
import getProductsSortedByPrice from '../queries/getProductsSortedByPrice';

const graphql = String.raw;

export const extendGraphqlSchema = (schema: GraphQLSchema) =>
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
        getCustomerOrder(orderId: ID!, secretKey: String): JSON
        getCustomerOrders(limit: Int, offset: Int): JSON
        getCustomerAccount(accountId: ID!): JSON
        getCustomerAccounts(limit: Int, offset: Int): JSON
        getUnpaidLineItemsByRegion(accountId: ID!): UnpaidLineItemsByRegionResult!
        getInvoicePaymentSessions(invoiceId: ID!): [PaymentSession!]!
        getAnalytics(timeframe: String): JSON
        activeInvoice(invoiceId: ID!): JSON
        getCustomerPaidInvoices(limit: Int, offset: Int): JSON
        getProductsSortedByPrice(
          countryCode: String!
          limit: Int!
          offset: Int!
          priceOrder: String!
          collectionId: ID
          categoryId: ID
        ): ProductsSortedByPriceResult!
      }

      type ProductsSortedByPriceResult {
        products: [Product!]!
        count: Int!
      }

      type ShippingRate {
        id: ID!
        provider: String!
        service: String!
        carrier: String!
        price: String!
        estimatedDays: String!
      }

      type ProviderShippingLabel {
        id: ID!
        status: String!
        trackingNumber: String
        trackingUrl: String
        labelUrl: String
        data: JSON
      }

      type PackageDimensions {
        length: Float!
        width: Float!
        height: Float!
        weight: Float!
        unit: String!
        weightUnit: String!
      }

      input DimensionsInput {
        length: Float!
        width: Float!
        height: Float!
        weight: Float!
        unit: String!
        weightUnit: String!
      }

      input LineItemInput {
        lineItemId: ID!
        quantity: Int!
      }

      type AddressValidationResult {
        isValid: Boolean!
        normalizedAddress: JSON
        errors: [String!]
      }

      type TrackingEvent {
        status: String!
        location: String
        timestamp: String!
        message: String
      }

      type ShipmentTrackingResult {
        status: String!
        estimatedDeliveryDate: String
        trackingEvents: [TrackingEvent!]!
      }

      type LabelCancellationResult {
        success: Boolean!
        refundStatus: String
        error: String
      }

      input UserUpdateProfileInput {
        email: String
        name: String
        phone: String
        billingAddress: String
        password: String
        onboardingStatus: String
        orderWebhookUrl: String
      }

      type WebhookResult {
        success: Boolean!
        message: String
        statusCode: Int
        error: String
      }


      type CustomerTokenResult {
        success: Boolean!
        token: String
      }

      input PaymentInput {
        paymentMethod: String!
        paymentMethodId: String
        orderId: String
        data: JSON
      }

      type PaymentResult {
        success: Boolean!
        invoice: Invoice
        payment: Payment
        message: String
        error: String
      }

      type InvoiceCreationResult {
        success: Boolean!
        invoiceId: ID
        message: String
        error: String
      }

      type RegionLineItems {
        region: JSON!
        lineItems: [JSON!]!
        totalAmount: Int!
        formattedTotalAmount: String!
        itemCount: Int!
      }

      type UnpaidLineItemsByRegionResult {
        success: Boolean!
        regions: [RegionLineItems!]!
        totalRegions: Int!
        totalUnpaidItems: Int!
        message: String
      }

      type InvoicePaymentResult {
        id: ID!
        status: String!
        success: Boolean!
        message: String!
        error: String
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
        deleteActiveUserAddress(where: AddressWhereUniqueInput!): Address
        addDiscountToActiveCart(cartId: ID!, code: String!): Cart
        removeDiscountFromActiveCart(cartId: ID!, code: String!): Cart
        createActiveCartPaymentSessions(cartId: ID!): Cart
        setActiveCartPaymentSession(cartId: ID!, providerId: ID!): Cart
        completeActiveCart(cartId: ID!, paymentSessionId: ID): JSON
        addActiveCartShippingMethod(cartId: ID!, shippingMethodId: ID!): Cart
        initiatePaymentSession(
          cartId: ID!
          paymentProviderId: String!
        ): PaymentSession
        handlePaymentProviderWebhook(providerId: ID!, event: JSON!, headers: JSON!): WebhookResult!
        getAnalytics: JSON
        importInventory: Boolean
        getRatesForOrder(orderId: ID!, providerId: ID!, dimensions: DimensionsInput): [ShippingRate!]!
        validateShippingAddress(providerId: ID!, address: JSON!): AddressValidationResult!
        trackShipment(providerId: ID!, trackingNumber: String!): ShipmentTrackingResult!
        cancelShippingLabel(providerId: ID!, labelId: ID!): LabelCancellationResult!
        createProviderShippingLabel(
          orderId: ID!
          providerId: ID!
          rateId: String!
          dimensions: DimensionsInput
          lineItems: [LineItemInput!]
        ): ProviderShippingLabel
        regenerateCustomerToken: CustomerTokenResult!
        payInvoice(invoiceId: ID!, paymentData: PaymentInput!): PaymentResult!
        createInvoiceFromLineItems(accountId: ID!, regionId: ID!, lineItemIds: [ID!]!, dueDate: String): InvoiceCreationResult!
        createInvoicePaymentSessions(invoiceId: ID!): Invoice!
        initiateInvoicePaymentSession(invoiceId: ID!, paymentProviderId: String!): PaymentSession
        setInvoicePaymentSession(invoiceId: ID!, providerId: ID!): Invoice
        completeInvoicePayment(paymentSessionId: ID!): InvoicePaymentResult!
      }
    `,
    resolvers: {
      Query: {
        redirectToInit,
        activeCart,
        activeCartShippingOptions,
        activeCartPaymentProviders,
        activeCartRegion,
        getCustomerOrder,
        getCustomerOrders,
        getCustomerAccount,
        getCustomerAccounts,
        getUnpaidLineItemsByRegion,
        getInvoicePaymentSessions,
        getAnalytics,
        activeInvoice,
        getCustomerPaidInvoices,
        getProductsSortedByPrice,
      },
      Mutation: {
        updateActiveUserPassword,
        updateActiveCart,
        updateActiveCartLineItem,
        updateActiveUser,
        createActiveUserAddress,
        updateActiveUserAddress,
        deleteActiveUserAddress,
        addDiscountToActiveCart,
        removeDiscountFromActiveCart,
        createActiveCartPaymentSessions,
        setActiveCartPaymentSession,
        completeActiveCart,
        addActiveCartShippingMethod,
        initiatePaymentSession,
        handlePaymentProviderWebhook,
        getAnalytics,
        importInventory,
        getRatesForOrder,
        validateShippingAddress,
        trackShipment,
        cancelShippingLabel,
        createProviderShippingLabel,
        regenerateCustomerToken,
        payInvoice,
        createInvoiceFromLineItems,
        createInvoicePaymentSessions,
        initiateInvoicePaymentSession,
        setInvoicePaymentSession,
        completeInvoicePayment,
      }
    },
  });
