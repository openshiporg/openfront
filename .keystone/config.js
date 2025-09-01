"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __glob = (map) => (path) => {
  var fn = map[path];
  if (fn) return fn();
  throw new Error("Module not found in bundle: " + path);
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// features/keystone/utils/currencyConversion.ts
var currencyConversion_exports = {};
__export(currencyConversion_exports, {
  convertCurrency: () => convertCurrency,
  default: () => currencyConversion_default,
  formatCurrencyAmount: () => formatCurrencyAmount,
  getCurrentExchangeRates: () => getCurrentExchangeRates,
  getSupportedCurrencies: () => getSupportedCurrencies,
  isConversionSupported: () => isConversionSupported,
  updateExchangeRates: () => updateExchangeRates
});
async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  try {
    const rate = getConversionRate(from, to);
    if (!rate) {
      console.warn(`No conversion rate found for ${from} to ${to}, defaulting to 1:1`);
      return amount;
    }
    const convertedAmount = Math.round(amount * rate);
    console.log(`Currency conversion: ${amount} ${from} = ${convertedAmount} ${to} (rate: ${rate})`);
    return convertedAmount;
  } catch (error) {
    console.error(`Error converting currency from ${from} to ${to}:`, error);
    return amount;
  }
}
function getConversionRate(fromCurrency, toCurrency) {
  const rates = STATIC_EXCHANGE_RATES[fromCurrency];
  if (!rates) {
    return null;
  }
  return rates[toCurrency] || null;
}
function getSupportedCurrencies() {
  return Object.keys(STATIC_EXCHANGE_RATES);
}
function isConversionSupported(fromCurrency, toCurrency) {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();
  return Boolean(STATIC_EXCHANGE_RATES[from]?.[to]);
}
function updateExchangeRates(rates) {
  Object.assign(STATIC_EXCHANGE_RATES, rates);
}
function getCurrentExchangeRates() {
  return { ...STATIC_EXCHANGE_RATES };
}
function formatCurrencyAmount(amount, currencyCode) {
  const currency = currencyCode.toUpperCase();
  const noDivisionCurrencies = ["JPY", "KRW", "VND"];
  const divisor = noDivisionCurrencies.includes(currency) ? 1 : 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount / divisor);
}
var STATIC_EXCHANGE_RATES, currencyConversion_default;
var init_currencyConversion = __esm({
  "features/keystone/utils/currencyConversion.ts"() {
    "use strict";
    STATIC_EXCHANGE_RATES = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        CAD: 1.35,
        AUD: 1.52,
        JPY: 110,
        USD: 1
      },
      EUR: {
        USD: 1.18,
        GBP: 0.86,
        CAD: 1.59,
        AUD: 1.79,
        JPY: 129.5,
        EUR: 1
      },
      GBP: {
        USD: 1.37,
        EUR: 1.16,
        CAD: 1.85,
        AUD: 2.08,
        JPY: 150.6,
        GBP: 1
      }
      // Add more currencies as needed
    };
    currencyConversion_default = convertCurrency;
  }
});

// features/integrations/payment/stripe.ts
var stripe_exports = {};
__export(stripe_exports, {
  capturePaymentFunction: () => capturePaymentFunction,
  createPaymentFunction: () => createPaymentFunction,
  generatePaymentLinkFunction: () => generatePaymentLinkFunction,
  getPaymentStatusFunction: () => getPaymentStatusFunction,
  handleWebhookFunction: () => handleWebhookFunction,
  refundPaymentFunction: () => refundPaymentFunction
});
async function createPaymentFunction({ cart, amount, currency }) {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true
    }
  });
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}
async function capturePaymentFunction({ paymentId, amount }) {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.capture(paymentId, {
    amount_to_capture: amount
  });
  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount_captured,
    data: paymentIntent
  };
}
async function refundPaymentFunction({ paymentId, amount }) {
  const stripe = getStripeClient();
  const refund = await stripe.refunds.create({
    payment_intent: paymentId,
    amount
  });
  return {
    status: refund.status,
    amount: refund.amount,
    data: refund
  };
}
async function getPaymentStatusFunction({ paymentId }) {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    data: paymentIntent
  };
}
async function generatePaymentLinkFunction({ paymentId }) {
  return `https://dashboard.stripe.com/payments/${paymentId}`;
}
async function handleWebhookFunction({ event, headers }) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Stripe webhook secret is not configured");
  }
  const stripe = getStripeClient();
  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      JSON.stringify(event),
      headers["stripe-signature"],
      webhookSecret
    );
    return {
      isValid: true,
      event: stripeEvent,
      type: stripeEvent.type,
      resource: stripeEvent.data.object
    };
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
}
var import_stripe, getStripeClient;
var init_stripe = __esm({
  "features/integrations/payment/stripe.ts"() {
    "use strict";
    import_stripe = __toESM(require("stripe"));
    getStripeClient = () => {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        throw new Error("Stripe secret key not configured");
      }
      return new import_stripe.default(stripeKey, {
        apiVersion: "2023-10-16"
      });
    };
  }
});

// features/integrations/payment/paypal.ts
var paypal_exports = {};
__export(paypal_exports, {
  capturePaymentFunction: () => capturePaymentFunction2,
  createPaymentFunction: () => createPaymentFunction2,
  generatePaymentLinkFunction: () => generatePaymentLinkFunction2,
  getPaymentStatusFunction: () => getPaymentStatusFunction2,
  handleWebhookFunction: () => handleWebhookFunction2,
  refundPaymentFunction: () => refundPaymentFunction2
});
async function handleWebhookFunction2({ event, headers }) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error("PayPal webhook ID is not configured");
  }
  const accessToken = await getPayPalAccessToken();
  const response = await fetch("https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: webhookId,
      webhook_event: event
    })
  });
  const verification = await response.json();
  const isValid = verification.verification_status === "SUCCESS";
  if (!isValid) {
    throw new Error("Invalid webhook signature");
  }
  return {
    isValid: true,
    event,
    type: event.event_type,
    resource: event.resource
  };
}
async function createPaymentFunction2({ cart, amount, currency }) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: "AUTHORIZE",
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: (amount / 100).toFixed(2)
            }
          }
        ]
      })
    }
  );
  const order = await response.json();
  if (order.error) {
    throw new Error(`PayPal order creation failed: ${order.error.message}`);
  }
  return {
    orderId: order.id,
    status: order.status
  };
}
async function capturePaymentFunction2({ paymentId }) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  const capture = await response.json();
  if (capture.error) {
    throw new Error(`PayPal capture failed: ${capture.error.message}`);
  }
  return {
    status: capture.status,
    amount: parseFloat(capture.purchase_units[0].payments.captures[0].amount.value) * 100,
    data: capture
  };
}
async function refundPaymentFunction2({ paymentId, amount }) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/payments/captures/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        amount: {
          value: (amount / 100).toFixed(2),
          currency_code: "USD"
          // This should come from the original payment
        }
      })
    }
  );
  const refund = await response.json();
  if (refund.error) {
    throw new Error(`PayPal refund failed: ${refund.error.message}`);
  }
  return {
    status: refund.status,
    amount: parseFloat(refund.amount.value) * 100,
    data: refund
  };
}
async function getPaymentStatusFunction2({ paymentId }) {
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  const order = await response.json();
  if (order.error) {
    throw new Error(`PayPal status check failed: ${order.error.message}`);
  }
  return {
    status: order.status,
    amount: parseFloat(order.purchase_units[0].amount.value) * 100,
    data: order
  };
}
async function generatePaymentLinkFunction2({ paymentId }) {
  return `https://www.paypal.com/activity/payment/${paymentId}`;
}
var getPayPalAccessToken;
var init_paypal = __esm({
  "features/integrations/payment/paypal.ts"() {
    "use strict";
    getPayPalAccessToken = async () => {
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new Error("PayPal credentials not configured");
      }
      const response = await fetch(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Language": "en_US",
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")}`
          },
          body: "grant_type=client_credentials"
        }
      );
      const { access_token } = await response.json();
      if (!access_token) {
        throw new Error("Failed to get PayPal access token");
      }
      return access_token;
    };
  }
});

// features/integrations/payment/manual.ts
var manual_exports = {};
__export(manual_exports, {
  capturePaymentFunction: () => capturePaymentFunction3,
  createPaymentFunction: () => createPaymentFunction3,
  generatePaymentLinkFunction: () => generatePaymentLinkFunction3,
  getPaymentStatusFunction: () => getPaymentStatusFunction3,
  handleWebhookFunction: () => handleWebhookFunction3,
  refundPaymentFunction: () => refundPaymentFunction3
});
async function handleWebhookFunction3({ event, headers }) {
  return {
    isValid: true,
    event,
    type: event.type,
    resource: event.data
  };
}
async function createPaymentFunction3({ cart, amount, currency }) {
  return {
    status: "pending",
    data: {
      status: "pending",
      amount,
      currency: currency.toLowerCase()
    }
  };
}
async function capturePaymentFunction3({ paymentId, amount }) {
  return {
    status: "captured",
    amount,
    data: {
      status: "captured",
      amount,
      captured_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
async function refundPaymentFunction3({ paymentId, amount }) {
  return {
    status: "refunded",
    amount,
    data: {
      status: "refunded",
      amount,
      refunded_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
async function getPaymentStatusFunction3({ paymentId }) {
  return {
    status: "succeeded",
    data: {
      status: "succeeded"
    }
  };
}
async function generatePaymentLinkFunction3({ paymentId }) {
  return null;
}
var init_manual = __esm({
  "features/integrations/payment/manual.ts"() {
    "use strict";
  }
});

// features/integrations/payment/index.ts
var payment_exports = {};
__export(payment_exports, {
  paymentProviderAdapters: () => paymentProviderAdapters
});
var paymentProviderAdapters;
var init_payment = __esm({
  "features/integrations/payment/index.ts"() {
    "use strict";
    paymentProviderAdapters = {
      stripe: () => Promise.resolve().then(() => (init_stripe(), stripe_exports)),
      paypal: () => Promise.resolve().then(() => (init_paypal(), paypal_exports)),
      manual: () => Promise.resolve().then(() => (init_manual(), manual_exports))
    };
  }
});

// features/integrations/shipping/shippo.ts
var shippo_exports = {};
__export(shippo_exports, {
  cancelLabelFunction: () => cancelLabelFunction,
  createLabelFunction: () => createLabelFunction,
  getRatesFunction: () => getRatesFunction,
  trackShipmentFunction: () => trackShipmentFunction,
  validateAddressFunction: () => validateAddressFunction
});
async function createLabelFunction({
  provider,
  order,
  rateId,
  dimensions,
  lineItems
}) {
  if (!dimensions) {
    throw new Error("Dimensions are required to create a shipping label");
  }
  if (!dimensions.length || !dimensions.width || !dimensions.height || !dimensions.weight) {
    throw new Error(
      "Invalid dimensions provided. All dimensions and weight are required"
    );
  }
  const addressToResponse = await fetch(`${SHIPPO_API_URL}/addresses/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      company: order.shippingAddress.company,
      street1: order.shippingAddress.address1,
      street2: order.shippingAddress.address2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.province,
      zip: order.shippingAddress.postalCode,
      country: order.shippingAddress.country.iso2,
      phone: order.shippingAddress.phone,
      email: order.shippingAddress.email
    })
  });
  const addressTo = await addressToResponse.json();
  if (!addressToResponse.ok) {
    throw new Error(addressTo.message || "Failed to create address");
  }
  const shipmentResponse = await fetch(`${SHIPPO_API_URL}/shipments/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      address_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        company: provider.fromAddress.company,
        street1: provider.fromAddress.address1,
        street2: provider.fromAddress.address2,
        city: provider.fromAddress.city,
        state: provider.fromAddress.province,
        zip: provider.fromAddress.postalCode,
        country: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone
      },
      address_to: addressTo.object_id,
      parcels: [
        {
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
          distance_unit: dimensions.unit,
          weight: dimensions.weight || dimensions.value,
          mass_unit: dimensions.weightUnit || dimensions.unit
        }
      ],
      async: false
    })
  });
  const shipment = await shipmentResponse.json();
  if (!shipmentResponse.ok) {
    throw new Error(shipment.message || "Failed to create shipment");
  }
  const transactionResponse = await fetch(`${SHIPPO_API_URL}/transactions/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      rate: rateId,
      label_file_type: "PDF",
      async: false
    })
  });
  const transaction = await transactionResponse.json();
  if (!transactionResponse.ok) {
    throw new Error(transaction.message || "Failed to create label");
  }
  if (transaction.status === "ERROR") {
    const errorMessage = transaction.messages?.[0]?.text || "Label creation failed";
    throw new Error(errorMessage);
  }
  if (!transaction.label_url) {
    throw new Error("No label URL received from Shippo");
  }
  return {
    status: "purchased",
    data: transaction,
    rate: transaction.rate,
    carrier: transaction.provider,
    service: transaction.servicelevel?.name,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    labelUrl: transaction.label_url
  };
}
async function getRatesFunction({ provider, order, dimensions }) {
  if (!dimensions) {
    throw new Error("Dimensions are required to get shipping rates");
  }
  const addressToResponse = await fetch(`${SHIPPO_API_URL}/addresses/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      company: order.shippingAddress.company,
      street1: order.shippingAddress.address1,
      street2: order.shippingAddress.address2,
      city: order.shippingAddress.city,
      state: order.shippingAddress.province,
      zip: order.shippingAddress.postalCode,
      country: order.shippingAddress.country.iso2,
      phone: order.shippingAddress.phone
    })
  });
  const addressTo = await addressToResponse.json();
  if (!addressToResponse.ok) {
    throw new Error(addressTo.message || "Failed to create address");
  }
  const shipmentResponse = await fetch(`${SHIPPO_API_URL}/shipments/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      address_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        company: provider.fromAddress.company,
        street1: provider.fromAddress.address1,
        street2: provider.fromAddress.address2,
        city: provider.fromAddress.city,
        state: provider.fromAddress.province,
        zip: provider.fromAddress.postalCode,
        country: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone
      },
      address_to: addressTo.object_id,
      parcels: [
        {
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
          distance_unit: dimensions.unit,
          weight: dimensions.weight,
          mass_unit: dimensions.weightUnit
        }
      ]
    })
  });
  const shipment = await shipmentResponse.json();
  if (!shipmentResponse.ok) {
    throw new Error(
      shipment.message || shipment.__all__ || "Failed to create shipment"
    );
  }
  return shipment.rates.map((rate) => ({
    id: rate.object_id,
    providerId: provider.id,
    service: rate.servicelevel.name,
    carrier: rate.provider,
    price: rate.amount,
    currency: rate.currency,
    estimatedDays: rate.estimated_days
  }));
}
async function validateAddressFunction({ provider, address }) {
  try {
    const response = await fetch(`${SHIPPO_API_URL}/addresses/`, {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${provider.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: `${address.firstName} ${address.lastName}`,
        company: address.company,
        street1: address.address1,
        street2: address.address2,
        city: address.city,
        state: address.province,
        zip: address.postalCode,
        country: address.country.iso2,
        phone: address.phone,
        validate: true
      })
    });
    const validation = await response.json();
    if (!response.ok) {
      throw new Error(validation.message || "Address validation failed");
    }
    return {
      isValid: validation.validation_results.is_valid,
      suggestedAddress: validation.validation_results.is_valid ? {
        address1: validation.street1,
        address2: validation.street2,
        city: validation.city,
        province: validation.state,
        postalCode: validation.zip,
        country: validation.country
      } : null,
      errors: validation.validation_results.messages || []
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message]
    };
  }
}
async function trackShipmentFunction({ provider, trackingNumber }) {
  const response = await fetch(`${SHIPPO_API_URL}/tracks/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      carrier: "usps",
      tracking_number: trackingNumber
    })
  });
  const tracking = await response.json();
  if (!response.ok) {
    throw new Error(tracking.message || "Failed to track shipment");
  }
  return {
    status: tracking.tracking_status.status,
    estimatedDelivery: tracking.eta,
    trackingUrl: tracking.tracking_url,
    events: tracking.tracking_history.map((event) => ({
      status: event.status,
      location: event.location,
      timestamp: event.status_date,
      message: event.status_details
    }))
  };
}
async function cancelLabelFunction({ provider, labelId }) {
  try {
    const response = await fetch(`${SHIPPO_API_URL}/refunds/`, {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${provider.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transaction: labelId
      })
    });
    const refund = await response.json();
    if (!response.ok) {
      throw new Error(refund.message || "Failed to cancel label");
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
var SHIPPO_API_URL;
var init_shippo = __esm({
  "features/integrations/shipping/shippo.ts"() {
    "use strict";
    SHIPPO_API_URL = "https://api.goshippo.com";
  }
});

// features/integrations/shipping/shipengine.ts
var shipengine_exports = {};
__export(shipengine_exports, {
  cancelLabelFunction: () => cancelLabelFunction2,
  createLabelFunction: () => createLabelFunction2,
  getRatesFunction: () => getRatesFunction2,
  listCarriersFunction: () => listCarriersFunction,
  trackShipmentFunction: () => trackShipmentFunction2,
  validateAddressFunction: () => validateAddressFunction2
});
function convertDimensions(dim) {
  if (dim.unit === "m") {
    return {
      length: dim.length * 100,
      width: dim.width * 100,
      height: dim.height * 100,
      unit: "centimeter"
    };
  } else if (dim.unit === "ft") {
    return {
      length: dim.length * 12,
      width: dim.width * 12,
      height: dim.height * 12,
      unit: "inch"
    };
  } else {
    return {
      length: dim.length,
      width: dim.width,
      height: dim.height,
      unit: DIMENSION_UNIT_MAP[dim.unit] || dim.unit
    };
  }
}
function convertWeight(dim) {
  if (dim.weightUnit in WEIGHT_UNIT_MAP) {
    return {
      value: dim.weight,
      unit: WEIGHT_UNIT_MAP[dim.weightUnit]
    };
  } else if (dim.weightUnit === "mg") {
    return {
      value: dim.weight / 1e3,
      unit: "gram"
    };
  } else {
    return {
      value: dim.weight,
      unit: "gram"
    };
  }
}
async function listCarriersFunction(provider) {
  const response = await fetch(`${SHIPENGINE_API_URL}/carriers`, {
    method: "GET",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json"
    }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to list carriers");
  }
  if (!result.carriers || result.carriers.length === 0) {
    throw new Error("No carriers found from ShipEngine");
  }
  return result.carriers;
}
async function createLabelFunction2({
  provider,
  order,
  rateId,
  dimensions,
  lineItems
}) {
  if (!dimensions) {
    throw new Error("Dimensions are required to create a shipping label");
  }
  if (!dimensions.length || !dimensions.width || !dimensions.height || !dimensions.weight) {
    throw new Error(
      "Invalid dimensions provided. All dimensions and weight are required"
    );
  }
  const convertedDimensions = convertDimensions(dimensions);
  const convertedWeight = convertWeight(dimensions);
  let serviceCode = rateId;
  let finalRateId = rateId;
  try {
    const parsed = JSON.parse(rateId);
    serviceCode = parsed.service;
    finalRateId = parsed.id;
  } catch (e) {
  }
  const payload = {
    shipment: {
      // Use the serviceCode variable instead of rateId directly
      service_code: serviceCode,
      ship_to: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address_line1: order.shippingAddress.address1,
        address_line2: order.shippingAddress.address2,
        city_locality: order.shippingAddress.city,
        state_province: order.shippingAddress.province,
        postal_code: order.shippingAddress.postalCode,
        country_code: order.shippingAddress.country.iso2,
        phone: order.shippingAddress.phone,
        email: order.shippingAddress.email
      },
      ship_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        address_line1: provider.fromAddress.address1,
        address_line2: provider.fromAddress.address2,
        city_locality: provider.fromAddress.city,
        state_province: provider.fromAddress.province,
        postal_code: provider.fromAddress.postalCode,
        country_code: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone
      },
      packages: [
        {
          weight: convertedWeight,
          dimensions: {
            length: convertedDimensions.length,
            width: convertedDimensions.width,
            height: convertedDimensions.height,
            unit: convertedDimensions.unit
          }
        }
      ]
    },
    label_format: "PDF"
  };
  const response = await fetch(`${SHIPENGINE_API_URL}/labels`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create label");
  }
  const labelUrl = result.label_download?.pdf || result.label_download?.href;
  if (!labelUrl) {
    throw new Error("No label URL received from ShipEngine");
  }
  return {
    status: "purchased",
    data: result,
    rate: result.rate,
    carrier: result.carrier_code,
    service: result.service_type || result.service_code,
    trackingNumber: result.tracking_number,
    trackingUrl: result.tracking_url,
    labelUrl,
    rateId: finalRateId
  };
}
async function getRatesFunction2({ provider, order, dimensions }) {
  if (!dimensions) {
    throw new Error("Dimensions are required to get shipping rates");
  }
  const carriers = await listCarriersFunction(provider);
  const carrier_ids = carriers.map((carrier) => carrier.carrier_id);
  const convertedDimensions = convertDimensions(dimensions);
  const convertedWeight = convertWeight(dimensions);
  const payload = {
    shipment: {
      ship_to: {
        name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        address_line1: order.shippingAddress.address1,
        address_line2: order.shippingAddress.address2,
        city_locality: order.shippingAddress.city,
        state_province: order.shippingAddress.province,
        postal_code: order.shippingAddress.postalCode,
        country_code: order.shippingAddress.country.iso2,
        phone: order.shippingAddress.phone
      },
      ship_from: {
        name: `${provider.fromAddress.firstName} ${provider.fromAddress.lastName}`,
        address_line1: provider.fromAddress.address1,
        address_line2: provider.fromAddress.address2,
        city_locality: provider.fromAddress.city,
        state_province: provider.fromAddress.province,
        postal_code: provider.fromAddress.postalCode,
        country_code: provider.fromAddress.country.iso2,
        phone: provider.fromAddress.phone
      },
      packages: [
        {
          weight: convertedWeight,
          dimensions: {
            length: convertedDimensions.length,
            width: convertedDimensions.width,
            height: convertedDimensions.height,
            unit: convertedDimensions.unit
          }
        }
      ]
    },
    // rate_options is mandatory – we supply the gathered carrier_ids.
    rate_options: { carrier_ids }
  };
  const response = await fetch(`${SHIPENGINE_API_URL}/rates`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to get rates");
  }
  return result.rate_response.rates.map((rate) => {
    const shippingAmt = rate.shipping_amount && rate.shipping_amount.amount || 0;
    const otherAmt = rate.other_amount && rate.other_amount.amount || 0;
    const totalPrice = Number(shippingAmt + otherAmt).toFixed(2);
    const idValue = JSON.stringify({
      id: rate.rate_id,
      service: rate.service_code
    });
    return {
      id: idValue,
      providerId: provider.id,
      service: rate.service_type || rate.service_code,
      carrier: rate.carrier_friendly_name || rate.carrier_code,
      price: totalPrice,
      currency: rate.shipping_amount ? rate.shipping_amount.currency.toUpperCase() : "USD",
      estimatedDays: rate.delivery_days || rate.estimated_delivery_days
    };
  });
}
async function validateAddressFunction2({ provider, address }) {
  try {
    const payload = {
      address: {
        name: `${address.firstName} ${address.lastName}`,
        address_line1: address.address1,
        address_line2: address.address2,
        city_locality: address.city,
        state_province: address.province,
        postal_code: address.postalCode,
        country_code: address.country.iso2,
        phone: address.phone
      }
    };
    const response = await fetch(`${SHIPENGINE_API_URL}/addresses/validate`, {
      method: "POST",
      headers: {
        "API-Key": provider.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const validation = await response.json();
    if (!response.ok) {
      throw new Error(validation.message || "Address validation failed");
    }
    return {
      isValid: validation.is_valid,
      suggestedAddress: validation.is_valid ? {
        address1: validation.address_line1,
        address2: validation.address_line2,
        city: validation.city_locality,
        province: validation.state_province,
        postalCode: validation.postal_code,
        country: validation.country_code
      } : null,
      errors: validation.messages || []
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error.message]
    };
  }
}
async function trackShipmentFunction2({ provider, trackingNumber }) {
  const payload = {
    tracking_number: trackingNumber
    // Optionally include additional fields like carrier_code if required
  };
  const response = await fetch(`${SHIPENGINE_API_URL}/tracking`, {
    method: "POST",
    headers: {
      "API-Key": provider.accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const tracking = await response.json();
  if (!response.ok) {
    throw new Error(tracking.message || "Failed to track shipment");
  }
  return {
    status: tracking.status,
    estimatedDelivery: tracking.estimated_delivery_date,
    trackingUrl: tracking.tracking_url,
    events: tracking.events ? tracking.events.map((event) => ({
      status: event.status,
      location: event.location,
      timestamp: event.date,
      message: event.detail
    })) : []
  };
}
async function cancelLabelFunction2({ provider, labelId }) {
  try {
    const payload = { label_id: labelId };
    const response = await fetch(`${SHIPENGINE_API_URL}/labels/cancel`, {
      method: "POST",
      headers: {
        "API-Key": provider.accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to cancel label");
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
var SHIPENGINE_API_URL, WEIGHT_UNIT_MAP, DIMENSION_UNIT_MAP;
var init_shipengine = __esm({
  "features/integrations/shipping/shipengine.ts"() {
    "use strict";
    SHIPENGINE_API_URL = "https://api.shipengine.com/v1";
    WEIGHT_UNIT_MAP = {
      oz: "ounce",
      lb: "pound",
      lbs: "pound",
      kg: "kilogram",
      g: "gram"
    };
    DIMENSION_UNIT_MAP = {
      in: "inch",
      cm: "centimeter"
    };
  }
});

// features/integrations/shipping/manual.ts
var manual_exports2 = {};
__export(manual_exports2, {
  cancelLabelFunction: () => cancelLabelFunction3,
  createLabelFunction: () => createLabelFunction3,
  getRatesFunction: () => getRatesFunction3,
  trackShipmentFunction: () => trackShipmentFunction3,
  validateAddressFunction: () => validateAddressFunction3
});
async function getRatesFunction3({ provider, order }) {
  await sleep(1e3);
  return [
    {
      id: "rate_usps_1",
      providerId: provider.id,
      service: "Priority Mail",
      carrier: "USPS",
      price: "7.99",
      currency: "USD",
      estimatedDays: 3
    },
    {
      id: "rate_usps_2",
      providerId: provider.id,
      service: "Priority Mail Express",
      carrier: "USPS",
      price: "26.99",
      currency: "USD",
      estimatedDays: 1
    },
    {
      id: "rate_ups_1",
      providerId: provider.id,
      service: "Ground",
      carrier: "UPS",
      price: "8.99",
      currency: "USD",
      estimatedDays: 4
    },
    {
      id: "rate_ups_2",
      providerId: provider.id,
      service: "2nd Day Air",
      carrier: "UPS",
      price: "19.99",
      currency: "USD",
      estimatedDays: 2
    },
    {
      id: "rate_fedex_1",
      providerId: provider.id,
      service: "Ground",
      carrier: "FedEx",
      price: "9.99",
      currency: "USD",
      estimatedDays: 4
    },
    {
      id: "rate_fedex_2",
      providerId: provider.id,
      service: "2Day",
      carrier: "FedEx",
      price: "21.99",
      currency: "USD",
      estimatedDays: 2
    },
    {
      id: "rate_dhl_1",
      providerId: provider.id,
      service: "Express Worldwide",
      carrier: "DHL",
      price: "29.99",
      currency: "USD",
      estimatedDays: 2
    },
    {
      id: "rate_dhl_2",
      providerId: provider.id,
      service: "Express Economy",
      carrier: "DHL",
      price: "18.99",
      currency: "USD",
      estimatedDays: 4
    }
  ];
}
async function createLabelFunction3({ provider, order, rate }) {
  await sleep(1500);
  const carrierPrefix = rate.carrier || "UNKNOWN";
  const trackingFormats = {
    "USPS": "94001234567890123456",
    "UPS": "1Z999AA1234567890",
    "FedEx": "123456789012",
    "DHL": "1234567890"
  };
  const baseTrackingUrls = {
    "USPS": "https://tools.usps.com/go/TrackConfirmAction?tLabels=",
    "UPS": "https://www.ups.com/track?tracknum=",
    "FedEx": "https://www.fedex.com/fedextrack/?trknbr=",
    "DHL": "https://www.dhl.com/en/express/tracking.html?AWB="
  };
  const trackingNumber = trackingFormats[rate.carrier] || carrierPrefix + Math.random().toString(36).substring(2, 10).toUpperCase();
  const trackingUrl = baseTrackingUrls[rate.carrier] ? baseTrackingUrls[rate.carrier] + trackingNumber : "https://example.com/track";
  return {
    status: "SUCCESS",
    data: {
      rate_id: rate.id,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    rate,
    trackingNumber,
    trackingUrl,
    labelUrl: `https://api.example.com/shipping/labels/${rate.carrier.toLowerCase()}/${trackingNumber}.pdf`
  };
}
async function validateAddressFunction3({ provider, address }) {
  await sleep(800);
  return {
    isValid: true,
    suggestedAddress: null,
    errors: []
  };
}
async function trackShipmentFunction3({ provider, trackingNumber }) {
  await sleep(700);
  const carrierFromTracking = trackingNumber.startsWith("94") ? "USPS" : trackingNumber.startsWith("1Z") ? "UPS" : trackingNumber.length === 12 ? "FedEx" : "DHL";
  const locations = {
    "USPS": ["USPS Facility", "Local Post Office", "Regional Distribution Center"],
    "UPS": ["UPS Hub", "Local UPS Facility", "UPS Distribution Center"],
    "FedEx": ["FedEx Hub", "Local FedEx Station", "FedEx Sort Facility"],
    "DHL": ["DHL Gateway", "Local DHL Facility", "DHL Service Center"]
  };
  const carrierLocations = locations[carrierFromTracking];
  return {
    status: "in_transit",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toISOString(),
    trackingUrl: `https://example.com/track/${carrierFromTracking.toLowerCase()}/${trackingNumber}`,
    events: [
      {
        status: "in_transit",
        location: carrierLocations[0],
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1e3).toISOString(),
        message: "Package is in transit"
      },
      {
        status: "picked_up",
        location: carrierLocations[1],
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString(),
        message: "Package has been picked up"
      },
      {
        status: "label_created",
        location: carrierLocations[2],
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1e3).toISOString(),
        message: "Shipping label created"
      }
    ]
  };
}
async function cancelLabelFunction3({ provider, labelId }) {
  await sleep(500);
  return {
    success: true,
    error: null
  };
}
var sleep;
var init_manual2 = __esm({
  "features/integrations/shipping/manual.ts"() {
    "use strict";
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  }
});

// features/integrations/shipping/index.ts
var shipping_exports = {};
__export(shipping_exports, {
  shippingProviderAdapters: () => shippingProviderAdapters
});
var shippingProviderAdapters;
var init_shipping = __esm({
  "features/integrations/shipping/index.ts"() {
    "use strict";
    shippingProviderAdapters = {
      shippo: () => Promise.resolve().then(() => (init_shippo(), shippo_exports)),
      shipengine: () => Promise.resolve().then(() => (init_shipengine(), shipengine_exports)),
      manual: () => Promise.resolve().then(() => (init_manual2(), manual_exports2))
    };
  }
});

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default2
});
module.exports = __toCommonJS(keystone_exports);

// features/keystone/index.ts
var import_auth = require("@keystone-6/auth");
var import_core90 = require("@keystone-6/core");

// features/keystone/models/fields.ts
var import_fields = require("@keystone-6/core/fields");
var permissionFields = {
  canAccessDashboard: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can access the dashboard"
  }),
  canReadOrders: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read orders"
  }),
  canManageOrders: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can update and delete any order"
  }),
  canReadProducts: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read products"
  }),
  canManageProducts: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can update and delete any product"
  }),
  canReadFulfillments: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read fulfillments"
  }),
  canManageFulfillments: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can update and delete any fulfillment"
  }),
  canReadUsers: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other users"
  }),
  canManageUsers: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can update and delete other users"
  }),
  canReadRoles: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other roles"
  }),
  canManageRoles: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can CRUD roles"
  }),
  canReadCheckouts: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other checkouts"
  }),
  canManageCheckouts: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage checkouts"
  }),
  canReadDiscounts: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other discounts"
  }),
  canManageDiscounts: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage discounts"
  }),
  canReadGiftCards: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other gift cards"
  }),
  canManageGiftCards: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage gift cards"
  }),
  canReadReturns: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other returns"
  }),
  canManageReturns: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage returns"
  }),
  canReadSalesChannels: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other returns"
  }),
  canManageSalesChannels: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage returns"
  }),
  canReadPayments: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other payments"
  }),
  canManagePayments: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage payments"
  }),
  canReadIdempotencyKeys: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other idempotency keys"
  }),
  canManageIdempotencyKeys: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage idempotency keys"
  }),
  canReadApps: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can read other apps"
  }),
  canManageApps: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage apps"
  }),
  canManageKeys: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can see and manage API Keys"
  }),
  canManageOnboarding: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can access onboarding and store configuration"
  }),
  canReadWebhooks: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can view webhook endpoints and events"
  }),
  canManageWebhooks: (0, import_fields.checkbox)({
    defaultValue: false,
    label: "User can create, update, and delete webhook endpoints (Warning: Grants access to ALL resource events)"
  })
};
var permissionsList = Object.keys(permissionFields);

// features/keystone/index.ts
var import_config = require("dotenv/config");

// features/keystone/mutations/index.ts
var import_schema = require("@graphql-tools/schema");

// features/keystone/mutations/redirectToInit.ts
async function redirectToInit(root, { ids }, context) {
  const userCount = await context.sudo().query.User.count({});
  if (userCount === 0) {
    return true;
  }
  return false;
}
var redirectToInit_default = redirectToInit;

// features/keystone/mutations/activeCart.ts
async function activeCart(root, { cartId }, context) {
  if (!cartId) {
    throw new Error("Cart ID is required");
  }
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      type
      checkoutStep
      region {
        id
        name
        countries {
          id
          name
          iso2
          region {
            id
          }
        }
        currency {
          code
          noDivisionCurrency
        }
        taxRate
      }
      subtotal
      total
      discount
      giftCardTotal
      tax
      shipping
      lineItems(orderBy:  {
         createdAt: asc
      }) {
        id
        quantity
        title
        thumbnail
        description
        unitPrice
        originalPrice
        total
        percentageOff
        productVariant {
          id
          title
          product {
            id
            title
            thumbnail
            handle
          }
        }
      }
      giftCards {
        id
        code
        balance
      }
      discountsById
      discounts {
        id
        code
        isDynamic
        isDisabled
        discountRule {
          id
          type
          value
          allocation
        }
      }
      shippingMethods {
        id
        price
        shippingOption {
          id
          name
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          data
          isSelected
          paymentProvider {
            id
            code
            isInstalled
          }
        }
      }
      addresses {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
        }
        phone
      }
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
        }
        phone
      }
      billingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
        }
        phone
      }
    `
  });
  if (!cart) {
    return null;
  }
  return cart;
}
var activeCart_default = activeCart;

// features/keystone/mutations/updateActiveCart.ts
async function updateActiveCart(root, { cartId, data }, context) {
  const sudoContext = context.sudo();
  const existingCart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      lineItems {
        id
        quantity
        productVariant {
          id
        }
      }
    `
  });
  if (!existingCart) {
    throw new Error("Cart not found");
  }
  if (data?.lineItems?.create?.length) {
    for (const newItem of data.lineItems.create) {
      const variantId = newItem.productVariant.connect.id;
      const existingLineItem = existingCart.lineItems?.find(
        (item) => item.productVariant.id === variantId
      );
      if (existingLineItem) {
        await context.graphql.raw({
          query: `
            mutation UpdateActiveCartLineItem($cartId: ID!, $lineId: ID!, $quantity: Int!) {
              updateActiveCartLineItem(cartId: $cartId, lineId: $lineId, quantity: $quantity) {
                id
              }
            }
          `,
          variables: {
            cartId,
            lineId: existingLineItem.id,
            quantity: existingLineItem.quantity + newItem.quantity
          }
        });
        delete data.lineItems;
      }
    }
  }
  return await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data
  });
}
var updateActiveCart_default = updateActiveCart;

// features/keystone/mutations/updateActiveCartLineItem.ts
async function updateActiveCartLineItem(root, { cartId, lineId, quantity }, context) {
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId }
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  const updatedLineItem = await sudoContext.query.LineItem.updateOne({
    where: { id: lineId },
    data: { quantity }
  });
  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
}
var updateActiveCartLineItem_default = updateActiveCartLineItem;

// features/keystone/mutations/updateActiveUser.ts
async function updateActiveUser(root, { data, oldPassword }, context) {
  const sudoContext = context.sudo();
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId }
  });
  if (!existingUser) {
    throw new Error("User not found");
  }
  if (data.password && !oldPassword) {
    throw new Error("Old password is required to update password");
  }
  if (data.password) {
    const { authenticateUserWithPassword } = await sudoContext.graphql.raw({
      query: `
        mutation VerifyPassword($email: String!, $password: String!) {
          authenticateUserWithPassword(email: $email, password: $password) {
            ... on UserAuthenticationWithPasswordSuccess {
              item {
                id
              }
            }
            ... on UserAuthenticationWithPasswordFailure {
              message
            }
          }
        }
      `,
      variables: {
        email: existingUser.email,
        password: oldPassword
      }
    });
    if (authenticateUserWithPassword.__typename === "UserAuthenticationWithPasswordFailure") {
      throw new Error("Invalid old password");
    }
  }
  return await sudoContext.db.User.updateOne({
    where: { id: session.itemId },
    data
  });
}
var updateActiveUser_default = updateActiveUser;

// features/keystone/mutations/updateActiveUserPassword.ts
async function updateActiveUserPassword(root, { oldPassword, newPassword, confirmPassword }, context) {
  const sudoContext = context.sudo();
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: "id email"
  });
  if (!existingUser) {
    throw new Error("User not found");
  }
  const { data } = await sudoContext.graphql.raw({
    query: `
      mutation VerifyPassword($email: String!, $password: String!) {
        authenticateUserWithPassword(email: $email, password: $password) {
          ... on UserAuthenticationWithPasswordSuccess {
            item {
              id
            }
          }
          ... on UserAuthenticationWithPasswordFailure {
            message
          }
        }
      }
    `,
    variables: {
      email: existingUser.email,
      password: oldPassword
    }
  });
  if (data.authenticateUserWithPassword.message === "Authentication failed.") {
    throw new Error("Invalid old password");
  }
  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match");
  }
  return await sudoContext.db.User.updateOne({
    where: { id: session.itemId },
    data: { password: newPassword }
  });
}
var updateActiveUserPassword_default = updateActiveUserPassword;

// features/keystone/mutations/updateActiveUserAddress.ts
async function updateActiveUserAddress(root, { where, data }, context) {
  const sudoContext = context.sudo();
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: "id addresses { id isBilling }"
  });
  if (!existingUser) {
    throw new Error("User not found");
  }
  const addressExists = existingUser.addresses.some(
    (addr) => addr.id === where.id
  );
  if (!addressExists) {
    throw new Error("Address not found");
  }
  if (data.isBilling && existingUser.addresses) {
    for (const addr of existingUser.addresses) {
      if (addr.isBilling && addr.id !== where.id) {
        await sudoContext.db.Address.updateOne({
          where: { id: addr.id },
          data: { isBilling: false }
        });
      }
    }
  }
  return await sudoContext.db.Address.updateOne({
    where,
    data
  });
}
var updateActiveUserAddress_default = updateActiveUserAddress;

// features/keystone/mutations/createActiveUserAddress.ts
async function createActiveUserAddress(root, { data }, context) {
  const sudoContext = context.sudo();
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: "id addresses { id isBilling }"
  });
  if (!existingUser) {
    throw new Error("User not found");
  }
  if (data.isBilling && existingUser.addresses) {
    for (const addr of existingUser.addresses) {
      if (addr.isBilling) {
        await sudoContext.db.Address.updateOne({
          where: { id: addr.id },
          data: { isBilling: false }
        });
      }
    }
  }
  return await sudoContext.db.User.updateOne({
    where: { id: session.itemId },
    data: {
      addresses: {
        create: [data]
      }
    }
  });
}
var createActiveUserAddress_default = createActiveUserAddress;

// features/keystone/mutations/deleteActiveUserAddress.ts
async function deleteActiveUserAddress(root, { where }, context) {
  const sudoContext = context.sudo();
  const session = context.session;
  if (!session?.itemId) {
    throw new Error("Not authenticated");
  }
  const existingUser = await sudoContext.query.User.findOne({
    where: { id: session.itemId },
    query: "id addresses { id }"
  });
  if (!existingUser) {
    throw new Error("User not found");
  }
  const addressExists = existingUser.addresses.some((addr) => addr.id === where.id);
  if (!addressExists) {
    throw new Error("Address not found");
  }
  return await sudoContext.db.Address.deleteOne({
    where
  });
}
var deleteActiveUserAddress_default = deleteActiveUserAddress;

// features/keystone/mutations/addDiscountToActiveCart.ts
async function addDiscountToActiveCart(root, { cartId, code }, context) {
  const sudoContext = context.sudo();
  const discount = await sudoContext.query.Discount.findOne({
    where: { code },
    query: `
      id
      code
      isDynamic
      isDisabled
      stackable
      startsAt
      endsAt
      usageLimit
      usageCount
      discountRule {
        id
        type
        value
        allocation
        discountConditions {
          id
          type
          operator
          products {
            id
          }
          productCategories {
            id
          }
          customerGroups {
            id
          }
        }
      }
    `
  });
  if (!discount) {
    throw new Error(`No discount found with code: ${code}`);
  }
  if (discount.isDisabled) {
    throw new Error(`Discount ${code} is disabled`);
  }
  const now = /* @__PURE__ */ new Date();
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    throw new Error(`Discount ${code} has not started yet`);
  }
  if (discount.endsAt && new Date(discount.endsAt) < now) {
    throw new Error(`Discount ${code} has expired`);
  }
  if (discount.usageLimit) {
    if (discount.usageCount >= discount.usageLimit) {
      throw new Error(`Discount ${code} usage limit reached`);
    }
    await sudoContext.db.Discount.updateOne({
      where: { id: discount.id },
      data: { usageCount: discount.usageCount + 1 }
    });
  }
  const existingCart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      discounts {
        id
        code
        stackable
      }
    `
  });
  let discountUpdate;
  if (existingCart?.discounts?.length > 0) {
    const hasNonStackable = existingCart.discounts.some((d) => !d.stackable);
    if (hasNonStackable) {
      discountUpdate = {
        disconnect: existingCart.discounts.map((d) => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else if (!discount.stackable) {
      discountUpdate = {
        disconnect: existingCart.discounts.map((d) => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else {
      discountUpdate = {
        connect: [{ id: discount.id }]
      };
    }
  } else {
    discountUpdate = {
      connect: [{ id: discount.id }]
    };
  }
  return await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data: {
      discounts: discountUpdate
    }
  });
}
var addDiscountToActiveCart_default = addDiscountToActiveCart;

// features/keystone/mutations/removeDiscountFromActiveCart.ts
async function removeDiscountFromActiveCart(root, { cartId, code }, context) {
  const sudoContext = context.sudo();
  const discount = await sudoContext.query.Discount.findOne({
    where: { code },
    query: "id"
  });
  if (!discount) {
    throw new Error(`No discount found with code: ${code}`);
  }
  return await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data: {
      discounts: {
        disconnect: [{ id: discount.id }]
      }
    }
  });
}
var removeDiscountFromActiveCart_default = removeDiscountFromActiveCart;

// features/keystone/mutations/createActiveCartPaymentSessions.ts
async function createActiveCartPaymentSessions(root, { cartId }, context) {
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
        paymentProviders {
          id
          code
          isInstalled
        }
      }
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  const availableProviders = cart.region?.paymentProviders?.filter((p) => p.isInstalled) || [];
  let paymentCollection = cart.paymentCollection;
  if (!paymentCollection) {
    paymentCollection = await sudoContext.db.PaymentCollection.createOne({
      data: {
        cart: { connect: { id: cartId } },
        description: "default",
        amount: 0
        // Will be updated when payment is initiated
      },
      query: "id"
    });
  }
  for (const provider of availableProviders) {
    const existingSession = cart.paymentCollection?.paymentSessions?.find(
      (s) => s.paymentProvider.id === provider.id
    );
    if (!existingSession) {
      await sudoContext.db.PaymentSession.createOne({
        data: {
          paymentCollection: { connect: { id: paymentCollection.id } },
          paymentProvider: { connect: { id: provider.id } },
          amount: 0,
          // Initialize with 0, will be updated when payment is initiated
          data: {},
          // Initialize with empty data object
          isSelected: false,
          isInitiated: false
        }
      });
    }
  }
  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
}
var createActiveCartPaymentSessions_default = createActiveCartPaymentSessions;

// features/keystone/mutations/setActiveCartPaymentSession.ts
async function setActiveCartPaymentSession(root, { cartId, providerId }, context) {
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      paymentCollection {
        id
        paymentSessions {
          id
          paymentProvider {
            id
          }
        }
      }
    `
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  if (!cart.paymentCollection) {
    throw new Error("Cart has no payment collection");
  }
  for (const session of cart.paymentCollection.paymentSessions || []) {
    await sudoContext.db.PaymentSession.updateOne({
      where: { id: session.id },
      data: { isSelected: false }
    });
  }
  const selectedSession = cart.paymentCollection.paymentSessions?.find(
    (s) => s.paymentProvider.id === providerId
  );
  if (!selectedSession) {
    throw new Error("Payment session not found");
  }
  await sudoContext.db.PaymentSession.updateOne({
    where: { id: selectedSession.id },
    data: { isSelected: true }
  });
  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
}
var setActiveCartPaymentSession_default = setActiveCartPaymentSession;

// features/keystone/mutations/completeActiveCart.ts
async function completeActiveCart(root, { cartId, paymentSessionId }, context) {
  const sudoContext = context.sudo();
  const user = context.session?.itemId;
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      rawTotal
      user {
        id
        hasAccount
      }
      shippingAddress {
        id
        user {
          id
          hasAccount
        }
      }
      region {
        id
        taxRate
        currency {
          code
          id
        }
      }
      billingAddress {
        id
      }
      shippingAddress {
        id
      }
      discounts {
        id
      }
      shippingMethods {
        id
      }
      lineItems {
        id
        quantity
        metadata
        unitPrice
        total
        productVariant {
          id
          sku
          title
          product {
            id
            title
            thumbnail
            description {
              document
            }
            metadata
          }
          prices {
            id
            amount
            compareAmount
            currency {
              code
            }
            calculatedPrice {
              calculatedAmount
              originalAmount
              currencyCode
            }
          }
          measurements {
            id
            value
            unit
            type
          }
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          amount
          data
          paymentProvider {
            id
            code
          }
        }
      }
    `
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  if (!paymentSessionId) {
    return await handleAccountOrder(cart, user, sudoContext);
  } else {
    return await handlePaidOrder(cart, paymentSessionId, sudoContext);
  }
}
async function handleAccountOrder(cart, user, sudoContext) {
  if (!user) {
    throw new Error("Authentication required for account orders");
  }
  const cartCurrency = cart.region?.currency?.code;
  if (!cartCurrency) {
    throw new Error("Cart region or currency not found");
  }
  const accounts = await sudoContext.query.Account.findMany({
    where: {
      user: { id: { equals: user } },
      accountType: { equals: "business" },
      status: { equals: "active" }
    },
    query: `
      id
      totalAmount
      paidAmount
      creditLimit
      currency {
        id
        code
        noDivisionCurrency
      }
      user {
        id
        email
      }
    `
  });
  const activeAccount = accounts[0];
  if (!activeAccount) {
    throw new Error(`No active business account found. Contact administrator to set up business account access.`);
  }
  const convertCurrency2 = (await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports))).default;
  const orderInAccountCurrency = await convertCurrency2(
    cart.rawTotal,
    cartCurrency,
    activeAccount.currency.code
  );
  const accountWithBalance = await sudoContext.query.Account.findOne({
    where: { id: activeAccount.id },
    query: "availableCreditInAccountCurrency"
  });
  const availableCredit = accountWithBalance.availableCreditInAccountCurrency || 0;
  if (orderInAccountCurrency > availableCredit) {
    const { formatCurrencyAmount: formatCurrencyAmount3 } = await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports));
    const availableCreditFormatted = formatCurrencyAmount3(availableCredit, activeAccount.currency.code);
    const requiredCreditFormatted = formatCurrencyAmount3(orderInAccountCurrency, activeAccount.currency.code);
    throw new Error(
      `Insufficient credit. Available: ${availableCreditFormatted}, Required: ${requiredCreditFormatted}. Please contact billing to increase your credit limit or make a payment.`
    );
  }
  const order = await createOrderFromCartData(cart, sudoContext);
  await addOrderToAccount(activeAccount.id, order, sudoContext);
  return order;
}
async function handlePaidOrder(cart, paymentSessionId, sudoContext) {
  const selectedSession = cart.paymentCollection?.paymentSessions?.find(
    (session) => session.id === paymentSessionId
  );
  if (!selectedSession) {
    throw new Error(`Payment session not found. Looking for session ID: ${paymentSessionId}`);
  }
  if (!selectedSession.paymentProvider) {
    throw new Error("Payment provider not found in session");
  }
  if (!selectedSession.paymentProvider.code) {
    throw new Error("Payment provider code is missing");
  }
  let paymentResult;
  switch (selectedSession.paymentProvider.code) {
    case "pp_stripe_stripe":
      paymentResult = await captureStripePayment(selectedSession);
      break;
    case "pp_paypal_paypal":
      paymentResult = await capturePayPalPayment(selectedSession);
      break;
    case "pp_system_default":
      paymentResult = { status: "manual_pending", paymentIntentId: null };
      break;
    default:
      throw new Error(`Unsupported payment provider: ${selectedSession.paymentProvider.code}`);
  }
  if (paymentResult.status !== "succeeded" && paymentResult.status !== "manual_pending") {
    throw new Error(`Payment failed: ${paymentResult.error}`);
  }
  const order = await createOrderFromCartData(cart, sudoContext);
  await createPaymentRecord(paymentResult, order, cart, sudoContext);
  return order;
}
async function captureStripePayment(session) {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  if (!stripe) {
    throw new Error("Stripe not configured");
  }
  try {
    const paymentIntentId = session.data.clientSecret?.split("_secret_")[0];
    console.log("=== captureStripePayment Debug ===");
    console.log("session.data:", session.data);
    console.log("paymentIntentId:", paymentIntentId);
    if (!paymentIntentId) {
      throw new Error("Invalid Stripe payment intent");
    }
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log("PaymentIntent status:", paymentIntent.status);
    console.log("PaymentIntent amount:", paymentIntent.amount);
    if (paymentIntent.status === "succeeded") {
      return {
        status: "succeeded",
        paymentIntentId: paymentIntent.id,
        error: null
      };
    } else if (paymentIntent.status === "requires_capture") {
      const captured = await stripe.paymentIntents.capture(paymentIntentId);
      return {
        status: captured.status === "succeeded" ? "succeeded" : "failed",
        paymentIntentId: captured.id,
        error: captured.status !== "succeeded" ? "Payment capture failed" : null
      };
    } else {
      return {
        status: "failed",
        paymentIntentId: paymentIntent.id,
        error: `Payment status: ${paymentIntent.status}`
      };
    }
  } catch (error) {
    return {
      status: "failed",
      paymentIntentId: null,
      error: error.message
    };
  }
}
async function capturePayPalPayment(session) {
  if (!session.data.orderId) {
    return {
      status: "failed",
      paymentIntentId: null,
      error: "PayPal order ID not found"
    };
  }
  try {
    const authResponse = await fetch(`${process.env.PAYPAL_API_URL || "https://api.paypal.com"}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`
      },
      body: "grant_type=client_credentials"
    });
    if (!authResponse.ok) {
      throw new Error("PayPal authentication failed");
    }
    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    const orderResponse = await fetch(`${process.env.PAYPAL_API_URL || "https://api.paypal.com"}/v2/checkout/orders/${session.data.orderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    if (!orderResponse.ok) {
      throw new Error(`PayPal order verification failed: ${orderResponse.status}`);
    }
    const orderData = await orderResponse.json();
    console.log("=== capturePayPalPayment Debug ===");
    console.log("PayPal Order ID:", session.data.orderId);
    console.log("PayPal Order Status:", orderData.status);
    console.log("PayPal Order Amount:", orderData.purchase_units?.[0]?.amount);
    if (orderData.status === "COMPLETED" || orderData.status === "APPROVED") {
      return {
        status: "succeeded",
        paymentIntentId: session.data.orderId,
        error: null
      };
    } else {
      return {
        status: "failed",
        paymentIntentId: session.data.orderId,
        error: `PayPal order status: ${orderData.status}`
      };
    }
  } catch (error) {
    console.error("PayPal verification error:", error);
    return {
      status: "failed",
      paymentIntentId: session.data.orderId,
      error: error.message
    };
  }
}
async function addOrderToAccount(accountId, order, sudoContext) {
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      totalAmount
      currency {
        code
      }
    `
  });
  const orderDetails = await sudoContext.query.Order.findOne({
    where: { id: order.id },
    query: `
      id
      displayId
      rawTotal
      region {
        id
        name
        currency {
          code
        }
      }
      currency {
        code
      }
      lineItems {
        id
      }
    `
  });
  try {
    await sudoContext.prisma.$transaction(async (tx) => {
      await sudoContext.query.AccountLineItem.createOne({
        data: {
          account: { connect: { id: accountId } },
          order: { connect: { id: order.id } },
          region: { connect: { id: orderDetails.region.id } },
          description: `Order #${orderDetails.displayId} - ${orderDetails.lineItems?.length || 0} items`,
          amount: orderDetails.rawTotal || 0,
          orderDisplayId: String(orderDetails.displayId),
          itemCount: orderDetails.lineItems?.length || 0,
          paymentStatus: "unpaid"
        }
      });
      await sudoContext.query.Account.updateOne({
        where: { id: accountId },
        data: {
          totalAmount: (account.totalAmount || 0) + (orderDetails.rawTotal || 0)
        }
      });
      await sudoContext.query.Order.updateOne({
        where: { id: order.id },
        data: {
          account: { connect: { id: accountId } }
        }
      });
    });
    console.log(`Order #${orderDetails.displayId} added to account ${accountId} for ${orderDetails.rawTotal} ${orderDetails.currency.code}`);
  } catch (error) {
    console.error("Error adding order to account:", error);
    throw new Error(`Failed to add order to account: ${error.message}`);
  }
}
async function createPaymentRecord(paymentResult, order, cart, sudoContext) {
  const selectedSession = cart.paymentCollection?.paymentSessions?.[0];
  await sudoContext.query.Payment.createOne({
    data: {
      status: paymentResult.status === "succeeded" ? "captured" : "pending",
      amount: cart.rawTotal,
      currencyCode: cart.region.currency.code,
      data: {
        ...selectedSession.data,
        paymentIntentId: paymentResult.paymentIntentId
      },
      capturedAt: paymentResult.status === "succeeded" ? (/* @__PURE__ */ new Date()).toISOString() : null,
      paymentCollection: { connect: { id: cart.paymentCollection.id } },
      order: { connect: { id: order.id } },
      user: order.user?.id ? { connect: { id: order.user.id } } : void 0
    }
  });
}
async function createOrderFromCartData(cart, sudoContext) {
  const userId = cart.user?.id || cart.shippingAddress?.user?.id;
  const hasAccount = cart.user?.hasAccount || cart.shippingAddress?.user?.hasAccount || false;
  const secretKey = !userId ? require("crypto").randomBytes(32).toString("hex") : void 0;
  const formatCurrency5 = (amount, currencyCode) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode
    }).format(amount / 100);
  };
  const orderLineItems = [];
  for (const lineItem of cart.lineItems) {
    const prices = await sudoContext.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: lineItem.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region.currency.code } }
      },
      query: `
        id
        calculatedPrice {
          calculatedAmount
          originalAmount
          currencyCode
        }
      `
    });
    const price = prices[0]?.calculatedPrice;
    if (!price) {
      throw new Error(`No valid price found for variant ${lineItem.productVariant.id} in region ${cart.region.id}`);
    }
    const orderMoneyAmount = await sudoContext.query.OrderMoneyAmount.createOne({
      data: {
        amount: price.calculatedAmount,
        originalAmount: price.originalAmount,
        currency: { connect: { id: cart.region.currency.id } },
        region: { connect: { id: cart.region.id } },
        priceData: {
          prices: lineItem.productVariant.prices,
          currencyCode: cart.region.currency.code,
          regionId: cart.region.id,
          taxRate: cart.region.taxRate
        },
        metadata: lineItem.metadata
      }
    });
    const orderLineItem = await sudoContext.query.OrderLineItem.createOne({
      data: {
        quantity: lineItem.quantity,
        title: lineItem.productVariant.product.title,
        sku: lineItem.productVariant.sku,
        metadata: lineItem.metadata,
        productData: {
          id: lineItem.productVariant.product.id,
          title: lineItem.productVariant.product.title,
          thumbnail: lineItem.productVariant.product.thumbnail,
          description: lineItem.productVariant.product.description,
          metadata: lineItem.productVariant.product.metadata
        },
        variantData: {
          id: lineItem.productVariant.id,
          sku: lineItem.productVariant.sku,
          title: lineItem.productVariant.title,
          measurements: lineItem.productVariant.measurements || []
        },
        variantTitle: lineItem.productVariant.title,
        formattedUnitPrice: lineItem.unitPrice,
        formattedTotal: lineItem.total,
        productVariant: { connect: { id: lineItem.productVariant.id } },
        originalLineItem: { connect: { id: lineItem.id } },
        moneyAmount: { connect: { id: orderMoneyAmount.id } }
      }
    });
    orderLineItems.push(orderLineItem);
  }
  const order = await sudoContext.query.Order.createOne({
    data: {
      cart: { connect: { id: cart.id } },
      email: cart.email,
      user: userId ? { connect: { id: userId } } : void 0,
      region: { connect: { id: cart.region.id } },
      currency: { connect: { code: cart.region.currency.code } },
      billingAddress: { connect: { id: cart.billingAddress.id } },
      shippingAddress: { connect: { id: cart.shippingAddress.id } },
      discounts: { connect: cart.discounts.map((d) => ({ id: d.id })) },
      shippingMethods: { connect: cart.shippingMethods.map((sm) => ({ id: sm.id })) },
      lineItems: { connect: orderLineItems.map((li) => ({ id: li.id })) },
      status: "pending",
      displayId: Math.floor(Date.now() / 1e3),
      taxRate: cart.region.taxRate || 0,
      secretKey,
      events: {
        create: {
          type: "ORDER_PLACED",
          data: {
            cartId: cart.id,
            isGuestOrder: !hasAccount
          }
        }
      }
    }
  });
  await sudoContext.query.Cart.updateOne({
    where: { id: cart.id },
    data: {
      order: { connect: { id: order.id } }
    }
  });
  const createdOrder = await sudoContext.query.Order.findOne({
    where: { id: order.id },
    query: `
      id
      status
      displayId
      secretKey
      subtotal
      total
      shipping
      discount
      tax
      paymentDetails
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
        }
        phone
      }
    `
  });
  return createdOrder;
}
var completeActiveCart_default = completeActiveCart;

// features/keystone/mutations/addActiveCartShippingMethod.ts
async function addActiveCartShippingMethod(root, { cartId, shippingMethodId }, context) {
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
      }
      shippingMethods {
        id
      }
    `
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  if (cart.shippingMethods?.length > 0) {
    await Promise.all(
      cart.shippingMethods.map(
        (method) => sudoContext.db.ShippingMethod.deleteOne({
          where: { id: method.id }
        })
      )
    );
  }
  const shippingOption = await sudoContext.query.ShippingOption.findOne({
    where: { id: shippingMethodId },
    query: `
      id
      amount
      name
    `
  });
  if (!shippingOption) {
    throw new Error("Shipping option not found");
  }
  await sudoContext.db.ShippingMethod.createOne({
    data: {
      cart: { connect: { id: cartId } },
      shippingOption: { connect: { id: shippingOption.id } },
      price: shippingOption.amount,
      data: {
        name: shippingOption.name
      }
    }
  });
  return await sudoContext.db.Cart.findOne({
    where: { id: cartId }
  });
}
var addActiveCartShippingMethod_default = addActiveCartShippingMethod;

// features/keystone/queries/activeCartShippingOptions.ts
async function activeCartShippingOptions(root, { cartId }, context) {
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
        currency {
          code
          noDivisionCurrency
        }
      }
      shippingAddress {
        id
      }
      subtotal
    `
  });
  if (!cart?.region?.id) return [];
  const shippingOptions = await sudoContext.query.ShippingOption.findMany({
    where: {
      AND: [
        { region: { id: { equals: cart.region.id } } },
        { isReturn: { equals: false } },
        { adminOnly: { equals: false } }
      ]
    },
    query: `
      id
      name
      amount
      priceType
      data
      shippingOptionRequirements {
        id
        type
        amount
      }
      taxRates {
        id
        rate
      }
    `
  });
  const currencyCode = cart.region?.currency?.code || "USD";
  const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
  return shippingOptions.map((option) => {
    const taxRate = option.taxRates?.[0]?.rate || 0;
    const baseAmount = option.amount;
    const calculatedAmount = baseAmount * (1 + taxRate);
    return {
      ...option,
      amount: baseAmount,
      calculatedAmount: formatAmount(calculatedAmount / divisor, currencyCode),
      isTaxInclusive: true
    };
  });
}
function formatAmount(amount, currencyCode) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
}
var activeCartShippingOptions_default = activeCartShippingOptions;

// features/keystone/queries/activeCartPaymentProviders.ts
async function activeCartPaymentProviders(root, { regionId }, context, info) {
  if (!regionId) {
    throw new Error("Region ID is required");
  }
  const providers = await context.sudo().query.PaymentProvider.findMany({
    where: {
      isInstalled: { equals: true },
      regions: { some: { id: { equals: regionId } } }
    },
    query: `
      id
      name
      code
      isInstalled
    `
  });
  return providers;
}
var activeCartPaymentProviders_default = activeCartPaymentProviders;

// features/keystone/queries/activeCartRegion.ts
async function activeCartRegion(root, { countryCode }, context) {
  const sudoContext = context.sudo();
  const regions = await sudoContext.query.Region.findMany({
    where: {
      countries: {
        some: {
          iso2: { equals: countryCode }
        }
      }
    },
    query: `
      id
      name
      currency {
        code
        noDivisionCurrency
      }
      countries {
        id
        name
        iso2
      }
      paymentProviders {
        id
        code
        isInstalled
      }
      shippingOptions {
        id
        name
        amount
        priceType
      }
    `
  });
  return regions[0] || null;
}
var activeCartRegion_default = activeCartRegion;

// import("../../integrations/payment/**/*.ts") in features/keystone/utils/paymentProviderAdapter.ts
var globImport_integrations_payment_ts = __glob({
  "../../integrations/payment/index.ts": () => Promise.resolve().then(() => (init_payment(), payment_exports)),
  "../../integrations/payment/manual.ts": () => Promise.resolve().then(() => (init_manual(), manual_exports)),
  "../../integrations/payment/paypal.ts": () => Promise.resolve().then(() => (init_paypal(), paypal_exports)),
  "../../integrations/payment/stripe.ts": () => Promise.resolve().then(() => (init_stripe(), stripe_exports))
});

// features/keystone/utils/paymentProviderAdapter.ts
async function executeAdapterFunction({ provider, functionName, args }) {
  const functionPath = provider[functionName];
  if (functionPath.startsWith("http")) {
    const response = await fetch(functionPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, ...args })
    });
    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.statusText}`);
    }
    return response.json();
  }
  const adapter = await globImport_integrations_payment_ts(`../../integrations/payment/${functionPath}.ts`);
  const fn = adapter[functionName];
  if (!fn) {
    throw new Error(
      `Function ${functionName} not found in adapter ${functionPath}`
    );
  }
  try {
    return await fn({ provider, ...args });
  } catch (error) {
    throw new Error(
      `Error executing ${functionName} for provider ${functionPath}: ${error.message}`
    );
  }
}
async function createPayment({ provider, cart, amount, currency }) {
  return executeAdapterFunction({
    provider,
    functionName: "createPaymentFunction",
    args: { cart, amount, currency }
  });
}
async function capturePayment({ provider, paymentId, amount }) {
  return executeAdapterFunction({
    provider,
    functionName: "capturePaymentFunction",
    args: { paymentId, amount }
  });
}
async function handleWebhook({ provider, event, headers }) {
  return executeAdapterFunction({
    provider,
    functionName: "handleWebhookFunction",
    args: { event, headers }
  });
}

// features/keystone/mutations/initiatePaymentSession.ts
async function initiatePaymentSession(root, { cartId, paymentProviderId }, context) {
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      rawTotal
      region {
        id
        taxRate
        currency {
          code
          noDivisionCurrency
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          isSelected
          isInitiated
          paymentProvider {
            id
            code
          }
          data
        }
      }
    `
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  const provider = await sudoContext.query.PaymentProvider.findOne({
    where: { code: paymentProviderId },
    query: `
      id 
      code 
      isInstalled
      createPaymentFunction
      capturePaymentFunction
      refundPaymentFunction
      getPaymentStatusFunction
      generatePaymentLinkFunction
      credentials
    `
  });
  if (!provider || !provider.isInstalled) {
    throw new Error("Payment provider not found or not installed");
  }
  if (!cart.paymentCollection) {
    cart.paymentCollection = await sudoContext.query.PaymentCollection.createOne({
      data: {
        cart: { connect: { id: cart.id } },
        amount: cart.rawTotal,
        description: "default"
      },
      query: "id"
    });
  }
  const existingSession = cart.paymentCollection?.paymentSessions?.find(
    (s) => s.paymentProvider.code === paymentProviderId && !s.isInitiated
  );
  if (existingSession) {
    const otherSessions = cart.paymentCollection.paymentSessions.filter(
      (s) => s.id !== existingSession.id && s.isSelected
    );
    for (const session of otherSessions) {
      await sudoContext.query.PaymentSession.updateOne({
        where: { id: session.id },
        data: { isSelected: false }
      });
    }
    await sudoContext.query.PaymentSession.updateOne({
      where: { id: existingSession.id },
      data: { isSelected: true }
    });
    return existingSession;
  }
  try {
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code
    });
    const existingSelectedSessions = cart.paymentCollection.paymentSessions?.filter(
      (s) => s.isSelected
    ) || [];
    for (const session of existingSelectedSessions) {
      await sudoContext.query.PaymentSession.updateOne({
        where: { id: session.id },
        data: { isSelected: false }
      });
    }
    const newSession = await sudoContext.query.PaymentSession.createOne({
      data: {
        paymentCollection: { connect: { id: cart.paymentCollection.id } },
        paymentProvider: { connect: { id: provider.id } },
        amount: cart.rawTotal,
        isSelected: true,
        isInitiated: false,
        data: sessionData
      },
      query: `
        id
        data
        amount
        isInitiated
      `
    });
    return newSession;
  } catch (error) {
    console.error("Payment session creation failed:", error);
    throw error;
  }
}
var initiatePaymentSession_default = initiatePaymentSession;

// features/keystone/mutations/handlePaymentProviderWebhook.ts
async function handlePaymentProviderWebhook(root, { providerId, event, headers }, context) {
  const sudoContext = context.sudo();
  const provider = await sudoContext.query.PaymentProvider.findOne({
    where: { id: providerId },
    query: `
      id
      code
      isInstalled
      createPaymentFunction
      capturePaymentFunction
      refundPaymentFunction
      getPaymentStatusFunction
      generatePaymentLinkFunction
      handleWebhookFunction
      credentials
    `
  });
  if (!provider || !provider.isInstalled) {
    throw new Error("Payment provider not found or not installed");
  }
  const { type, resource } = await handleWebhook({ provider, event, headers });
  if (type.match(/payment_intent\.succeeded|PAYMENT\.CAPTURE\.COMPLETED/)) {
    const paymentId = resource.metadata?.paymentId || resource.custom_id;
    if (paymentId) {
      const captureResult = await capturePayment({
        provider,
        paymentId: resource.id,
        amount: typeof resource.amount === "number" ? resource.amount : parseInt(resource.amount.value * 100)
      });
      const payment = await sudoContext.query.Payment.updateOne({
        where: { id: paymentId },
        data: {
          status: captureResult.status,
          capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
          data: captureResult.data
        }
      });
      await sudoContext.query.Capture.createOne({
        data: {
          amount: captureResult.amount,
          payment: { connect: { id: payment.id } },
          metadata: {
            providerId,
            paymentId: resource.id
          },
          createdBy: "system"
        }
      });
      const orderId = resource.metadata?.orderId || resource.custom_id;
      if (orderId) {
        await sudoContext.query.Order.updateOne({
          where: { id: orderId },
          data: {
            status: "completed",
            paymentStatus: "captured"
          }
        });
      }
    }
  } else if (type.match(/payment_intent\.payment_failed|PAYMENT\.CAPTURE\.DENIED/)) {
    const paymentId = resource.metadata?.paymentId || resource.custom_id;
    if (paymentId) {
      await sudoContext.query.Payment.updateOne({
        where: { id: paymentId },
        data: {
          status: "failed",
          data: {
            ...resource,
            error: resource.last_payment_error || resource.error
          }
        }
      });
      const orderId = resource.metadata?.orderId || resource.custom_id;
      if (orderId) {
        await sudoContext.query.Order.updateOne({
          where: { id: orderId },
          data: {
            status: "failed",
            paymentStatus: "failed"
          }
        });
      }
    }
  } else if (type === "PAYMENT.AUTHORIZATION.CREATED") {
    const paymentId = resource.custom_id;
    if (paymentId) {
      await sudoContext.query.Payment.updateOne({
        where: { id: paymentId },
        data: {
          status: "authorized",
          data: resource
        }
      });
      await sudoContext.query.Order.updateOne({
        where: { id: paymentId },
        data: {
          status: "pending",
          paymentStatus: "authorized"
        }
      });
    }
  } else if (type === "PAYMENT.AUTHORIZATION.VOIDED") {
    const paymentId = resource.custom_id;
    if (paymentId) {
      await sudoContext.query.Payment.updateOne({
        where: { id: paymentId },
        data: {
          status: "canceled",
          canceledAt: (/* @__PURE__ */ new Date()).toISOString(),
          data: resource
        }
      });
      await sudoContext.query.Order.updateOne({
        where: { id: paymentId },
        data: {
          status: "canceled",
          paymentStatus: "canceled"
        }
      });
    }
  } else {
    console.log(`Unhandled webhook event type: ${type}`);
  }
  return { success: true };
}
var handlePaymentProviderWebhook_default = handlePaymentProviderWebhook;

// features/keystone/mutations/getCustomerOrder.ts
async function getCustomerOrder(root, { orderId, secretKey }, context) {
  const sudoContext = context.sudo();
  const order = await sudoContext.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      secretKey
      displayId
      status
      fulfillmentStatus
      fulfillmentDetails
      paymentDetails
      total
      subtotal
      shipping
      discount
      tax
      createdAt
      email
      unfulfilled
      fulfillments {
        id
        createdAt
        canceledAt
        fulfillmentItems {
          id
          quantity
          lineItem {
            id
            quantity
            title
            sku
            thumbnail
            metadata
            variantTitle
            formattedUnitPrice
            formattedTotal
            productData
            variantData
          }
        }
        shippingLabels {
          id
          labelUrl
          trackingNumber
          trackingUrl
          carrier
        }
      }
      user {
        id
        name
        email
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
          name
        }
        phone
      }
      billingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          id
          iso2
          name
        }
        phone
      }
      shippingMethods {
        id
        price
        shippingOption {
          name
        }
      }
      payments {
        id
        amount
        status
        data
        createdAt
        paymentCollection {
          paymentSessions {
            id
            isSelected
            paymentProvider {
              id
              code
            }
          }
        }
      }
      lineItems {
        id
        title
        quantity
        thumbnail
        variantTitle
        formattedUnitPrice
        formattedTotal
        variantData
        productData
      }
      region {
        id
        name
        currency {
          code
        }
      }
    `
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (secretKey) {
    if (order.secretKey !== secretKey) {
      throw new Error("Invalid secret key");
    }
    return order;
  }
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  if (order.user?.id !== context.session.itemId) {
    throw new Error("Order not found");
  }
  return order;
}
var getCustomerOrder_default = getCustomerOrder;

// features/keystone/mutations/getCustomerOrders.ts
async function getCustomerOrders(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  const sudoContext = context.sudo();
  const orders = await sudoContext.query.Order.findMany({
    where: {
      user: { id: { equals: context.session.itemId } }
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    query: `
      id
      displayId
      status
      fulfillmentStatus
      total
      formattedTotalPaid
      createdAt
      shippingAddress {
        country {
          id
          iso2
        }
      }
      lineItems {
        id
        title
        quantity
        thumbnail
      }
      region {
        id
        currency {
          code
        }
      }
    `
  });
  return orders;
}
var getCustomerOrders_default = getCustomerOrders;

// features/keystone/mutations/getAnalytics.ts
async function getAnalytics(root, { timeframe = "7d" }, context) {
  const endDate = /* @__PURE__ */ new Date();
  const startDate = /* @__PURE__ */ new Date();
  switch (timeframe) {
    case "24h":
      startDate.setDate(startDate.getDate() - 1);
      break;
    case "7d":
      startDate.setDate(startDate.getDate() - 7);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 30);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }
  const sudoContext = context.sudo();
  const orders = await sudoContext.query.Order.findMany({
    where: { createdAt: { gte: startDate.toISOString(), lte: endDate.toISOString() } },
    query: `
      id
      status
      fulfillmentStatus
      paymentStatus
      createdAt
      user {
        id
      }
      total
      subtotal
      shipping
      tax
      discount
      lineItems {
        id
        quantity
        title
        variantData
        productData
        moneyAmount {
          amount
        }
      }
      payments {
        id
        amount
        status
      }
      returns {
        id
        status
        refundAmount
      }
      shippingMethods {
        id
        price
        shippingOption {
          name
          fulfillmentProvider {
            id
          }
        }
      }
    `
  });
  const salesMetrics = orders.reduce((acc, order) => {
    const total = parseFloat(order.total || "0");
    const subtotal = parseFloat(order.subtotal || "0");
    const shipping = parseFloat(order.shipping || "0");
    const tax = parseFloat(order.tax || "0");
    const discount = parseFloat(order.discount || "0");
    const refunds = order.returns?.reduce((sum, ret) => sum + (ret.refundAmount || 0), 0) || 0;
    acc.total += total;
    acc.subtotal += subtotal;
    acc.shipping += shipping;
    acc.tax += tax;
    acc.discount += discount;
    acc.refunds += refunds;
    acc.count += 1;
    return acc;
  }, { total: 0, subtotal: 0, shipping: 0, tax: 0, discount: 0, refunds: 0, count: 0 });
  salesMetrics.averageOrderValue = salesMetrics.count > 0 ? salesMetrics.total / salesMetrics.count : 0;
  const ordersByDay = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = {
        total: 0,
        subtotal: 0,
        shipping: 0,
        tax: 0,
        discount: 0,
        refunds: 0,
        count: 0
      };
    }
    const total = parseFloat(order.total || "0");
    const subtotal = parseFloat(order.subtotal || "0");
    const shipping = parseFloat(order.shipping || "0");
    const tax = parseFloat(order.tax || "0");
    const discount = parseFloat(order.discount || "0");
    const refunds = order.returns?.reduce((sum, ret) => sum + (ret.refundAmount || 0), 0) || 0;
    acc[date].total += total;
    acc[date].subtotal += subtotal;
    acc[date].shipping += shipping;
    acc[date].tax += tax;
    acc[date].discount += discount;
    acc[date].refunds += refunds;
    acc[date].count += 1;
    return acc;
  }, {});
  const orderTimeline = Object.entries(ordersByDay).map(([date, metrics]) => ({
    date,
    ...metrics
  })).sort((a, b) => a.date.localeCompare(b.date));
  const products = await sudoContext.query.Product.findMany({
    query: `
      id
      title
      status
      productVariants {
        id
        title
        inventoryQuantity
        prices {
          amount
          currency {
            code
          }
        }
      }
    `
  });
  const inventoryMetrics = products.reduce((acc, product) => {
    const variants = product.productVariants || [];
    const isOutOfStock = variants.every((v) => v.inventoryQuantity === 0);
    const isLowStock = variants.some((v) => v.inventoryQuantity > 0 && v.inventoryQuantity < 10);
    const totalValue = variants.reduce((sum, v) => {
      const price = v.prices?.[0]?.amount || 0;
      return sum + v.inventoryQuantity * price;
    }, 0);
    if (isOutOfStock) acc.outOfStock += 1;
    if (isLowStock) acc.lowStock += 1;
    acc.total += 1;
    acc.totalValue += totalValue;
    acc.totalStock += variants.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0);
    return acc;
  }, { total: 0, outOfStock: 0, lowStock: 0, totalValue: 0, totalStock: 0 });
  const productMetrics = {};
  orders.forEach((order) => {
    order.lineItems?.forEach((item) => {
      const productId = item.productData?.id;
      const productTitle = item.productData?.title;
      if (!productId) return;
      if (!productMetrics[productId]) {
        productMetrics[productId] = {
          id: productId,
          title: productTitle,
          status: item.productData?.status,
          quantity: 0,
          revenue: 0,
          orders: /* @__PURE__ */ new Set()
        };
      }
      productMetrics[productId].quantity += item.quantity;
      productMetrics[productId].revenue += item.quantity * (item.moneyAmount?.amount || 0);
      productMetrics[productId].orders.add(order.id);
    });
  });
  const topProducts = Object.values(productMetrics).map((p) => ({
    ...p,
    orderCount: p.orders.size,
    averageOrderValue: p.revenue / p.orders.size
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const users = await sudoContext.query.User.findMany({
    where: { createdAt: { gte: startDate.toISOString(), lte: endDate.toISOString() } },
    query: `
      id
      createdAt
      orders {
        id
        total
        createdAt
      }
    `
  });
  const totalUsers = await sudoContext.query.User.count();
  const newUsers = users.length;
  const customerMetrics = users.reduce((acc, user) => {
    const userOrders = user.orders || [];
    if (userOrders.length > 0) {
      acc.activeUsers += 1;
      acc.totalRevenue += userOrders.reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);
    }
    return acc;
  }, { activeUsers: 0, totalRevenue: 0 });
  const shippingMetrics = orders.reduce((acc, order) => {
    order.shippingMethods?.forEach((method) => {
      const provider = method.shippingOption?.fulfillmentProvider?.id;
      const name = method.shippingOption?.name;
      if (provider && name) {
        const key = `${provider}-${name}`;
        if (!acc.methods[key]) {
          acc.methods[key] = {
            provider,
            name,
            count: 0,
            total: 0
          };
        }
        acc.methods[key].count += 1;
        acc.methods[key].total += parseFloat(method.price || "0");
      }
    });
    return acc;
  }, { methods: {} });
  return {
    sales: {
      total: salesMetrics.total,
      subtotal: salesMetrics.subtotal,
      shipping: salesMetrics.shipping,
      tax: salesMetrics.tax,
      discount: salesMetrics.discount,
      refunds: salesMetrics.refunds,
      count: salesMetrics.count,
      averageOrderValue: salesMetrics.averageOrderValue,
      timeline: orderTimeline
    },
    inventory: {
      total: inventoryMetrics.total,
      outOfStock: inventoryMetrics.outOfStock,
      lowStock: inventoryMetrics.lowStock,
      totalValue: inventoryMetrics.totalValue,
      totalStock: inventoryMetrics.totalStock,
      topProducts
    },
    customers: {
      total: totalUsers,
      new: newUsers,
      active: customerMetrics.activeUsers,
      averageLifetimeValue: totalUsers > 0 ? customerMetrics.totalRevenue / totalUsers : 0,
      timeline: orderTimeline.map((day) => ({
        date: day.date,
        newUsers: users.filter((u) => u.createdAt.split("T")[0] === day.date).length
      }))
    },
    orders: {
      total: salesMetrics.count,
      byStatus: orders.reduce((acc, order) => {
        const status = order.status?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byFulfillmentStatus: orders.reduce((acc, order) => {
        const status = order.fulfillmentStatus?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byPaymentStatus: orders.reduce((acc, order) => {
        const status = order.paymentStatus?.toLowerCase();
        if (status) acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      timeline: orderTimeline
    },
    shipping: {
      total: salesMetrics.shipping,
      methods: Object.values(shippingMetrics.methods).sort((a, b) => b.count - a.count)
    }
  };
}
var getAnalytics_default = getAnalytics;

// features/keystone/mutations/importInventory.ts
async function importInventory(root, { file }, context) {
  const batchJob = await context.query.BatchJob.createOne({
    data: {
      type: "INVENTORY_UPDATE",
      status: "CREATED",
      context: {
        fileKey: file,
        strategy: "INVENTORY"
      }
    },
    query: "id status"
  });
  return batchJob;
}
var importInventory_default = importInventory;

// import("../../integrations/shipping/**/*.ts") in features/keystone/utils/shippingProviderAdapter.ts
var globImport_integrations_shipping_ts = __glob({
  "../../integrations/shipping/index.ts": () => Promise.resolve().then(() => (init_shipping(), shipping_exports)),
  "../../integrations/shipping/manual.ts": () => Promise.resolve().then(() => (init_manual2(), manual_exports2)),
  "../../integrations/shipping/shipengine.ts": () => Promise.resolve().then(() => (init_shipengine(), shipengine_exports)),
  "../../integrations/shipping/shippo.ts": () => Promise.resolve().then(() => (init_shippo(), shippo_exports))
});

// features/keystone/utils/shippingProviderAdapter.ts
async function executeAdapterFunction2({
  provider,
  functionName,
  args
}) {
  const functionPath = provider[functionName];
  if (functionPath.startsWith("http")) {
    const response = await fetch(functionPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, ...args })
    });
    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.statusText}`);
    }
    return response.json();
  }
  const adapter = await globImport_integrations_shipping_ts(`../../integrations/shipping/${functionPath}.ts`);
  const fn = adapter[functionName];
  if (!fn) {
    throw new Error(
      `Function ${functionName} not found in adapter ${functionPath}`
    );
  }
  try {
    return await fn({ provider, ...args });
  } catch (error) {
    throw new Error(
      `Error executing ${functionName} for provider ${functionPath}: ${error.message}`
    );
  }
}
async function createLabel({ provider, order, rateId, dimensions, lineItems }) {
  return executeAdapterFunction2({
    provider,
    functionName: "createLabelFunction",
    args: { order, rateId, dimensions, lineItems }
  });
}
async function getRates({ provider, order, dimensions }) {
  return executeAdapterFunction2({
    provider,
    functionName: "getRatesFunction",
    args: { order, dimensions }
  });
}
async function validateAddress({ provider, address }) {
  return executeAdapterFunction2({
    provider,
    functionName: "validateAddressFunction",
    args: { address }
  });
}
async function trackShipment({ provider, trackingNumber }) {
  return executeAdapterFunction2({
    provider,
    functionName: "trackShipmentFunction",
    args: { trackingNumber }
  });
}
async function cancelLabel({ provider, labelId }) {
  return executeAdapterFunction2({
    provider,
    functionName: "cancelLabelFunction",
    args: { labelId }
  });
}

// features/keystone/oauth/scopes.ts
var SCOPE_TO_PERMISSIONS = {
  // Products
  "read_products": ["canReadProducts"],
  "write_products": ["canReadProducts", "canManageProducts"],
  // Orders  
  "read_orders": ["canReadOrders"],
  "write_orders": ["canReadOrders", "canManageOrders"],
  // Customers (maps to users in our system)
  "read_customers": ["canReadUsers"],
  "write_customers": ["canReadUsers", "canManageUsers"],
  // Fulfillments
  "read_fulfillments": ["canReadFulfillments"],
  "write_fulfillments": ["canReadFulfillments", "canManageFulfillments"],
  // Checkouts
  "read_checkouts": ["canReadCheckouts"],
  "write_checkouts": ["canReadCheckouts", "canManageCheckouts"],
  // Discounts
  "read_discounts": ["canReadDiscounts"],
  "write_discounts": ["canReadDiscounts", "canManageDiscounts"],
  // Gift Cards
  "read_gift_cards": ["canReadGiftCards"],
  "write_gift_cards": ["canReadGiftCards", "canManageGiftCards"],
  // Returns
  "read_returns": ["canReadReturns"],
  "write_returns": ["canReadReturns", "canManageReturns"],
  // Sales Channels
  "read_sales_channels": ["canReadSalesChannels"],
  "write_sales_channels": ["canReadSalesChannels", "canManageSalesChannels"],
  // Payments
  "read_payments": ["canReadPayments"],
  "write_payments": ["canReadPayments", "canManagePayments"],
  // Webhooks
  "read_webhooks": ["canReadWebhooks"],
  "write_webhooks": ["canReadWebhooks", "canManageWebhooks"],
  // Apps
  "read_apps": ["canReadApps"],
  "write_apps": ["canReadApps", "canManageApps"]
};
var AVAILABLE_SCOPES = Object.keys(SCOPE_TO_PERMISSIONS);
var DEFAULT_SCOPES = ["read_products", "read_orders"];

// features/keystone/access.ts
function isSignedIn({ session }) {
  return !!session;
}
function hasOAuthPermission(session, permission) {
  if (!session?.oauthScopes) return false;
  const scopes = session.oauthScopes;
  const grantedPermissions = /* @__PURE__ */ new Set();
  scopes.forEach((scope) => {
    const scopePermissions = SCOPE_TO_PERMISSIONS[scope];
    if (scopePermissions) {
      scopePermissions.forEach((p) => grantedPermissions.add(p));
    }
  });
  return grantedPermissions.has(permission);
}
function hasApiKeyPermission(session, permission) {
  if (!session?.apiKeyScopes) return false;
  const scopes = session.apiKeyScopes;
  const grantedPermissions = /* @__PURE__ */ new Set();
  scopes.forEach((scope) => {
    const scopePermissions = SCOPE_TO_PERMISSIONS[scope];
    if (scopePermissions) {
      scopePermissions.forEach((p) => grantedPermissions.add(p));
    }
  });
  return grantedPermissions.has(permission);
}
var generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function({ session }) {
      if (hasApiKeyPermission(session, permission)) {
        return true;
      }
      if (hasOAuthPermission(session, permission)) {
        return true;
      }
      const rolePermission = !!session?.data?.role?.[permission];
      return rolePermission;
    }
  ])
);
var permissions = {
  ...generatedPermissions
};
var rules = {
  canManageOrders({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageProducts({ session })) {
      return true;
    }
  },
  canManageProducts({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageProducts({ session })) {
      return true;
    }
  },
  canManageOrderItems({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageCart({ session })) {
      return true;
    }
  },
  canReadProducts({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageProducts({ session })) {
      return true;
    }
  },
  canManageUsers({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageUsers({ session })) {
      return true;
    }
    return { id: { equals: session?.itemId } };
  },
  canManageKeys({ session }) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageKeys({ session })) {
      return true;
    }
    return { user: { id: { equals: session?.itemId } } };
  }
};

// features/keystone/mutations/getRatesForOrder.ts
async function getRatesForOrder(root, { orderId, providerId, dimensions }, context) {
  const hasAccess = permissions.canReadOrders({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to get shipping rates"
    );
  }
  const sudoContext = context.sudo();
  try {
    const [order, provider] = await Promise.all([
      sudoContext.query.Order.findOne({
        where: { id: orderId },
        query: `
          id
          shippingAddress {
            firstName
            lastName
            company
            address1
            address2
            city
            province
            postalCode
            country {
              iso2
            }
            phone
          }
          lineItems {
            id
            quantity
            variantData
          }
        `
      }),
      sudoContext.query.ShippingProvider.findOne({
        where: { id: providerId },
        query: `
          id
          name
          accessToken
          getRatesFunction
          isActive
          fromAddress {
            firstName
            lastName
            company
            address1
            address2
            city
            province
            postalCode
            country {
              iso2
            }
            phone
          }
        `
      })
    ]);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    if (!provider) {
      throw new Error(`Shipping provider not found: ${providerId}`);
    }
    if (!provider.isActive) {
      throw new Error(`Shipping provider ${provider.id} is not active`);
    }
    if (!provider.accessToken) {
      throw new Error(`Shipping provider ${provider.id} has no access token configured`);
    }
    let packageDimensions = dimensions;
    if (!packageDimensions) {
      let maxLength = 0;
      let maxWidth = 0;
      let maxHeight = 0;
      let totalWeight = 0;
      let hasDimensions = false;
      let weightUnit = null;
      let dimensionUnit = null;
      order.lineItems.forEach((item) => {
        const variant = item.variantData;
        if (variant?.measurements?.length) {
          hasDimensions = true;
          variant.measurements.forEach((measurement) => {
            const { type, value, unit } = measurement;
            switch (type) {
              case "weight":
                totalWeight += value * item.quantity;
                weightUnit = unit;
                break;
              case "length":
                maxLength = Math.max(maxLength, value);
                dimensionUnit = unit;
                break;
              case "width":
                maxWidth = Math.max(maxWidth, value);
                dimensionUnit = unit;
                break;
              case "height":
                maxHeight = Math.max(maxHeight, value);
                dimensionUnit = unit;
                break;
            }
          });
        }
      });
      if (!hasDimensions) {
        throw new Error("No dimensions found for line items. Dimensions must be provided to get shipping rates.");
      }
      packageDimensions = {
        length: maxLength,
        width: maxWidth,
        height: maxHeight,
        weight: totalWeight,
        unit: dimensionUnit || "cm",
        // Default unit
        weightUnit: weightUnit || "kg"
        // Default weight unit
      };
    }
    const rates = await getRates({
      provider: {
        ...provider,
        accessToken: provider.accessToken
      },
      order,
      dimensions: packageDimensions
    });
    return rates.map((rate) => ({
      id: rate.id,
      provider: provider.name,
      service: rate.service,
      carrier: rate.carrier,
      price: rate.price,
      estimatedDays: rate.estimatedDays
    }));
  } catch (error) {
    console.error("Getting shipping rates failed:", error);
    throw error;
  }
}
var getRatesForOrder_default = getRatesForOrder;

// features/keystone/mutations/validateShippingAddress.ts
async function validateShippingAddress(root, { providerId, address }, context) {
  const hasAccess = permissions.canReadOrders({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to validate shipping addresses"
    );
  }
  const provider = await context.db.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      validateAddressFunction
      isActive
    `
  });
  if (!provider) throw new Error("Provider not found");
  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }
  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }
  return validateAddress({
    provider: {
      ...provider,
      accessToken: provider.accessToken
    },
    address
  });
}
var validateShippingAddress_default = validateShippingAddress;

// features/keystone/mutations/trackShipment.ts
async function trackShipment2(root, { providerId, trackingNumber }, context) {
  const hasAccess = permissions.canReadOrders({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to track shipments"
    );
  }
  const provider = await context.db.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      trackShipmentFunction
      isActive
    `
  });
  if (!provider) throw new Error("Provider not found");
  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }
  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }
  return trackShipment({
    provider: {
      ...provider,
      accessToken: provider.accessToken
    },
    trackingNumber
  });
}
var trackShipment_default = trackShipment2;

// features/keystone/mutations/cancelShippingLabel.ts
async function cancelShippingLabel(root, { providerId, labelId }, context) {
  const hasAccess = permissions.canReadOrders({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to cancel shipping labels"
    );
  }
  const provider = await context.db.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
      id
      accessToken
      metadata
      cancelLabelFunction
      isActive
    `
  });
  if (!provider) throw new Error("Provider not found");
  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }
  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }
  return cancelLabel({
    provider: {
      ...provider,
      accessToken: provider.accessToken
    },
    labelId
  });
}
var cancelShippingLabel_default = cancelShippingLabel;

// features/keystone/mutations/createProviderShippingLabel.ts
async function createProviderShippingLabel(root, { orderId, providerId, rateId, dimensions, lineItems }, context) {
  const hasAccess = permissions.canManageFulfillments({ session: context.session });
  if (!hasAccess) {
    throw new Error("Access denied: You do not have permission to create shipping labels");
  }
  const order = await context.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      lineItems {
        id
        quantity
      }
      fulfillments {
        canceledAt
        fulfillmentItems {
          quantity
          lineItem {
            id
          }
        }
      }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        country {
          iso2
        }
        phone
      }
    `
  });
  if (!order?.lineItems) {
    throw new Error("Order not found or has no line items");
  }
  if (!lineItems?.length) {
    throw new Error("No items to fulfill");
  }
  const unfulfilledQuantities = {};
  order.lineItems.forEach((item) => {
    unfulfilledQuantities[item.id] = item.quantity;
  });
  order.fulfillments?.forEach((fulfillment2) => {
    if (fulfillment2.canceledAt) {
      return;
    }
    fulfillment2.fulfillmentItems?.forEach((item) => {
      unfulfilledQuantities[item.lineItem.id] -= item.quantity;
    });
  });
  for (const item of lineItems) {
    const availableQuantity = unfulfilledQuantities[item.lineItemId] || 0;
    if (availableQuantity <= 0) {
      throw new Error(`Line item ${item.lineItemId} has no unfulfilled quantity`);
    }
    if (item.quantity > availableQuantity) {
      throw new Error(`Cannot fulfill more than ${availableQuantity} items for line item ${item.lineItemId}`);
    }
  }
  const provider = await context.query.ShippingProvider.findOne({
    where: { id: providerId },
    query: `
        id 
        name 
        createLabelFunction
        accessToken
        isActive
        fromAddress {
          firstName
          lastName
          company
          address1
          address2
          city
          province
          postalCode
          country {
            iso2
          }
          phone
        }
      `
  });
  if (!provider) {
    throw new Error(`Shipping provider not found: ${providerId}`);
  }
  if (!provider.isActive) {
    throw new Error(`Shipping provider ${provider.id} is not active`);
  }
  if (!provider.accessToken) {
    throw new Error(`Shipping provider ${provider.id} has no access token configured`);
  }
  const labelData = await createLabel({
    provider,
    order,
    rateId,
    dimensions,
    lineItems
  });
  const fulfillment = await context.query.Fulfillment.createOne({
    data: {
      order: { connect: { id: orderId } },
      fulfillmentItems: {
        create: lineItems.map((item) => ({
          lineItem: { connect: { id: item.lineItemId } },
          quantity: item.quantity
        }))
      },
      shippingLabels: {
        create: [{
          status: "purchased",
          provider: { connect: { id: providerId } },
          labelUrl: labelData.labelUrl,
          carrier: labelData.carrier,
          service: labelData.service,
          trackingNumber: labelData.trackingNumber,
          trackingUrl: labelData.trackingUrl,
          rate: labelData.rate,
          data: labelData.data
        }]
      },
      metadata: {
        source: "admin",
        createdBy: "admin"
      }
    },
    query: `
        id
        shippingLabels {
          id
          status
          trackingNumber
          trackingUrl
          labelUrl
          carrier
          service
          data
        }
      `
  });
  return fulfillment.shippingLabels[0];
}
var createProviderShippingLabel_default = createProviderShippingLabel;

// features/keystone/mutations/regenerateCustomerToken.ts
async function regenerateCustomerToken(root, args, context) {
  const userId = context.session?.itemId;
  if (!userId) {
    throw new Error("Authentication required");
  }
  const sudoContext = context.sudo();
  try {
    const accounts = await sudoContext.query.Account.findMany({
      where: {
        user: { id: { equals: userId } },
        status: { equals: "active" },
        accountType: { equals: "business" }
      },
      query: "id"
    });
    const activeAccount = accounts[0];
    if (!activeAccount) {
      throw new Error("No active account found. Customer token can only be regenerated for users with active accounts.");
    }
    const crypto3 = require("crypto");
    const newToken = "ctok_" + crypto3.randomBytes(32).toString("hex");
    await sudoContext.query.User.updateOne({
      where: { id: userId },
      data: {
        customerToken: newToken,
        tokenGeneratedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    return {
      success: true,
      token: newToken
    };
  } catch (error) {
    console.error("Error regenerating customer token:", error);
    throw error;
  }
}
var regenerateCustomerToken_default = regenerateCustomerToken;

// features/keystone/mutations/getCustomerAccount.ts
async function getCustomerAccount(root, { accountId }, context) {
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  const sudoContext = context.sudo();
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      accountNumber
      title
      description
      status
      totalAmount
      paidAmount
      creditLimit
      formattedTotal
      formattedBalance
      formattedCreditLimit
      availableCredit
      formattedAvailableCredit
      balanceDue
      dueDate
      paidAt
      createdAt
      accountType
      currency {
        id
        code
        symbol
      }
      user {
        id
        email
        name
      }
      orders {
        id
        displayId
        status
        total
        createdAt
        lineItems {
          id
          title
          quantity
          thumbnail
        }
      }
      lineItems {
        id
        description
        amount
        formattedAmount
        orderDisplayId
        itemCount
        paymentStatus
        createdAt
        orderDetails
      }
    `
  });
  if (!account) {
    throw new Error("Account not found");
  }
  if (account.user?.id !== context.session.itemId) {
    throw new Error("Account not found");
  }
  return account;
}
var getCustomerAccount_default = getCustomerAccount;

// features/keystone/mutations/getCustomerAccounts.ts
async function getCustomerAccounts(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  const sudoContext = context.sudo();
  const accounts = await sudoContext.query.Account.findMany({
    where: {
      user: { id: { equals: context.session.itemId } }
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    query: `
      id
      accountNumber
      title
      status
      totalAmount
      paidAmount
      creditLimit
      formattedTotal
      formattedBalance
      formattedCreditLimit
      availableCredit
      formattedAvailableCredit
      balanceDue
      dueDate
      createdAt
      accountType
      currency {
        id
        code
        symbol
      }
      lineItems {
        id
        description
        amount
        formattedAmount
        orderDisplayId
        itemCount
        paymentStatus
        createdAt
        order {
          id
        }
      }
      unpaidLineItemsByRegion
    `
  });
  return accounts;
}
var getCustomerAccounts_default = getCustomerAccounts;

// features/keystone/mutations/payInvoice.ts
async function payInvoice(root, { invoiceId, paymentData }, context) {
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      totalAmount
      status
      currency {
        id
        code
        noDivisionCurrency
      }
      account {
        id
        totalAmount
        paidAmount
        currency {
          id
          code
        }
      }
      user {
        id
        email
      }
      lineItems {
        id
        accountLineItem {
          id
          amount
          paymentStatus
        }
      }
    `
  });
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  if (invoice.status === "paid") {
    throw new Error("Invoice is already paid");
  }
  if (!context.session?.itemId || invoice.user.id !== context.session.itemId) {
    throw new Error("Unauthorized to pay this invoice");
  }
  try {
    let paymentResult;
    switch (paymentData.paymentMethod) {
      case "stripe":
        paymentResult = await processStripePayment(paymentData, invoice);
        break;
      case "paypal":
        paymentResult = await processPayPalPayment(paymentData, invoice);
        break;
      case "manual":
        paymentResult = {
          status: "succeeded",
          paymentIntentId: `manual_${Date.now()}`,
          data: paymentData
        };
        break;
      default:
        throw new Error(`Unsupported payment method: ${paymentData.paymentMethod}`);
    }
    if (paymentResult.status !== "succeeded") {
      throw new Error(`Payment failed: ${paymentResult.error}`);
    }
    const updates = await sudoContext.prisma.$transaction(async (tx) => {
      const updatedInvoice = await sudoContext.query.Invoice.updateOne({
        where: { id: invoiceId },
        data: {
          status: "paid",
          paidAt: (/* @__PURE__ */ new Date()).toISOString(),
          metadata: {
            ...invoice.metadata,
            paymentResult,
            paidAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        }
      });
      const lineItemUpdates = [];
      for (const lineItem of invoice.lineItems) {
        if (lineItem.accountLineItem.paymentStatus !== "paid") {
          const updated = await sudoContext.query.AccountLineItem.updateOne({
            where: { id: lineItem.accountLineItem.id },
            data: { paymentStatus: "paid" }
          });
          lineItemUpdates.push(updated);
        }
      }
      const totalLineItemAmount = invoice.lineItems.reduce(
        (sum, item) => sum + (item.accountLineItem.amount || 0),
        0
      );
      const convertCurrency2 = (init_currencyConversion(), __toCommonJS(currencyConversion_exports)).default;
      const convertedAmount = invoice.currency.code !== invoice.account.currency.code ? await convertCurrency2(totalLineItemAmount, invoice.currency.code, invoice.account.currency.code) : totalLineItemAmount;
      const updatedAccount = await sudoContext.query.Account.updateOne({
        where: { id: invoice.account.id },
        data: {
          paidAmount: (invoice.account.paidAmount || 0) + convertedAmount
        }
      });
      const payment = await sudoContext.query.Payment.createOne({
        data: {
          status: "captured",
          amount: invoice.totalAmount,
          currencyCode: invoice.currency.code,
          data: paymentResult,
          capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
          user: { connect: { id: invoice.user.id } },
          // Note: Need to add invoice relationship to Payment model
          metadata: {
            invoiceId,
            paymentMethod: paymentData.paymentMethod,
            accountId: invoice.account.id
          }
        }
      });
      return {
        invoice: updatedInvoice,
        account: updatedAccount,
        payment,
        lineItemUpdates
      };
    });
    return {
      success: true,
      invoice: updates.invoice,
      payment: updates.payment,
      message: `Payment of ${invoice.totalAmount / (invoice.currency.noDivisionCurrency ? 1 : 100)} ${invoice.currency.code} processed successfully`
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    throw new Error(`Payment failed: ${error.message}`);
  }
}
async function processStripePayment(paymentData, invoice) {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  if (!stripe) {
    throw new Error("Stripe not configured");
  }
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: invoice.totalAmount,
      currency: invoice.currency.code.toLowerCase(),
      payment_method: paymentData.paymentMethodId,
      confirmation_method: "manual",
      confirm: true,
      metadata: {
        invoiceId: invoice.id,
        accountId: invoice.account.id,
        userId: invoice.user.id
      }
    });
    return {
      status: paymentIntent.status === "succeeded" ? "succeeded" : "failed",
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.status !== "succeeded" ? `Stripe status: ${paymentIntent.status}` : null,
      data: paymentIntent
    };
  } catch (error) {
    return {
      status: "failed",
      paymentIntentId: null,
      error: error.message,
      data: error
    };
  }
}
async function processPayPalPayment(paymentData, invoice) {
  try {
    const authResponse = await fetch(`${process.env.PAYPAL_API_URL || "https://api.paypal.com"}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")}`
      },
      body: "grant_type=client_credentials"
    });
    if (!authResponse.ok) {
      throw new Error("PayPal authentication failed");
    }
    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    const captureResponse = await fetch(`${process.env.PAYPAL_API_URL || "https://api.paypal.com"}/v2/checkout/orders/${paymentData.orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    if (!captureResponse.ok) {
      throw new Error(`PayPal capture failed: ${captureResponse.status}`);
    }
    const captureData = await captureResponse.json();
    return {
      status: captureData.status === "COMPLETED" ? "succeeded" : "failed",
      paymentIntentId: paymentData.orderId,
      error: captureData.status !== "COMPLETED" ? `PayPal status: ${captureData.status}` : null,
      data: captureData
    };
  } catch (error) {
    return {
      status: "failed",
      paymentIntentId: paymentData.orderId,
      error: error.message,
      data: error
    };
  }
}
var payInvoice_default = payInvoice;

// features/keystone/mutations/createInvoiceFromLineItems.ts
async function createInvoiceFromLineItems(root, { accountId, regionId, lineItemIds, dueDate }, context) {
  const sudoContext = context.sudo();
  if (!context.session?.itemId) {
    throw new Error("Authentication required");
  }
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      user {
        id
        email
      }
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      totalAmount
      paidAmount
    `
  });
  if (!account) {
    throw new Error("Account not found");
  }
  if (account.user.id !== context.session.itemId) {
    throw new Error("Unauthorized access to account");
  }
  const region2 = await sudoContext.query.Region.findOne({
    where: { id: regionId },
    query: `
      id
      name
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
    `
  });
  if (!region2) {
    throw new Error("Region not found");
  }
  const lineItems = await sudoContext.query.AccountLineItem.findMany({
    where: {
      id: { in: lineItemIds },
      account: { id: { equals: accountId } },
      region: { id: { equals: regionId } },
      paymentStatus: { equals: "unpaid" }
    },
    query: `
      id
      amount
      description
      orderDisplayId
      itemCount
      paymentStatus
      createdAt
      region {
        id
        currency {
          code
        }
      }
    `
  });
  if (!lineItems.length) {
    throw new Error("No valid unpaid line items found");
  }
  if (lineItems.length !== lineItemIds.length) {
    throw new Error(`Some line items were not found, are already paid, or are not from ${region2.name} region`);
  }
  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  if (totalAmount <= 0) {
    throw new Error("Invoice total must be greater than zero");
  }
  try {
    const result = await sudoContext.prisma.$transaction(async (tx) => {
      const invoice = await sudoContext.query.Invoice.createOne({
        data: {
          user: { connect: { id: account.user.id } },
          account: { connect: { id: accountId } },
          currency: { connect: { id: region2.currency.id } },
          totalAmount,
          title: `${region2.name} Invoice for Account ${account.id}`,
          description: `Payment invoice for ${lineItems.length} ${region2.name} orders (${lineItems.map((item) => `#${item.orderDisplayId}`).join(", ")})`,
          status: "sent",
          // Ready for payment
          dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
          // Default 30 days
          metadata: {
            regionId,
            regionName: region2.name,
            createdFromLineItems: lineItemIds,
            orderDisplayIds: lineItems.map((item) => item.orderDisplayId),
            itemCount: lineItems.reduce((sum, item) => sum + (item.itemCount || 0), 0)
          }
        }
      });
      const invoiceLineItems = [];
      for (const lineItem of lineItems) {
        const invoiceLineItem = await sudoContext.query.InvoiceLineItem.createOne({
          data: {
            invoice: { connect: { id: invoice.id } },
            accountLineItem: { connect: { id: lineItem.id } }
          }
        });
        invoiceLineItems.push(invoiceLineItem);
      }
      return {
        invoice: {
          ...invoice,
          lineItems: invoiceLineItems
        }
      };
    });
    const completeInvoice = await sudoContext.query.Invoice.findOne({
      where: { id: result.invoice.id },
      query: `
        id
        invoiceNumber
        title
        description
        totalAmount
        formattedTotal
        status
        dueDate
        createdAt
        currency {
          code
          symbol
        }
        lineItems {
          id
          orderDisplayId
          formattedAmount
          accountLineItem {
            id
            description
            orderDisplayId
            itemCount
          }
        }
        itemCount
      `
    });
    return {
      success: true,
      invoice: completeInvoice,
      message: `Invoice created with ${lineItems.length} orders totaling ${completeInvoice.formattedTotal}`
    };
  } catch (error) {
    console.error("Invoice creation error:", error);
    throw new Error(`Failed to create invoice: ${error.message}`);
  }
}
var createInvoiceFromLineItems_default = createInvoiceFromLineItems;

// features/keystone/mutations/getUnpaidLineItemsByRegion.ts
async function getUnpaidLineItemsByRegion(root, { accountId }, context) {
  const sudoContext = context.sudo();
  if (!context.session?.itemId) {
    throw new Error("Authentication required");
  }
  const account = await sudoContext.query.Account.findOne({
    where: { id: accountId },
    query: `
      id
      user {
        id
        email
      }
    `
  });
  if (!account) {
    throw new Error("Account not found");
  }
  if (account.user.id !== context.session.itemId) {
    throw new Error("Unauthorized access to account");
  }
  try {
    const unpaidLineItems = await sudoContext.query.AccountLineItem.findMany({
      where: {
        account: { id: { equals: accountId } },
        paymentStatus: { equals: "unpaid" }
      },
      query: `
        id
        amount
        description
        orderDisplayId
        itemCount
        createdAt
        order {
          id
        }
        region {
          id
          name
          currency {
            id
            code
            symbol
            noDivisionCurrency
          }
        }
      `,
      orderBy: { createdAt: "desc" }
    });
    const lineItemsByRegion = unpaidLineItems.reduce((acc, item) => {
      const regionId = item.region.id;
      const regionName = item.region.name;
      const currency = item.region.currency;
      if (!acc[regionId]) {
        acc[regionId] = {
          region: {
            id: regionId,
            name: regionName,
            currency
          },
          lineItems: [],
          totalAmount: 0,
          itemCount: 0
        };
      }
      acc[regionId].lineItems.push({
        id: item.id,
        amount: item.amount,
        description: item.description,
        orderDisplayId: item.orderDisplayId,
        itemCount: item.itemCount,
        createdAt: item.createdAt,
        formattedAmount: formatCurrencyAmount2(item.amount, currency.code),
        order: item.order
      });
      acc[regionId].totalAmount += item.amount || 0;
      acc[regionId].itemCount += item.itemCount || 0;
      return acc;
    }, {});
    const regionsWithLineItems = Object.values(lineItemsByRegion).map((regionData) => ({
      ...regionData,
      formattedTotalAmount: formatCurrencyAmount2(
        regionData.totalAmount,
        regionData.region.currency.code
      )
    }));
    regionsWithLineItems.sort((a, b) => b.totalAmount - a.totalAmount);
    return {
      success: true,
      regions: regionsWithLineItems,
      totalRegions: regionsWithLineItems.length,
      totalUnpaidItems: unpaidLineItems.length,
      message: `Found ${unpaidLineItems.length} unpaid orders across ${regionsWithLineItems.length} regions`
    };
  } catch (error) {
    console.error("Error getting unpaid line items by region:", error);
    throw new Error(`Failed to get unpaid line items: ${error.message}`);
  }
}
function formatCurrencyAmount2(amount, currencyCode) {
  const currency = currencyCode.toUpperCase();
  const noDivisionCurrencies = ["JPY", "KRW", "VND"];
  const divisor = noDivisionCurrencies.includes(currency) ? 1 : 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount / divisor);
}
var getUnpaidLineItemsByRegion_default = getUnpaidLineItemsByRegion;

// features/keystone/mutations/index.ts
var graphql = String.raw;
var extendGraphqlSchema = (schema) => (0, import_schema.mergeSchemas)({
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
        getAnalytics(timeframe: String): JSON
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
        invoice: Invoice
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
      }
    `,
  resolvers: {
    Query: {
      redirectToInit: redirectToInit_default,
      activeCart: activeCart_default,
      activeCartShippingOptions: activeCartShippingOptions_default,
      activeCartPaymentProviders: activeCartPaymentProviders_default,
      activeCartRegion: activeCartRegion_default,
      getCustomerOrder: getCustomerOrder_default,
      getCustomerOrders: getCustomerOrders_default,
      getCustomerAccount: getCustomerAccount_default,
      getCustomerAccounts: getCustomerAccounts_default,
      getUnpaidLineItemsByRegion: getUnpaidLineItemsByRegion_default,
      getAnalytics: getAnalytics_default
    },
    Mutation: {
      updateActiveUserPassword: updateActiveUserPassword_default,
      updateActiveCart: updateActiveCart_default,
      updateActiveCartLineItem: updateActiveCartLineItem_default,
      updateActiveUser: updateActiveUser_default,
      createActiveUserAddress: createActiveUserAddress_default,
      updateActiveUserAddress: updateActiveUserAddress_default,
      deleteActiveUserAddress: deleteActiveUserAddress_default,
      addDiscountToActiveCart: addDiscountToActiveCart_default,
      removeDiscountFromActiveCart: removeDiscountFromActiveCart_default,
      createActiveCartPaymentSessions: createActiveCartPaymentSessions_default,
      setActiveCartPaymentSession: setActiveCartPaymentSession_default,
      completeActiveCart: completeActiveCart_default,
      addActiveCartShippingMethod: addActiveCartShippingMethod_default,
      initiatePaymentSession: initiatePaymentSession_default,
      handlePaymentProviderWebhook: handlePaymentProviderWebhook_default,
      getAnalytics: getAnalytics_default,
      importInventory: importInventory_default,
      getRatesForOrder: getRatesForOrder_default,
      validateShippingAddress: validateShippingAddress_default,
      trackShipment: trackShipment_default,
      cancelShippingLabel: cancelShippingLabel_default,
      createProviderShippingLabel: createProviderShippingLabel_default,
      regenerateCustomerToken: regenerateCustomerToken_default,
      payInvoice: payInvoice_default,
      createInvoiceFromLineItems: createInvoiceFromLineItems_default
    }
  }
});

// features/keystone/models/Address.ts
var import_core = require("@keystone-6/core");
var import_fields4 = require("@keystone-6/core/fields");

// features/keystone/models/trackingFields.ts
var import_fields3 = require("@keystone-6/core/fields");
var trackingFields = {
  createdAt: (0, import_fields3.timestamp)({
    access: { read: () => true, create: () => false, update: () => false },
    validation: { isRequired: true },
    defaultValue: { kind: "now" },
    ui: {
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" }
    }
  }),
  updatedAt: (0, import_fields3.timestamp)({
    access: { read: () => true, create: () => false, update: () => false },
    db: { updatedAt: true },
    validation: { isRequired: true },
    defaultValue: { kind: "now" },
    ui: {
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" }
    }
  })
};

// features/keystone/models/Address.ts
var canManageAddresses = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { user: { id: { equals: session?.itemId } } };
};
var Address = (0, import_core.list)({
  access: {
    operation: {
      create: () => true,
      query: isSignedIn,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    },
    filter: {
      query: canManageAddresses,
      update: canManageAddresses,
      delete: canManageAddresses
    }
  },
  fields: {
    label: (0, import_fields4.virtual)({
      field: import_core.graphql.field({
        type: import_core.graphql.String,
        resolve(item) {
          const parts = [];
          if (item.company) {
            parts.push(item.company);
          }
          if (item.firstName || item.lastName) {
            parts.push(`${item.firstName || ""} ${item.lastName || ""}`.trim());
          }
          if (item.address1) {
            parts.push(item.address1);
          }
          if (item.address2) {
            parts.push(item.address2);
          }
          const cityProvince = [];
          if (item.city) cityProvince.push(item.city);
          if (item.province) cityProvince.push(item.province);
          if (cityProvince.length > 0) {
            parts.push(cityProvince.join(", ") + (item.postalCode ? ` ${item.postalCode}` : ""));
          } else if (item.postalCode) {
            parts.push(item.postalCode);
          }
          return parts.join(" \u2022 ");
        }
      })
    }),
    company: (0, import_fields4.text)(),
    firstName: (0, import_fields4.text)(),
    lastName: (0, import_fields4.text)(),
    address1: (0, import_fields4.text)(),
    address2: (0, import_fields4.text)(),
    city: (0, import_fields4.text)(),
    province: (0, import_fields4.text)(),
    postalCode: (0, import_fields4.text)(),
    phone: (0, import_fields4.text)(),
    isBilling: (0, import_fields4.checkbox)({ defaultValue: false }),
    metadata: (0, import_fields4.json)(),
    country: (0, import_fields4.relationship)({
      ref: "Country.addresses",
      many: false,
      validation: { isRequired: true }
    }),
    user: (0, import_fields4.relationship)({
      ref: "User.addresses",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === "create" || operation === "update") && !resolvedData.user && context.session?.itemId) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        }
      }
    }),
    shippingProviders: (0, import_fields4.relationship)({
      ref: "ShippingProvider.fromAddress",
      many: true
    }),
    cart: (0, import_fields4.relationship)({
      ref: "Cart.addresses",
      many: false
    }),
    claimOrders: (0, import_fields4.relationship)({
      ref: "ClaimOrder.address",
      many: true
    }),
    ordersUsingAsBillingAddress: (0, import_fields4.relationship)({
      ref: "Order.billingAddress",
      many: true
    }),
    ordersUsingAsShippingAddress: (0, import_fields4.relationship)({
      ref: "Order.shippingAddress",
      many: true
    }),
    cartsUsingAsBillingAddress: (0, import_fields4.relationship)({
      ref: "Cart.billingAddress",
      many: true
    }),
    cartsUsingAsShippingAddress: (0, import_fields4.relationship)({
      ref: "Cart.shippingAddress",
      many: true
    }),
    swaps: (0, import_fields4.relationship)({
      ref: "Swap.address",
      many: true
    }),
    ...trackingFields
  },
  ui: {
    labelField: "label"
  }
});

// features/keystone/models/ApiKey.ts
var import_fields5 = require("@keystone-6/core/fields");
var import_core2 = require("@keystone-6/core");
var ApiKey = (0, import_core2.list)({
  access: {
    operation: {
      query: isSignedIn,
      create: permissions.canManageKeys,
      update: permissions.canManageKeys,
      delete: permissions.canManageKeys
    },
    filter: {
      query: rules.canManageKeys,
      update: rules.canManageKeys,
      delete: rules.canManageKeys
    }
  },
  hooks: {
    validate: {
      create: async ({ resolvedData, addValidationError }) => {
        if (!resolvedData.scopes || resolvedData.scopes.length === 0) {
          addValidationError("At least one scope is required for API keys");
        }
      }
    },
    resolveInput: {
      create: async ({ resolvedData, context }) => {
        return {
          ...resolvedData,
          user: resolvedData.user || (context.session?.itemId ? { connect: { id: context.session.itemId } } : void 0)
        };
      }
    }
  },
  fields: {
    name: (0, import_fields5.text)({
      validation: { isRequired: true },
      ui: {
        description: "A descriptive name for this API key (e.g. 'Production Bot', 'Analytics Dashboard')"
      }
    }),
    tokenSecret: (0, import_fields5.password)({
      validation: { isRequired: true },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
        description: "Secure API key token (hashed and never displayed)"
      }
    }),
    tokenPreview: (0, import_fields5.text)({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        listView: { fieldMode: "read" },
        description: "Preview of the API key (actual key is hidden for security)"
      }
    }),
    scopes: (0, import_fields5.json)({
      defaultValue: [],
      ui: {
        description: "Array of scopes for this API key. Available scopes: orders:read, orders:write, shops:read, shops:write, channels:read, channels:write, etc."
      }
    }),
    status: (0, import_fields5.select)({
      type: "enum",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Revoked", value: "revoked" }
      ],
      defaultValue: "active",
      ui: {
        description: "Current status of this API key"
      }
    }),
    expiresAt: (0, import_fields5.timestamp)({
      ui: {
        description: "When this API key expires (optional - leave blank for no expiration)"
      }
    }),
    lastUsedAt: (0, import_fields5.timestamp)({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Last time this API key was used"
      }
    }),
    usageCount: (0, import_fields5.json)({
      defaultValue: { total: 0, daily: {} },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Usage statistics for this API key"
      }
    }),
    restrictedToIPs: (0, import_fields5.json)({
      defaultValue: [],
      ui: {
        description: "Optional: Restrict this key to specific IP addresses (array of IPs)"
      }
    }),
    user: (0, import_fields5.relationship)({
      ref: "User.apiKeys",
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      }
    }),
    ...trackingFields
  },
  ui: {
    labelField: "name",
    listView: {
      initialColumns: ["name", "tokenPreview", "scopes", "status", "lastUsedAt", "expiresAt"]
    },
    description: "Secure API keys for programmatic access to Openfront"
  }
});

// features/keystone/models/BatchJob.ts
var import_core3 = require("@keystone-6/core");
var import_fields6 = require("@keystone-6/core/fields");
var BatchJob = (0, import_core3.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    type: (0, import_fields6.select)({
      type: "enum",
      options: [
        { label: "Product Import", value: "PRODUCT_IMPORT" },
        { label: "Order Export", value: "ORDER_EXPORT" },
        { label: "Inventory Update", value: "INVENTORY_UPDATE" },
        { label: "Price Update", value: "PRICE_UPDATE" }
      ],
      validation: { isRequired: true }
    }),
    status: (0, import_fields6.select)({
      type: "enum",
      options: [
        { label: "Created", value: "CREATED" },
        { label: "Processing", value: "PROCESSING" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Failed", value: "FAILED" },
        { label: "Canceled", value: "CANCELED" }
      ],
      defaultValue: "CREATED",
      validation: { isRequired: true }
    }),
    context: (0, import_fields6.json)({
      defaultValue: {}
    }),
    result: (0, import_fields6.json)({
      defaultValue: {}
    }),
    error: (0, import_fields6.text)(),
    progress: (0, import_fields6.integer)({
      defaultValue: 0,
      validation: {
        min: 0,
        max: 100
      }
    }),
    createdBy: (0, import_fields6.relationship)({
      ref: "User.batchJobs",
      many: false
    }),
    completedAt: (0, import_fields6.timestamp)(),
    ...trackingFields
  }
});

// features/keystone/models/Capture.ts
var import_core4 = require("@keystone-6/core");
var import_fields7 = require("@keystone-6/core/fields");
var Capture = (0, import_core4.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    amount: (0, import_fields7.integer)({
      validation: {
        isRequired: true
      }
    }),
    payment: (0, import_fields7.relationship)({
      ref: "Payment.captures"
    }),
    metadata: (0, import_fields7.json)(),
    createdBy: (0, import_fields7.text)(),
    ...trackingFields
  }
});

// features/keystone/models/Cart.ts
var import_core5 = require("@keystone-6/core");
var import_fields8 = require("@keystone-6/core/fields");
var formatCurrency = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
};
async function calculateCartSubtotal(cart, context) {
  const sudoContext = context.sudo();
  if (!cart?.lineItems?.length) return 0;
  let subtotal = 0;
  for (const lineItem of cart.lineItems) {
    const prices = await sudoContext.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: lineItem.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region?.currency?.code } }
      },
      query: "calculatedPrice { calculatedAmount }"
    });
    const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
    subtotal += price * lineItem.quantity;
  }
  return subtotal;
}
async function calculateCartDiscount(cart, context) {
  const sudoContext = context.sudo();
  if (!cart?.discounts?.length) return 0;
  const subtotal = await calculateCartSubtotal(cart, context);
  let discountAmount = 0;
  for (const discount of cart.discounts) {
    if (!discount.discountRule?.type) continue;
    switch (discount.discountRule.type) {
      case "percentage":
        discountAmount += subtotal * (discount.discountRule.value / 100);
        break;
      case "fixed":
        discountAmount += discount.discountRule.value * (cart.region?.currency?.noDivisionCurrency ? 1 : 100);
        break;
      case "free_shipping":
        discountAmount += cart.shippingMethods?.reduce(
          (total, method) => total + (method.price || 0),
          0
        ) || 0;
        break;
    }
  }
  return discountAmount;
}
async function calculateCartShipping(cart) {
  if (!cart?.shippingMethods?.length) return 0;
  return cart.shippingMethods.reduce(
    (total, method) => total + (method.price || 0),
    0
  );
}
async function calculateCartTax(cart, context) {
  const subtotal = await calculateCartSubtotal(cart, context);
  const discount = await calculateCartDiscount(cart, context);
  const taxableAmount = subtotal - discount;
  return taxableAmount * (cart.region?.taxRate || 0);
}
async function calculateCartTotal(cart, context) {
  const [subtotal, discount, shipping, tax] = await Promise.all([
    calculateCartSubtotal(cart, context),
    calculateCartDiscount(cart, context),
    calculateCartShipping(cart),
    calculateCartTax(cart, context)
  ]);
  return subtotal - discount + shipping + tax;
}
async function findCheapestShippingOption(regionId, context) {
  const sudoContext = context.sudo();
  const shippingOptions = await sudoContext.query.ShippingOption.findMany({
    where: {
      region: { id: { equals: regionId } },
      isReturn: { equals: false }
    },
    query: `
      id
      amount
      name
    `,
    orderBy: { amount: "asc" }
  });
  return shippingOptions[0];
}
var Cart = (0, import_core5.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: () => true,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    },
    filter: {
      query: ({ session }) => {
        if (!session) return false;
        if (permissions.canManageOrders({ session })) return true;
        return { user: { id: { equals: session.itemId } } };
      },
      update: ({ session }) => {
        if (!session) return false;
        if (permissions.canManageOrders({ session })) return true;
        return { user: { id: { equals: session.itemId } } };
      }
    }
  },
  hooks: {
    async beforeOperation({ operation, resolvedData, context, item }) {
      const sudoContext = context.sudo();
      if (operation === "create" && context.session?.itemId) {
        resolvedData.user = { connect: { id: context.session.itemId } };
      }
      if (operation === "create" && resolvedData.region || operation === "update" && resolvedData.region && item?.region?.id !== resolvedData.region.connect?.id) {
        const regionId = operation === "create" ? resolvedData.region.connect.id : resolvedData.region.connect.id;
        const cheapestOption = await findCheapestShippingOption(regionId, context);
        if (operation === "create") {
          if (cheapestOption) {
            resolvedData.shippingMethods = {
              create: [{
                shippingOption: { connect: { id: cheapestOption.id } },
                price: cheapestOption.amount,
                data: { name: cheapestOption.name }
              }]
            };
          }
        } else {
          if (item.shippingMethods?.length) {
            await Promise.all(
              item.shippingMethods.map(
                (method) => sudoContext.db.ShippingMethod.deleteOne({
                  where: { id: method.id }
                })
              )
            );
          }
          if (cheapestOption) {
            await sudoContext.db.ShippingMethod.createOne({
              data: {
                cart: { connect: { id: item.id } },
                shippingOption: { connect: { id: cheapestOption.id } },
                price: cheapestOption.amount,
                data: { name: cheapestOption.name }
              }
            });
          }
          resolvedData.paymentCollection = { disconnect: true };
        }
      }
    }
  },
  fields: {
    email: (0, import_fields8.text)(),
    type: (0, import_fields8.select)({
      type: "enum",
      options: [
        { label: "Default", value: "default" },
        { label: "Swap", value: "swap" },
        { label: "Draft Order", value: "draft_order" },
        { label: "Payment Link", value: "payment_link" },
        { label: "Claim", value: "claim" }
      ],
      defaultValue: "default",
      validation: { isRequired: true }
    }),
    metadata: (0, import_fields8.json)(),
    idempotencyKey: (0, import_fields8.text)(),
    context: (0, import_fields8.json)(),
    paymentAuthorizedAt: (0, import_fields8.timestamp)(),
    abandonedEmailSent: (0, import_fields8.checkbox)({ defaultValue: false }),
    // Track if abandoned cart email was sent
    user: (0, import_fields8.relationship)({
      ref: "User.carts",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === "create" || operation === "update") && !resolvedData.user && context.session?.itemId) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        }
      }
    }),
    // Regular fields
    region: (0, import_fields8.relationship)({
      ref: "Region.carts"
    }),
    addresses: (0, import_fields8.relationship)({
      ref: "Address.cart",
      many: true
    }),
    discounts: (0, import_fields8.relationship)({
      ref: "Discount.carts",
      many: true
    }),
    giftCards: (0, import_fields8.relationship)({
      ref: "GiftCard.carts",
      many: true
    }),
    draftOrder: (0, import_fields8.relationship)({
      ref: "DraftOrder.cart"
    }),
    order: (0, import_fields8.relationship)({
      ref: "Order.cart"
    }),
    lineItems: (0, import_fields8.relationship)({
      ref: "LineItem.cart",
      many: true
    }),
    customShippingOptions: (0, import_fields8.relationship)({
      ref: "CustomShippingOption.cart",
      many: true
    }),
    swap: (0, import_fields8.relationship)({
      ref: "Swap.cart"
    }),
    shippingMethods: (0, import_fields8.relationship)({
      ref: "ShippingMethod.cart",
      many: true
    }),
    payment: (0, import_fields8.relationship)({
      ref: "Payment.cart"
    }),
    paymentCollection: (0, import_fields8.relationship)({
      ref: "PaymentCollection.cart"
    }),
    billingAddress: (0, import_fields8.relationship)({
      ref: "Address.cartsUsingAsBillingAddress",
      many: false
    }),
    shippingAddress: (0, import_fields8.relationship)({
      ref: "Address.cartsUsingAsShippingAddress",
      many: false
    }),
    ...(0, import_core5.group)({
      label: "Virtual Fields",
      description: "Calculated fields for cart display and totals",
      fields: {
        abandonedFor: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.Int,
            resolve(item) {
              if (!item.updatedAt) return 0;
              const lastActivity = new Date(item.updatedAt).getTime();
              return Math.floor((Date.now() - lastActivity) / (1e3 * 60));
            }
          })
        }),
        status: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.enum({
              name: "CartStatus",
              values: import_core5.graphql.enumValues(["ACTIVE", "COMPLETED"])
            }),
            resolve(item) {
              return item.order ? "COMPLETED" : "ACTIVE";
            }
          })
        }),
        isActive: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.Boolean,
            resolve(item) {
              return !item.order;
            }
          })
        }),
        subtotal: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    productVariant {
                      id
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `
              });
              if (!cart) return null;
              const subtotal = await calculateCartSubtotal(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(subtotal / divisor, currencyCode);
            }
          })
        }),
        total: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                `
              });
              const total = await calculateCartTotal(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(total / divisor, currencyCode);
            }
          })
        }),
        rawTotal: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                `
              });
              if (!cart) return 0;
              return Math.round(await calculateCartTotal(cart, context));
            }
          })
        }),
        rawSubtotal: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    productVariant {
                      id
                      title
                      product {
                        title
                      }
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `
              });
              if (!cart?.lineItems?.length) return "No items in cart";
              let subtotal = 0;
              const breakdown = [];
              for (const lineItem of cart.lineItems) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: { id: { equals: lineItem.productVariant.id } },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: cart.region?.currency?.code } }
                  },
                  query: "id region { id } currency { code } calculatedPrice { calculatedAmount }"
                });
                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                const itemTotal = price * lineItem.quantity;
                subtotal += itemTotal;
                const title = `${lineItem.productVariant.product?.title} - ${lineItem.productVariant.title}`;
                breakdown.push(`${title}: ${price} \xD7 ${lineItem.quantity} = ${itemTotal}`);
              }
              return `Total: ${subtotal}
Breakdown:
${breakdown.join("\n")}`;
            }
          })
        }),
        rawTotalBreakdown: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                `
              });
              if (!cart) return "Cart not found";
              const subtotal = await calculateCartSubtotal(cart, context);
              const discount = await calculateCartDiscount(cart, context);
              const shipping = await calculateCartShipping(cart);
              const tax = await calculateCartTax(cart, context);
              const total = subtotal - discount + shipping + tax;
              return `subtotal(${subtotal}) - discount(${discount}) + shipping(${shipping}) + tax(${tax}) = ${total}`;
            }
          })
        }),
        discount: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity 
                    productVariant {
                      id
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                    }
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  shippingMethods {
                    price
                    shippingOption {
                      id
                      name
                    }
                  }
                `
              });
              if (!cart?.discounts?.length) {
                return null;
              }
              let subtotal = 0;
              for (const lineItem of cart.lineItems || []) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: {
                      id: { equals: lineItem.productVariant.id }
                    },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: cart.region?.currency?.code } }
                  },
                  query: "calculatedPrice { calculatedAmount }"
                });
                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                subtotal += price * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of cart.discounts) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (cart.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += cart.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }
              if (totalDiscountAmount === 0) return null;
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(
                totalDiscountAmount / divisor,
                currencyCode
              );
            }
          })
        }),
        giftCardTotal: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  giftCards {
                    id
                    balance
                    value
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!cart?.giftCards?.length) {
                return null;
              }
              const total = cart.giftCards.reduce((sum, card) => {
                const usableAmount = Math.min(
                  card.balance,
                  card.value || card.balance
                );
                return sum + usableAmount;
              }, 0);
              if (total === 0) return null;
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(total / divisor, currencyCode);
            }
          })
        }),
        tax: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  lineItems {
                    id
                    quantity
                    productVariant {
                      id
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                `
              });
              const tax = await calculateCartTax(cart, context);
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency(tax / divisor, currencyCode);
            }
          })
        }),
        shipping: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (cart?.shippingMethods?.length > 0) {
                const shipping = await calculateCartShipping(cart);
                const currencyCode = cart.region?.currency?.code || "USD";
                const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
                return shipping > 0 ? formatCurrency(shipping / divisor, currencyCode) : null;
              }
              if (cart?.region?.id) {
                const shippingOptions = await sudoContext.query.ShippingOption.findMany({
                  where: {
                    region: { id: { equals: cart.region.id } },
                    isReturn: { equals: false }
                  },
                  query: `
                    amount
                    priceType
                    calculatedAmount
                  `,
                  orderBy: { amount: "asc" }
                });
                if (shippingOptions?.length > 0) {
                  const currencyCode = cart.region?.currency?.code || "USD";
                  const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
                  return formatCurrency(
                    shippingOptions[0].amount / divisor,
                    currencyCode
                  );
                }
              }
              return null;
            }
          })
        }),
        cheapestShipping: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (cart?.shippingMethods?.length > 0) {
                const shippingAmount = cart.shippingMethods.reduce(
                  (total, method) => total + (method.price || 0),
                  0
                );
                const currencyCode = cart.region?.currency?.code || "USD";
                const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
                return formatCurrency(shippingAmount / divisor, currencyCode);
              }
              if (cart?.region?.id) {
                const shippingOptions = await sudoContext.query.ShippingOption.findMany({
                  where: {
                    region: { id: { equals: cart.region.id } },
                    isReturn: { equals: false }
                  },
                  query: `
                    amount
                    priceType
                    calculatedAmount
                  `,
                  orderBy: { amount: "asc" }
                });
                if (shippingOptions?.length > 0) {
                  const currencyCode = cart.region?.currency?.code || "USD";
                  const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
                  return formatCurrency(
                    shippingOptions[0].amount / divisor,
                    currencyCode
                  );
                }
              }
              return null;
            }
          })
        }),
        discountsById: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.JSON,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity 
                    productVariant {
                      id
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                    }
                  }
                  region {
                    id
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                  shippingMethods {
                    price
                    shippingOption {
                      id
                      name
                    }
                  }
                `
              });
              if (!cart?.discounts?.length) {
                return {};
              }
              const currencyCode = cart.region?.currency?.code || "USD";
              const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
              let subtotal = 0;
              for (const lineItem of cart.lineItems || []) {
                const prices = await sudoContext.query.MoneyAmount.findMany({
                  where: {
                    productVariant: {
                      id: { equals: lineItem.productVariant.id }
                    },
                    region: { id: { equals: cart.region.id } },
                    currency: { code: { equals: currencyCode } }
                  },
                  query: "calculatedPrice { calculatedAmount }"
                });
                const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
                subtotal += price * lineItem.quantity;
              }
              const discountAmounts = {};
              for (const discount of cart.discounts) {
                if (!discount.discountRule?.type) continue;
                let amount = 0;
                switch (discount.discountRule.type) {
                  case "percentage":
                    amount = subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    amount = discount.discountRule.value * (cart.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    amount = cart.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
                if (amount > 0) {
                  discountAmounts[discount.id] = formatCurrency(
                    amount / divisor,
                    currencyCode
                  );
                }
              }
              return discountAmounts;
            }
          })
        }),
        checkoutStep: (0, import_fields8.virtual)({
          field: import_core5.graphql.field({
            type: import_core5.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const cart = await sudoContext.query.Cart.findOne({
                where: { id: item.id },
                query: `
                  id
                  email
                  billingAddress { id }
                  shippingAddress { id }
                  shippingMethods {
                    id
                  }
                  paymentCollection {
                    id
                    paymentSessions {
                      id
                      isSelected
                    }
                  }
                  lineItems {
                    id
                  }
                `
              });
              if (!cart || !cart.lineItems?.length) return "cart";
              if (!cart.billingAddress?.id || !cart.shippingAddress?.id)
                return "address";
              if (!cart.shippingMethods?.length) return "delivery";
              if (!cart.paymentCollection?.id || !cart.paymentCollection?.paymentSessions?.some(
                (s) => s.isSelected
              )) {
                return "payment";
              }
              return "review";
            }
          })
        })
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/ClaimImage.ts
var import_core6 = require("@keystone-6/core");
var import_fields9 = require("@keystone-6/core/fields");
var ClaimImage = (0, import_core6.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    // image: cloudinaryImage({
    //   cloudinary,
    //   label: 'Source',
    // }),
    image: (0, import_fields9.image)({ storage: "my_images" }),
    url: (0, import_fields9.text)({
      label: "Image URL",
      ui: {
        description: "Direct URL to the image file"
      }
    }),
    altText: (0, import_fields9.text)(),
    claimItem: (0, import_fields9.relationship)({ ref: "ClaimItem.claimImages" }),
    metadata: (0, import_fields9.json)(),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ["image", "altText", "product"]
    }
  }
});

// features/keystone/models/ClaimItem.ts
var import_core7 = require("@keystone-6/core");
var import_fields10 = require("@keystone-6/core/fields");
var ClaimItem = (0, import_core7.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    reason: (0, import_fields10.select)({
      type: "enum",
      options: [
        {
          label: "Missing Item",
          value: "missing_item"
        },
        {
          label: "Wrong Item",
          value: "wrong_item"
        },
        {
          label: "Production Failure",
          value: "production_failure"
        },
        {
          label: "Other",
          value: "other"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    note: (0, import_fields10.text)(),
    quantity: (0, import_fields10.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields10.json)(),
    productVariant: (0, import_fields10.relationship)({
      ref: "ProductVariant.claimItems"
    }),
    lineItem: (0, import_fields10.relationship)({
      ref: "LineItem.claimItems"
    }),
    claimOrder: (0, import_fields10.relationship)({
      ref: "ClaimOrder.claimItems"
    }),
    claimImages: (0, import_fields10.relationship)({
      ref: "ClaimImage.claimItem",
      many: true
    }),
    claimTags: (0, import_fields10.relationship)({
      ref: "ClaimTag.claimItems",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ClaimOrder.ts
var import_core8 = require("@keystone-6/core");
var import_fields11 = require("@keystone-6/core/fields");
var ClaimOrder = (0, import_core8.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    paymentStatus: (0, import_fields11.select)({
      type: "enum",
      options: [
        {
          label: "Na",
          value: "na"
        },
        {
          label: "Not Refunded",
          value: "not_refunded"
        },
        {
          label: "Refunded",
          value: "refunded"
        }
      ],
      defaultValue: "na",
      validation: {
        isRequired: true
      }
    }),
    fulfillmentStatus: (0, import_fields11.select)({
      type: "enum",
      options: [
        {
          label: "Not Fulfilled",
          value: "not_fulfilled"
        },
        {
          label: "Partially Fulfilled",
          value: "partially_fulfilled"
        },
        {
          label: "Fulfilled",
          value: "fulfilled"
        },
        {
          label: "Partially Shipped",
          value: "partially_shipped"
        },
        {
          label: "Shipped",
          value: "shipped"
        },
        {
          label: "Partially Returned",
          value: "partially_returned"
        },
        {
          label: "Returned",
          value: "returned"
        },
        {
          label: "Canceled",
          value: "canceled"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        }
      ],
      defaultValue: "not_fulfilled",
      validation: {
        isRequired: true
      }
    }),
    type: (0, import_fields11.select)({
      type: "enum",
      options: [
        {
          label: "Refund",
          value: "refund"
        },
        {
          label: "Replace",
          value: "replace"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    refundAmount: (0, import_fields11.integer)(),
    canceledAt: (0, import_fields11.timestamp)(),
    metadata: (0, import_fields11.json)(),
    idempotencyKey: (0, import_fields11.text)(),
    noNotification: (0, import_fields11.checkbox)(),
    address: (0, import_fields11.relationship)({
      ref: "Address.claimOrders"
    }),
    order: (0, import_fields11.relationship)({
      ref: "Order.claimOrders"
    }),
    claimItems: (0, import_fields11.relationship)({
      ref: "ClaimItem.claimOrder",
      many: true
    }),
    fulfillments: (0, import_fields11.relationship)({
      ref: "Fulfillment.claimOrder",
      many: true
    }),
    lineItems: (0, import_fields11.relationship)({
      ref: "LineItem.claimOrder",
      many: true
    }),
    return: (0, import_fields11.relationship)({
      ref: "Return.claimOrder"
    }),
    shippingMethods: (0, import_fields11.relationship)({
      ref: "ShippingMethod.claimOrder",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ClaimTag.ts
var import_core9 = require("@keystone-6/core");
var import_fields12 = require("@keystone-6/core/fields");
var ClaimTag = (0, import_core9.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    value: (0, import_fields12.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields12.text)(),
    metadata: (0, import_fields12.json)(),
    claimItems: (0, import_fields12.relationship)({
      ref: "ClaimItem.claimTags",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Country.ts
var import_core10 = require("@keystone-6/core");
var import_fields13 = require("@keystone-6/core/fields");
var Country = (0, import_core10.list)({
  access: {
    operation: {
      query: () => true,
      // query: ({ session }) =>
      //   permissions.canReadUsers({ session }) ||
      //   permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    iso2: (0, import_fields13.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    iso3: (0, import_fields13.text)({
      validation: {
        isRequired: true
      }
    }),
    numCode: (0, import_fields13.integer)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields13.text)({
      validation: {
        isRequired: true
      }
    }),
    displayName: (0, import_fields13.text)({
      validation: {
        isRequired: true
      }
    }),
    region: (0, import_fields13.relationship)({
      ref: "Region.countries"
    }),
    addresses: (0, import_fields13.relationship)({
      ref: "Address.country",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Currency.ts
var import_core11 = require("@keystone-6/core");
var import_fields14 = require("@keystone-6/core/fields");
var NO_DIVISION_CURRENCIES = ["jpy", "krw", "vnd"];
var Currency = (0, import_core11.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    code: (0, import_fields14.text)({
      isIndexed: "unique",
      validation: { isRequired: true }
    }),
    symbol: (0, import_fields14.text)({
      validation: { isRequired: true }
    }),
    symbolNative: (0, import_fields14.text)({
      validation: { isRequired: true }
    }),
    name: (0, import_fields14.text)({
      validation: { isRequired: true }
    }),
    moneyAmounts: (0, import_fields14.relationship)({
      ref: "MoneyAmount.currency",
      many: true
    }),
    orders: (0, import_fields14.relationship)({
      ref: "Order.currency",
      many: true
    }),
    payments: (0, import_fields14.relationship)({
      ref: "Payment.currency",
      many: true
    }),
    regions: (0, import_fields14.relationship)({
      ref: "Region.currency",
      many: true
    }),
    stores: (0, import_fields14.relationship)({
      ref: "Store.currencies",
      many: true
    }),
    accounts: (0, import_fields14.relationship)({
      ref: "Account.currency",
      many: true
    }),
    invoices: (0, import_fields14.relationship)({
      ref: "Invoice.currency",
      many: true
    }),
    ...(0, import_core11.group)({
      label: "Virtual Fields",
      description: "Virtual fields for currency",
      fields: {
        noDivisionCurrency: (0, import_fields14.virtual)({
          field: import_core11.graphql.field({
            type: import_core11.graphql.Boolean,
            resolve(item) {
              return NO_DIVISION_CURRENCIES.includes(item.code.toLowerCase());
            }
          })
        })
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/CustomerGroup.ts
var import_core12 = require("@keystone-6/core");
var import_fields15 = require("@keystone-6/core/fields");
var CustomerGroup = (0, import_core12.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    name: (0, import_fields15.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields15.json)(),
    users: (0, import_fields15.relationship)({
      ref: "User.customerGroups",
      many: true
    }),
    discountConditions: (0, import_fields15.relationship)({
      ref: "DiscountCondition.customerGroups",
      many: true
    }),
    priceLists: (0, import_fields15.relationship)({
      ref: "PriceList.customerGroups",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/CustomShippingOption.ts
var import_core13 = require("@keystone-6/core");
var import_fields16 = require("@keystone-6/core/fields");
var CustomShippingOption = (0, import_core13.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    price: (0, import_fields16.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields16.json)(),
    shippingOption: (0, import_fields16.relationship)({
      ref: "ShippingOption.customShippingOptions"
    }),
    cart: (0, import_fields16.relationship)({
      ref: "Cart.customShippingOptions"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Discount.ts
var import_core14 = require("@keystone-6/core");
var import_fields17 = require("@keystone-6/core/fields");
var Discount = (0, import_core14.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    code: (0, import_fields17.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    isDynamic: (0, import_fields17.checkbox)(),
    isDisabled: (0, import_fields17.checkbox)(),
    stackable: (0, import_fields17.checkbox)({
      defaultValue: false
    }),
    startsAt: (0, import_fields17.timestamp)({
      defaultValue: { kind: "now" },
      validation: {
        isRequired: true
      }
    }),
    endsAt: (0, import_fields17.timestamp)({
      validation: {
        isRequired: false
      }
    }),
    metadata: (0, import_fields17.json)(),
    usageLimit: (0, import_fields17.integer)(),
    usageCount: (0, import_fields17.integer)({
      defaultValue: 0,
      validation: {
        isRequired: true
      }
    }),
    validDuration: (0, import_fields17.text)(),
    discountRule: (0, import_fields17.relationship)({
      ref: "DiscountRule.discounts"
    }),
    carts: (0, import_fields17.relationship)({
      ref: "Cart.discounts",
      many: true
    }),
    lineItemAdjustments: (0, import_fields17.relationship)({
      ref: "LineItemAdjustment.discount",
      many: true
    }),
    regions: (0, import_fields17.relationship)({
      ref: "Region.discounts",
      many: true
    }),
    orders: (0, import_fields17.relationship)({
      ref: "Order.discounts",
      many: true
    }),
    ...trackingFields
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const discount = await sudoContext.query.Discount.findOne({
          where: { id: item.id },
          query: "carts { id }"
        });
        if (discount?.carts?.length) {
          for (const cart of discount.carts) {
            await sudoContext.query.Cart.updateOne({
              where: { id: cart.id },
              data: {
                paymentCollection: {
                  disconnect: true
                }
              }
            });
          }
        }
      }
    }
  }
});

// features/keystone/models/DiscountCondition.ts
var import_core15 = require("@keystone-6/core");
var import_fields18 = require("@keystone-6/core/fields");
var DiscountCondition = (0, import_core15.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    type: (0, import_fields18.select)({
      type: "enum",
      options: [
        {
          label: "Products",
          value: "products"
        },
        {
          label: "Product Types",
          value: "product_types"
        },
        {
          label: "Product Collections",
          value: "product_collections"
        },
        {
          label: "Product Tags",
          value: "product_tags"
        },
        {
          label: "Customer Groups",
          value: "customer_groups"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    operator: (0, import_fields18.select)({
      type: "enum",
      options: [
        {
          label: "In",
          value: "in"
        },
        {
          label: "Not In",
          value: "not_in"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields18.json)(),
    discountRule: (0, import_fields18.relationship)({
      ref: "DiscountRule.discountConditions"
    }),
    customerGroups: (0, import_fields18.relationship)({
      ref: "CustomerGroup.discountConditions",
      many: true
    }),
    products: (0, import_fields18.relationship)({
      ref: "Product.discountConditions",
      many: true
    }),
    productCollections: (0, import_fields18.relationship)({
      ref: "ProductCollection.discountConditions",
      many: true
    }),
    productCategories: (0, import_fields18.relationship)({
      ref: "ProductCategory.discountConditions",
      many: true
    }),
    productTags: (0, import_fields18.relationship)({
      ref: "ProductTag.discountConditions",
      many: true
    }),
    productTypes: (0, import_fields18.relationship)({
      ref: "ProductType.discountConditions",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/DiscountRule.ts
var import_core16 = require("@keystone-6/core");
var import_fields19 = require("@keystone-6/core/fields");
var DiscountRule = (0, import_core16.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    description: (0, import_fields19.text)(),
    type: (0, import_fields19.select)({
      type: "enum",
      options: [
        {
          label: "Fixed",
          value: "fixed"
        },
        {
          label: "Percentage",
          value: "percentage"
        },
        {
          label: "Free Shipping",
          value: "free_shipping"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    value: (0, import_fields19.integer)({
      validation: {
        isRequired: true
      }
    }),
    allocation: (0, import_fields19.select)({
      type: "enum",
      options: [
        {
          label: "Total",
          value: "total"
        },
        {
          label: "Item",
          value: "item"
        }
      ]
    }),
    metadata: (0, import_fields19.json)(),
    discounts: (0, import_fields19.relationship)({
      ref: "Discount.discountRule",
      many: true
    }),
    discountConditions: (0, import_fields19.relationship)({
      ref: "DiscountCondition.discountRule",
      many: true
    }),
    products: (0, import_fields19.relationship)({
      ref: "Product.discountRules",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/DraftOrder.ts
var import_core17 = require("@keystone-6/core");
var import_fields20 = require("@keystone-6/core/fields");
var DraftOrder = (0, import_core17.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    status: (0, import_fields20.select)({
      type: "enum",
      options: [
        {
          label: "Open",
          value: "open"
        },
        {
          label: "Completed",
          value: "completed"
        }
      ],
      defaultValue: "open",
      validation: {
        isRequired: true
      }
    }),
    displayId: (0, import_fields20.integer)({
      validation: {
        isRequired: true
      }
    }),
    canceledAt: (0, import_fields20.timestamp)(),
    completedAt: (0, import_fields20.timestamp)(),
    metadata: (0, import_fields20.json)(),
    idempotencyKey: (0, import_fields20.text)(),
    noNotificationOrder: (0, import_fields20.checkbox)(),
    cart: (0, import_fields20.relationship)({
      ref: "Cart.draftOrder"
    }),
    order: (0, import_fields20.relationship)({
      ref: "Order.draftOrder"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Fulfillment.ts
var import_core18 = require("@keystone-6/core");
var import_fields21 = require("@keystone-6/core/fields");

// features/keystone/lib/mail.ts
var import_nodemailer = require("nodemailer");
function getBaseUrlForEmails() {
  if (process.env.SMTP_STORE_LINK) {
    return process.env.SMTP_STORE_LINK;
  }
  console.warn("SMTP_STORE_LINK not set. Please add SMTP_STORE_LINK to your environment variables for email links to work properly.");
  return "";
}
var transport = (0, import_nodemailer.createTransport)({
  // @ts-ignore
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
function passwordResetEmail({ url }) {
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";
  return `
    <body style="background: ${backgroundColor};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Please click below to reset your password
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">Reset Password</a></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            If you did not request this email you can safely ignore it.
          </td>
        </tr>
      </table>
    </body>
  `;
}
async function sendPasswordResetEmail(resetToken, to, baseUrl) {
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  const info = await transport.sendMail({
    to,
    from: process.env.SMTP_FROM,
    subject: "Your password reset token!",
    html: passwordResetEmail({
      url: `${frontendUrl}${basePath && basePath}/reset?token=${resetToken}`
    })
  });
  if (process.env.MAIL_USER?.includes("ethereal.email")) {
    console.log(`\u{1F4E7} Message Sent!  Preview it at ${(0, import_nodemailer.getTestMessageUrl)(info)}`);
  }
}
function orderConfirmationEmail({ order, orderUrl }) {
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";
  const headerColor = "#333333";
  const itemsHtml = order.lineItems?.map((item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.title}</strong><br>
        ${item.variantTitle ? `<span style="color: #666; font-size: 14px;">${item.variantTitle}</span><br>` : ""}
        ${item.sku ? `<span style="color: #666; font-size: 14px;">SKU: ${item.sku}</span><br>` : ""}
        Quantity: ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.formattedUnitPrice}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.formattedTotal}
      </td>
    </tr>
  `).join("") || "";
  return `
    <body style="background: ${backgroundColor};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center" style="padding: 20px 0px 0px 0px; font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; font-weight: bold;">
            Order Confirmation
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Thank you for your order! Your order #${order.displayId} has been confirmed.
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #eee;">
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Item</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Price</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Total</th>
              </tr>
              ${itemsHtml}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 0;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding: 5px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                  Subtotal: ${order.subtotal}
                </td>
              </tr>
              ${order.shipping && order.shipping !== "$0.00" ? `
              <tr>
                <td style="padding: 5px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                  Shipping: ${order.shipping}
                </td>
              </tr>
              ` : ""}
              ${order.discount && order.discount !== "$0.00" ? `
              <tr>
                <td style="padding: 5px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                  Discount: -${order.discount}
                </td>
              </tr>
              ` : ""}
              ${order.tax && order.tax !== "$0.00" ? `
              <tr>
                <td style="padding: 5px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
                  Tax: ${order.tax}
                </td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 10px 0; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; font-weight: bold; font-size: 18px; border-top: 2px solid #eee;">
                  Total: ${order.total}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ${order.shippingAddress ? `
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; margin: 0 0 10px 0;">Shipping Address</h3>
            <p style="font-family: Helvetica, Arial, sans-serif; color: ${textColor}; margin: 0; line-height: 1.4;">
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.company ? `${order.shippingAddress.company}<br>` : ""}
              ${order.shippingAddress.address1}<br>
              ${order.shippingAddress.address2 ? `${order.shippingAddress.address2}<br>` : ""}
              ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country?.displayName || order.shippingAddress.country?.iso2}<br>
              ${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ""}
            </p>
          </td>
        </tr>
        ` : ""}
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}">
                  <a href="${orderUrl}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 12px 24px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">
                    View Order Details
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0px 0px 20px 0px; font-size: 14px; line-height: 20px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            We'll send you another email when your order ships. If you have any questions, please contact us.
          </td>
        </tr>
      </table>
    </body>
  `;
}
function orderFulfillmentEmail({ order, fulfillment, orderUrl }) {
  const backgroundColor = "#f9f9f9";
  const textColor = "#444444";
  const mainBackgroundColor = "#ffffff";
  const buttonBackgroundColor = "#346df1";
  const buttonBorderColor = "#346df1";
  const buttonTextColor = "#ffffff";
  const headerColor = "#333333";
  const itemsHtml = fulfillment.items?.map((item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.lineItem.title}</strong><br>
        ${item.lineItem.variantTitle ? `<span style="color: #666; font-size: 14px;">${item.lineItem.variantTitle}</span><br>` : ""}
        ${item.lineItem.sku ? `<span style="color: #666; font-size: 14px;">SKU: ${item.lineItem.sku}</span><br>` : ""}
        Quantity: ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.lineItem.formattedUnitPrice}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.lineItem.formattedTotal}
      </td>
    </tr>
  `).join("") || "";
  const trackingHtml = fulfillment.shippingLabels?.map((label) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${label.carrier}</strong><br>
        Tracking: ${label.trackingNumber}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${label.url ? `<a href="${label.url}" target="_blank" style="color: ${buttonBackgroundColor}; text-decoration: none;">Track Package</a>` : ""}
      </td>
    </tr>
  `).join("") || "";
  return `
    <body style="background: ${backgroundColor};">
      <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${mainBackgroundColor}; max-width: 600px; margin: auto; border-radius: 10px;">
        <tr>
          <td align="center" style="padding: 20px 0px 0px 0px; font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; font-weight: bold;">
            Order Shipped
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Good news! Your order #${order.displayId} has been shipped.
          </td>
        </tr>
        ${trackingHtml ? `
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; margin: 0 0 10px 0;">Tracking Information</h3>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #eee;">
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Carrier & Tracking</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Track</th>
              </tr>
              ${trackingHtml}
            </table>
          </td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; margin: 0 0 10px 0;">Items Shipped</h3>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #eee;">
              <tr style="background: #f8f9fa;">
                <th style="padding: 15px; text-align: left; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Item</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Price</th>
                <th style="padding: 15px; text-align: right; font-family: Helvetica, Arial, sans-serif; color: ${headerColor};">Total</th>
              </tr>
              ${itemsHtml}
            </table>
          </td>
        </tr>
        ${order.shippingAddress ? `
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="font-family: Helvetica, Arial, sans-serif; color: ${headerColor}; margin: 0 0 10px 0;">Shipping Address</h3>
            <p style="font-family: Helvetica, Arial, sans-serif; color: ${textColor}; margin: 0; line-height: 1.4;">
              ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
              ${order.shippingAddress.company ? `${order.shippingAddress.company}<br>` : ""}
              ${order.shippingAddress.address1}<br>
              ${order.shippingAddress.address2 ? `${order.shippingAddress.address2}<br>` : ""}
              ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country?.displayName || order.shippingAddress.country?.iso2}<br>
              ${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ""}
            </p>
          </td>
        </tr>
        ` : ""}
        <tr>
          <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius: 5px;" bgcolor="${buttonBackgroundColor}">
                  <a href="${orderUrl}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px; padding: 12px 24px; border: 1px solid ${buttonBorderColor}; display: inline-block; font-weight: bold;">
                    View Order Details
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding: 0px 0px 20px 0px; font-size: 14px; line-height: 20px; font-family: Helvetica, Arial, sans-serif; color: ${textColor};">
            Thank you for your order! If you have any questions, please contact us.
          </td>
        </tr>
      </table>
    </body>
  `;
}
async function sendOrderConfirmationEmail(order, baseUrl) {
  if (!order.email) {
    console.warn("No email address found for order", order.id);
    return;
  }
  const countryCode = order.shippingAddress?.country?.iso2?.toLowerCase() || "us";
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  const orderUrl = order.secretKey ? `${frontendUrl}/${countryCode}/order/confirmed/${order.id}?secretKey=${order.secretKey}` : `${frontendUrl}/${countryCode}/order/confirmed/${order.id}`;
  try {
    const info = await transport.sendMail({
      to: order.email,
      from: process.env.SMTP_FROM,
      subject: `Order Confirmation - Order #${order.displayId}`,
      html: orderConfirmationEmail({ order, orderUrl })
    });
    if (process.env.SMTP_USER?.includes("ethereal.email")) {
      console.log(`\u{1F4E7} Order confirmation email sent! Preview it at ${(0, import_nodemailer.getTestMessageUrl)(info)}`);
    } else {
      console.log(`\u{1F4E7} Order confirmation email sent to ${order.email}`);
    }
    if (order.user?.orderWebhookUrl) {
      try {
        const webhookPayload = {
          event: "order.created",
          data: {
            order: {
              id: order.id,
              displayId: order.displayId,
              status: order.status,
              total: order.total,
              formattedTotal: order.formattedTotal || order.total,
              createdAt: order.createdAt,
              email: order.email,
              customer: {
                id: order.user.id,
                email: order.user.email
              },
              shippingAddress: order.shippingAddress,
              lineItems: order.lineItems || []
            }
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        console.log(`\u{1FA9D} Calling webhook for order ${order.displayId}: ${order.user.orderWebhookUrl}`);
        const webhookResponse = await fetch(order.user.orderWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "OpenFront-Webhook/1.0",
            "X-OpenFront-Event": "order.created",
            "X-OpenFront-Order-ID": order.id
          },
          body: JSON.stringify(webhookPayload)
        });
        if (webhookResponse.ok) {
          console.log(`\u2705 Webhook called successfully for order ${order.displayId}`);
        } else {
          console.error(`\u274C Webhook call failed for order ${order.displayId}: ${webhookResponse.status}`);
        }
      } catch (webhookError) {
        console.error(`\u274C Webhook call error for order ${order.displayId}:`, webhookError);
      }
    }
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
  }
}
async function sendOrderFulfillmentEmail(order, fulfillment, baseUrl) {
  if (!order.email) {
    console.warn("No email address found for order", order.id);
    return;
  }
  const countryCode = order.shippingAddress?.country?.iso2?.toLowerCase() || "us";
  const frontendUrl = baseUrl || getBaseUrlForEmails();
  const orderUrl = order.secretKey ? `${frontendUrl}/${countryCode}/order/confirmed/${order.id}?secretKey=${order.secretKey}` : `${frontendUrl}/${countryCode}/order/confirmed/${order.id}`;
  try {
    const info = await transport.sendMail({
      to: order.email,
      from: process.env.SMTP_FROM,
      subject: `Order Shipped - Order #${order.displayId}`,
      html: orderFulfillmentEmail({ order, fulfillment, orderUrl })
    });
    if (process.env.SMTP_USER?.includes("ethereal.email")) {
      console.log(`\u{1F4E7} Order fulfillment email sent! Preview it at ${(0, import_nodemailer.getTestMessageUrl)(info)}`);
    } else {
      console.log(`\u{1F4E7} Order fulfillment email sent to ${order.email}`);
    }
    if (order.user?.orderWebhookUrl) {
      try {
        const webhookPayload = {
          event: "order.shipped",
          data: {
            order: {
              id: order.id,
              displayId: order.displayId,
              status: order.status,
              total: order.total,
              formattedTotal: order.formattedTotal || order.total,
              createdAt: order.createdAt,
              email: order.email,
              customer: {
                id: order.user.id,
                email: order.user.email
              },
              shippingAddress: order.shippingAddress,
              lineItems: order.lineItems || []
            },
            fulfillment: {
              id: fulfillment.id,
              trackingNumber: fulfillment.trackingNumber,
              trackingCompany: fulfillment.trackingCompany,
              shippingLabels: fulfillment.shippingLabels || []
            }
          },
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        console.log(`\u{1FA9D} Calling webhook for shipped order ${order.displayId}: ${order.user.orderWebhookUrl}`);
        const webhookResponse = await fetch(order.user.orderWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "OpenFront-Webhook/1.0",
            "X-OpenFront-Event": "order.shipped",
            "X-OpenFront-Order-ID": order.id
          },
          body: JSON.stringify(webhookPayload)
        });
        if (webhookResponse.ok) {
          console.log(`\u2705 Webhook called successfully for shipped order ${order.displayId}`);
        } else {
          console.error(`\u274C Webhook call failed for shipped order ${order.displayId}: ${webhookResponse.status}`);
        }
      } catch (webhookError) {
        console.error(`\u274C Webhook call error for shipped order ${order.displayId}:`, webhookError);
      }
    }
  } catch (error) {
    console.error("Failed to send order fulfillment email:", error);
  }
}

// features/keystone/models/Fulfillment.ts
var Fulfillment = (0, import_core18.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: permissions.canManageFulfillments,
      update: permissions.canManageFulfillments,
      delete: permissions.canManageFulfillments
    }
  },
  hooks: {
    beforeDelete: async ({ context, item }) => {
      await context.db.FulfillmentItem.deleteMany({
        where: { fulfillment: { id: item.id } }
      });
      await context.db.ShippingLabel.deleteMany({
        where: { fulfillment: { id: item.id } }
      });
    },
    afterOperation: async ({ operation, item, context }) => {
      if (operation === "create" && item && !item.noNotification) {
        try {
          const fulfillment = await context.sudo().query.Fulfillment.findOne({
            where: { id: item.id },
            query: `
              id
              noNotification
              shippingLabels {
                id
                trackingNumber
                trackingUrl
                carrier
                labelUrl
              }
              fulfillmentItems {
                id
                quantity
                lineItem {
                  id
                  title
                  sku
                  variantTitle
                  formattedUnitPrice
                  formattedTotal
                }
              }
              order {
                id
                displayId
                email
                secretKey
                shippingAddress {
                  id
                  firstName
                  lastName
                  company
                  address1
                  address2
                  city
                  province
                  postalCode
                  phone
                  country {
                    id
                    iso2
                    displayName
                  }
                }
              }
            `
          });
          if (fulfillment?.order) {
            const fulfillmentData = {
              items: fulfillment.fulfillmentItems,
              shippingLabels: fulfillment.shippingLabels?.map((label) => ({
                id: label.id,
                trackingNumber: label.trackingNumber,
                url: label.trackingUrl,
                carrier: label.carrier,
                labelUrl: label.labelUrl
              })) || []
            };
            await sendOrderFulfillmentEmail(fulfillment.order, fulfillmentData);
          }
        } catch (error) {
          console.error("Error sending order fulfillment email:", error);
        }
      }
    }
  },
  fields: {
    // Status fields
    shippedAt: (0, import_fields21.timestamp)(),
    canceledAt: (0, import_fields21.timestamp)(),
    // Data fields
    data: (0, import_fields21.json)(),
    metadata: (0, import_fields21.json)(),
    idempotencyKey: (0, import_fields21.text)(),
    noNotification: (0, import_fields21.checkbox)({
      defaultValue: false
    }),
    // Relationships
    order: (0, import_fields21.relationship)({
      ref: "Order.fulfillments",
      many: false,
      validation: { isRequired: true },
      hooks: {
        validateInput: async ({ context, operation, resolvedData, addValidationError }) => {
          if (operation === "create") {
            const fulfillmentItems = resolvedData.fulfillmentItems?.create || resolvedData.fulfillmentItems?.connect;
            if (!fulfillmentItems?.length) {
              addValidationError("No items to fulfill");
              return;
            }
            const order = await context.query.Order.findOne({
              where: { id: resolvedData.order.connect.id },
              query: `
                lineItems {
                  id
                  quantity
                }
                fulfillments {
                  canceledAt
                  fulfillmentItems {
                    quantity
                    lineItem {
                      id
                    }
                  }
                }
              `
            });
            if (!order?.lineItems) {
              addValidationError("Order not found or has no line items");
              return;
            }
            const unfulfilledQuantities = {};
            order.lineItems.forEach((item) => {
              unfulfilledQuantities[item.id] = item.quantity;
            });
            order.fulfillments?.forEach((fulfillment) => {
              if (!fulfillment.canceledAt) {
                fulfillment.fulfillmentItems?.forEach((item) => {
                  unfulfilledQuantities[item.lineItem.id] -= item.quantity;
                });
              }
            });
            let itemsToValidate = fulfillmentItems;
            if (resolvedData.fulfillmentItems?.connect) {
              const connectedItems = await context.query.FulfillmentItem.findMany({
                where: { id: { in: fulfillmentItems.map((item) => item.id) } },
                query: "quantity lineItem { id }"
              });
              itemsToValidate = connectedItems;
            }
            for (const item of itemsToValidate) {
              const lineItemId = resolvedData.fulfillmentItems?.create ? item.lineItem.connect.id : item.lineItem.id;
              const quantity = resolvedData.fulfillmentItems?.create ? item.quantity : item.quantity;
              const availableQuantity = unfulfilledQuantities[lineItemId] || 0;
              if (availableQuantity <= 0) {
                addValidationError(`Line item ${lineItemId} has no unfulfilled quantity`);
                return;
              }
              if (quantity > availableQuantity) {
                addValidationError(`Cannot fulfill more than ${availableQuantity} items for ${lineItemId}`);
                return;
              }
            }
          }
        }
      }
    }),
    claimOrder: (0, import_fields21.relationship)({
      ref: "ClaimOrder.fulfillments",
      many: false
    }),
    swap: (0, import_fields21.relationship)({
      ref: "Swap.fulfillments",
      many: false
    }),
    fulfillmentProvider: (0, import_fields21.relationship)({
      ref: "FulfillmentProvider.fulfillments",
      many: false,
      validation: { isRequired: true }
    }),
    fulfillmentItems: (0, import_fields21.relationship)({
      ref: "FulfillmentItem.fulfillment",
      many: true
    }),
    shippingLabels: (0, import_fields21.relationship)({
      ref: "ShippingLabel.fulfillment",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/FulfillmentItem.ts
var import_core19 = require("@keystone-6/core");
var import_fields22 = require("@keystone-6/core/fields");
var FulfillmentItem = (0, import_core19.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: permissions.canManageFulfillments,
      update: permissions.canManageFulfillments,
      delete: permissions.canManageFulfillments
    }
  },
  fields: {
    quantity: (0, import_fields22.integer)({
      validation: {
        isRequired: true
      }
    }),
    fulfillment: (0, import_fields22.relationship)({
      ref: "Fulfillment.fulfillmentItems",
      many: false,
      validation: { isRequired: true }
    }),
    lineItem: (0, import_fields22.relationship)({
      ref: "OrderLineItem.fulfillmentItems",
      many: false,
      validation: { isRequired: true }
    }),
    ...trackingFields
  }
});

// features/keystone/models/FulfillmentProvider.ts
var import_core20 = require("@keystone-6/core");
var import_fields23 = require("@keystone-6/core/fields");
var FulfillmentProvider = (0, import_core20.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: permissions.canManageFulfillments,
      update: permissions.canManageFulfillments,
      delete: permissions.canManageFulfillments
    }
  },
  fields: {
    name: (0, import_fields23.text)({
      validation: { isRequired: true }
    }),
    code: (0, import_fields23.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true,
        match: {
          regex: /^fp_[a-zA-Z0-9-_]+$/,
          explanation: 'Code must start with "fp_" followed by letters, numbers, hyphens or underscores'
        }
      }
    }),
    isInstalled: (0, import_fields23.checkbox)({
      defaultValue: true
    }),
    credentials: (0, import_fields23.json)({
      ui: {
        itemView: { fieldMode: "hidden" }
      }
    }),
    metadata: (0, import_fields23.json)(),
    // Relationships
    fulfillments: (0, import_fields23.relationship)({
      ref: "Fulfillment.fulfillmentProvider",
      many: true
    }),
    regions: (0, import_fields23.relationship)({
      ref: "Region.fulfillmentProviders",
      many: true
    }),
    shippingOptions: (0, import_fields23.relationship)({
      ref: "ShippingOption.fulfillmentProvider",
      many: true
    }),
    shippingProviders: (0, import_fields23.relationship)({
      ref: "ShippingProvider.fulfillmentProvider",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/GiftCard.ts
var import_core21 = require("@keystone-6/core");
var import_fields24 = require("@keystone-6/core/fields");
var GiftCard = (0, import_core21.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadGiftCards({ session }) || permissions.canManageGiftCards({ session }),
      create: permissions.canManageGiftCards,
      update: permissions.canManageGiftCards,
      delete: permissions.canManageGiftCards
    }
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const giftCard = await sudoContext.query.GiftCard.findOne({
          where: { id: item.id },
          query: "carts { id }"
        });
        if (giftCard?.carts?.length) {
          for (const cart of giftCard.carts) {
            await sudoContext.query.Cart.updateOne({
              where: { id: cart.id },
              data: {
                paymentCollection: {
                  disconnect: true
                }
              }
            });
          }
        }
      }
    }
  },
  fields: {
    code: (0, import_fields24.text)({
      validation: {
        isRequired: true
      },
      isIndexed: "unique"
    }),
    value: (0, import_fields24.integer)({
      validation: {
        isRequired: true
      }
    }),
    balance: (0, import_fields24.integer)({
      validation: {
        isRequired: true
      }
    }),
    isDisabled: (0, import_fields24.checkbox)(),
    endsAt: (0, import_fields24.timestamp)(),
    metadata: (0, import_fields24.json)(),
    order: (0, import_fields24.relationship)({
      ref: "Order.giftCards"
    }),
    carts: (0, import_fields24.relationship)({
      ref: "Cart.giftCards",
      many: true
    }),
    giftCardTransactions: (0, import_fields24.relationship)({
      ref: "GiftCardTransaction.giftCard",
      many: true
    }),
    region: (0, import_fields24.relationship)({
      ref: "Region.giftCards"
    }),
    ...trackingFields
  }
});

// features/keystone/models/GiftCardTransaction.ts
var import_core22 = require("@keystone-6/core");
var import_fields25 = require("@keystone-6/core/fields");
var GiftCardTransaction = (0, import_core22.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadGiftCards({ session }) || permissions.canManageGiftCards({ session }),
      create: permissions.canManageGiftCards,
      update: permissions.canManageGiftCards,
      delete: permissions.canManageGiftCards
    }
  },
  fields: {
    amount: (0, import_fields25.integer)({
      validation: {
        isRequired: true
      }
    }),
    isTaxable: (0, import_fields25.checkbox)(),
    taxRate: (0, import_fields25.float)(),
    giftCard: (0, import_fields25.relationship)({
      ref: "GiftCard.giftCardTransactions"
    }),
    order: (0, import_fields25.relationship)({
      ref: "Order.giftCardTransactions"
    }),
    ...trackingFields
  }
});

// features/keystone/models/IdempotencyKey.ts
var import_core23 = require("@keystone-6/core");
var import_fields26 = require("@keystone-6/core/fields");
var IdempotencyKey = (0, import_core23.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadIdempotencyKeys({ session }) || permissions.canManageIdempotencyKeys({ session }),
      create: permissions.canManageIdempotencyKeys,
      update: permissions.canManageIdempotencyKeys,
      delete: permissions.canManageIdempotencyKeys
    }
  },
  fields: {
    idempotencyKey: (0, import_fields26.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    requestMethod: (0, import_fields26.text)(),
    requestParams: (0, import_fields26.json)(),
    requestPath: (0, import_fields26.text)(),
    responseCode: (0, import_fields26.integer)(),
    responseBody: (0, import_fields26.json)(),
    recoveryPoint: (0, import_fields26.text)({
      defaultValue: "started",
      validation: {
        isRequired: true
      }
    }),
    lockedAt: (0, import_fields26.timestamp)(),
    ...trackingFields
  }
});

// features/keystone/models/Invite.ts
var import_core24 = require("@keystone-6/core");
var import_fields27 = require("@keystone-6/core/fields");
var Invite = (0, import_core24.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    userEmail: (0, import_fields27.text)({
      validation: {
        isRequired: true
      }
    }),
    role: (0, import_fields27.select)({
      type: "enum",
      options: [
        {
          label: "Admin",
          value: "admin"
        },
        {
          label: "Member",
          value: "member"
        },
        {
          label: "Developer",
          value: "developer"
        }
      ],
      defaultValue: "member"
    }),
    accepted: (0, import_fields27.checkbox)(),
    metadata: (0, import_fields27.json)(),
    token: (0, import_fields27.text)({
      validation: {
        isRequired: true
      }
    }),
    expiresAt: (0, import_fields27.timestamp)({
      defaultValue: { kind: "now" },
      validation: {
        isRequired: true
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/Account.ts
var import_core25 = require("@keystone-6/core");
var import_fields28 = require("@keystone-6/core/fields");
var Account = (0, import_core25.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    // Core account data
    user: (0, import_fields28.relationship)({
      ref: "User.accounts",
      many: false,
      validation: { isRequired: true }
    }),
    accountNumber: (0, import_fields28.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    title: (0, import_fields28.text)({
      validation: { isRequired: true },
      defaultValue: "Business Account"
    }),
    description: (0, import_fields28.text)({
      ui: { displayMode: "textarea" },
      defaultValue: "Running business account for automated orders placed through API integration"
    }),
    // Financial fields (amounts in cents)
    totalAmount: (0, import_fields28.integer)({
      defaultValue: 0
    }),
    paidAmount: (0, import_fields28.integer)({
      defaultValue: 0
    }),
    creditLimit: (0, import_fields28.integer)({
      validation: { isRequired: true },
      defaultValue: 1e5
      // $1000 default
    }),
    currency: (0, import_fields28.relationship)({
      ref: "Currency.accounts",
      many: false,
      validation: { isRequired: true }
    }),
    // Status and dates
    status: (0, import_fields28.select)({
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "Not Approved", value: "not_approved" },
        { label: "Paid", value: "paid" },
        { label: "Overdue", value: "overdue" }
      ],
      defaultValue: "active",
      validation: { isRequired: true }
    }),
    dueDate: (0, import_fields28.timestamp)(),
    paidAt: (0, import_fields28.timestamp)(),
    suspendedAt: (0, import_fields28.timestamp)(),
    notApprovedAt: (0, import_fields28.timestamp)(),
    // Account type
    accountType: (0, import_fields28.select)({
      options: [
        { label: "Business", value: "business" },
        { label: "Personal", value: "personal" }
      ],
      defaultValue: "business",
      validation: { isRequired: true }
    }),
    // Metadata for additional context
    metadata: (0, import_fields28.json)({
      defaultValue: {}
    }),
    // Relationships
    orders: (0, import_fields28.relationship)({
      ref: "Order.account",
      many: true
    }),
    lineItems: (0, import_fields28.relationship)({
      ref: "AccountLineItem.account",
      many: true
    }),
    invoices: (0, import_fields28.relationship)({
      ref: "Invoice.account",
      many: true
    }),
    // Virtual computed fields
    ...(0, import_core25.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for account display",
      fields: {
        balanceDue: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.Int,
            resolve(item) {
              return (item.totalAmount || 0) - (item.paidAmount || 0);
            }
          })
        }),
        formattedTotal: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  totalAmount
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!account?.currency) return "$0.00";
              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const amount = (account.totalAmount || 0) / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency.code
              }).format(amount);
            }
          })
        }),
        formattedBalance: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  totalAmount
                  paidAmount
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!account?.currency) return "$0.00";
              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const balance = ((account.totalAmount || 0) - (account.paidAmount || 0)) / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency.code
              }).format(balance);
            }
          })
        }),
        formattedCreditLimit: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  creditLimit
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!account?.currency) return "$0.00";
              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const limit = (account.creditLimit || 0) / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency.code
              }).format(limit);
            }
          })
        }),
        availableCredit: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.Int,
            resolve(item) {
              const used = (item.totalAmount || 0) - (item.paidAmount || 0);
              return Math.max(0, (item.creditLimit || 0) - used);
            }
          })
        }),
        formattedAvailableCredit: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  totalAmount
                  paidAmount
                  creditLimit
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!account?.currency) return "$0.00";
              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const used = ((account.totalAmount || 0) - (account.paidAmount || 0)) / divisor;
              const available = Math.max(0, (account.creditLimit || 0) / divisor - used);
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency.code
              }).format(available);
            }
          })
        }),
        // New currency-aware fields for multi-region support
        totalOwedInAccountCurrency: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.Int,
            async resolve(item, args, context) {
              const convertCurrency2 = (await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports))).default;
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                `
              });
              if (!account?.currency?.code) return 0;
              const unpaidItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: "unpaid" }
                },
                query: `
                  amount
                  region {
                    currency { code }
                  }
                `
              });
              let totalInAccountCurrency = 0;
              for (const lineItem of unpaidItems) {
                if (lineItem.region?.currency?.code) {
                  const converted = await convertCurrency2(
                    lineItem.amount || 0,
                    lineItem.region.currency.code,
                    account.currency.code
                  );
                  totalInAccountCurrency += converted;
                }
              }
              return totalInAccountCurrency;
            }
          })
        }),
        availableCreditInAccountCurrency: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.Int,
            async resolve(item, args, context) {
              const convertCurrency2 = (await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports))).default;
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  creditLimit
                  currency { code }
                `
              });
              if (!account?.currency?.code) return 0;
              const unpaidItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: "unpaid" }
                },
                query: `
                  amount
                  region {
                    currency { code }
                  }
                `
              });
              let totalOwedInAccountCurrency = 0;
              for (const lineItem of unpaidItems) {
                if (lineItem.region?.currency?.code) {
                  const converted = await convertCurrency2(
                    lineItem.amount || 0,
                    lineItem.region.currency.code,
                    account.currency.code
                  );
                  totalOwedInAccountCurrency += converted;
                }
              }
              const creditLimit = account.creditLimit || 0;
              return Math.max(0, creditLimit - totalOwedInAccountCurrency);
            }
          })
        }),
        formattedTotalOwedInAccountCurrency: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.String,
            async resolve(item, args, context) {
              const { formatCurrencyAmount: formatCurrencyAmount3 } = await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports));
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                  totalOwedInAccountCurrency
                `
              });
              if (!account?.currency?.code) return "$0.00";
              return formatCurrencyAmount3(
                account.totalOwedInAccountCurrency || 0,
                account.currency.code
              );
            }
          })
        }),
        formattedAvailableCreditInAccountCurrency: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.String,
            async resolve(item, args, context) {
              const { formatCurrencyAmount: formatCurrencyAmount3 } = await Promise.resolve().then(() => (init_currencyConversion(), currencyConversion_exports));
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency { code }
                  availableCreditInAccountCurrency
                `
              });
              if (!account?.currency?.code) return "$0.00";
              return formatCurrencyAmount3(
                account.availableCreditInAccountCurrency || 0,
                account.currency.code
              );
            }
          })
        }),
        unpaidLineItemsByRegion: (0, import_fields28.virtual)({
          field: import_core25.graphql.field({
            type: import_core25.graphql.JSON,
            async resolve(item, args, context) {
              const unpaidLineItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: "unpaid" }
                },
                query: `
                  id
                  amount
                  description
                  orderDisplayId
                  itemCount
                  createdAt
                  formattedAmount
                  region {
                    id
                    name
                    currency {
                      id
                      code
                      symbol
                      noDivisionCurrency
                    }
                  }
                `,
                orderBy: { createdAt: "desc" }
              });
              if (unpaidLineItems.length === 0) {
                return {
                  success: true,
                  regions: [],
                  totalRegions: 0,
                  totalUnpaidItems: 0,
                  message: "No unpaid items found"
                };
              }
              const lineItemsByRegion = unpaidLineItems.reduce((acc, item2) => {
                const regionId = item2.region.id;
                const regionName = item2.region.name;
                const currency = item2.region.currency;
                if (!acc[regionId]) {
                  acc[regionId] = {
                    region: {
                      id: regionId,
                      name: regionName,
                      currency
                    },
                    lineItems: [],
                    totalAmount: 0,
                    itemCount: 0
                  };
                }
                acc[regionId].lineItems.push({
                  id: item2.id,
                  amount: item2.amount,
                  description: item2.description,
                  orderDisplayId: item2.orderDisplayId,
                  itemCount: item2.itemCount,
                  createdAt: item2.createdAt,
                  formattedAmount: item2.formattedAmount
                });
                acc[regionId].totalAmount += item2.amount || 0;
                acc[regionId].itemCount += item2.itemCount || 0;
                return acc;
              }, {});
              const regionsWithLineItems = Object.values(lineItemsByRegion).map((regionData) => {
                const divisor = regionData.region.currency.noDivisionCurrency ? 1 : 100;
                const formattedTotal = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: regionData.region.currency.code
                }).format(regionData.totalAmount / divisor);
                return {
                  ...regionData,
                  formattedTotalAmount: formattedTotal
                };
              });
              regionsWithLineItems.sort((a, b) => b.totalAmount - a.totalAmount);
              return {
                success: true,
                regions: regionsWithLineItems,
                totalRegions: regionsWithLineItems.length,
                totalUnpaidItems: unpaidLineItems.length,
                message: `Found ${unpaidLineItems.length} unpaid orders across ${regionsWithLineItems.length} regions`
              };
            }
          })
        })
      }
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput({ operation, resolvedData }) {
      if (operation === "create" && !resolvedData.accountNumber) {
        const timestamp29 = Date.now();
        resolvedData.accountNumber = `ACC-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(timestamp29).slice(-6)}`;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/AccountLineItem.ts
var import_core26 = require("@keystone-6/core");
var import_fields29 = require("@keystone-6/core/fields");
var AccountLineItem = (0, import_core26.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    // Core relationships
    account: (0, import_fields29.relationship)({
      ref: "Account.lineItems",
      many: false,
      validation: { isRequired: true }
    }),
    order: (0, import_fields29.relationship)({
      ref: "Order.accountLineItems",
      many: false,
      validation: { isRequired: true }
    }),
    region: (0, import_fields29.relationship)({
      ref: "Region.accountLineItems",
      many: false
    }),
    // Line item details
    description: (0, import_fields29.text)({
      validation: { isRequired: true },
      defaultValue: "Order line item"
    }),
    amount: (0, import_fields29.integer)({
      validation: { isRequired: true },
      label: "Amount (in cents)"
    }),
    orderDisplayId: (0, import_fields29.text)({
      validation: { isRequired: true },
      isIndexed: true
    }),
    itemCount: (0, import_fields29.integer)({
      validation: { isRequired: true },
      defaultValue: 0
    }),
    paymentStatus: (0, import_fields29.select)({
      options: [
        { label: "Unpaid", value: "unpaid" },
        { label: "Paid", value: "paid" }
      ],
      defaultValue: "unpaid",
      validation: { isRequired: true }
    }),
    // Junction relationship to track which invoices paid this item
    invoiceLineItems: (0, import_fields29.relationship)({
      ref: "InvoiceLineItem.accountLineItem",
      many: true
    }),
    // Virtual computed fields
    ...(0, import_core26.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for line item display",
      fields: {
        formattedAmount: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
            async resolve(item, args, context) {
              const lineItem = await context.sudo().query.AccountLineItem.findOne({
                where: { id: item.id },
                query: `
                  amount
                  account {
                    currency {
                      code
                      symbol
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!lineItem?.account?.currency) return "$0.00";
              const divisor = lineItem.account.currency.noDivisionCurrency ? 1 : 100;
              const amount = (lineItem.amount || 0) / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: lineItem.account.currency.code
              }).format(amount);
            }
          })
        }),
        orderDetails: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.JSON,
            async resolve(item, args, context) {
              const lineItem = await context.sudo().query.AccountLineItem.findOne({
                where: { id: item.id },
                query: `
                  order {
                    id
                    displayId
                    status
                    email
                    createdAt
                    total
                    subtotal
                    shipping
                    tax
                    lineItems {
                      id
                      title
                      quantity
                      sku
                      variantTitle
                      formattedUnitPrice
                      formattedTotal
                      thumbnail
                    }
                  }
                `
              });
              return lineItem?.order || null;
            }
          })
        })
      }
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput: async ({ resolvedData, context, operation }) => {
      if (operation === "create") {
        if (resolvedData.order?.connect?.id && (!resolvedData.description || !resolvedData.amount)) {
          const order = await context.sudo().query.Order.findOne({
            where: { id: resolvedData.order.connect.id },
            query: `
              displayId
              rawTotal
              lineItems {
                id
              }
            `
          });
          if (order) {
            return {
              ...resolvedData,
              description: resolvedData.description || `Order #${order.displayId} - ${order.lineItems?.length || 0} items`,
              amount: resolvedData.amount || order.rawTotal || 0,
              orderDisplayId: resolvedData.orderDisplayId || order.displayId,
              itemCount: resolvedData.itemCount || order.lineItems?.length || 0
            };
          }
        }
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/Invoice.ts
var import_core27 = require("@keystone-6/core");
var import_fields30 = require("@keystone-6/core/fields");
var Invoice = (0, import_core27.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    // Core invoice data
    user: (0, import_fields30.relationship)({
      ref: "User.invoices",
      many: false,
      validation: { isRequired: true }
    }),
    invoiceNumber: (0, import_fields30.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    title: (0, import_fields30.text)({
      validation: { isRequired: true },
      defaultValue: "Payment Invoice"
    }),
    description: (0, import_fields30.text)({
      ui: { displayMode: "textarea" },
      defaultValue: "Invoice for selected orders payment"
    }),
    // Financial fields (amounts in cents)
    totalAmount: (0, import_fields30.integer)({
      validation: { isRequired: true },
      defaultValue: 0
    }),
    currency: (0, import_fields30.relationship)({
      ref: "Currency.invoices",
      many: false,
      validation: { isRequired: true }
    }),
    // Status and dates
    status: (0, import_fields30.select)({
      options: [
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Paid", value: "paid" },
        { label: "Overdue", value: "overdue" },
        { label: "Cancelled", value: "cancelled" }
      ],
      defaultValue: "paid",
      // Most invoices will be immediately paid
      validation: { isRequired: true }
    }),
    dueDate: (0, import_fields30.timestamp)(),
    paidAt: (0, import_fields30.timestamp)({
      defaultValue: { kind: "now" }
      // Default to now since most are paid immediately
    }),
    // Metadata for payment details
    metadata: (0, import_fields30.json)({
      defaultValue: {}
    }),
    // Relationships
    account: (0, import_fields30.relationship)({
      ref: "Account.invoices",
      many: false,
      validation: { isRequired: true }
    }),
    lineItems: (0, import_fields30.relationship)({
      ref: "InvoiceLineItem.invoice",
      many: true
    }),
    // Virtual computed fields
    ...(0, import_core27.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for invoice display",
      fields: {
        formattedTotal: (0, import_fields30.virtual)({
          field: import_core27.graphql.field({
            type: import_core27.graphql.String,
            async resolve(item, args, context) {
              const invoice = await context.sudo().query.Invoice.findOne({
                where: { id: item.id },
                query: `
                  totalAmount
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!invoice?.currency) return "$0.00";
              const divisor = invoice.currency.noDivisionCurrency ? 1 : 100;
              const amount = (invoice.totalAmount || 0) / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: invoice.currency.code
              }).format(amount);
            }
          })
        }),
        itemCount: (0, import_fields30.virtual)({
          field: import_core27.graphql.field({
            type: import_core27.graphql.Int,
            async resolve(item, args, context) {
              const invoice = await context.sudo().query.Invoice.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                  }
                `
              });
              return invoice?.lineItems?.length || 0;
            }
          })
        })
      }
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput({ operation, resolvedData }) {
      if (operation === "create" && !resolvedData.invoiceNumber) {
        const timestamp29 = Date.now();
        resolvedData.invoiceNumber = `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(timestamp29).slice(-6)}`;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/InvoiceLineItem.ts
var import_core28 = require("@keystone-6/core");
var import_fields31 = require("@keystone-6/core/fields");
var InvoiceLineItem = (0, import_core28.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    // Junction table relationships
    invoice: (0, import_fields31.relationship)({
      ref: "Invoice.lineItems",
      many: false,
      validation: { isRequired: true }
    }),
    accountLineItem: (0, import_fields31.relationship)({
      ref: "AccountLineItem.invoiceLineItems",
      many: false,
      validation: { isRequired: true }
    }),
    // Virtual computed fields
    ...(0, import_core28.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields from related account line item",
      fields: {
        orderDisplayId: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.String,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    orderDisplayId
                  }
                `
              });
              return invoiceLineItem?.accountLineItem?.orderDisplayId || "";
            }
          })
        }),
        formattedAmount: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.String,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    formattedAmount
                  }
                `
              });
              return invoiceLineItem?.accountLineItem?.formattedAmount || "$0.00";
            }
          })
        }),
        orderDetails: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.JSON,
            async resolve(item, args, context) {
              const invoiceLineItem = await context.sudo().query.InvoiceLineItem.findOne({
                where: { id: item.id },
                query: `
                  accountLineItem {
                    orderDetails
                  }
                `
              });
              return invoiceLineItem?.accountLineItem?.orderDetails || null;
            }
          })
        })
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/BusinessAccountRequest.ts
var import_core29 = require("@keystone-6/core");
var import_fields32 = require("@keystone-6/core/fields");
var BusinessAccountRequest = (0, import_core29.list)({
  access: {
    operation: {
      query: ({ session }) => {
        if (permissions.canManageOrders({ session })) return true;
        return isSignedIn({ session });
      },
      create: isSignedIn,
      // Any authenticated user can create requests
      update: permissions.canManageOrders,
      // Only admins can update/approve
      delete: permissions.canManageOrders
      // Only admins can delete
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canManageOrders({ session })) return true;
        return { user: { id: { equals: session?.itemId } } };
      }
    }
  },
  fields: {
    // Core relationship
    user: (0, import_fields32.relationship)({
      ref: "User.businessAccountRequest",
      many: false,
      validation: { isRequired: true }
    }),
    // Request details
    businessName: (0, import_fields32.text)({
      validation: { isRequired: true }
    }),
    businessType: (0, import_fields32.select)({
      options: [
        { label: "Wholesale Partner", value: "wholesale" },
        { label: "Distribution Channel", value: "distribution" },
        { label: "Authorized Reseller", value: "reseller" },
        { label: "B2B Platform", value: "b2b_platform" },
        { label: "Other", value: "other" }
      ],
      validation: { isRequired: true }
    }),
    monthlyOrderVolume: (0, import_fields32.select)({
      options: [
        { label: "1-50 orders/month", value: "low" },
        { label: "51-200 orders/month", value: "medium" },
        { label: "201-1000 orders/month", value: "high" },
        { label: "1000+ orders/month", value: "enterprise" }
      ],
      validation: { isRequired: true }
    }),
    requestedCreditLimit: (0, import_fields32.integer)({
      validation: { isRequired: true },
      label: "Requested Credit Limit (in cents)"
    }),
    businessDescription: (0, import_fields32.text)({
      ui: { displayMode: "textarea" },
      validation: { isRequired: true }
    }),
    // Status tracking
    status: (0, import_fields32.select)({
      options: [
        { label: "Pending", value: "pending" },
        { label: "Approved", value: "approved" },
        { label: "Not Approved", value: "not_approved" },
        { label: "Requires Info", value: "requires_info" }
      ],
      defaultValue: "pending",
      validation: { isRequired: true }
    }),
    // Admin fields
    reviewedBy: (0, import_fields32.relationship)({
      ref: "User",
      many: false,
      label: "Reviewed By Admin"
    }),
    reviewNotes: (0, import_fields32.text)({
      ui: { displayMode: "textarea" },
      label: "Admin Review Notes"
    }),
    approvedCreditLimit: (0, import_fields32.integer)({
      label: "Approved Credit Limit (in cents)"
    }),
    // Timestamps
    submittedAt: (0, import_fields32.timestamp)({
      defaultValue: { kind: "now" },
      validation: { isRequired: true }
    }),
    reviewedAt: (0, import_fields32.timestamp)(),
    // Generated account (once approved)
    generatedAccount: (0, import_fields32.relationship)({
      ref: "Account",
      many: false,
      label: "Generated Account"
    }),
    // Virtual computed fields
    ...(0, import_core29.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for request display",
      fields: {
        formattedRequestedCredit: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
            resolve(item) {
              const amount = (item.requestedCreditLimit || 0) / 100;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(amount);
            }
          })
        }),
        formattedApprovedCredit: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
            resolve(item) {
              if (!item.approvedCreditLimit) return null;
              const amount = (item.approvedCreditLimit || 0) / 100;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(amount);
            }
          })
        }),
        businessTypeLabel: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
            resolve(item) {
              const typeMap = {
                wholesale: "Wholesale Partner",
                distribution: "Distribution Channel",
                reseller: "Authorized Reseller",
                b2b_platform: "B2B Platform",
                other: "Other"
              };
              return typeMap[item.businessType] || item.businessType;
            }
          })
        }),
        volumeLabel: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
            resolve(item) {
              const volumeMap = {
                low: "1-50 orders/month",
                medium: "51-200 orders/month",
                high: "201-1000 orders/month",
                enterprise: "1000+ orders/month"
              };
              return volumeMap[item.monthlyOrderVolume] || item.monthlyOrderVolume;
            }
          })
        }),
        statusLabel: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
            resolve(item) {
              const statusMap = {
                pending: "Pending Review",
                approved: "Approved",
                not_approved: "Not Approved",
                requires_info: "Requires Additional Information"
              };
              return statusMap[item.status] || item.status;
            }
          })
        })
      }
    }),
    ...trackingFields
  },
  hooks: {
    beforeOperation: async ({ operation, item, originalItem, inputData, resolvedData, context }) => {
      console.log("=== BusinessAccountRequest beforeOperation Hook ===");
      console.log("operation:", operation);
      console.log("inputData:", JSON.stringify(inputData, null, 2));
      console.log("item (current item):", JSON.stringify(item, null, 2));
      if (operation === "update" && item?.id && inputData?.status === "approved" && item?.status !== "approved") {
        const accountId = await createAccountFromApprovedRequest(
          { id: item.id, ...inputData },
          context
        );
        if (accountId) {
          return {
            ...resolvedData,
            generatedAccount: { connect: { id: accountId } }
          };
        }
      } else {
        console.log('  - operation === "update":', operation === "update");
        console.log("  - item?.id exists:", !!item?.id);
        console.log('  - inputData?.status === "approved":', inputData?.status === "approved");
        console.log('  - item?.status !== "approved":', item?.status !== "approved");
      }
      return resolvedData;
    }
  }
});
async function createAccountFromApprovedRequest(request, context) {
  console.log("request.id:", request.id);
  try {
    const fullRequest = await context.sudo().query.BusinessAccountRequest.findOne({
      where: { id: request.id },
      query: `
        id
        businessName
        businessType
        approvedCreditLimit
        user {
          id
          email
          name
        }
      `
    });
    console.log("fullRequest:", JSON.stringify(fullRequest, null, 2));
    if (!fullRequest) {
      console.error("\u274C Full request not found!");
      return null;
    }
    console.log("\u{1F4B0} Looking for USD currency...");
    const defaultCurrency = await context.sudo().query.Currency.findOne({
      where: { code: "usd" },
      query: "id code"
    });
    console.log("defaultCurrency:", defaultCurrency);
    if (!defaultCurrency) {
      console.error("\u274C Default USD currency not found");
      return null;
    }
    console.log("\u{1F3E6} Creating business account...");
    const account = await context.sudo().query.Account.createOne({
      data: {
        user: { connect: { id: fullRequest.user.id } },
        title: "Business Account",
        description: `Running business account for automated orders placed through API integration - ${fullRequest.businessName}`,
        currency: { connect: { id: defaultCurrency.id } },
        status: "active",
        creditLimit: request.approvedCreditLimit || fullRequest.approvedCreditLimit || 1e5,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
        // 30 days from now
        accountType: "business",
        metadata: {
          createdFromRequest: fullRequest.id,
          businessType: fullRequest.businessType,
          businessName: fullRequest.businessName,
          approvedCreditLimit: request.approvedCreditLimit || fullRequest.approvedCreditLimit
        }
      }
    });
    console.log("\u{1F511} Generating customer token...");
    const customerToken = generateSecureToken();
    console.log("Generated token:", customerToken);
    console.log("\u{1F464} Updating user with customer token...");
    await context.sudo().query.User.updateOne({
      where: { id: fullRequest.user.id },
      data: {
        customerToken,
        tokenGeneratedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
    console.log(`Account created for user ${fullRequest.user.email}, token: ${customerToken}`);
    return account.id;
  } catch (error) {
    console.error("Error creating account from approved request:", error);
    return null;
  }
}
function generateSecureToken() {
  const crypto3 = require("crypto");
  return "ctok_" + crypto3.randomBytes(32).toString("hex");
}

// features/keystone/models/LineItem.ts
var import_core30 = require("@keystone-6/core");
var import_fields33 = require("@keystone-6/core/fields");
var formatCurrency2 = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
};
var LineItem = (0, import_core30.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const lineItem = await sudoContext.query.LineItem.findOne({
          where: { id: item.id },
          query: "cart { id }"
        });
        if (lineItem?.cart?.id) {
          await sudoContext.query.Cart.updateOne({
            where: { id: lineItem.cart.id },
            data: {
              paymentCollection: {
                disconnect: true
              }
            }
          });
        }
      }
    }
  },
  fields: {
    // Core fields
    quantity: (0, import_fields33.integer)({
      validation: { isRequired: true }
    }),
    metadata: (0, import_fields33.json)(),
    isReturn: (0, import_fields33.checkbox)(),
    isGiftcard: (0, import_fields33.checkbox)(),
    shouldMerge: (0, import_fields33.checkbox)({
      defaultValue: true
    }),
    allowDiscounts: (0, import_fields33.checkbox)({
      defaultValue: true
    }),
    hasShipping: (0, import_fields33.checkbox)(),
    // Relationships
    claimOrder: (0, import_fields33.relationship)({
      ref: "ClaimOrder.lineItems"
    }),
    cart: (0, import_fields33.relationship)({
      ref: "Cart.lineItems"
    }),
    swap: (0, import_fields33.relationship)({
      ref: "Swap.lineItems"
    }),
    productVariant: (0, import_fields33.relationship)({
      ref: "ProductVariant.lineItems"
    }),
    claimItems: (0, import_fields33.relationship)({
      ref: "ClaimItem.lineItem",
      many: true
    }),
    lineItemAdjustments: (0, import_fields33.relationship)({
      ref: "LineItemAdjustment.lineItem",
      many: true
    }),
    lineItemTaxLines: (0, import_fields33.relationship)({
      ref: "LineItemTaxLine.lineItem",
      many: true
    }),
    returnItems: (0, import_fields33.relationship)({
      ref: "ReturnItem.lineItem",
      many: true
    }),
    ...(0, import_core30.group)({
      label: "Virtual Fields",
      description: "Virtual fields for line item",
      fields: {
        title: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: "productVariant { product { title } }"
              });
              if (!lineItem?.productVariant?.product) {
                return "Product not found";
              }
              return lineItem.productVariant.product.title;
            }
          })
        }),
        thumbnail: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: "productVariant { product { thumbnail } }"
              });
              if (!lineItem?.productVariant?.product) {
                return null;
              }
              return lineItem.productVariant.product.thumbnail;
            }
          })
        }),
        description: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.JSON,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: "productVariant { product { description { document } } }"
              });
              if (!lineItem?.productVariant?.product) {
                return null;
              }
              return lineItem.productVariant.product.description.document;
            }
          })
        }),
        originalPrice: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `cart { region { id taxRate currency { code noDivisionCurrency } } }`
              });
              if (!cart) {
                return "No cart associated";
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: `
                  calculatedPrice {
                    originalAmount
                    currencyCode
                  }
                `
              });
              const price = prices[0]?.calculatedPrice;
              const currencyCode = cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }
              const amount = price.originalAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency ? 1 : 100;
              const finalAmount = Math.round(amount) / divisor;
              return formatCurrency2(finalAmount, currencyCode);
            }
          })
        }),
        unitPrice: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  cart {
                    region {
                      id
                      currency {
                        code
                        noDivisionCurrency
                      }
                    }
                  }
                `
              });
              if (!cart) {
                return "No cart associated";
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: `
                  calculatedPrice {
                    calculatedAmount
                    currencyCode
                  }
                `
              });
              const price = prices[0]?.calculatedPrice;
              const currencyCode = cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }
              const amount = price.calculatedAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency ? 1 : 100;
              const finalAmount = Math.round(amount) / divisor;
              return formatCurrency2(finalAmount, currencyCode);
            }
          })
        }),
        total: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart, quantity } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  quantity
                  cart {
                    region {
                      id
                      currency {
                        code
                        noDivisionCurrency
                      }
                    }
                  }
                `
              });
              if (!cart) {
                return "No cart associated";
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: `
                  calculatedPrice {
                    calculatedAmount
                    currencyCode
                  }
                `
              });
              const price = prices[0]?.calculatedPrice;
              const currencyCode = cart?.region?.currency?.code || price?.currencyCode;
              if (!price || !currencyCode) {
                return "No price available";
              }
              const amount = price.calculatedAmount;
              const divisor = cart?.region?.currency?.noDivisionCurrency ? 1 : 100;
              const finalAmount = Math.round(amount * quantity) / divisor;
              return formatCurrency2(finalAmount, currencyCode);
            }
          })
        }),
        availableInRegion: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  cart { 
                    region { 
                      id 
                    }
                  }
                `
              });
              if (!cart) {
                return "no_cart";
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: "id"
              });
              return prices.length > 0 ? "available" : "unavailable";
            }
          })
        }),
        percentageOff: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const { cart, quantity } = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `cart { region { id } } quantity`
              });
              if (!cart) {
                return 0;
              }
              const prices = await sudoContext.query.MoneyAmount.findMany({
                where: {
                  productVariant: {
                    lineItems: { some: { id: { equals: item.id } } }
                  },
                  region: { id: { equals: cart.region.id } }
                },
                query: `
                  id
                  amount
                  calculatedPrice {
                    calculatedAmount
                    originalAmount
                    currencyCode
                  }
                `
              });
              const price = prices[0]?.calculatedPrice;
              if (!price) return 0;
              const originalAmount = price.originalAmount * quantity;
              const calculatedAmount = price.calculatedAmount * quantity;
              if (!originalAmount || originalAmount <= calculatedAmount)
                return 0;
              const diff = originalAmount - calculatedAmount;
              return Math.round(diff / originalAmount * 100);
            }
          })
        }),
        fulfillmentStatus: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  quantity
                  fulfillmentItems {
                    quantity
                    fulfillment {
                      canceledAt
                    }
                  }
                `
              });
              if (!lineItem?.quantity) return "Unfulfilled";
              const fulfilledQuantity = lineItem.fulfillmentItems?.filter((fi) => !fi.fulfillment?.canceledAt)?.reduce((sum, fi) => sum + (fi.quantity || 0), 0) || 0;
              if (fulfilledQuantity === 0) return "Unfulfilled";
              if (fulfilledQuantity === lineItem.quantity) return "Fulfilled";
              return `${fulfilledQuantity}/${lineItem.quantity} Partially Fulfilled`;
            }
          })
        })
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/LineItemAdjustment.ts
var import_core31 = require("@keystone-6/core");
var import_fields34 = require("@keystone-6/core/fields");
var LineItemAdjustment = (0, import_core31.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    description: (0, import_fields34.text)({
      validation: {
        isRequired: true
      }
    }),
    amount: (0, import_fields34.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields34.json)(),
    discount: (0, import_fields34.relationship)({
      ref: "Discount.lineItemAdjustments"
    }),
    lineItem: (0, import_fields34.relationship)({
      ref: "LineItem.lineItemAdjustments"
    }),
    ...trackingFields
  }
});

// features/keystone/models/LineItemTaxLine.ts
var import_core32 = require("@keystone-6/core");
var import_fields35 = require("@keystone-6/core/fields");
var LineItemTaxLine = (0, import_core32.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    rate: (0, import_fields35.float)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields35.text)({
      validation: {
        isRequired: true
      }
    }),
    code: (0, import_fields35.text)(),
    metadata: (0, import_fields35.json)(),
    lineItem: (0, import_fields35.relationship)({
      ref: "LineItem.lineItemTaxLines"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Location.ts
var import_core33 = require("@keystone-6/core");
var import_fields36 = require("@keystone-6/core/fields");
var Location = (0, import_core33.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    name: (0, import_fields36.text)({
      validation: { isRequired: true }
    }),
    description: (0, import_fields36.text)(),
    address: (0, import_fields36.text)(),
    variants: (0, import_fields36.relationship)({
      ref: "ProductVariant.location",
      many: true
    }),
    ...trackingFields
  },
  hooks: {
    validateInput: async ({ resolvedData, addValidationError }) => {
      const { name } = resolvedData;
      if (name && name.length < 2) {
        addValidationError("Location name must be at least 2 characters long");
      }
    }
  }
});

// features/keystone/models/Measurement.ts
var import_core34 = require("@keystone-6/core");
var import_fields37 = require("@keystone-6/core/fields");
var UNITS = {
  weight: ["g", "kg", "oz", "lb"],
  dimensions: ["cm", "m", "in", "ft"]
};
var Measurement = (0, import_core34.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields37.float)({
      validation: {
        isRequired: true,
        min: 0
      }
    }),
    unit: (0, import_fields37.select)({
      type: "string",
      validation: {
        isRequired: true
      },
      options: [...UNITS.weight, ...UNITS.dimensions].map((unit) => ({
        label: unit.toUpperCase(),
        value: unit
      })),
      defaultValue: "g",
      ui: {
        displayMode: "select"
      }
    }),
    type: (0, import_fields37.select)({
      type: "string",
      validation: {
        isRequired: true
      },
      options: [
        { label: "Weight", value: "weight" },
        { label: "Length", value: "length" },
        { label: "Width", value: "width" },
        { label: "Height", value: "height" }
      ],
      defaultValue: "weight",
      ui: {
        displayMode: "select"
      }
    }),
    productVariant: (0, import_fields37.relationship)({
      ref: "ProductVariant.measurements"
    }),
    ...trackingFields
  }
});

// features/keystone/models/MoneyAmount.ts
var import_core35 = require("@keystone-6/core");
var import_fields38 = require("@keystone-6/core/fields");
var MoneyAmount = (0, import_core35.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    amount: (0, import_fields38.integer)({
      validation: {
        isRequired: true
      }
    }),
    compareAmount: (0, import_fields38.integer)(),
    minQuantity: (0, import_fields38.integer)(),
    maxQuantity: (0, import_fields38.integer)(),
    productVariant: (0, import_fields38.relationship)({
      ref: "ProductVariant.prices"
    }),
    region: (0, import_fields38.relationship)({
      ref: "Region.moneyAmounts"
    }),
    currency: (0, import_fields38.relationship)({
      ref: "Currency.moneyAmounts"
    }),
    priceList: (0, import_fields38.relationship)({
      ref: "PriceList.moneyAmounts"
    }),
    priceSet: (0, import_fields38.relationship)({
      ref: "PriceSet.prices"
    }),
    priceRules: (0, import_fields38.relationship)({
      ref: "PriceRule.moneyAmounts",
      many: true
    }),
    ...(0, import_core35.group)({
      label: "Virtual Fields",
      description: "Virtual fields for money amount",
      fields: {
        displayPrice: (0, import_fields38.virtual)({
          field: import_core35.graphql.field({
            type: import_core35.graphql.String,
            resolve: async (item, args, context) => {
              const { currency, amount } = await context.query.MoneyAmount.findOne({
                where: { id: item.id },
                query: "currency { symbol } amount"
              });
              return `${currency.symbol}${(amount / 100).toFixed(2)}`;
            }
          })
        }),
        calculatedPrice: (0, import_fields38.virtual)({
          field: import_core35.graphql.field({
            type: import_core35.graphql.object()({
              name: "CalculatedPrice",
              fields: {
                calculatedAmount: import_core35.graphql.field({ type: import_core35.graphql.Int }),
                originalAmount: import_core35.graphql.field({ type: import_core35.graphql.Int }),
                currencyCode: import_core35.graphql.field({ type: import_core35.graphql.String }),
                moneyAmountId: import_core35.graphql.field({ type: import_core35.graphql.ID }),
                variantId: import_core35.graphql.field({ type: import_core35.graphql.ID }),
                priceListId: import_core35.graphql.field({ type: import_core35.graphql.ID }),
                priceListType: import_core35.graphql.field({ type: import_core35.graphql.String })
              }
            }),
            resolve: async (item, args, context) => {
              const moneyAmount = await context.query.MoneyAmount.findOne({
                where: { id: item.id },
                query: `
                  id
                  amount
                  currency { code }
                  productVariant { id }
                  priceList { 
                    id 
                    type 
                    status
                    startsAt 
                    endsAt 
                  }
                  priceSet { 
                    id 
                    prices { 
                      id 
                      amount 
                      currency { code }
                      minQuantity
                      maxQuantity
                      priceList { 
                        id 
                        type 
                        status
                        startsAt 
                        endsAt 
                      }
                    }
                    priceRules {
                      id
                      type
                      value
                      priority
                      ruleAttribute
                      ruleValue
                    }
                  }
                `
              });
              if (!moneyAmount) return null;
              const now = /* @__PURE__ */ new Date();
              const currencyCode = moneyAmount.currency.code;
              let calculatedAmount = moneyAmount.amount;
              let originalAmount = moneyAmount.amount;
              let appliedPriceList = null;
              if (moneyAmount.priceList) {
                const startDate = new Date(moneyAmount.priceList.startsAt);
                const endDate = new Date(moneyAmount.priceList.endsAt);
                if (moneyAmount.priceList.status === "active" && (!startDate || startDate <= now) && (!endDate || endDate >= now)) {
                  appliedPriceList = moneyAmount.priceList;
                }
              }
              if (moneyAmount.priceSet) {
                const validPrices = moneyAmount.priceSet.prices.filter(
                  (price) => {
                    if (price.currency.code !== currencyCode) return false;
                    if (price.priceList) {
                      const startDate = new Date(price.priceList.startsAt);
                      const endDate = new Date(price.priceList.endsAt);
                      return price.priceList.status === "active" && (!startDate || startDate <= now) && (!endDate || endDate >= now);
                    }
                    return true;
                  }
                );
                if (validPrices.length > 0) {
                  validPrices.sort((a, b) => a.amount - b.amount);
                  calculatedAmount = validPrices[0].amount;
                  appliedPriceList = validPrices[0].priceList || null;
                }
                if (moneyAmount.priceSet.priceRules && moneyAmount.priceSet.priceRules.length > 0) {
                  const sortedRules = moneyAmount.priceSet.priceRules.sort(
                    (a, b) => b.priority - a.priority
                  );
                  for (const rule of sortedRules) {
                    if (rule.type === "fixed") {
                      calculatedAmount = Math.min(calculatedAmount, rule.value);
                    } else if (rule.type === "percentage") {
                      const discountAmount = Math.round(
                        calculatedAmount * (rule.value / 100)
                      );
                      calculatedAmount -= discountAmount;
                    }
                  }
                }
              }
              return {
                calculatedAmount,
                originalAmount,
                currencyCode,
                moneyAmountId: moneyAmount.id,
                variantId: moneyAmount.productVariant?.id || null,
                priceListId: appliedPriceList?.id || null,
                priceListType: appliedPriceList?.type || null
              };
            }
          }),
          ui: {
            query: "{ calculatedAmount originalAmount currencyCode moneyAmountId variantId priceListId priceListType }"
          }
        })
      }
    }),
    ...trackingFields
  },
  ui: {
    labelField: "displayPrice"
  }
});

// features/keystone/models/Note.ts
var import_core36 = require("@keystone-6/core");
var import_fields39 = require("@keystone-6/core/fields");
var Note = (0, import_core36.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    value: (0, import_fields39.text)({
      validation: {
        isRequired: true
      }
    }),
    resourceType: (0, import_fields39.text)({
      validation: {
        isRequired: true
      }
    }),
    resourceId: (0, import_fields39.text)({
      validation: {
        isRequired: true
      }
    }),
    authorId: (0, import_fields39.text)(),
    metadata: (0, import_fields39.json)(),
    ...trackingFields
  }
});

// features/keystone/models/Notification.ts
var import_core37 = require("@keystone-6/core");
var import_fields40 = require("@keystone-6/core/fields");
var Notification = (0, import_core37.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    eventName: (0, import_fields40.text)(),
    resourceType: (0, import_fields40.text)({
      validation: {
        isRequired: true
      }
    }),
    resourceId: (0, import_fields40.text)({
      validation: {
        isRequired: true
      }
    }),
    to: (0, import_fields40.text)({
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields40.json)(),
    parentId: (0, import_fields40.text)(),
    notificationProvider: (0, import_fields40.relationship)({
      ref: "NotificationProvider.notifications"
    }),
    user: (0, import_fields40.relationship)({
      ref: "User.notifications"
    }),
    otherNotifications: (0, import_fields40.relationship)({
      ref: "Notification",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/NotificationProvider.ts
var import_core38 = require("@keystone-6/core");
var import_fields41 = require("@keystone-6/core/fields");
var NotificationProvider = (0, import_core38.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    isInstalled: (0, import_fields41.checkbox)({
      defaultValue: true
    }),
    notifications: (0, import_fields41.relationship)({
      ref: "Notification.notificationProvider",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/OAuthApp.ts
var import_core39 = require("@keystone-6/core");
var import_fields42 = require("@keystone-6/core/fields");
var OAuthApp = (0, import_core39.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadApps({ session }) || permissions.canManageApps({ session }),
      create: ({ session }) => permissions.canManageApps({ session }),
      update: ({ session }) => permissions.canManageApps({ session }),
      delete: ({ session }) => permissions.canManageApps({ session })
    }
  },
  fields: {
    name: (0, import_fields42.text)({
      validation: {
        isRequired: true
      }
    }),
    clientId: (0, import_fields42.text)({
      isIndexed: "unique",
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === "create" && !resolvedData.clientId) {
            return `of_${Math.random().toString(36).substring(2, 18)}`;
          }
          return resolvedData.clientId;
        }
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Auto-generated unique identifier for your application."
      }
    }),
    clientSecret: (0, import_fields42.text)({
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === "create" && !resolvedData.clientSecret) {
            return `cs_${Math.random().toString(36).substring(2, 34)}`;
          }
          return resolvedData.clientSecret;
        }
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        // displayMode: "textarea",
        description: "Auto-generated secret key. Keep this secure - it's used to authenticate your application."
      }
    }),
    redirectUris: (0, import_fields42.json)({
      defaultValue: [],
      ui: {
        description: "Array of allowed redirect URIs for OAuth callbacks"
      }
    }),
    scopes: (0, import_fields42.json)({
      defaultValue: DEFAULT_SCOPES,
      ui: {
        description: "Array of allowed OAuth scopes that map to permissions"
      }
    }),
    webhookUrl: (0, import_fields42.text)({
      ui: {
        description: "URL to receive webhook notifications"
      }
    }),
    status: (0, import_fields42.select)({
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "Pending", value: "pending" }
      ],
      defaultValue: "active"
    }),
    installUrl: (0, import_fields42.text)({
      ui: {
        description: "URL where users can install this app"
      }
    }),
    uninstallUrl: (0, import_fields42.text)({
      ui: {
        description: "URL to handle app uninstallation"
      }
    }),
    description: (0, import_fields42.text)({
      ui: {
        displayMode: "textarea"
      }
    }),
    metadata: (0, import_fields42.json)({
      defaultValue: {},
      ui: {
        description: "Additional app-specific configuration and settings"
      }
    }),
    developerEmail: (0, import_fields42.text)(),
    privacyPolicyUrl: (0, import_fields42.text)(),
    termsOfServiceUrl: (0, import_fields42.text)(),
    supportUrl: (0, import_fields42.text)(),
    ...trackingFields
  },
  ui: {
    labelField: "name",
    listView: {
      initialColumns: ["name", "clientId", "status", "createdAt"]
    }
  }
});

// features/keystone/models/OAuthToken.ts
var import_core40 = require("@keystone-6/core");
var import_fields43 = require("@keystone-6/core/fields");
var OAuthToken = (0, import_core40.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadApps({ session }) || permissions.canManageApps({ session }),
      create: ({ session }) => permissions.canManageApps({ session }),
      update: ({ session }) => permissions.canManageApps({ session }),
      delete: ({ session }) => permissions.canManageApps({ session })
    }
  },
  fields: {
    tokenType: (0, import_fields43.select)({
      options: [
        { label: "Authorization Code", value: "authorization_code" },
        { label: "Access Token", value: "access_token" },
        { label: "Refresh Token", value: "refresh_token" }
      ],
      validation: {
        isRequired: true
      }
    }),
    token: (0, import_fields43.text)({
      validation: {
        isRequired: true
      },
      isIndexed: "unique"
    }),
    clientId: (0, import_fields43.text)({
      validation: {
        isRequired: true
      },
      isIndexed: true
    }),
    user: (0, import_fields43.relationship)({
      ref: "User",
      ui: {
        description: "The user who authorized this token"
      }
    }),
    scopes: (0, import_fields43.json)({
      defaultValue: [],
      ui: {
        description: "Array of granted scopes"
      }
    }),
    redirectUri: (0, import_fields43.text)({
      ui: {
        description: "The redirect URI used during authorization"
      }
    }),
    expiresAt: (0, import_fields43.timestamp)({
      ui: {
        description: "When this token expires"
      }
    }),
    isRevoked: (0, import_fields43.select)({
      options: [
        { label: "Active", value: "false" },
        { label: "Revoked", value: "true" }
      ],
      defaultValue: "false"
    }),
    authorizationCode: (0, import_fields43.text)({
      ui: {
        description: "The authorization code that was exchanged for this token (for access tokens)"
      }
    }),
    refreshToken: (0, import_fields43.text)({
      ui: {
        description: "Associated refresh token (for access tokens)"
      }
    }),
    accessToken: (0, import_fields43.text)({
      ui: {
        description: "Associated access token (for refresh tokens)"
      }
    }),
    state: (0, import_fields43.text)({
      ui: {
        description: "OAuth state parameter for CSRF protection"
      }
    }),
    codeChallenge: (0, import_fields43.text)({
      ui: {
        description: "PKCE code challenge"
      }
    }),
    codeChallengeMethod: (0, import_fields43.select)({
      options: [
        { label: "Plain", value: "plain" },
        { label: "SHA256", value: "S256" }
      ],
      ui: {
        description: "PKCE code challenge method"
      }
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput({ operation, resolvedData, context }) {
      if ((operation === "create" || operation === "update") && !resolvedData.user && context.session?.itemId) {
        return {
          ...resolvedData,
          user: { connect: { id: context.session.itemId } }
        };
      }
      return resolvedData;
    }
  },
  ui: {
    labelField: "token",
    listView: {
      initialColumns: ["tokenType", "clientId", "scopes", "expiresAt", "isRevoked"]
    }
  }
});

// features/keystone/models/Order.ts
var import_core41 = require("@keystone-6/core");
var import_fields44 = require("@keystone-6/core/fields");
var formatCurrency3 = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
};
var Order = (0, import_core41.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      // Allow public access for order confirmation
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  hooks: {
    afterOperation: async ({ operation, item, context }) => {
      if (operation === "create" && item && !item.noNotification) {
        try {
          const order = await context.sudo().query.Order.findOne({
            where: { id: item.id },
            query: `
              id
              displayId
              email
              secretKey
              subtotal
              total
              shipping
              discount
              tax
              lineItems {
                id
                title
                quantity
                sku
                variantTitle
                formattedUnitPrice
                formattedTotal
              }
              shippingAddress {
                id
                firstName
                lastName
                company
                address1
                address2
                city
                province
                postalCode
                phone
                country {
                  id
                  iso2
                  displayName
                }
              }
            `
          });
          if (order) {
            await sendOrderConfirmationEmail(order);
          }
        } catch (error) {
          console.error("Error sending order confirmation email:", error);
        }
      }
    }
  },
  fields: {
    status: (0, import_fields44.select)({
      type: "enum",
      options: [
        {
          label: "Pending",
          value: "pending"
        },
        {
          label: "Completed",
          value: "completed"
        },
        {
          label: "Archived",
          value: "archived"
        },
        {
          label: "Canceled",
          value: "canceled"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        }
      ],
      defaultValue: "pending",
      validation: {
        isRequired: true
      },
      hooks: {
        beforeOperation: ({ operation, resolvedData, item, fieldKey }) => {
          if (operation === "update" && resolvedData[fieldKey] && item[fieldKey] !== resolvedData[fieldKey]) {
            return {
              ...resolvedData,
              events: {
                create: {
                  type: "STATUS_CHANGE",
                  data: {
                    newStatus: resolvedData[fieldKey],
                    previousStatus: item[fieldKey]
                  }
                }
              }
            };
          }
          return resolvedData;
        }
      }
    }),
    displayId: (0, import_fields44.integer)({
      validation: {
        isRequired: true
      }
    }),
    email: (0, import_fields44.text)({
      validation: {
        isRequired: true
      }
    }),
    taxRate: (0, import_fields44.float)(),
    canceledAt: (0, import_fields44.timestamp)(),
    metadata: (0, import_fields44.json)(),
    idempotencyKey: (0, import_fields44.text)(),
    noNotification: (0, import_fields44.checkbox)(),
    externalId: (0, import_fields44.text)(),
    shippingAddress: (0, import_fields44.relationship)({
      ref: "Address.ordersUsingAsShippingAddress",
      many: false
    }),
    billingAddress: (0, import_fields44.relationship)({
      ref: "Address.ordersUsingAsBillingAddress",
      many: false
    }),
    currency: (0, import_fields44.relationship)({
      ref: "Currency.orders"
    }),
    draftOrder: (0, import_fields44.relationship)({
      ref: "DraftOrder.order"
    }),
    cart: (0, import_fields44.relationship)({
      ref: "Cart.order"
    }),
    user: (0, import_fields44.relationship)({
      ref: "User.orders"
    }),
    region: (0, import_fields44.relationship)({
      ref: "Region.orders"
    }),
    claimOrders: (0, import_fields44.relationship)({
      ref: "ClaimOrder.order",
      many: true
    }),
    fulfillments: (0, import_fields44.relationship)({
      ref: "Fulfillment.order",
      many: true,
      hooks: {
        beforeOperation: async ({ operation, resolvedData, item, context }) => {
          if ((operation === "create" || operation === "update") && resolvedData?.connect) {
            const fulfillment = await context.sudo().query.Fulfillment.findOne({
              where: { id: resolvedData.connect.id },
              query: `
                shippingLabels {
                  trackingNumber
                  trackingUrl
                  carrier
                }
              `
            });
            if (fulfillment?.shippingLabels?.length) {
              return {
                ...resolvedData,
                events: {
                  create: {
                    type: "TRACKING_NUMBER_ADDED",
                    data: {
                      shippingLabels: fulfillment.shippingLabels.map((label) => ({
                        number: label.trackingNumber,
                        url: label.trackingUrl,
                        carrier: label.carrier
                      })),
                      fulfillmentId: resolvedData.connect.id
                    }
                  }
                }
              };
            }
          }
          return resolvedData;
        }
      }
    }),
    giftCards: (0, import_fields44.relationship)({
      ref: "GiftCard.order",
      many: true
    }),
    giftCardTransactions: (0, import_fields44.relationship)({
      ref: "GiftCardTransaction.order",
      many: true
    }),
    lineItems: (0, import_fields44.relationship)({
      ref: "OrderLineItem.order",
      many: true
    }),
    discounts: (0, import_fields44.relationship)({
      ref: "Discount.orders",
      many: true
    }),
    payments: (0, import_fields44.relationship)({
      ref: "Payment.order",
      many: true,
      hooks: {
        beforeOperation: async ({ operation, resolvedData, item, context }) => {
          if ((operation === "create" || operation === "update") && resolvedData?.connect) {
            const payment = await context.sudo().query.Payment.findOne({
              where: { id: resolvedData.connect.id },
              query: "status amount data"
            });
            if (!payment) return resolvedData;
            let eventData = {
              ...resolvedData,
              events: {
                create: {
                  type: payment.status === "refunded" ? "REFUND_PROCESSED" : payment.status === "captured" ? "PAYMENT_CAPTURED" : "PAYMENT_STATUS_UPDATED",
                  data: {
                    paymentId: resolvedData.connect.id,
                    amount: payment.amount,
                    status: payment.status,
                    provider: payment.data?.provider
                  }
                }
              }
            };
            return eventData;
          }
          return resolvedData;
        }
      }
    }),
    returns: (0, import_fields44.relationship)({
      ref: "Return.order",
      many: true,
      hooks: {
        beforeOperation: ({ operation, resolvedData }) => {
          if (operation === "create" || operation === "update" && resolvedData?.connect) {
            return {
              ...resolvedData,
              events: {
                create: {
                  type: "RETURN_REQUESTED",
                  data: {
                    returnId: resolvedData.connect.id
                  }
                }
              }
            };
          }
          return resolvedData;
        }
      }
    }),
    shippingMethods: (0, import_fields44.relationship)({
      ref: "ShippingMethod.order",
      many: true
    }),
    swaps: (0, import_fields44.relationship)({
      ref: "Swap.order",
      many: true
    }),
    // Account relationship for Openship integration
    account: (0, import_fields44.relationship)({
      ref: "Account.orders",
      many: false
    }),
    accountLineItems: (0, import_fields44.relationship)({
      ref: "AccountLineItem.order",
      many: true
    }),
    secretKey: (0, import_fields44.text)({
      hooks: {
        resolveInput: ({ operation }) => {
          if (operation === "create") {
            const randomBytes = require("crypto").randomBytes(32);
            return randomBytes.toString("hex");
          }
          return void 0;
        }
      }
    }),
    ...(0, import_core41.group)({
      label: "Virtual Fields",
      description: "Calculated fields for order display and totals",
      fields: {
        subtotal: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems { 
                    id 
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  } 
                  region { 
                    id
                    currency { 
                      code 
                      noDivisionCurrency 
                    }
                  }
                `
              });
              if (!order?.lineItems?.length) return "0";
              let subtotal = 0;
              for (const lineItem of order.lineItems) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(subtotal / divisor, currencyCode);
            }
          })
        }),
        shipping: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  shippingMethods {
                    price
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!order?.shippingMethods?.length) return "0";
              const total = order.shippingMethods.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              );
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(total / divisor, currencyCode);
            }
          })
        }),
        discount: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (!order?.discounts?.length) return null;
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of order.discounts) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }
              if (totalDiscountAmount === 0) return null;
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(totalDiscountAmount / divisor, currencyCode);
            }
          })
        }),
        tax: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                }
              }
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(tax / divisor, currencyCode);
            }
          })
        }),
        total: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total2, method) => total2 + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }
              const shipping = order.shippingMethods?.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              ) || 0;
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);
              const total = subtotal - totalDiscountAmount + shipping + tax;
              const currencyCode = order.region?.currency?.code || "USD";
              const divisor = order.region?.currency?.noDivisionCurrency ? 1 : 100;
              return formatCurrency3(total / divisor, currencyCode);
            }
          })
        }),
        rawTotal: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.Int,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const order = await sudoContext.query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    quantity
                    title
                    sku
                    thumbnail
                    variantTitle
                    variantData
                    productData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                    }
                  }
                  shippingMethods {
                    price
                  }
                  region {
                    taxRate
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              let subtotal = 0;
              for (const lineItem of order.lineItems || []) {
                const amount = lineItem.moneyAmount?.amount || 0;
                subtotal += amount * lineItem.quantity;
              }
              let totalDiscountAmount = 0;
              for (const discount of order.discounts || []) {
                if (!discount.discountRule?.type) continue;
                switch (discount.discountRule.type) {
                  case "percentage":
                    totalDiscountAmount += subtotal * (discount.discountRule.value / 100);
                    break;
                  case "fixed":
                    totalDiscountAmount += discount.discountRule.value * (order.region?.currency?.noDivisionCurrency ? 1 : 100);
                    break;
                  case "free_shipping":
                    totalDiscountAmount += order.shippingMethods?.reduce(
                      (total, method) => total + (method.price || 0),
                      0
                    ) || 0;
                    break;
                }
              }
              const shipping = order.shippingMethods?.reduce(
                (sum, method) => sum + (method.price || 0),
                0
              ) || 0;
              const taxableAmount = subtotal - totalDiscountAmount;
              const tax = taxableAmount * (order.region?.taxRate || 0);
              return Math.round(subtotal - totalDiscountAmount + shipping + tax);
            }
          })
        }),
        fulfillmentDetails: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  fulfillments {
                    id
                    createdAt
                    canceledAt
                    shippingLabels {
                      id
                      trackingNumber
                      trackingUrl
                      carrier
                      labelUrl
                    }
                    fulfillmentItems {
                      id
                      quantity
                      lineItem {
                        id
                        title
                        thumbnail
                        quantity
                        formattedUnitPrice
                        formattedTotal
                        sku
                        variantTitle
                        productData
                        variantData
                      }
                    }
                  }
                `
              });
              return order.fulfillments?.map((fulfillment) => ({
                id: fulfillment.id,
                createdAt: fulfillment.createdAt,
                canceledAt: fulfillment.canceledAt,
                shippingLabels: fulfillment.shippingLabels?.map((label) => ({
                  id: label.id,
                  trackingNumber: label.trackingNumber,
                  url: label.trackingUrl,
                  carrier: label.carrier,
                  labelUrl: label.labelUrl
                })) || [],
                items: fulfillment.fulfillmentItems?.map((fi) => ({
                  id: fi.id,
                  quantity: fi.quantity,
                  lineItem: {
                    id: fi.lineItem.id,
                    title: fi.lineItem.title,
                    thumbnail: fi.lineItem.thumbnail,
                    sku: fi.lineItem.sku,
                    variantTitle: fi.lineItem.variantTitle,
                    formattedUnitPrice: fi.lineItem.formattedUnitPrice,
                    formattedTotal: fi.lineItem.formattedTotal,
                    productData: fi.lineItem.productData,
                    variantData: fi.lineItem.variantData
                  }
                })) || []
              })) || [];
            }
          })
        }),
        unfulfilled: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    id
                    title
                    thumbnail
                    quantity
                    formattedUnitPrice
                    formattedTotal
                    sku
                    variantTitle
                    productData
                    variantData
                    moneyAmount {
                      amount
                      originalAmount
                    }
                  }
                  fulfillments {
                    canceledAt
                    fulfillmentItems {
                      quantity
                      lineItem {
                        id
                      }
                    }
                  }
                `
              });
              const fulfilledQuantities = {};
              order.fulfillments?.filter((f) => !f.canceledAt)?.forEach((fulfillment) => {
                fulfillment.fulfillmentItems?.forEach((fi) => {
                  const lineItemId = fi.lineItem.id;
                  fulfilledQuantities[lineItemId] = (fulfilledQuantities[lineItemId] || 0) + fi.quantity;
                });
              });
              const result = order.lineItems?.map((lineItem) => {
                const fulfilledQuantity = fulfilledQuantities[lineItem.id] || 0;
                const remainingQuantity = lineItem.quantity - fulfilledQuantity;
                return {
                  id: lineItem.id,
                  title: lineItem.title,
                  thumbnail: lineItem.thumbnail,
                  sku: lineItem.sku,
                  quantity: remainingQuantity,
                  totalQuantity: lineItem.quantity,
                  fulfilledQuantity,
                  formattedUnitPrice: lineItem.formattedUnitPrice,
                  formattedTotal: lineItem.formattedTotal,
                  variantTitle: lineItem.variantTitle,
                  productData: lineItem.productData,
                  variantData: lineItem.variantData,
                  moneyAmount: lineItem.moneyAmount
                };
              }).filter((item2) => item2.quantity > 0) || [];
              return result;
            }
          })
        }),
        fulfillmentStatus: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  lineItems {
                    quantity
                  }
                  fulfillments {
                    canceledAt
                    shippingLabels {
                      id
                    }
                    fulfillmentItems {
                      quantity
                    }
                  }
                `
              });
              const totalQuantity = order.lineItems.reduce((sum, item2) => sum + item2.quantity, 0);
              const activeFulfillments = order.fulfillments.filter((f) => !f.canceledAt);
              const fulfilledQuantity = activeFulfillments.reduce(
                (sum, f) => sum + f.fulfillmentItems.reduce((itemSum, fi) => itemSum + fi.quantity, 0),
                0
              );
              const shippedQuantity = activeFulfillments.filter((f) => f.shippingLabels?.length > 0).reduce(
                (sum, f) => sum + f.fulfillmentItems.reduce((itemSum, fi) => itemSum + fi.quantity, 0),
                0
              );
              return {
                totalQuantity,
                fulfilledQuantity,
                shippedQuantity,
                remainingQuantity: totalQuantity - fulfilledQuantity,
                status: fulfilledQuantity === 0 ? "not_fulfilled" : fulfilledQuantity === totalQuantity ? "fulfilled" : "partially_fulfilled",
                shippingStatus: shippedQuantity === 0 ? "not_shipped" : shippedQuantity === totalQuantity ? "shipped" : "partially_shipped"
              };
            }
          })
        }),
        paymentDetails: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.JSON,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    id
                    amount
                    status
                    data
                    createdAt
                    paymentCollection {
                      paymentSessions {
                        id
                        amount
                        isSelected
                        paymentProvider {
                          name
                        }
                      }
                    }
                  }
                  currency {
                    code
                    symbol
                  }
                `
              });
              if (!order?.payments?.length) return null;
              return order.payments.map((payment) => ({
                id: payment.id,
                amount: payment.amount,
                formattedAmount: order.currency ? `${order.currency.symbol}${(payment.amount / 100).toFixed(2)}` : `${(payment.amount / 100).toFixed(2)}`,
                status: payment.status,
                createdAt: payment.createdAt,
                provider: payment.data?.provider,
                cardLast4: payment.data?.cardLast4,
                paymentSession: payment.paymentCollection?.paymentSessions?.find((s) => s.isSelected)
              }));
            }
          })
        }),
        totalPaid: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.Int,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                `
              });
              return order.payments?.reduce((total, payment) => {
                if (payment.status === "captured") {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;
            }
          })
        }),
        formattedTotalPaid: (0, import_fields44.virtual)({
          field: import_core41.graphql.field({
            type: import_core41.graphql.String,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                  currency {
                    code
                    symbol
                  }
                `
              });
              const totalPaid = order.payments?.reduce((total, payment) => {
                if (payment.status === "captured") {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;
              if (!order.currency) return `${(totalPaid / 100).toFixed(2)}`;
              return `${order.currency.symbol}${(totalPaid / 100).toFixed(2)}`;
            }
          })
        })
      }
    }),
    events: (0, import_fields44.relationship)({
      ref: "OrderEvent.order",
      many: true
    }),
    note: (0, import_fields44.text)({
      label: "Note"
    }),
    shippingLabels: (0, import_fields44.relationship)({
      ref: "ShippingLabel.order",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/OrderEvent.ts
var import_core42 = require("@keystone-6/core");
var import_fields45 = require("@keystone-6/core/fields");
var OrderEvent = (0, import_core42.list)({
  fields: {
    order: (0, import_fields45.relationship)({
      ref: "Order.events",
      many: false
    }),
    user: (0, import_fields45.relationship)({
      ref: "User.orderEvents",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === "create" || operation === "update") && !resolvedData.user && context.session?.itemId) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        }
      }
    }),
    type: (0, import_fields45.select)({
      type: "enum",
      options: [
        { label: "Order Placed", value: "ORDER_PLACED" },
        { label: "Status Change", value: "STATUS_CHANGE" },
        { label: "Payment Status Change", value: "PAYMENT_STATUS_CHANGE" },
        { label: "Payment Captured", value: "PAYMENT_CAPTURED" },
        { label: "Fulfillment Status Change", value: "FULFILLMENT_STATUS_CHANGE" },
        { label: "Note Added", value: "NOTE_ADDED" },
        { label: "Email Sent", value: "EMAIL_SENT" },
        { label: "Tracking Number Added", value: "TRACKING_NUMBER_ADDED" },
        { label: "Return Requested", value: "RETURN_REQUESTED" },
        { label: "Refund Processed", value: "REFUND_PROCESSED" }
      ],
      validation: { isRequired: true },
      defaultValue: "STATUS_CHANGE"
    }),
    data: (0, import_fields45.json)({
      defaultValue: {}
    }),
    time: (0, import_fields45.timestamp)({
      defaultValue: { kind: "now" }
    }),
    createdBy: (0, import_fields45.relationship)({
      ref: "User",
      many: false,
      ui: {
        displayMode: "select",
        labelField: "email"
      },
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === "create" || operation === "update") && !resolvedData.createdBy && context.session?.itemId) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.createdBy;
        }
      }
    }),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ["order", "type", "time", "createdBy"],
      initialSort: { field: "time", direction: "DESC" }
    }
  },
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  }
});

// features/keystone/models/OrderLineItem.ts
var import_core43 = require("@keystone-6/core");
var import_fields46 = require("@keystone-6/core/fields");
var import_core44 = require("@keystone-6/core");
var isS3SignedUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.has("X-Amz-Date") && parsedUrl.searchParams.has("X-Amz-Expires");
  } catch (e) {
    return false;
  }
};
var isS3UrlExpired = (url) => {
  try {
    const parsedUrl = new URL(url);
    const dateStr = parsedUrl.searchParams.get("X-Amz-Date");
    const expiresSeconds = parseInt(parsedUrl.searchParams.get("X-Amz-Expires"));
    const date = /* @__PURE__ */ new Date(
      dateStr.slice(0, 4) + "-" + dateStr.slice(4, 6) + "-" + dateStr.slice(6, 8) + "T" + dateStr.slice(9, 11) + ":" + dateStr.slice(11, 13) + ":" + dateStr.slice(13, 15) + "Z"
    );
    const expirationTime = new Date(date.getTime() + expiresSeconds * 1e3);
    return expirationTime < /* @__PURE__ */ new Date();
  } catch (e) {
    return true;
  }
};
var checkUrlIsAccessible = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (e) {
    return false;
  }
};
var OrderLineItem = (0, import_core43.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    quantity: (0, import_fields46.integer)({
      validation: { isRequired: true }
    }),
    title: (0, import_fields46.text)({
      validation: { isRequired: true }
    }),
    sku: (0, import_fields46.text)(),
    thumbnail: (0, import_fields46.virtual)({
      field: import_core44.graphql.field({
        type: import_core44.graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          if (item.productData?.thumbnail) {
            const thumbnail = item.productData.thumbnail;
            if (thumbnail.startsWith("/") || !thumbnail.includes("://")) {
              return thumbnail;
            }
            if (isS3SignedUrl(thumbnail)) {
              if (!isS3UrlExpired(thumbnail)) {
                const isAccessible = await checkUrlIsAccessible(thumbnail);
                if (isAccessible) {
                  return thumbnail;
                }
              }
            } else {
              const isAccessible = await checkUrlIsAccessible(thumbnail);
              if (isAccessible) {
                return thumbnail;
              }
            }
          }
          const orderLineItem = await sudoContext.query.OrderLineItem.findOne({
            where: { id: item.id },
            query: `
              productVariant {
                id
                product {
                  thumbnail
                }
              }
            `
          });
          return orderLineItem?.productVariant?.product?.thumbnail || null;
        }
      })
    }),
    metadata: (0, import_fields46.json)(),
    productData: (0, import_fields46.json)({
      description: "Snapshot of product data at time of order"
    }),
    variantData: (0, import_fields46.json)({
      description: "Snapshot of variant data at time of order"
    }),
    // Formatted values for display
    variantTitle: (0, import_fields46.text)(),
    formattedUnitPrice: (0, import_fields46.text)(),
    formattedTotal: (0, import_fields46.text)(),
    order: (0, import_fields46.relationship)({
      ref: "Order.lineItems"
    }),
    productVariant: (0, import_fields46.relationship)({
      ref: "ProductVariant",
      description: "Optional reference to product variant (may be deleted)"
    }),
    moneyAmount: (0, import_fields46.relationship)({
      ref: "OrderMoneyAmount.orderLineItem"
    }),
    originalLineItem: (0, import_fields46.relationship)({
      ref: "LineItem",
      description: "Reference to the original cart line item"
    }),
    fulfillmentItems: (0, import_fields46.relationship)({
      ref: "FulfillmentItem.lineItem",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/OrderMoneyAmount.ts
var import_core45 = require("@keystone-6/core");
var import_fields47 = require("@keystone-6/core/fields");
var OrderMoneyAmount = (0, import_core45.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    amount: (0, import_fields47.integer)({
      validation: { isRequired: true }
    }),
    originalAmount: (0, import_fields47.integer)({
      validation: { isRequired: true }
    }),
    priceData: (0, import_fields47.json)({
      description: "Snapshot of complete price data including rules, lists, etc."
    }),
    metadata: (0, import_fields47.json)(),
    orderLineItem: (0, import_fields47.relationship)({
      ref: "OrderLineItem.moneyAmount"
    }),
    currency: (0, import_fields47.relationship)({
      ref: "Currency"
    }),
    region: (0, import_fields47.relationship)({
      ref: "Region"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Payment.ts
var import_core46 = require("@keystone-6/core");
var import_fields48 = require("@keystone-6/core/fields");
var import_core47 = require("@keystone-6/core");
var Payment = (0, import_core46.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    status: (0, import_fields48.select)({
      type: "enum",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Authorized", value: "authorized" },
        { label: "Captured", value: "captured" },
        { label: "Failed", value: "failed" },
        { label: "Canceled", value: "canceled" }
      ],
      defaultValue: "pending",
      validation: { isRequired: true },
      hooks: {
        beforeOperation: async ({ operation, resolvedData, item, context }) => {
          if (operation === "update" && resolvedData.status && item.status !== resolvedData.status) {
            const payment = await context.sudo().query.Payment.findOne({
              where: { id: item.id },
              query: `
                id
                amount
                data
                order {
                  id
                }
              `
            });
            if (!payment?.order?.id) return resolvedData;
            let eventData = {
              ...resolvedData
            };
            if (resolvedData.status === "captured") {
              eventData = {
                ...eventData,
                capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
                order: {
                  update: {
                    where: { id: payment.order.id },
                    data: {
                      paymentStatus: "captured",
                      events: {
                        create: {
                          type: "PAYMENT_CAPTURED",
                          data: {
                            amount: payment.amount,
                            paymentId: item.id
                          }
                        }
                      }
                    }
                  }
                }
              };
              await context.sudo().query.Capture.createOne({
                data: {
                  amount: payment.amount,
                  payment: { connect: { id: item.id } },
                  metadata: payment.data,
                  createdBy: "system"
                }
              });
            }
            return eventData;
          }
          return resolvedData;
        }
      }
    }),
    amount: (0, import_fields48.integer)({
      validation: {
        isRequired: true
      }
    }),
    currencyCode: (0, import_fields48.text)({
      validation: {
        isRequired: true
      }
    }),
    amountRefunded: (0, import_fields48.integer)({
      defaultValue: 0,
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields48.json)(),
    capturedAt: (0, import_fields48.timestamp)(),
    canceledAt: (0, import_fields48.timestamp)(),
    metadata: (0, import_fields48.json)(),
    idempotencyKey: (0, import_fields48.text)(),
    cart: (0, import_fields48.relationship)({
      ref: "Cart.payment"
    }),
    paymentCollection: (0, import_fields48.relationship)({
      ref: "PaymentCollection.payments"
    }),
    swap: (0, import_fields48.relationship)({
      ref: "Swap.payment"
    }),
    currency: (0, import_fields48.relationship)({
      ref: "Currency.payments"
    }),
    order: (0, import_fields48.relationship)({
      ref: "Order.payments"
    }),
    captures: (0, import_fields48.relationship)({
      ref: "Capture.payment",
      many: true
    }),
    refunds: (0, import_fields48.relationship)({
      ref: "Refund.payment",
      many: true
    }),
    user: (0, import_fields48.relationship)({
      ref: "User.payments"
    }),
    paymentLink: (0, import_fields48.virtual)({
      field: import_core47.graphql.field({
        type: import_core47.graphql.String,
        resolve(item) {
          if (!item.data) return null;
          if (item.data.provider_id?.startsWith("pp_stripe_")) {
            const paymentIntentId = item.data.payment_intent_id;
            if (paymentIntentId) {
              return `https://dashboard.stripe.com/payments/${paymentIntentId}`;
            }
          }
          if (item.data.provider_id?.startsWith("pp_paypal_")) {
            const paypalOrderId = item.data.id;
            if (paypalOrderId) {
              return `https://www.paypal.com/activity/payment/${paypalOrderId}`;
            }
          }
          return null;
        }
      })
    }),
    ...trackingFields
  }
});

// features/keystone/models/PaymentCollection.ts
var import_core48 = require("@keystone-6/core");
var import_fields49 = require("@keystone-6/core/fields");
var PaymentCollection = (0, import_core48.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    description: (0, import_fields49.select)({
      type: "enum",
      options: [
        { label: "Default", value: "default" },
        { label: "Refund", value: "refund" }
      ],
      defaultValue: "default"
    }),
    amount: (0, import_fields49.integer)({
      validation: { isRequired: true }
    }),
    authorizedAmount: (0, import_fields49.integer)({
      defaultValue: 0
    }),
    refundedAmount: (0, import_fields49.integer)({
      defaultValue: 0
    }),
    metadata: (0, import_fields49.json)(),
    paymentSessions: (0, import_fields49.relationship)({
      ref: "PaymentSession.paymentCollection",
      many: true
    }),
    payments: (0, import_fields49.relationship)({
      ref: "Payment.paymentCollection",
      many: true
    }),
    cart: (0, import_fields49.relationship)({
      ref: "Cart.paymentCollection"
    }),
    ...trackingFields
  }
});

// features/keystone/models/PaymentProvider.ts
var import_core49 = require("@keystone-6/core");
var import_fields50 = require("@keystone-6/core/fields");
var PaymentProvider = (0, import_core49.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    name: (0, import_fields50.text)({
      validation: { isRequired: true }
    }),
    code: (0, import_fields50.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true,
        match: {
          regex: /^pp_[a-zA-Z0-9-_]+$/,
          explanation: 'Payment provider code must start with "pp_" followed by alphanumeric characters, hyphens or underscores'
        }
      }
    }),
    isInstalled: (0, import_fields50.checkbox)({
      defaultValue: true
    }),
    credentials: (0, import_fields50.json)({
      defaultValue: {}
    }),
    metadata: (0, import_fields50.json)({
      defaultValue: {}
    }),
    // Adapter function fields
    createPaymentFunction: (0, import_fields50.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to create payments"
      }
    }),
    capturePaymentFunction: (0, import_fields50.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to capture payments"
      }
    }),
    refundPaymentFunction: (0, import_fields50.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to refund payments"
      }
    }),
    getPaymentStatusFunction: (0, import_fields50.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to check payment status"
      }
    }),
    generatePaymentLinkFunction: (0, import_fields50.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to generate payment dashboard links"
      }
    }),
    handleWebhookFunction: (0, import_fields50.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to handle provider webhooks"
      }
    }),
    regions: (0, import_fields50.relationship)({
      ref: "Region.paymentProviders",
      many: true
    }),
    sessions: (0, import_fields50.relationship)({
      ref: "PaymentSession.paymentProvider",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/PaymentSession.ts
var import_core50 = require("@keystone-6/core");
var import_fields51 = require("@keystone-6/core/fields");
var import_core51 = require("@keystone-6/core");
var PaymentSession = (0, import_core50.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    isSelected: (0, import_fields51.checkbox)({
      defaultValue: false
    }),
    isInitiated: (0, import_fields51.checkbox)({
      defaultValue: false
    }),
    amount: (0, import_fields51.integer)({
      validation: { isRequired: true }
    }),
    formattedAmount: (0, import_fields51.virtual)({
      field: import_core51.graphql.field({
        type: import_core51.graphql.String,
        async resolve(item, args, context) {
          const { paymentCollection } = await context.query.PaymentSession.findOne({
            where: { id: item.id },
            query: `
              paymentCollection {
                cart {
                  order {
                    currency {
                      code
                      symbol
                    }
                  }
                }
              }
            `
          });
          if (!paymentCollection?.cart?.order?.currency) {
            return `${item.amount / 100}`;
          }
          const { symbol } = paymentCollection.cart.order.currency;
          const amount = item.amount / 100;
          return `${symbol}${amount.toFixed(2)}`;
        }
      })
    }),
    data: (0, import_fields51.json)({
      defaultValue: {}
    }),
    idempotencyKey: (0, import_fields51.text)({
      isIndexed: true
    }),
    paymentCollection: (0, import_fields51.relationship)({
      ref: "PaymentCollection.paymentSessions"
    }),
    paymentProvider: (0, import_fields51.relationship)({
      ref: "PaymentProvider.sessions",
      many: false
    }),
    paymentAuthorizedAt: (0, import_fields51.timestamp)(),
    ...trackingFields
  }
});

// features/keystone/models/PriceList.ts
var import_core52 = require("@keystone-6/core");
var import_fields52 = require("@keystone-6/core/fields");
var PriceList = (0, import_core52.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    name: (0, import_fields52.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields52.text)({
      validation: {
        isRequired: true
      }
    }),
    type: (0, import_fields52.select)({
      type: "enum",
      options: [
        {
          label: "Sale",
          value: "sale"
        },
        {
          label: "Override",
          value: "override"
        }
      ],
      defaultValue: "sale",
      validation: {
        isRequired: true
      }
    }),
    status: (0, import_fields52.select)({
      type: "enum",
      options: [
        {
          label: "Active",
          value: "active"
        },
        {
          label: "Draft",
          value: "draft"
        }
      ],
      defaultValue: "draft",
      validation: {
        isRequired: true
      }
    }),
    startsAt: (0, import_fields52.timestamp)(),
    endsAt: (0, import_fields52.timestamp)(),
    moneyAmounts: (0, import_fields52.relationship)({
      ref: "MoneyAmount.priceList",
      many: true
    }),
    customerGroups: (0, import_fields52.relationship)({
      ref: "CustomerGroup.priceLists",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/PriceRule.ts
var import_core53 = require("@keystone-6/core");
var import_fields53 = require("@keystone-6/core/fields");
var PriceRule = (0, import_core53.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    type: (0, import_fields53.select)({
      type: "enum",
      options: [
        { label: "Fixed", value: "fixed" },
        { label: "Percentage", value: "percentage" }
      ],
      validation: { isRequired: true }
    }),
    value: (0, import_fields53.float)({ validation: { isRequired: true } }),
    priority: (0, import_fields53.integer)({ defaultValue: 0 }),
    ruleAttribute: (0, import_fields53.text)({ validation: { isRequired: true } }),
    ruleValue: (0, import_fields53.text)({ validation: { isRequired: true } }),
    moneyAmounts: (0, import_fields53.relationship)({ ref: "MoneyAmount.priceRules", many: true }),
    priceSet: (0, import_fields53.relationship)({ ref: "PriceSet.priceRules" }),
    ...trackingFields
  }
});

// features/keystone/models/PriceSet.ts
var import_core54 = require("@keystone-6/core");
var import_fields54 = require("@keystone-6/core/fields");
var PriceSet = (0, import_core54.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    prices: (0, import_fields54.relationship)({ ref: "MoneyAmount.priceSet", many: true }),
    priceRules: (0, import_fields54.relationship)({ ref: "PriceRule.priceSet", many: true }),
    ruleTypes: (0, import_fields54.relationship)({ ref: "RuleType.priceSets", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/Product.ts
var import_core55 = require("@keystone-6/core");
var import_fields55 = require("@keystone-6/core/fields");
var import_fields_document = require("@keystone-6/fields-document");
var Product = (0, import_core55.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canManageProducts({ session })) {
          return true;
        }
        return {
          status: {
            equals: "published"
          }
        };
      }
    }
  },
  fields: {
    title: (0, import_fields55.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields_document.document)({
      formatting: true,
      links: true,
      dividers: true,
      layouts: [
        [1, 1],
        [1, 1, 1],
        [2, 1]
      ]
    }),
    handle: (0, import_fields55.text)({
      isIndexed: "unique"
    }),
    subtitle: (0, import_fields55.text)(),
    isGiftcard: (0, import_fields55.checkbox)(),
    thumbnail: (0, import_fields55.virtual)({
      field: import_core55.graphql.field({
        type: import_core55.graphql.String,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: "productImages(take: 1) { image { url } imagePath }"
          });
          return product.productImages[0]?.image?.url || product.productImages[0]?.imagePath || null;
        }
      })
    }),
    dimensionsRange: (0, import_fields55.virtual)({
      field: import_core55.graphql.field({
        type: import_core55.graphql.JSON,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: `
              productVariants {
                measurements {
                  value
                  unit
                  type
                }
              }
            `
          });
          if (!product.productVariants?.length) return null;
          const dimensions = {
            weight: { min: null, max: null },
            length: { min: null, max: null },
            height: { min: null, max: null },
            width: { min: null, max: null }
          };
          product.productVariants.forEach((variant) => {
            variant.measurements?.forEach((measurement) => {
              const dim = measurement.type;
              if (dimensions[dim] && measurement.value !== null && measurement.value !== void 0) {
                if (dimensions[dim].min === null || measurement.value < dimensions[dim].min) {
                  dimensions[dim].min = measurement.value;
                }
                if (dimensions[dim].max === null || measurement.value > dimensions[dim].max) {
                  dimensions[dim].max = measurement.value;
                }
              }
            });
          });
          return dimensions;
        }
      })
    }),
    defaultDimensions: (0, import_fields55.virtual)({
      field: import_core55.graphql.field({
        type: import_core55.graphql.JSON,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: `
              productVariants(take: 1) {
                measurements {
                  value
                  unit
                  type
                }
              }
            `
          });
          if (!product.productVariants?.[0]?.measurements) return null;
          const dimensions = {};
          product.productVariants[0].measurements.forEach((measurement) => {
            dimensions[measurement.type] = {
              value: measurement.value,
              unit: measurement.unit
            };
          });
          return dimensions;
        }
      })
    }),
    metadata: (0, import_fields55.json)(),
    discountable: (0, import_fields55.checkbox)({
      defaultValue: true
    }),
    status: (0, import_fields55.select)({
      type: "enum",
      options: [
        {
          label: "Draft",
          value: "draft"
        },
        {
          label: "Proposed",
          value: "proposed"
        },
        {
          label: "Published",
          value: "published"
        },
        {
          label: "Rejected",
          value: "rejected"
        }
      ],
      defaultValue: "draft",
      validation: {
        isRequired: true
      }
    }),
    externalId: (0, import_fields55.text)(),
    productCollections: (0, import_fields55.relationship)({
      ref: "ProductCollection.products",
      many: true
    }),
    productCategories: (0, import_fields55.relationship)({
      ref: "ProductCategory.products",
      many: true
    }),
    shippingProfile: (0, import_fields55.relationship)({
      ref: "ShippingProfile.products"
    }),
    productType: (0, import_fields55.relationship)({
      ref: "ProductType.products"
    }),
    discountConditions: (0, import_fields55.relationship)({
      ref: "DiscountCondition.products",
      many: true
    }),
    discountRules: (0, import_fields55.relationship)({
      ref: "DiscountRule.products",
      many: true
    }),
    productImages: (0, import_fields55.relationship)({
      ref: "ProductImage.products",
      many: true,
      ui: {
        displayMode: "cards",
        cardFields: ["image", "altText", "imagePath"],
        inlineCreate: { fields: ["image", "altText", "imagePath"] },
        inlineEdit: { fields: ["image", "altText", "imagePath"] },
        inlineConnect: true,
        removeMode: "disconnect",
        linkToItem: false
      }
    }),
    productOptions: (0, import_fields55.relationship)({
      ref: "ProductOption.product",
      many: true
    }),
    productTags: (0, import_fields55.relationship)({
      ref: "ProductTag.products",
      many: true
    }),
    taxRates: (0, import_fields55.relationship)({
      ref: "TaxRate.products",
      many: true
    }),
    productVariants: (0, import_fields55.relationship)({
      ref: "ProductVariant.product",
      many: true
    }),
    ...trackingFields
  },
  // hooks: {
  //   resolveInput: async ({
  //     resolvedData,
  //     existingItem,
  //     context,
  //     operation,
  //   }) => {
  //     if (!resolvedData.handle && resolvedData.title) {
  //       let baseHandle = resolvedData.title
  //         .toLowerCase()
  //         .replace(/[^a-z0-9]+/g, '-')
  //         .replace(/^-+|-+$/g, '');
  //       let handle = baseHandle;
  //       let counter = 1;
  //       while (await context.query.Product.findOne({ where: { handle } })) {
  //         handle = `${baseHandle}-${counter}`;
  //         counter++;
  //       }
  //       resolvedData.handle = handle;
  //     }
  //     return resolvedData;
  //   },
  // },
  ui: {
    labelField: "title"
  }
});

// features/keystone/models/ProductCategory.ts
var import_core56 = require("@keystone-6/core");
var import_fields56 = require("@keystone-6/core/fields");
var ProductCategory = (0, import_core56.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canManageProducts({ session })) {
          return true;
        }
        return {
          isActive: {
            equals: true
          }
        };
      }
    }
  },
  fields: {
    title: (0, import_fields56.text)({
      validation: {
        isRequired: true
      }
    }),
    handle: (0, import_fields56.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields56.json)(),
    isInternal: (0, import_fields56.checkbox)({
      defaultValue: false
    }),
    isActive: (0, import_fields56.checkbox)({
      defaultValue: true
    }),
    discountConditions: (0, import_fields56.relationship)({
      ref: "DiscountCondition.productCategories",
      many: true
    }),
    products: (0, import_fields56.relationship)({
      ref: "Product.productCategories",
      many: true
    }),
    parentCategory: (0, import_fields56.relationship)({
      ref: "ProductCategory.categoryChildren",
      many: false
    }),
    categoryChildren: (0, import_fields56.relationship)({
      ref: "ProductCategory.parentCategory",
      many: true
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput: async ({ resolvedData, existingItem, context, operation }) => {
      if (!resolvedData.handle && resolvedData.title) {
        let baseHandle = resolvedData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        let handle = baseHandle;
        let counter = 1;
        while (await context.query.ProductCategory.findOne({ where: { handle } })) {
          handle = `${baseHandle}-${counter}`;
          counter++;
        }
        resolvedData.handle = handle;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/ProductCollection.ts
var import_core57 = require("@keystone-6/core");
var import_fields57 = require("@keystone-6/core/fields");
var ProductCollection = (0, import_core57.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    title: (0, import_fields57.text)({
      validation: {
        isRequired: true
      }
    }),
    handle: (0, import_fields57.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields57.json)(),
    discountConditions: (0, import_fields57.relationship)({
      ref: "DiscountCondition.productCollections",
      many: true
    }),
    products: (0, import_fields57.relationship)({
      ref: "Product.productCollections",
      many: true
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput: async ({ resolvedData, existingItem, context, operation }) => {
      if (!resolvedData.handle && resolvedData.title) {
        let baseHandle = resolvedData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        let handle = baseHandle;
        let counter = 1;
        while (await context.query.ProductCollection.findOne({ where: { handle } })) {
          handle = `${baseHandle}-${counter}`;
          counter++;
        }
        resolvedData.handle = handle;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/ProductImage.ts
var import_core58 = require("@keystone-6/core");
var import_fields58 = require("@keystone-6/core/fields");
var ProductImage = (0, import_core58.list)({
  access: {
    operation: {
      // query: ({ session }) =>
      //   permissions.canReadProducts({ session }) ||
      //   permissions.canManageProducts({ session }),
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    image: (0, import_fields58.image)({ storage: "my_images" }),
    imagePath: (0, import_fields58.text)(),
    altText: (0, import_fields58.text)(),
    products: (0, import_fields58.relationship)({ ref: "Product.productImages", many: true }),
    metadata: (0, import_fields58.json)(),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ["image", "imagePath", "altText", "products"]
    }
  }
});

// features/keystone/models/ProductOption.ts
var import_core59 = require("@keystone-6/core");
var import_fields59 = require("@keystone-6/core/fields");
var ProductOption = (0, import_core59.list)({
  access: {
    operation: {
      // query: ({ session }) =>
      //   permissions.canReadProducts({ session }) ||
      //   permissions.canManageProducts({ session }),
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    title: (0, import_fields59.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields59.json)(),
    product: (0, import_fields59.relationship)({
      ref: "Product.productOptions"
    }),
    productOptionValues: (0, import_fields59.relationship)({
      ref: "ProductOptionValue.productOption",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ProductOptionValue.ts
var import_core60 = require("@keystone-6/core");
var import_fields60 = require("@keystone-6/core/fields");
var ProductOptionValue = (0, import_core60.list)({
  access: {
    operation: {
      // query: ({ session }) =>
      //   permissions.canReadProducts({ session }) ||
      //   permissions.canManageProducts({ session }),
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields60.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields60.json)(),
    productVariants: (0, import_fields60.relationship)({
      ref: "ProductVariant.productOptionValues",
      many: true
    }),
    productOption: (0, import_fields60.relationship)({
      ref: "ProductOption.productOptionValues"
    }),
    ...trackingFields
  },
  ui: {
    labelField: "value"
  }
});

// features/keystone/models/ProductTag.ts
var import_core61 = require("@keystone-6/core");
var import_fields61 = require("@keystone-6/core/fields");
var ProductTag = (0, import_core61.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields61.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields61.json)(),
    discountConditions: (0, import_fields61.relationship)({
      ref: "DiscountCondition.productTags",
      many: true
    }),
    products: (0, import_fields61.relationship)({ ref: "Product.productTags", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/ProductType.ts
var import_core62 = require("@keystone-6/core");
var import_fields62 = require("@keystone-6/core/fields");
var ProductType = (0, import_core62.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields62.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields62.json)(),
    discountConditions: (0, import_fields62.relationship)({
      ref: "DiscountCondition.productTypes",
      many: true
    }),
    products: (0, import_fields62.relationship)({
      ref: "Product.productType",
      many: true
    }),
    taxRates: (0, import_fields62.relationship)({
      ref: "TaxRate.productTypes",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ProductVariant.ts
var import_core63 = require("@keystone-6/core");
var import_fields63 = require("@keystone-6/core/fields");
var ProductVariant = (0, import_core63.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    fullTitle: (0, import_fields63.virtual)({
      field: import_core63.graphql.field({
        type: import_core63.graphql.String,
        resolve: async (item, args, context) => {
          const { product } = await context.query.ProductVariant.findOne({
            where: { id: item.id.toString() },
            query: "product { title }"
          });
          return `${product?.title ? `${product.title} - ` : ""}${item.title}`;
        }
      })
    }),
    title: (0, import_fields63.text)({
      validation: {
        isRequired: true
      }
    }),
    sku: (0, import_fields63.text)(),
    barcode: (0, import_fields63.text)(),
    ean: (0, import_fields63.text)(),
    upc: (0, import_fields63.text)(),
    inventoryQuantity: (0, import_fields63.integer)({
      validation: {
        isRequired: true
      }
    }),
    allowBackorder: (0, import_fields63.checkbox)(),
    manageInventory: (0, import_fields63.checkbox)({
      defaultValue: true
    }),
    hsCode: (0, import_fields63.text)(),
    originCountry: (0, import_fields63.text)(),
    midCode: (0, import_fields63.text)(),
    material: (0, import_fields63.text)(),
    metadata: (0, import_fields63.json)(),
    variantRank: (0, import_fields63.integer)({
      defaultValue: 0
    }),
    product: (0, import_fields63.relationship)({
      ref: "Product.productVariants"
    }),
    claimItems: (0, import_fields63.relationship)({
      ref: "ClaimItem.productVariant",
      many: true
    }),
    lineItems: (0, import_fields63.relationship)({
      ref: "LineItem.productVariant",
      many: true
    }),
    prices: (0, import_fields63.relationship)({
      ref: "MoneyAmount.productVariant",
      many: true
    }),
    productOptionValues: (0, import_fields63.relationship)({
      ref: "ProductOptionValue.productVariants",
      many: true
    }),
    location: (0, import_fields63.relationship)({
      ref: "Location.variants"
    }),
    stockMovements: (0, import_fields63.relationship)({
      ref: "StockMovement.variant",
      many: true
    }),
    measurements: (0, import_fields63.relationship)({
      ref: "Measurement.productVariant",
      many: true
    }),
    ...trackingFields
  },
  ui: {
    labelField: "fullTitle"
  }
});

// features/keystone/models/Refund.ts
var import_core64 = require("@keystone-6/core");
var import_fields64 = require("@keystone-6/core/fields");
var Refund = (0, import_core64.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    amount: (0, import_fields64.integer)({
      validation: {
        isRequired: true
      }
    }),
    note: (0, import_fields64.text)(),
    reason: (0, import_fields64.select)({
      type: "enum",
      options: [
        {
          label: "Discount",
          value: "discount"
        },
        {
          label: "Return",
          value: "return"
        },
        {
          label: "Swap",
          value: "swap"
        },
        {
          label: "Claim",
          value: "claim"
        },
        {
          label: "Other",
          value: "other"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields64.json)(),
    idempotencyKey: (0, import_fields64.text)(),
    payment: (0, import_fields64.relationship)({
      ref: "Payment.refunds"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Region.ts
var import_core65 = require("@keystone-6/core");
var import_fields65 = require("@keystone-6/core/fields");
var Region = (0, import_core65.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    code: (0, import_fields65.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields65.text)({
      validation: {
        isRequired: true
      }
    }),
    taxRate: (0, import_fields65.float)({
      validation: {
        isRequired: true
      }
    }),
    taxCode: (0, import_fields65.text)(),
    metadata: (0, import_fields65.json)(),
    giftCardsTaxable: (0, import_fields65.checkbox)({
      defaultValue: true
    }),
    automaticTaxes: (0, import_fields65.checkbox)({
      defaultValue: true
    }),
    currency: (0, import_fields65.relationship)({
      ref: "Currency.regions"
    }),
    carts: (0, import_fields65.relationship)({
      ref: "Cart.region",
      many: true
    }),
    countries: (0, import_fields65.relationship)({
      ref: "Country.region",
      many: true
    }),
    discounts: (0, import_fields65.relationship)({
      ref: "Discount.regions",
      many: true
    }),
    giftCards: (0, import_fields65.relationship)({
      ref: "GiftCard.region",
      many: true
    }),
    moneyAmounts: (0, import_fields65.relationship)({
      ref: "MoneyAmount.region",
      many: true
    }),
    orders: (0, import_fields65.relationship)({
      ref: "Order.region",
      many: true
    }),
    taxProvider: (0, import_fields65.relationship)({
      ref: "TaxProvider.regions"
    }),
    fulfillmentProviders: (0, import_fields65.relationship)({
      ref: "FulfillmentProvider.regions",
      many: true
    }),
    paymentProviders: (0, import_fields65.relationship)({
      ref: "PaymentProvider.regions",
      many: true
    }),
    shippingOptions: (0, import_fields65.relationship)({
      ref: "ShippingOption.region",
      many: true
    }),
    taxRates: (0, import_fields65.relationship)({
      ref: "TaxRate.region",
      many: true
    }),
    shippingProviders: (0, import_fields65.relationship)({
      ref: "ShippingProvider.regions",
      many: true
    }),
    accountLineItems: (0, import_fields65.relationship)({
      ref: "AccountLineItem.region",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Return.ts
var import_core66 = require("@keystone-6/core");
var import_fields66 = require("@keystone-6/core/fields");
var Return = (0, import_core66.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    status: (0, import_fields66.select)({
      type: "enum",
      options: [
        {
          label: "Requested",
          value: "requested"
        },
        {
          label: "Received",
          value: "received"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        },
        {
          label: "Canceled",
          value: "canceled"
        }
      ],
      defaultValue: "requested",
      db: {
        isNullable: false
      },
      validation: {
        isRequired: true
      }
    }),
    shippingData: (0, import_fields66.json)(),
    refundAmount: (0, import_fields66.integer)({
      validation: {
        isRequired: true
      }
    }),
    receivedAt: (0, import_fields66.timestamp)(),
    metadata: (0, import_fields66.json)(),
    idempotencyKey: (0, import_fields66.text)(),
    noNotification: (0, import_fields66.checkbox)(),
    claimOrder: (0, import_fields66.relationship)({
      ref: "ClaimOrder.return"
    }),
    swap: (0, import_fields66.relationship)({
      ref: "Swap.return"
    }),
    order: (0, import_fields66.relationship)({
      ref: "Order.returns"
    }),
    returnItems: (0, import_fields66.relationship)({
      ref: "ReturnItem.return",
      many: true
    }),
    shippingMethod: (0, import_fields66.relationship)({
      ref: "ShippingMethod.return"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ReturnItem.ts
var import_core67 = require("@keystone-6/core");
var import_fields67 = require("@keystone-6/core/fields");
var ReturnItem = (0, import_core67.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    quantity: (0, import_fields67.integer)({
      validation: {
        isRequired: true
      }
    }),
    isRequested: (0, import_fields67.checkbox)({
      defaultValue: true
    }),
    requestedQuantity: (0, import_fields67.integer)(),
    receivedQuantity: (0, import_fields67.integer)(),
    metadata: (0, import_fields67.json)(),
    note: (0, import_fields67.text)(),
    return: (0, import_fields67.relationship)({
      ref: "Return.returnItems"
    }),
    lineItem: (0, import_fields67.relationship)({
      ref: "LineItem.returnItems"
    }),
    returnReason: (0, import_fields67.relationship)({
      ref: "ReturnReason.returnItems"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ReturnReason.ts
var import_core68 = require("@keystone-6/core");
var import_fields68 = require("@keystone-6/core/fields");
var ReturnReason = (0, import_core68.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    value: (0, import_fields68.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    label: (0, import_fields68.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields68.text)(),
    metadata: (0, import_fields68.json)(),
    parentReturnReason: (0, import_fields68.relationship)({
      ref: "ReturnReason"
    }),
    returnItems: (0, import_fields68.relationship)({
      ref: "ReturnItem.returnReason",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Role.ts
var import_fields69 = require("@keystone-6/core/fields");
var import_core69 = require("@keystone-6/core");
var Role = (0, import_core69.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadRoles({ session }) || permissions.canManageRoles({ session }),
      create: permissions.canManageRoles,
      update: permissions.canManageRoles,
      delete: permissions.canManageRoles
    }
  },
  ui: {
    hideCreate: (args) => !permissions.canManageRoles(args),
    hideDelete: (args) => !permissions.canManageRoles(args),
    isHidden: (args) => !permissions.canManageRoles(args)
  },
  fields: {
    name: (0, import_fields69.text)({ validation: { isRequired: true } }),
    ...permissionFields,
    assignedTo: (0, import_fields69.relationship)({
      ref: "User.role",
      // TODO: Add this to the User
      many: true
      // ui: {
      //   itemView: { fieldMode: 'read' },
      // },
    }),
    ...trackingFields
  }
});

// features/keystone/models/RuleType.ts
var import_core70 = require("@keystone-6/core");
var import_fields71 = require("@keystone-6/core/fields");
var RuleType = (0, import_core70.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    name: (0, import_fields71.text)({ validation: { isRequired: true } }),
    ruleAttribute: (0, import_fields71.text)({ validation: { isRequired: true }, isIndexed: "unique" }),
    priceSets: (0, import_fields71.relationship)({ ref: "PriceSet.ruleTypes", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/SalesChannel.ts
var import_core71 = require("@keystone-6/core");
var import_fields72 = require("@keystone-6/core/fields");
var SalesChannel = (0, import_core71.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadSalesChannels({ session }) || permissions.canManageSalesChannels({ session }),
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels
    }
  },
  fields: {
    name: (0, import_fields72.text)(),
    description: (0, import_fields72.text)(),
    isDisabled: (0, import_fields72.checkbox)(),
    ...trackingFields
  }
});

// features/keystone/models/ShippingLabel.ts
var import_core72 = require("@keystone-6/core");
var import_fields73 = require("@keystone-6/core/fields");
var ShippingLabel = (0, import_core72.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: permissions.canManageFulfillments,
      update: permissions.canManageFulfillments,
      delete: permissions.canManageFulfillments
    }
  },
  fields: {
    status: (0, import_fields73.select)({
      type: "enum",
      options: [
        { label: "Created", value: "created" },
        { label: "Purchased", value: "purchased" },
        { label: "Failed", value: "failed" }
      ],
      validation: { isRequired: true },
      defaultValue: "created"
    }),
    // Label information
    labelUrl: (0, import_fields73.text)(),
    carrier: (0, import_fields73.text)(),
    service: (0, import_fields73.text)(),
    rate: (0, import_fields73.json)(),
    // Tracking information
    trackingNumber: (0, import_fields73.text)(),
    trackingUrl: (0, import_fields73.text)(),
    // Relationships
    order: (0, import_fields73.relationship)({
      ref: "Order.shippingLabels",
      many: false
    }),
    provider: (0, import_fields73.relationship)({
      ref: "ShippingProvider.labels",
      many: false
    }),
    fulfillment: (0, import_fields73.relationship)({
      ref: "Fulfillment.shippingLabels",
      many: false
    }),
    // Additional data
    data: (0, import_fields73.json)(),
    metadata: (0, import_fields73.json)(),
    ...trackingFields
  },
  hooks: {
    resolveInput: ({ resolvedData }) => {
      if (resolvedData.carrier && resolvedData.trackingNumber && !resolvedData.trackingUrl) {
        const carrier = resolvedData.carrier.toLowerCase();
        resolvedData.trackingUrl = carrier === "ups" ? `https://www.ups.com/track?tracknum=${resolvedData.trackingNumber}` : carrier === "usps" ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${resolvedData.trackingNumber}` : carrier === "fedex" ? `https://www.fedex.com/fedextrack/?trknbr=${resolvedData.trackingNumber}` : carrier === "dhl" ? `https://www.dhl.com/en/express/tracking.html?AWB=${resolvedData.trackingNumber}` : void 0;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/ShippingMethod.ts
var import_core73 = require("@keystone-6/core");
var import_fields74 = require("@keystone-6/core/fields");
var ShippingMethod = (0, import_core73.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  hooks: {
    async afterOperation({ operation, item, context }) {
      if (operation === "create" || operation === "update") {
        const sudoContext = context.sudo();
        const shippingMethod = await sudoContext.query.ShippingMethod.findOne({
          where: { id: item.id },
          query: "cart { id }"
        });
        if (shippingMethod?.cart?.id) {
          await sudoContext.query.Cart.updateOne({
            where: { id: shippingMethod.cart.id },
            data: {
              paymentCollection: {
                disconnect: true
              }
            }
          });
        }
      }
    }
  },
  fields: {
    price: (0, import_fields74.integer)({
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields74.json)(),
    return: (0, import_fields74.relationship)({
      ref: "Return.shippingMethod"
    }),
    order: (0, import_fields74.relationship)({
      ref: "Order.shippingMethods"
    }),
    claimOrder: (0, import_fields74.relationship)({
      ref: "ClaimOrder.shippingMethods"
    }),
    cart: (0, import_fields74.relationship)({
      ref: "Cart.shippingMethods"
    }),
    swap: (0, import_fields74.relationship)({
      ref: "Swap.shippingMethods"
    }),
    shippingOption: (0, import_fields74.relationship)({
      ref: "ShippingOption.shippingMethods"
    }),
    shippingMethodTaxLines: (0, import_fields74.relationship)({
      ref: "ShippingMethodTaxLine.shippingMethod",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingMethodTaxLine.ts
var import_core74 = require("@keystone-6/core");
var import_fields75 = require("@keystone-6/core/fields");
var ShippingMethodTaxLine = (0, import_core74.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    rate: (0, import_fields75.float)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields75.text)({
      validation: {
        isRequired: true
      }
    }),
    code: (0, import_fields75.text)(),
    metadata: (0, import_fields75.json)(),
    shippingMethod: (0, import_fields75.relationship)({
      ref: "ShippingMethod.shippingMethodTaxLines"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingOption.ts
var import_core75 = require("@keystone-6/core");
var import_fields76 = require("@keystone-6/core/fields");
var import_core76 = require("@keystone-6/core");
function formatCurrency4(amount, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
}
var ShippingOption = (0, import_core75.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    name: (0, import_fields76.text)({
      validation: {
        isRequired: true
      }
    }),
    uniqueKey: (0, import_fields76.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    priceType: (0, import_fields76.select)({
      type: "enum",
      options: [
        {
          label: "Flat Rate",
          value: "flat_rate"
        },
        {
          label: "Calculated",
          value: "calculated"
        },
        {
          label: "Free",
          value: "free"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    amount: (0, import_fields76.integer)({
      validation: {
        isRequired: false
      }
    }),
    isReturn: (0, import_fields76.checkbox)(),
    data: (0, import_fields76.json)(),
    metadata: (0, import_fields76.json)(),
    adminOnly: (0, import_fields76.checkbox)(),
    region: (0, import_fields76.relationship)({
      ref: "Region.shippingOptions"
    }),
    fulfillmentProvider: (0, import_fields76.relationship)({
      ref: "FulfillmentProvider.shippingOptions"
    }),
    shippingProfile: (0, import_fields76.relationship)({
      ref: "ShippingProfile.shippingOptions"
    }),
    customShippingOptions: (0, import_fields76.relationship)({
      ref: "CustomShippingOption.shippingOption",
      many: true
    }),
    shippingMethods: (0, import_fields76.relationship)({
      ref: "ShippingMethod.shippingOption",
      many: true
    }),
    shippingOptionRequirements: (0, import_fields76.relationship)({
      ref: "ShippingOptionRequirement.shippingOption",
      many: true
    }),
    taxRates: (0, import_fields76.relationship)({
      ref: "TaxRate.shippingOptions",
      many: true
    }),
    calculatedAmount: (0, import_fields76.virtual)({
      field: import_core76.graphql.field({
        type: import_core76.graphql.String,
        async resolve(item, args, context) {
          const sudoContext = context.sudo();
          const shippingOption = await sudoContext.query.ShippingOption.findOne({
            where: { id: item.id },
            query: `
              region {
                currency {
                  code
                  noDivisionCurrency
                }
              }
              amount
              taxRates {
                rate
              }
            `
          });
          if (!shippingOption?.amount) return null;
          const currencyCode = shippingOption.region?.currency?.code || "USD";
          const divisor = shippingOption.region?.currency?.noDivisionCurrency ? 1 : 100;
          const taxRate = shippingOption.taxRates?.[0]?.rate || 0;
          const amount = shippingOption.amount * (1 + taxRate);
          return formatCurrency4(amount / divisor, currencyCode);
        }
      })
    }),
    isTaxInclusive: (0, import_fields76.virtual)({
      field: import_core76.graphql.field({
        type: import_core76.graphql.Boolean,
        resolve() {
          return true;
        }
      })
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingOptionRequirement.ts
var import_core77 = require("@keystone-6/core");
var import_fields77 = require("@keystone-6/core/fields");
var ShippingOptionRequirement = (0, import_core77.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    type: (0, import_fields77.select)({
      type: "enum",
      options: [
        {
          label: "Min Subtotal",
          value: "min_subtotal"
        },
        {
          label: "Max Subtotal",
          value: "max_subtotal"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    amount: (0, import_fields77.integer)({
      validation: {
        isRequired: true
      }
    }),
    shippingOption: (0, import_fields77.relationship)({
      ref: "ShippingOption.shippingOptionRequirements"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingProfile.ts
var import_core78 = require("@keystone-6/core");
var import_fields78 = require("@keystone-6/core/fields");
var ShippingProfile = (0, import_core78.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    name: (0, import_fields78.text)({
      validation: {
        isRequired: true
      }
    }),
    type: (0, import_fields78.select)({
      type: "enum",
      options: [
        {
          label: "Default",
          value: "default"
        },
        {
          label: "Gift Card",
          value: "gift_card"
        },
        {
          label: "Custom",
          value: "custom"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields78.json)(),
    products: (0, import_fields78.relationship)({
      ref: "Product.shippingProfile",
      many: true
    }),
    shippingOptions: (0, import_fields78.relationship)({
      ref: "ShippingOption.shippingProfile",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingProvider.ts
var import_core79 = require("@keystone-6/core");
var import_fields79 = require("@keystone-6/core/fields");
var ShippingProvider = (0, import_core79.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    name: (0, import_fields79.text)({
      validation: { isRequired: true }
    }),
    isActive: (0, import_fields79.checkbox)({
      defaultValue: false
    }),
    accessToken: (0, import_fields79.text)({
      validation: { isRequired: true },
      ui: {
        itemView: { fieldMode: "hidden" }
      }
    }),
    // Adapter function fields
    createLabelFunction: (0, import_fields79.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the order data"
      }
    }),
    getRatesFunction: (0, import_fields79.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the order data"
      }
    }),
    validateAddressFunction: (0, import_fields79.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the address data"
      }
    }),
    trackShipmentFunction: (0, import_fields79.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the tracking number"
      }
    }),
    cancelLabelFunction: (0, import_fields79.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the label ID"
      }
    }),
    metadata: (0, import_fields79.json)(),
    // Relationships
    regions: (0, import_fields79.relationship)({
      ref: "Region.shippingProviders",
      many: true
    }),
    labels: (0, import_fields79.relationship)({
      ref: "ShippingLabel.provider",
      many: true
    }),
    fulfillmentProvider: (0, import_fields79.relationship)({
      ref: "FulfillmentProvider.shippingProviders",
      many: false
    }),
    fromAddress: (0, import_fields79.relationship)({
      ref: "Address.shippingProviders",
      many: false
      // ui: {
      //   displayMode: 'cards',
      //   cardFields: ['company', 'address1', 'city', 'province', 'country'],
      //   inlineCreate: { fields: ['company', 'firstName', 'lastName', 'address1', 'address2', 'city', 'province', 'postalCode', 'country', 'phone'] },
      //   inlineEdit: { fields: ['company', 'firstName', 'lastName', 'address1', 'address2', 'city', 'province', 'postalCode', 'country', 'phone'] },
      //   inlineConnect: true,
      // },
    }),
    ...trackingFields
  }
});

// features/keystone/models/StockMovement.ts
var import_core80 = require("@keystone-6/core");
var import_fields80 = require("@keystone-6/core/fields");
var StockMovement = (0, import_core80.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    type: (0, import_fields80.select)({
      type: "enum",
      options: [
        { label: "Receive", value: "RECEIVE" },
        { label: "Remove", value: "REMOVE" }
      ],
      validation: { isRequired: true }
    }),
    quantity: (0, import_fields80.integer)({
      validation: { isRequired: true }
    }),
    reason: (0, import_fields80.text)(),
    note: (0, import_fields80.text)(),
    variant: (0, import_fields80.relationship)({
      ref: "ProductVariant.stockMovements",
      many: false
    }),
    createdAt: (0, import_fields80.timestamp)({
      defaultValue: { kind: "now" }
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      const { quantity, type, variant } = resolvedData;
      if (variant?.connect?.id && quantity) {
        const variantData = await context.query.ProductVariant.findOne({
          where: { id: variant.connect.id },
          query: "inventoryQuantity"
        });
        if (variantData) {
          await context.query.ProductVariant.updateOne({
            where: { id: variant.connect.id },
            data: {
              inventoryQuantity: type === "RECEIVE" ? variantData.inventoryQuantity + quantity : variantData.inventoryQuantity - quantity
            }
          });
        }
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/Store.ts
var import_core81 = require("@keystone-6/core");
var import_fields81 = require("@keystone-6/core/fields");
var Store = (0, import_core81.list)({
  access: {
    operation: {
      // Allow public read access
      query: () => true,
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels
    }
  },
  fields: {
    name: (0, import_fields81.text)({
      defaultValue: "Openfront Store",
      validation: {
        isRequired: true
      }
    }),
    defaultCurrencyCode: (0, import_fields81.text)({
      defaultValue: "usd",
      validation: {
        isRequired: true
      }
    }),
    homepageTitle: (0, import_fields81.text)({
      defaultValue: "Openfront Next.js Starter"
    }),
    homepageDescription: (0, import_fields81.text)({
      defaultValue: "A performant frontend e-commerce starter template with Next.js 15 and Openfront."
    }),
    metadata: (0, import_fields81.json)(),
    swapLinkTemplate: (0, import_fields81.text)(),
    paymentLinkTemplate: (0, import_fields81.text)(),
    inviteLinkTemplate: (0, import_fields81.text)(),
    // currency: relationship({
    //   ref: "Currency.stores",
    // }),
    currencies: (0, import_fields81.relationship)({
      ref: "Currency.stores",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Swap.ts
var import_core82 = require("@keystone-6/core");
var import_fields82 = require("@keystone-6/core/fields");
var Swap = (0, import_core82.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    fulfillmentStatus: (0, import_fields82.select)({
      type: "enum",
      options: [
        {
          label: "Not Fulfilled",
          value: "not_fulfilled"
        },
        {
          label: "Fulfilled",
          value: "fulfilled"
        },
        {
          label: "Shipped",
          value: "shipped"
        },
        {
          label: "Partially Shipped",
          value: "partially_shipped"
        },
        {
          label: "Canceled",
          value: "canceled"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    paymentStatus: (0, import_fields82.select)({
      type: "enum",
      options: [
        {
          label: "Not Paid",
          value: "not_paid"
        },
        {
          label: "Awaiting",
          value: "awaiting"
        },
        {
          label: "Captured",
          value: "captured"
        },
        {
          label: "Confirmed",
          value: "confirmed"
        },
        {
          label: "Canceled",
          value: "canceled"
        },
        {
          label: "Difference Refunded",
          value: "difference_refunded"
        },
        {
          label: "Partially Refunded",
          value: "partially_refunded"
        },
        {
          label: "Refunded",
          value: "refunded"
        },
        {
          label: "Requires Action",
          value: "requires_action"
        }
      ],
      validation: {
        isRequired: true
      }
    }),
    differenceDue: (0, import_fields82.integer)(),
    confirmedAt: (0, import_fields82.timestamp)(),
    metadata: (0, import_fields82.json)(),
    idempotencyKey: (0, import_fields82.text)(),
    noNotification: (0, import_fields82.checkbox)(),
    canceledAt: (0, import_fields82.timestamp)(),
    allowBackorder: (0, import_fields82.checkbox)(),
    cart: (0, import_fields82.relationship)({
      ref: "Cart.swap"
    }),
    order: (0, import_fields82.relationship)({
      ref: "Order.swaps"
    }),
    address: (0, import_fields82.relationship)({
      ref: "Address.swaps"
    }),
    lineItems: (0, import_fields82.relationship)({
      ref: "LineItem.swap",
      many: true
    }),
    fulfillments: (0, import_fields82.relationship)({
      ref: "Fulfillment.swap",
      many: true
    }),
    payment: (0, import_fields82.relationship)({
      ref: "Payment.swap"
    }),
    return: (0, import_fields82.relationship)({
      ref: "Return.swap"
    }),
    shippingMethods: (0, import_fields82.relationship)({
      ref: "ShippingMethod.swap",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/TaxProvider.ts
var import_core83 = require("@keystone-6/core");
var import_fields83 = require("@keystone-6/core/fields");
var TaxProvider = (0, import_core83.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: ({ session }) => !!session?.data.isAdmin,
      update: ({ session }) => !!session?.data.isAdmin,
      delete: ({ session }) => !!session?.data.isAdmin
    }
  },
  fields: {
    isInstalled: (0, import_fields83.checkbox)({
      defaultValue: true
    }),
    regions: (0, import_fields83.relationship)({
      ref: "Region.taxProvider",
      many: true
    })
  }
});

// features/keystone/models/TaxRate.ts
var import_core84 = require("@keystone-6/core");
var import_fields84 = require("@keystone-6/core/fields");
var TaxRate = (0, import_core84.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    rate: (0, import_fields84.float)(),
    code: (0, import_fields84.text)(),
    name: (0, import_fields84.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields84.json)(),
    products: (0, import_fields84.relationship)({
      ref: "Product.taxRates",
      many: true
    }),
    productTypes: (0, import_fields84.relationship)({
      ref: "ProductType.taxRates",
      many: true
    }),
    region: (0, import_fields84.relationship)({
      ref: "Region.taxRates"
    }),
    shippingOptions: (0, import_fields84.relationship)({
      ref: "ShippingOption.taxRates",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Team.ts
var import_core85 = require("@keystone-6/core");
var import_fields85 = require("@keystone-6/core/fields");
var canManageTeams = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { id: { equals: session?.itemId } };
};
var Team = (0, import_core85.list)({
  access: {
    operation: {
      create: isSignedIn,
      query: isSignedIn,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    },
    filter: {
      query: canManageTeams,
      update: canManageTeams
    }
  },
  ui: {
    // hide the backend UI from regular users
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args)
  },
  fields: {
    name: (0, import_fields85.text)({
      validation: { isRequired: true }
    }),
    description: (0, import_fields85.text)(),
    members: (0, import_fields85.relationship)({
      ref: "User.team",
      many: true
    }),
    leader: (0, import_fields85.relationship)({
      ref: "User.teamLead",
      many: false
    }),
    ...trackingFields
  },
  hooks: {
    validateInput: async ({ resolvedData, addValidationError, context }) => {
      const { name, leader, members } = resolvedData;
      if (name && name.length < 2) {
        addValidationError("Team name must be at least 2 characters long");
      }
      if (leader && members) {
        const leaderInMembers = members.connect?.some(
          (member) => member.id === leader.connect?.id
        );
        if (!leaderInMembers) {
          addValidationError("Team leader must be a member of the team");
        }
      }
    },
    beforeOperation: async ({ operation, resolvedData, item, context }) => {
      if (operation === "delete") {
        const teamWithMembers = await context.query.Team.findOne({
          where: { id: item.id },
          query: "members { id }"
        });
        if (teamWithMembers?.members?.length > 0) {
          throw new Error("Cannot delete team with active members");
        }
      }
    }
  }
});

// features/keystone/models/User.ts
var import_core86 = require("@keystone-6/core");
var import_fields86 = require("@keystone-6/core/fields");
var canManageUsers = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { id: { equals: session?.itemId } };
};
var User = (0, import_core86.list)({
  access: {
    operation: {
      create: () => true,
      query: isSignedIn,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    },
    filter: {
      query: canManageUsers,
      update: canManageUsers
    }
  },
  ui: {
    // hide the backend UI from regular users
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args)
  },
  fields: {
    name: (0, import_fields86.text)({
      validation: { isRequired: true }
    }),
    email: (0, import_fields86.text)({ isIndexed: "unique", validation: { isRequired: true } }),
    password: (0, import_fields86.password)({
      validation: {
        length: { min: 10, max: 1e3 },
        isRequired: true,
        rejectCommon: true
      }
    }),
    role: (0, import_fields86.relationship)({
      ref: "Role.assignedTo",
      access: {
        create: permissions.canManageUsers,
        update: permissions.canManageUsers
      },
      ui: {
        itemView: {
          fieldMode: (args) => permissions.canManageUsers(args) ? "edit" : "read"
        }
      }
    }),
    apiKeys: (0, import_fields86.relationship)({ ref: "ApiKey.user", many: true }),
    phone: (0, import_fields86.text)(),
    hasAccount: (0, import_fields86.checkbox)(),
    addresses: (0, import_fields86.relationship)({
      ref: "Address.user",
      many: true
    }),
    orders: (0, import_fields86.relationship)({
      ref: "Order.user",
      many: true
    }),
    orderEvents: (0, import_fields86.relationship)({
      ref: "OrderEvent.user",
      many: true
    }),
    carts: (0, import_fields86.relationship)({
      ref: "Cart.user",
      many: true
    }),
    customerGroups: (0, import_fields86.relationship)({
      ref: "CustomerGroup.users",
      many: true
    }),
    notifications: (0, import_fields86.relationship)({
      ref: "Notification.user",
      many: true
    }),
    payments: (0, import_fields86.relationship)({
      ref: "Payment.user",
      many: true
    }),
    batchJobs: (0, import_fields86.relationship)({
      ref: "BatchJob.createdBy",
      many: true
    }),
    team: (0, import_fields86.relationship)({
      ref: "Team.members",
      many: false
    }),
    teamLead: (0, import_fields86.relationship)({
      ref: "Team.leader",
      many: true
    }),
    userField: (0, import_fields86.relationship)({
      ref: "UserField.user",
      many: false
    }),
    onboardingStatus: (0, import_fields86.select)({
      options: [
        { label: "Not Started", value: "not_started" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Dismissed", value: "dismissed" }
      ],
      defaultValue: "not_started"
    }),
    // Account system fields
    accounts: (0, import_fields86.relationship)({
      ref: "Account.user",
      many: true
    }),
    invoices: (0, import_fields86.relationship)({
      ref: "Invoice.user",
      many: true
    }),
    businessAccountRequest: (0, import_fields86.relationship)({
      ref: "BusinessAccountRequest.user",
      many: false
    }),
    customerToken: (0, import_fields86.text)({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" }
      },
      db: {
        isNullable: true
      }
    }),
    tokenGeneratedAt: (0, import_fields86.timestamp)(),
    orderWebhookUrl: (0, import_fields86.text)({
      ui: {
        description: "Webhook URL to call when orders are created/updated (for Openship integration)"
      }
    }),
    ...(0, import_core86.group)({
      label: "Virtual Fields",
      description: "Calculated fields for user display and cart status",
      fields: {
        firstName: (0, import_fields86.virtual)({
          field: import_core86.graphql.field({
            type: import_core86.graphql.String,
            resolve(item) {
              if (!item.name) return "";
              const parts = item.name.trim().split(/\s+/);
              return parts[0] || "";
            }
          })
        }),
        lastName: (0, import_fields86.virtual)({
          field: import_core86.graphql.field({
            type: import_core86.graphql.String,
            resolve(item) {
              if (!item.name) return "";
              const parts = item.name.trim().split(/\s+/);
              if (parts.length === 1) return "";
              if (parts.length > 2 && parts[parts.length - 2].length === 1) {
                return parts.slice(-2).join(" ");
              }
              return parts[parts.length - 1];
            }
          })
        }),
        activeCartId: (0, import_fields86.virtual)({
          field: import_core86.graphql.field({
            type: import_core86.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const activeCarts = await sudoContext.query.Cart.findMany({
                where: {
                  user: { id: { equals: item.id } },
                  order: null,
                  type: { equals: "default" }
                },
                orderBy: { updatedAt: "desc" },
                take: 1,
                query: `
                  id
                  lineItems {
                    id
                  }
                `
              });
              const cart = activeCarts[0];
              if (cart && cart.lineItems?.length > 0) {
                return cart.id;
              }
              return null;
            }
          })
        }),
        billingAddress: (0, import_fields86.virtual)({
          field: (lists) => import_core86.graphql.field({
            type: lists.Address.types.output,
            async resolve(item, args, context) {
              const address = await context.db.Address.findMany({
                where: {
                  user: { id: { equals: item.id } },
                  isBilling: { equals: true }
                },
                take: 1
              });
              if (!address.length) return null;
              return address[0];
            }
          }),
          ui: {
            query: `{
                firstName
                lastName
                company
                address1
                address2
                city
                province
                postalCode
                country {
                  id
                  iso2
                }
                phone
            }`
          }
        })
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/UserField.ts
var import_core87 = require("@keystone-6/core");
var import_fields87 = require("@keystone-6/core/fields");
var UserField = (0, import_core87.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    user: (0, import_fields87.relationship)({
      ref: "User.userField",
      many: false
    }),
    lastLoginIp: (0, import_fields87.text)(),
    lastLoginUserAgent: (0, import_fields87.text)(),
    loginHistory: (0, import_fields87.json)({
      defaultValue: []
    }),
    preferences: (0, import_fields87.json)({
      defaultValue: {
        theme: "light",
        notifications: true,
        emailNotifications: true
      }
    }),
    notes: (0, import_fields87.text)(),
    lastPasswordChange: (0, import_fields87.timestamp)(),
    failedLoginAttempts: (0, import_fields87.json)({
      defaultValue: {
        count: 0,
        lastAttempt: null,
        lockedUntil: null
      }
    }),
    ...trackingFields
  },
  hooks: {
    resolveInput: async ({ resolvedData, context }) => {
      if (resolvedData.lastLoginIp || resolvedData.lastLoginUserAgent) {
        const history = resolvedData.loginHistory || [];
        history.push({
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          ip: resolvedData.lastLoginIp,
          userAgent: resolvedData.lastLoginUserAgent
        });
        if (history.length > 10) {
          history.shift();
        }
        resolvedData.loginHistory = history;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/WebhookEndpoint.ts
var import_core88 = require("@keystone-6/core");
var import_fields88 = require("@keystone-6/core/fields");
var import_crypto = __toESM(require("crypto"));
var WebhookEndpoint = (0, import_core88.list)({
  access: {
    operation: {
      query: permissions.canReadWebhooks,
      create: permissions.canManageWebhooks,
      update: permissions.canManageWebhooks,
      delete: permissions.canManageWebhooks
    }
  },
  ui: {
    hideCreate: (args) => !permissions.canManageWebhooks(args),
    hideDelete: (args) => !permissions.canManageWebhooks(args),
    listView: {
      initialColumns: ["url", "isActive", "events", "lastTriggered", "failureCount"]
    }
  },
  fields: {
    url: (0, import_fields88.text)({
      validation: { isRequired: true },
      ui: { description: "The URL where webhook events will be sent" }
    }),
    events: (0, import_fields88.json)({
      defaultValue: [],
      ui: {
        description: 'Events to subscribe to, e.g., ["order.created", "product.updated", "cart.completed"]'
      }
    }),
    isActive: (0, import_fields88.checkbox)({
      defaultValue: true,
      ui: { description: "Whether this webhook endpoint is currently active" }
    }),
    secret: (0, import_fields88.text)({
      ui: {
        itemView: { fieldMode: "hidden" },
        description: "Secret key for webhook signature verification (auto-generated)"
      },
      hooks: {
        resolveInput: ({ resolvedData, operation }) => {
          if (operation === "create" && !resolvedData.secret) {
            return import_crypto.default.randomBytes(32).toString("hex");
          }
          return resolvedData.secret;
        }
      }
    }),
    lastTriggered: (0, import_fields88.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Last time this webhook was triggered"
      }
    }),
    failureCount: (0, import_fields88.integer)({
      defaultValue: 0,
      ui: {
        itemView: { fieldMode: "read" },
        description: "Number of consecutive delivery failures"
      }
    }),
    // Removed user relationship - webhooks are system-wide based on permissions
    webhookEvents: (0, import_fields88.relationship)({
      ref: "WebhookEvent.endpoint",
      many: true,
      ui: {
        displayMode: "count",
        description: "Events sent to this endpoint"
      }
    }),
    createdAt: (0, import_fields88.timestamp)({
      defaultValue: { kind: "now" },
      ui: { itemView: { fieldMode: "read" } }
    }),
    updatedAt: (0, import_fields88.timestamp)({
      db: { updatedAt: true },
      ui: { itemView: { fieldMode: "read" } }
    })
  }
});

// features/keystone/models/WebhookEvent.ts
var import_core89 = require("@keystone-6/core");
var import_fields89 = require("@keystone-6/core/fields");
var WebhookEvent = (0, import_core89.list)({
  access: {
    operation: {
      query: permissions.canReadWebhooks,
      create: permissions.canManageWebhooks,
      // Only system should create events
      update: permissions.canManageWebhooks,
      // Only system should update events
      delete: permissions.canManageWebhooks
    }
  },
  ui: {
    hideCreate: () => true,
    // Events should only be created by the system
    hideDelete: (args) => !permissions.canManageWebhooks(args),
    listView: {
      initialColumns: ["eventType", "resourceType", "delivered", "deliveryAttempts", "createdAt"]
    }
  },
  fields: {
    eventType: (0, import_fields89.text)({
      validation: { isRequired: true },
      ui: { description: 'The type of event (e.g., "order.created")' }
    }),
    resourceId: (0, import_fields89.text)({
      validation: { isRequired: true },
      ui: { description: "ID of the resource that triggered the event" }
    }),
    resourceType: (0, import_fields89.text)({
      validation: { isRequired: true },
      ui: { description: 'Type of resource (e.g., "Order", "Product")' }
    }),
    payload: (0, import_fields89.json)({
      ui: {
        description: "The event payload sent to the webhook",
        itemView: { fieldMode: "read" }
      }
    }),
    deliveryAttempts: (0, import_fields89.integer)({
      defaultValue: 0,
      ui: {
        itemView: { fieldMode: "read" },
        description: "Number of delivery attempts"
      }
    }),
    delivered: (0, import_fields89.checkbox)({
      defaultValue: false,
      ui: {
        itemView: { fieldMode: "read" },
        description: "Whether the webhook was successfully delivered"
      }
    }),
    lastAttempt: (0, import_fields89.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Timestamp of the last delivery attempt"
      }
    }),
    nextAttempt: (0, import_fields89.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Timestamp for the next retry attempt"
      }
    }),
    responseStatus: (0, import_fields89.integer)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "HTTP status code from the last delivery attempt"
      }
    }),
    responseBody: (0, import_fields89.text)({
      ui: {
        itemView: { fieldMode: "read" },
        displayMode: "textarea",
        description: "Response body from the last delivery attempt"
      }
    }),
    endpoint: (0, import_fields89.relationship)({
      ref: "WebhookEndpoint.webhookEvents",
      ui: { description: "The webhook endpoint this event was sent to" }
    }),
    createdAt: (0, import_fields89.timestamp)({
      defaultValue: { kind: "now" },
      ui: { itemView: { fieldMode: "read" } }
    })
  }
});

// features/keystone/models/index.ts
var models = {
  Account,
  AccountLineItem,
  Address,
  ApiKey,
  BatchJob,
  Capture,
  Cart,
  ClaimImage,
  ClaimItem,
  ClaimOrder,
  ClaimTag,
  Country,
  Currency,
  CustomShippingOption,
  CustomerGroup,
  Discount,
  DiscountCondition,
  DiscountRule,
  DraftOrder,
  Fulfillment,
  FulfillmentItem,
  FulfillmentProvider,
  GiftCard,
  GiftCardTransaction,
  IdempotencyKey,
  Invite,
  Invoice,
  InvoiceLineItem,
  BusinessAccountRequest,
  LineItem,
  LineItemAdjustment,
  LineItemTaxLine,
  Location,
  Measurement,
  MoneyAmount,
  Note,
  Notification,
  NotificationProvider,
  OAuthApp,
  OAuthToken,
  Order,
  OrderEvent,
  OrderLineItem,
  OrderMoneyAmount,
  Payment,
  PaymentCollection,
  PaymentProvider,
  PaymentSession,
  PriceList,
  PriceRule,
  PriceSet,
  Product,
  ProductCategory,
  ProductCollection,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductTag,
  ProductType,
  ProductVariant,
  Refund,
  Region,
  Return,
  ReturnItem,
  ReturnReason,
  Role,
  RuleType,
  SalesChannel,
  ShippingLabel,
  ShippingMethod,
  ShippingMethodTaxLine,
  ShippingOption,
  ShippingOptionRequirement,
  ShippingProfile,
  ShippingProvider,
  StockMovement,
  Store,
  Swap,
  TaxProvider,
  TaxRate,
  Team,
  User,
  UserField,
  WebhookEndpoint,
  WebhookEvent
};

// features/keystone/index.ts
var import_iron = __toESM(require("@hapi/iron"));
var cookie = __toESM(require("cookie"));
var import_bcryptjs = __toESM(require("bcryptjs"));

// features/webhooks/webhook-plugin.ts
var import_crypto2 = __toESM(require("crypto"));

// features/webhooks/enrichers/base-enricher.ts
var BaseWebhookEnricher = class {
  /**
   * Helper method to query the entity with enriched data
   */
  async queryEnrichedEntity(item, context) {
    if (!item?.id) {
      return item;
    }
    try {
      const result = await context.query[this.entityType].findOne({
        where: { id: item.id },
        query: this.getQueryFields()
      });
      return result || item;
    } catch (error) {
      console.error(`Error querying ${this.entityType} for webhook enrichment:`, error);
      return item;
    }
  }
};

// features/webhooks/enrichers/order-enricher.ts
var OrderWebhookEnricher = class extends BaseWebhookEnricher {
  constructor() {
    super(...arguments);
    this.entityType = "Order";
  }
  async enrich(item, context) {
    const enrichedItem = await this.queryEnrichedEntity(item, context);
    return enrichedItem || item;
  }
  getQueryFields() {
    return `
      id
      displayId
      email
      status
      rawTotal
      total
      subtotal
      shipping
      discount
      tax
      canceledAt
      metadata
      idempotencyKey
      noNotification
      externalId
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      shippingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        phone
        country {
          id
          iso2
          displayName
        }
      }
      billingAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        postalCode
        phone
        country {
          id
          iso2
          displayName
        }
      }
      lineItems {
        id
        title
        quantity
        sku
        variantTitle
        thumbnail
        formattedUnitPrice
        formattedTotal
        moneyAmount {
          amount
          originalAmount
        }
        productVariant {
          id
          title
          sku
          product {
            id
            title
            handle
            thumbnail
            productImages {
              image {
                url
              }
              imagePath
            }
          }
        }
        productData
        variantData
      }
      createdAt
      updatedAt
    `;
  }
};

// features/webhooks/enrichers/registry.ts
var WebhookEnricherRegistry = class {
  constructor() {
    this.enrichers = /* @__PURE__ */ new Map();
  }
  register(entityType, enricher) {
    this.enrichers.set(entityType, enricher);
  }
  get(entityType) {
    return this.enrichers.get(entityType);
  }
  has(entityType) {
    return this.enrichers.has(entityType);
  }
  /**
   * Get all registered entity types
   */
  getRegisteredTypes() {
    return Array.from(this.enrichers.keys());
  }
};
var webhookEnricherRegistry = new WebhookEnricherRegistry();
function registerWebhookEnricher(enricher) {
  webhookEnricherRegistry.register(enricher.entityType, enricher);
}

// features/webhooks/enrichers/index.ts
registerWebhookEnricher(new OrderWebhookEnricher());

// features/webhooks/webhook-plugin.ts
var webhookQueue = [];
var batchTimer = null;
function withWebhooks(config2) {
  const enhancedLists = Object.fromEntries(
    Object.entries(config2.lists || {}).map(([listKey2, listConfig]) => [
      listKey2,
      {
        ...listConfig,
        hooks: {
          ...listConfig.hooks,
          afterOperation: async (args) => {
            try {
              if (listConfig.hooks?.afterOperation) {
                await listConfig.hooks.afterOperation(args);
              }
            } catch (error) {
              console.error(`Original hook failed for ${listKey2}:`, error);
            }
            try {
              await queueWebhook({
                listKey: listKey2,
                operation: args.operation,
                item: args.item,
                originalItem: args.originalItem,
                context: args.context.sudo()
              });
            } catch (error) {
              console.error(`Webhook failed for ${listKey2}:`, error);
            }
          }
        }
      }
    ])
  );
  return {
    ...config2,
    lists: enhancedLists
  };
}
async function queueWebhook(payload) {
  webhookQueue.push(payload);
  if (!batchTimer) {
    batchTimer = setTimeout(processBatch, 100);
  }
}
async function processBatch() {
  const batch = [...webhookQueue];
  webhookQueue = [];
  batchTimer = null;
  if (batch.length === 0) {
    return;
  }
  for (const webhook of batch) {
    await triggerWebhook(webhook);
  }
}
async function triggerWebhook({ listKey: listKey2, operation, item, originalItem, context }) {
  try {
    const operationMap = {
      "create": "created",
      "update": "updated",
      "delete": "deleted"
    };
    const webhookOperation = operationMap[operation] || operation;
    const eventType = `${listKey2.toLowerCase()}.${webhookOperation}`;
    const webhooks = await context.query.WebhookEndpoint.findMany({
      where: {
        isActive: { equals: true }
      },
      query: "id url secret events failureCount"
    });
    if (!webhooks || webhooks.length === 0) {
      return;
    }
    const subscribedWebhooks = webhooks.filter((webhook) => {
      if (!webhook.events || !Array.isArray(webhook.events)) {
        return false;
      }
      return webhook.events.includes(eventType) || webhook.events.includes("*");
    });
    if (subscribedWebhooks.length === 0) {
      return;
    }
    const payload = await formatPayload(listKey2, operation, item, originalItem, context);
    for (const webhook of subscribedWebhooks) {
      await deliverWebhook(webhook, eventType, payload, context);
    }
  } catch (error) {
    console.error("Webhook trigger error:", error);
  }
}
async function deliverWebhook(webhook, eventType, payload, context) {
  try {
    const webhookEvent2 = await context.query.WebhookEvent.createOne({
      data: {
        eventType,
        resourceType: payload.listKey,
        resourceId: payload.data?.id || "unknown",
        payload,
        endpoint: { connect: { id: webhook.id } },
        deliveryAttempts: 1,
        nextAttempt: /* @__PURE__ */ new Date()
      },
      query: "id"
    });
    const secret = webhook.secret || "default-secret";
    const signature = import_crypto2.default.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-OpenFront-Webhook-Signature": `sha256=${signature}`,
        "X-OpenFront-Topic": eventType,
        "X-OpenFront-ListKey": payload.listKey,
        "X-OpenFront-Operation": payload.operation,
        "X-OpenFront-Delivery-ID": webhookEvent2.id
      },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent2.id },
        data: {
          delivered: true,
          responseStatus: response.status,
          responseBody: await response.text(),
          lastAttempt: /* @__PURE__ */ new Date()
        }
      });
      if (webhook.failureCount > 0) {
        await context.query.WebhookEndpoint.updateOne({
          where: { id: webhook.id },
          data: {
            failureCount: 0,
            lastTriggered: /* @__PURE__ */ new Date()
          }
        });
      } else {
        await context.query.WebhookEndpoint.updateOne({
          where: { id: webhook.id },
          data: { lastTriggered: /* @__PURE__ */ new Date() }
        });
      }
    } else {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    try {
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent?.id },
        data: {
          delivered: false,
          responseStatus: error.status || 0,
          responseBody: error.message,
          lastAttempt: /* @__PURE__ */ new Date(),
          // Schedule retry (exponential backoff)
          nextAttempt: new Date(Date.now() + Math.pow(2, 1) * 6e4)
          // 2 minutes for first retry
        }
      });
      await context.query.WebhookEndpoint.updateOne({
        where: { id: webhook.id },
        data: {
          failureCount: (webhook.failureCount || 0) + 1
        }
      });
    } catch (updateError) {
      console.error("Failed to update webhook event after delivery failure:", updateError);
    }
  }
}
async function formatPayload(listKey2, operation, item, originalItem, context) {
  const basePayload = {
    event: `${listKey2.toLowerCase()}.${operation}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    listKey: listKey2,
    operation
  };
  let enrichedData = item;
  if (webhookEnricherRegistry.has(listKey2) && item?.id) {
    try {
      const enricher = webhookEnricherRegistry.get(listKey2);
      if (enricher) {
        enrichedData = await enricher.enrich(item, context);
      }
    } catch (error) {
      console.error(`Error enriching webhook payload for ${listKey2}:`, error);
      enrichedData = item;
    }
  }
  switch (operation) {
    case "create":
      return {
        ...basePayload,
        data: enrichedData || item
      };
    case "update":
      return {
        ...basePayload,
        data: enrichedData || item,
        previousData: originalItem,
        changes: getChangedFields(originalItem, enrichedData || item)
      };
    case "delete":
      return {
        ...basePayload,
        data: originalItem
      };
    default:
      return {
        ...basePayload,
        data: enrichedData || item
      };
  }
}
function getChangedFields(original, updated) {
  if (!original || !updated) return {};
  const changes = {};
  for (const key in updated) {
    if (original[key] !== updated[key]) {
      changes[key] = {
        from: original[key],
        to: updated[key]
      };
    }
  }
  return changes;
}

// features/keystone/index.ts
var databaseURL = process.env.DATABASE_URL || "file:./keystone.db";
var listKey = "User";
var basePath = "/dashboard";
var sessionConfig = {
  maxAge: 60 * 60 * 24 * 360,
  // How long they stay signed in?
  secret: process.env.SESSION_SECRET || "this secret should only be used in testing"
};
var {
  S3_BUCKET_NAME: bucketName = "keystone-test",
  S3_REGION: region = "ap-southeast-2",
  S3_ACCESS_KEY_ID: accessKeyId = "keystone",
  S3_SECRET_ACCESS_KEY: secretAccessKey = "keystone",
  S3_ENDPOINT: endpoint = "https://sfo3.digitaloceanspaces.com"
} = process.env;
function statelessSessions({
  secret,
  maxAge = 60 * 60 * 24 * 360,
  path = "/",
  secure = process.env.NODE_ENV === "production",
  ironOptions = import_iron.default.defaults,
  domain,
  sameSite = "lax",
  cookieName = "keystonejs-session"
}) {
  if (!secret) {
    throw new Error("You must specify a session secret to use sessions");
  }
  if (secret.length < 32) {
    throw new Error("The session secret must be at least 32 characters long");
  }
  return {
    async get({ context }) {
      if (!context?.req) return;
      const authHeader = context.req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const accessToken = authHeader.replace("Bearer ", "");
        if (accessToken.startsWith("of_")) {
          try {
            const clientIP = context.req.headers["x-forwarded-for"] || context.req.headers["x-real-ip"] || context.req.connection?.remoteAddress || context.req.socket?.remoteAddress || context.req.connection?.socket?.remoteAddress || "127.0.0.1";
            const actualClientIP = typeof clientIP === "string" ? clientIP.split(",")[0].trim() : "127.0.0.1";
            const apiKeys = await context.sudo().query.ApiKey.findMany({
              where: { status: { equals: "active" } },
              query: `
                id
                name
                scopes
                status
                expiresAt
                usageCount
                restrictedToIPs
                tokenSecret { isSet }
                user { id }
              `
            });
            let matchingApiKey = null;
            for (const apiKey of apiKeys) {
              try {
                if (!apiKey.tokenSecret?.isSet) continue;
                const fullApiKey = await context.sudo().db.ApiKey.findOne({
                  where: { id: apiKey.id }
                });
                if (!fullApiKey || typeof fullApiKey.tokenSecret !== "string") {
                  continue;
                }
                const isValid = await import_bcryptjs.default.compare(accessToken, fullApiKey.tokenSecret);
                if (isValid) {
                  matchingApiKey = apiKey;
                  break;
                }
              } catch (error) {
                continue;
              }
            }
            if (!matchingApiKey) {
              return;
            }
            if (matchingApiKey.restrictedToIPs && Array.isArray(matchingApiKey.restrictedToIPs) && matchingApiKey.restrictedToIPs.length > 0) {
              const allowedIPs = matchingApiKey.restrictedToIPs;
              const isAllowedIP = allowedIPs.includes(actualClientIP);
              if (!isAllowedIP) {
                return;
              }
            }
            if (matchingApiKey.status !== "active") {
              return;
            }
            if (matchingApiKey.expiresAt && /* @__PURE__ */ new Date() > new Date(matchingApiKey.expiresAt)) {
              await context.sudo().query.ApiKey.updateOne({
                where: { id: matchingApiKey.id },
                data: { status: "revoked" }
              });
              return;
            }
            const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
            const usage = matchingApiKey.usageCount || { total: 0, daily: {} };
            usage.total = (usage.total || 0) + 1;
            usage.daily[today] = (usage.daily[today] || 0) + 1;
            context.sudo().query.ApiKey.updateOne({
              where: { id: matchingApiKey.id },
              data: {
                lastUsedAt: /* @__PURE__ */ new Date(),
                usageCount: usage
              }
            }).catch(console.error);
            if (matchingApiKey.user?.id) {
              const session = {
                itemId: matchingApiKey.user.id,
                listKey,
                apiKeyScopes: matchingApiKey.scopes || []
                // Attach scopes for permission checking
              };
              return session;
            }
          } catch (err) {
            return;
          }
        }
        try {
          const oauthToken = await context.sudo().query.OAuthToken.findOne({
            where: { token: accessToken },
            query: `id clientId scopes expiresAt tokenType isRevoked user { id }`
          });
          if (oauthToken) {
            if (oauthToken.tokenType !== "access_token") {
              return;
            }
            if (oauthToken.isRevoked === "true") {
              return;
            }
            if (/* @__PURE__ */ new Date() > new Date(oauthToken.expiresAt)) {
              return;
            }
            const oauthApp = await context.sudo().query.OAuthApp.findOne({
              where: { clientId: oauthToken.clientId },
              query: `id status`
            });
            if (!oauthApp || oauthApp.status !== "active") {
              return;
            }
            if (oauthToken.user?.id) {
              return {
                itemId: oauthToken.user.id,
                listKey,
                oauthScopes: oauthToken.scopes
                // Attach scopes for permission checking
              };
            }
          }
        } catch (err) {
        }
        if (accessToken.startsWith("ctok_")) {
          try {
            const users = await context.sudo().query.User.findMany({
              where: { customerToken: { equals: accessToken } },
              take: 1,
              query: `
                id
                email
                name
                accounts(where: { status: { equals: "active" }, accountType: { equals: "business" } }) {
                  id
                  status
                  availableCredit
                }
              `
            });
            const user = users[0];
            if (!user) {
              return;
            }
            const activeAccount = user.accounts?.[0];
            if (!activeAccount) {
              return;
            }
            return {
              itemId: user.id,
              listKey,
              customerToken: true,
              // Flag for permission checking
              activeAccountId: activeAccount.id
            };
          } catch (err) {
            return;
          }
        }
        try {
          return await import_iron.default.unseal(accessToken, secret, ironOptions);
        } catch (err) {
        }
      }
      const cookies = cookie.parse(context.req.headers.cookie || "");
      const token = cookies[cookieName];
      if (!token) return;
      try {
        return await import_iron.default.unseal(token, secret, ironOptions);
      } catch (err) {
      }
    },
    async end({ context }) {
      if (!context?.res) return;
      context.res.setHeader(
        "Set-Cookie",
        cookie.serialize(cookieName, "", {
          maxAge: 0,
          expires: /* @__PURE__ */ new Date(),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain
        })
      );
    },
    async start({ context, data }) {
      if (!context?.res) return;
      const sealedData = await import_iron.default.seal(data, secret, {
        ...ironOptions,
        ttl: maxAge * 1e3
      });
      context.res.setHeader(
        "Set-Cookie",
        cookie.serialize(cookieName, sealedData, {
          maxAge,
          expires: new Date(Date.now() + maxAge * 1e3),
          httpOnly: true,
          secure,
          path,
          sameSite,
          domain
        })
      );
      return sealedData;
    }
  };
}
var { withAuth } = (0, import_auth.createAuth)({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"],
    itemData: {
      /*
        This creates a related role with full permissions, so that when the first user signs in
        they have complete access to the system (without this, you couldn't do anything)
      */
      role: {
        create: {
          name: "Admin",
          canAccessDashboard: true,
          canReadOrders: true,
          canManageOrders: true,
          canReadProducts: true,
          canManageProducts: true,
          canReadFulfillments: true,
          canManageFulfillments: true,
          canReadUsers: true,
          canManageUsers: true,
          canReadRoles: true,
          canManageRoles: true,
          canReadCheckouts: true,
          canManageCheckouts: true,
          canReadDiscounts: true,
          canManageDiscounts: true,
          canReadGiftCards: true,
          canManageGiftCards: true,
          canReadReturns: true,
          canManageReturns: true,
          canReadSalesChannels: true,
          canManageSalesChannels: true,
          canReadPayments: true,
          canManagePayments: true,
          canReadIdempotencyKeys: true,
          canManageIdempotencyKeys: true,
          canReadApps: true,
          canManageApps: true,
          canManageKeys: true,
          canManageOnboarding: true,
          canReadWebhooks: true,
          canManageWebhooks: true
        }
      }
    }
    // TODO: Add in inital roles here
  },
  passwordResetLink: {
    async sendToken(args) {
      await sendPasswordResetEmail(args.token, args.identity);
    }
  },
  sessionData: `id name email role { ${permissionsList.join(" ")} }`
});
var keystone_default = withAuth(
  withWebhooks(
    (0, import_core90.config)({
      db: {
        provider: "postgresql",
        url: databaseURL
      },
      lists: models,
      storage: {
        my_images: {
          kind: "s3",
          type: "image",
          bucketName,
          region,
          accessKeyId,
          secretAccessKey,
          endpoint,
          signed: { expiry: 5e3 },
          forcePathStyle: true
        }
      },
      graphql: {
        // apolloConfig: {
        //   ...armor.protect()
        // },
        // extendGraphqlSchema: (schema) => {
        //   const extendedSchema = extendGraphqlSchema(schema);
        //   return applyMiddleware(extendedSchema,
        //     applyRateLimiting
        //   );
        // }
        extendGraphqlSchema
      },
      ui: {
        // Show the UI only for users who have canAccessDashboard permission
        // (min access scope needed to access Admin UI)
        isAccessAllowed: ({ session }) => permissions.canAccessDashboard({ session }),
        basePath
      },
      session: statelessSessions(sessionConfig)
    })
  )
);

// keystone.ts
var keystone_default2 = keystone_default;
//# sourceMappingURL=config.js.map
