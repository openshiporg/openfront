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
    },
    metadata: cart?.id ? { cartId: cart.id } : void 0
  }, cart?.id ? { idempotencyKey: `cart:${cart.id}:${amount}:${currency.toLowerCase()}` } : void 0);
  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}
async function capturePaymentFunction({ paymentId, amount, idempotencyKey }) {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.capture(
    paymentId,
    { ...amount ? { amount_to_capture: amount } : {} },
    idempotencyKey ? { idempotencyKey } : void 0
  );
  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount_received,
    currency: paymentIntent.currency,
    data: paymentIntent
  };
}
async function refundPaymentFunction({ paymentId, amount, idempotencyKey }) {
  const stripe = getStripeClient();
  const refund = await stripe.refunds.create({
    payment_intent: paymentId,
    ...amount ? { amount } : {}
  }, idempotencyKey ? { idempotencyKey } : void 0);
  return {
    status: refund.status,
    amount: refund.amount,
    currency: refund.currency,
    data: refund
  };
}
async function getPaymentStatusFunction({ paymentId }) {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount_received || paymentIntent.amount,
    currency: paymentIntent.currency,
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
    if (!headers.__rawBody) throw new Error("Raw webhook body is required");
    const stripeEvent = stripe.webhooks.constructEvent(
      headers.__rawBody,
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
    throw new Error(`Webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`);
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
        apiVersion: "2025-05-28.basil"
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
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
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
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(
    `${baseUrl}/v2/checkout/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...cart?.id ? { "PayPal-Request-Id": `cart-${cart.id}-${amount}-${currency.toUpperCase()}` } : {}
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            custom_id: cart?.id,
            amount: {
              currency_code: currency.toUpperCase(),
              value: formatPayPalAmount(amount, currency)
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
async function capturePaymentFunction2({ paymentId, idempotencyKey }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paymentId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...idempotencyKey ? { "PayPal-Request-Id": idempotencyKey } : {}
      }
    }
  );
  const capture = await response.json();
  if (capture.error) {
    throw new Error(`PayPal capture failed: ${capture.error.message}`);
  }
  const capturedAmount = capture.purchase_units[0].payments.captures[0].amount;
  return {
    status: capture.status,
    amount: parsePayPalAmount(capturedAmount.value, capturedAmount.currency_code),
    currency: capturedAmount.currency_code,
    data: capture
  };
}
async function refundPaymentFunction2({ paymentId, amount = 0, currency = "USD", idempotencyKey }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(
    `${baseUrl}/v2/payments/captures/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...idempotencyKey ? { "PayPal-Request-Id": idempotencyKey } : {}
      },
      body: JSON.stringify({
        amount: {
          value: formatPayPalAmount(amount, currency),
          currency_code: currency.toUpperCase()
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
    amount: parsePayPalAmount(refund.amount.value, refund.amount.currency_code),
    currency: refund.amount.currency_code,
    data: refund
  };
}
async function getPaymentStatusFunction2({ paymentId }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();
  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paymentId}`,
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
  const orderAmount = order.purchase_units[0].amount;
  return {
    status: order.status,
    amount: parsePayPalAmount(orderAmount.value, orderAmount.currency_code),
    currency: orderAmount.currency_code,
    data: order
  };
}
async function generatePaymentLinkFunction2({ paymentId }) {
  return `https://www.paypal.com/activity/payment/${paymentId}`;
}
var NO_DIVISION_CURRENCIES, getPayPalBaseUrl, formatPayPalAmount, parsePayPalAmount, getPayPalAccessToken;
var init_paypal = __esm({
  "features/integrations/payment/paypal.ts"() {
    "use strict";
    NO_DIVISION_CURRENCIES = [
      "JPY",
      "KRW",
      "VND",
      "CLP",
      "PYG",
      "XAF",
      "XOF",
      "BIF",
      "DJF",
      "GNF",
      "KMF",
      "MGA",
      "RWF",
      "XPF",
      "HTG",
      "VUV",
      "XAG",
      "XDR",
      "XAU"
    ];
    getPayPalBaseUrl = () => {
      const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX !== "false";
      return isSandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    };
    formatPayPalAmount = (amount, currency) => {
      const upperCurrency = currency.toUpperCase();
      const isNoDivision = NO_DIVISION_CURRENCIES.includes(upperCurrency);
      if (isNoDivision) {
        return amount.toString();
      }
      return (amount / 100).toFixed(2);
    };
    parsePayPalAmount = (value, currency) => {
      const upperCurrency = currency.toUpperCase();
      const isNoDivision = NO_DIVISION_CURRENCIES.includes(upperCurrency);
      if (isNoDivision) {
        return parseInt(value, 10);
      }
      return Math.round(parseFloat(value) * 100);
    };
    getPayPalAccessToken = async () => {
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        throw new Error("PayPal credentials not configured");
      }
      const baseUrl = getPayPalBaseUrl();
      const response = await fetch(
        `${baseUrl}/v1/oauth2/token`,
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
async function handleWebhookFunction3() {
  throw new Error("Manual payment providers do not accept webhook ingress");
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
async function capturePaymentFunction3({ paymentId, amount = 0 }) {
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
async function refundPaymentFunction3({ paymentId, amount = 0, currency = "USD" }) {
  return {
    status: "refunded",
    amount,
    currency,
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
  lineItems,
  idempotencyKey
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
      async: false,
      ...idempotencyKey ? { metadata: idempotencyKey } : {}
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
    return {
      success: refund.status !== "ERROR",
      refundStatus: refund.status || "QUEUED"
    };
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
  lineItems,
  idempotencyKey
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
      ...idempotencyKey ? { external_shipment_id: idempotencyKey } : {},
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
  const trackingUrl2 = baseTrackingUrls[rate.carrier] ? baseTrackingUrls[rate.carrier] + trackingNumber : "https://example.com/track";
  return {
    status: "SUCCESS",
    data: {
      rate_id: rate.id,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    },
    rate,
    trackingNumber,
    trackingUrl: trackingUrl2,
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

// features/keystone/utils/currencyConversion.ts
var currencyConversion_exports = {};
__export(currencyConversion_exports, {
  convertCurrency: () => convertCurrency,
  default: () => currencyConversion_default,
  formatCurrencyAmount: () => formatCurrencyAmount2,
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
function formatCurrencyAmount2(amount, currencyCode) {
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

// keystone.ts
var keystone_exports = {};
__export(keystone_exports, {
  default: () => keystone_default2
});
module.exports = __toCommonJS(keystone_exports);

// features/keystone/index.ts
var import_auth = require("@keystone-6/auth");
var import_core91 = require("@keystone-6/core");

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

// features/keystone/security/token-crypto.ts
var import_node_crypto = __toESM(require("node:crypto"));
var CART_PROOF_VERSION = "v1";
var DEFAULT_CART_PROOF_TTL_SECONDS = 60 * 60 * 24 * 7;
function requireSecret(purpose, explicitSecret) {
  const secret = explicitSecret || process.env.CREDENTIAL_PEPPER || process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      `${purpose} requires CREDENTIAL_PEPPER or SESSION_SECRET with at least 32 characters`
    );
  }
  return secret;
}
function generateOpaqueToken(prefix) {
  return `${prefix}${import_node_crypto.default.randomBytes(32).toString("base64url")}`;
}
function digestCredential(value, purpose, explicitSecret) {
  const secret = requireSecret(purpose, explicitSecret);
  return import_node_crypto.default.createHmac("sha256", secret).update(`${purpose}\0${value}`, "utf8").digest("hex");
}
function verifyCredentialDigest(value, expectedDigest, purpose, explicitSecret) {
  if (!value || !expectedDigest) return false;
  const actual = Buffer.from(
    digestCredential(value, purpose, explicitSecret),
    "hex"
  );
  const expected = Buffer.from(expectedDigest, "hex");
  return actual.length === expected.length && import_node_crypto.default.timingSafeEqual(actual, expected);
}
function createCartProof(cartId, options = {}) {
  if (!cartId) throw new Error("Cart ID is required");
  const expiresAt = options.expiresAt || Math.floor(Date.now() / 1e3) + DEFAULT_CART_PROOF_TTL_SECONDS;
  const payload = `${CART_PROOF_VERSION}.${cartId}.${expiresAt}`;
  const signature = digestCredential(payload, "cart-proof", options.secret);
  return `${payload}.${signature}`;
}
function verifyCartProof(proof, cartId, options = {}) {
  if (!proof || !cartId) return false;
  const [version, proofCartId, expiresAtRaw, signature, ...extra] = proof.split(".");
  if (extra.length || version !== CART_PROOF_VERSION || proofCartId !== cartId || !/^\d+$/.test(expiresAtRaw || "") || !/^[a-f0-9]{64}$/.test(signature || "")) {
    return false;
  }
  const expiresAt = Number(expiresAtRaw);
  const now = options.now || Math.floor(Date.now() / 1e3);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) return false;
  return verifyCredentialDigest(
    `${version}.${proofCartId}.${expiresAt}`,
    signature,
    "cart-proof",
    options.secret
  );
}
function customerTokenDigest(token) {
  return digestCredential(token, "customer-token");
}
function oauthTokenDigest(token) {
  return digestCredential(token, "oauth-token");
}
function oauthClientSecretDigest(secret) {
  return digestCredential(secret, "oauth-client-secret");
}

// features/keystone/security/cart-access.ts
function headerValue(value) {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : void 0;
}
function cookieValue(cookieHeader, name) {
  if (!cookieHeader) return void 0;
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return void 0;
}
function getCartProofFromContext(context) {
  const headers = context?.req?.headers || {};
  return headerValue(headers["x-openfront-cart-proof"]) || cookieValue(headerValue(headers.cookie), "_openfront_cart_id");
}
async function assertCartAccess(context, cartId, options = {}) {
  if (!cartId) throw new Error("Cart ID is required");
  const canManage = permissions.canManageOrders({ session: context.session });
  const sessionUserId = context.session?.itemId;
  const proof = getCartProofFromContext(context);
  if (!canManage && !sessionUserId && !verifyCartProof(proof, cartId)) {
    throw new Error("Cart not found");
  }
  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: "id user { id } order { id }"
  });
  if (!cart) throw new Error("Cart not found");
  if (!canManage) {
    const ownsCart = Boolean(sessionUserId && cart.user?.id === sessionUserId);
    const ownsGuestProof = Boolean(!cart.user && verifyCartProof(proof, cartId));
    if (!ownsCart && !ownsGuestProof) throw new Error("Cart not found");
  }
  if (!options.allowCompleted && cart.order?.id) {
    throw new Error("Cart has already been completed");
  }
  return cart;
}
async function assertLineItemBelongsToCart(context, cartId, lineItemId) {
  await assertCartAccess(context, cartId);
  const lineItem = await context.sudo().query.LineItem.findOne({
    where: { id: lineItemId },
    query: "id cart { id }"
  });
  if (lineItem?.cart?.id !== cartId) throw new Error("Line item not found");
}
async function assertAddressAccess(context, addressId) {
  const canManage = permissions.canManageOrders({ session: context.session });
  const address = await context.sudo().query.Address.findOne({
    where: { id: addressId },
    query: "id user { id }"
  });
  if (!address || !canManage && (!context.session?.itemId || address.user?.id !== context.session.itemId)) {
    throw new Error("Address not found");
  }
}
async function assertPaymentSessionBelongsToCart(context, cartId, paymentSessionId) {
  await assertCartAccess(context, cartId, { allowCompleted: true });
  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: "id paymentCollection { paymentSessions { id } }"
  });
  if (!cart?.paymentCollection?.paymentSessions?.some(
    (session) => session.id === paymentSessionId
  )) {
    throw new Error("Payment session not found");
  }
}

// features/keystone/mutations/activeCart.ts
async function activeCart(root, { cartId }, context) {
  await assertCartAccess(context, cartId, { allowCompleted: true });
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
      rawTotal
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
  await assertCartAccess(context, cartId);
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
  if (data?.region && existingCart.lineItems?.length) {
    throw new Error("Region cannot change after items are added; start a new cart");
  }
  if (data) {
    delete data.user;
    delete data.order;
    delete data.paymentCollection;
    delete data.payment;
    delete data.idempotencyKey;
    if (data.metadata || data.context) {
      throw new Error("Cart tax and commercial context are server-owned");
    }
    if (data.giftCards) {
      throw new Error("Gift-card redemption is outside the bounded launch boundary");
    }
    if (data.email !== void 0 || data.region || data.shippingAddress || data.billingAddress || data.lineItems || data.discounts) {
      data.paymentCollection = { disconnect: true };
    }
  }
  for (const relation of [data?.shippingAddress, data?.billingAddress]) {
    const addressId = relation?.connect?.id;
    if (addressId) await assertAddressAccess(context, addressId);
    if (relation?.connect && !addressId) throw new Error("Address ID is required");
  }
  const existingLineItemIds = [
    ...data?.lineItems?.disconnect || [],
    ...data?.lineItems?.delete || [],
    ...(data?.lineItems?.update || []).map((entry) => entry.where)
  ].map((entry) => entry?.id).filter(Boolean);
  for (const lineItemId of existingLineItemIds) {
    await assertLineItemBelongsToCart(context, cartId, lineItemId);
  }
  if (data?.lineItems?.connect || data?.lineItems?.set) {
    throw new Error("Existing line items cannot be attached to a cart");
  }
  for (const entry of data?.lineItems?.update || []) {
    if (entry.data?.quantity !== void 0 && (!Number.isInteger(entry.data.quantity) || entry.data.quantity <= 0)) {
      throw new Error("Line item quantity must be a positive integer");
    }
  }
  if (data?.lineItems?.create?.length) {
    for (const newItem of data.lineItems.create) {
      if (!newItem.productVariant?.connect?.id || !Number.isInteger(newItem.quantity) || newItem.quantity <= 0) {
        throw new Error("A variant and positive integer quantity are required");
      }
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
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }
  await assertLineItemBelongsToCart(context, cartId, lineId);
  const sudoContext = context.sudo();
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
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
      }
      user {
        id
        customerGroups {
          id
        }
      }
      lineItems {
        id
      }
      discounts {
        id
        code
        stackable
      }
    `
  });
  if (!cart) {
    throw new Error(`Cart not found`);
  }
  if (!cart.lineItems || cart.lineItems.length === 0) {
    throw new Error(`Cannot apply discount to an empty cart`);
  }
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
      regions {
        id
      }
      discountRule {
        id
        type
        value
        allocation
        discountConditions {
          id
          type
          operator
          customerGroups {
            id
          }
        }
      }
    `
  });
  if (!discount) {
    throw new Error(`Invalid discount code: ${code}`);
  }
  if (cart.discounts?.some((d) => d.id === discount.id)) {
    throw new Error(`Discount ${code} is already applied to this cart`);
  }
  if (discount.isDisabled) {
    throw new Error(`Discount ${code} is no longer available`);
  }
  const now = /* @__PURE__ */ new Date();
  if (discount.startsAt && new Date(discount.startsAt) > now) {
    throw new Error(`Discount ${code} is not yet active`);
  }
  if (discount.endsAt && new Date(discount.endsAt) < now) {
    throw new Error(`Discount ${code} has expired`);
  }
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    throw new Error(`Discount ${code} has reached its usage limit`);
  }
  if (discount.regions && discount.regions.length > 0 && cart.region) {
    const isValidForRegion = discount.regions.some((r) => r.id === cart.region.id);
    if (!isValidForRegion) {
      throw new Error(`Discount ${code} is not available in your region`);
    }
  }
  if (discount.discountRule?.discountConditions) {
    const customerGroupConditions = discount.discountRule.discountConditions.filter(
      (c) => c.type === "customer_groups"
    );
    for (const condition of customerGroupConditions) {
      const conditionGroupIds = condition.customerGroups?.map((g) => g.id) || [];
      const customerGroupIds = cart.user?.customerGroups?.map((g) => g.id) || [];
      if (conditionGroupIds.length === 0) continue;
      const hasMatch = customerGroupIds.some((id) => conditionGroupIds.includes(id));
      if (condition.operator === "in" && !hasMatch) {
        throw new Error(`Discount ${code} is not available for your customer group`);
      }
      if (condition.operator === "not_in" && hasMatch) {
        throw new Error(`Discount ${code} is not available for your customer group`);
      }
    }
  }
  let discountUpdate;
  if (cart.discounts && cart.discounts.length > 0) {
    const hasNonStackable = cart.discounts.some((d) => !d.stackable);
    if (hasNonStackable) {
      discountUpdate = {
        disconnect: cart.discounts.map((d) => ({ id: d.id })),
        connect: [{ id: discount.id }]
      };
    } else if (!discount.stackable) {
      discountUpdate = {
        disconnect: cart.discounts.map((d) => ({ id: d.id })),
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
  const updatedCart = await sudoContext.db.Cart.updateOne({
    where: { id: cartId },
    data: {
      discounts: discountUpdate,
      paymentCollection: { disconnect: true }
    }
  });
  return updatedCart;
}
var addDiscountToActiveCart_default = addDiscountToActiveCart;

// features/keystone/mutations/removeDiscountFromActiveCart.ts
async function removeDiscountFromActiveCart(root, { cartId, code }, context) {
  await assertCartAccess(context, cartId);
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
      },
      paymentCollection: { disconnect: true }
    }
  });
}
var removeDiscountFromActiveCart_default = removeDiscountFromActiveCart;

// features/keystone/utils/paymentProviderConfig.ts
function isPaymentProviderConfigured(code) {
  if (code.startsWith("pp_stripe")) {
    return Boolean(
      (process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.STRIPE_PUBLISHABLE_KEY) && process.env.STRIPE_SECRET_KEY
    );
  }
  if (code.startsWith("pp_paypal")) {
    return Boolean(
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
    );
  }
  return code === "pp_system_default" || code.startsWith("pp_manual");
}
function getPublicPaymentProviderConfig(code) {
  if (!isPaymentProviderConfigured(code)) return null;
  if (code.startsWith("pp_stripe")) {
    return {
      provider: "stripe",
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || ""
    };
  }
  if (code.startsWith("pp_paypal")) {
    return {
      provider: "paypal",
      publishableKey: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || ""
    };
  }
  return null;
}

// features/keystone/mutations/createActiveCartPaymentSessions.ts
async function createActiveCartPaymentSessions(root, { cartId }, context) {
  await assertCartAccess(context, cartId);
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
  const availableProviders = cart.region?.paymentProviders?.filter(
    (provider) => provider.isInstalled && isPaymentProviderConfigured(provider.code || "")
  ) || [];
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

// features/keystone/mutations/createActiveCart.ts
async function createActiveCart(_root, { regionId }, context) {
  if (!regionId) throw new Error("Region ID is required");
  const region2 = await context.query.Region.findOne({
    where: { id: regionId },
    query: "id"
  });
  if (!region2) throw new Error("Region not found");
  const cart = await context.sudo().query.Cart.createOne({
    data: {
      type: "default",
      region: { connect: { id: region2.id } },
      ...context.session?.itemId ? { user: { connect: { id: context.session.itemId } } } : {}
    },
    query: "id region { id }"
  });
  return {
    ...cart,
    proof: createCartProof(cart.id)
  };
}
var createActiveCart_default = createActiveCart;

// features/keystone/mutations/setActiveCartPaymentSession.ts
async function setActiveCartPaymentSession(root, { cartId, providerId }, context) {
  await assertCartAccess(context, cartId);
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
async function capturePayment({ provider, paymentId, amount, currency, idempotencyKey }) {
  return executeAdapterFunction({
    provider,
    functionName: "capturePaymentFunction",
    args: { paymentId, amount, currency, idempotencyKey }
  });
}
async function refundPayment({ provider, paymentId, amount, currency, idempotencyKey }) {
  return executeAdapterFunction({
    provider,
    functionName: "refundPaymentFunction",
    args: { paymentId, amount, currency, idempotencyKey }
  });
}
async function getPaymentStatus({ provider, paymentId }) {
  return executeAdapterFunction({
    provider,
    functionName: "getPaymentStatusFunction",
    args: { paymentId }
  });
}
async function handleWebhook({ provider, event, headers }) {
  return executeAdapterFunction({
    provider,
    functionName: "handleWebhookFunction",
    args: { event, headers }
  });
}

// features/keystone/utils/idempotency.ts
var import_node_crypto2 = __toESM(require("node:crypto"));
function normalize(value) {
  if (value === null || value === void 0) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Idempotency request contains a non-finite number");
    return value;
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => entry !== void 0).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, normalize(entry)])
    );
  }
  throw new Error(`Unsupported idempotency request value: ${typeof value}`);
}
function canonicalIdempotencyParams(params) {
  return normalize(params);
}
function idempotencyFingerprint(params) {
  return import_node_crypto2.default.createHash("sha256").update(JSON.stringify(canonicalIdempotencyParams(params))).digest("hex");
}
function storedFingerprint(requestParams) {
  const params = requestParams && typeof requestParams === "object" ? { ...requestParams } : {};
  const recorded = typeof params._fingerprint === "string" ? params._fingerprint : null;
  delete params._fingerprint;
  const calculated = idempotencyFingerprint(params);
  if (recorded && recorded !== calculated) {
    throw new Error("Stored idempotency request fingerprint is invalid");
  }
  return calculated;
}
function assertIdempotencyRequest(attempt, request) {
  const method = request.requestMethod || "POST";
  const expectedFingerprint = idempotencyFingerprint(request.requestParams);
  if (attempt.requestMethod !== method || attempt.requestPath !== request.requestPath || storedFingerprint(attempt.requestParams) !== expectedFingerprint) {
    throw new Error("Idempotency key was already used with a different request");
  }
}
async function findIdempotencyAttempt(prisma, request) {
  const key = request.key.trim();
  if (!key) throw new Error("Idempotency key is required");
  const existing = await prisma.idempotencyKey.findUnique({ where: { idempotencyKey: key } });
  if (existing) assertIdempotencyRequest(existing, { ...request, key });
  return existing;
}
async function getOrCreateIdempotencyAttempt(prisma, request) {
  const key = request.key.trim();
  if (!key) throw new Error("Idempotency key is required");
  const normalizedParams = canonicalIdempotencyParams(request.requestParams);
  const data = {
    idempotencyKey: key,
    requestMethod: request.requestMethod || "POST",
    requestPath: request.requestPath,
    requestParams: {
      ...normalizedParams,
      _fingerprint: idempotencyFingerprint(request.requestParams)
    },
    recoveryPoint: "started",
    lockedAt: /* @__PURE__ */ new Date()
  };
  const existing = await findIdempotencyAttempt(prisma, { ...request, key });
  if (existing) return { attempt: existing, replay: true };
  try {
    const attempt = await prisma.idempotencyKey.create({ data });
    return { attempt, replay: false };
  } catch (error) {
    if (error?.code !== "P2002") throw error;
    const raced = await prisma.idempotencyKey.findUnique({ where: { idempotencyKey: key } });
    if (!raced) throw error;
    assertIdempotencyRequest(raced, { ...request, key });
    return { attempt: raced, replay: true };
  }
}

// features/keystone/checkout/recovery.ts
function checkoutKey(cartId) {
  return `checkout:${cartId}`;
}
async function getOrCreateCheckoutAttempt(prisma, cartId, paymentSessionId) {
  const idempotencyKey = checkoutKey(cartId);
  const { attempt, replay } = await getOrCreateIdempotencyAttempt(prisma, {
    key: idempotencyKey,
    requestPath: "completeActiveCart",
    requestParams: { cartId, paymentSessionId: paymentSessionId || null }
  });
  if (attempt.recoveryPoint === "completed") return attempt;
  if (!replay) return attempt;
  const acquired = await prisma.idempotencyKey.updateMany({
    where: {
      id: attempt.id,
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1e3) } }
      ]
    },
    data: { lockedAt: /* @__PURE__ */ new Date() }
  });
  if (acquired.count !== 1) throw new Error("Checkout is already in progress");
  return prisma.idempotencyKey.findUnique({ where: { id: attempt.id } });
}
async function updateCheckoutAttempt(prisma, id, recoveryPoint, responseBody, responseCode) {
  await prisma.idempotencyKey.update({
    where: { id },
    data: {
      recoveryPoint,
      responseBody,
      responseCode,
      lockedAt: ["completed", "failed", "started"].includes(recoveryPoint) ? null : /* @__PURE__ */ new Date()
    }
  });
}
function aggregateLines(lines) {
  const byVariant = /* @__PURE__ */ new Map();
  for (const line of lines || []) {
    if (!line.productVariant?.id || !Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new Error("Cart contains an invalid inventory line");
    }
    const current = byVariant.get(line.productVariant.id);
    byVariant.set(line.productVariant.id, {
      variant: line.productVariant,
      quantity: (current?.quantity || 0) + line.quantity
    });
  }
  return [...byVariant.values()];
}
async function reserveCartInventory(prisma, lines, idempotencyKey, checkoutAttemptId) {
  const reservations = aggregateLines(lines);
  await prisma.$transaction(async (tx) => {
    for (const { variant, quantity } of reservations) {
      if (!variant.manageInventory) continue;
      const result = await tx.productVariant.updateMany({
        where: {
          id: variant.id,
          ...variant.allowBackorder ? {} : { inventoryQuantity: { gte: quantity } }
        },
        data: { inventoryQuantity: { decrement: quantity } }
      });
      if (result.count !== 1) {
        throw new Error(`Insufficient stock for ${variant.title || variant.id}`);
      }
      await tx.stockMovement.create({
        data: {
          type: "REMOVE",
          quantity,
          reason: "checkout_reservation",
          note: idempotencyKey,
          variantId: variant.id
        }
      });
    }
    if (checkoutAttemptId) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: { recoveryPoint: "stock_reserved", lockedAt: /* @__PURE__ */ new Date() }
      });
    }
  });
}
async function reserveDiscountUsage(prisma, discounts, checkoutAttemptId) {
  await prisma.$transaction(async (tx) => {
    for (const discount of discounts) {
      const current = await tx.discount.findUnique({
        where: { id: discount.id },
        select: {
          usageCount: true,
          usageLimit: true,
          isDisabled: true,
          startsAt: true,
          endsAt: true
        }
      });
      if (!current) throw new Error("Discount not found");
      const now = /* @__PURE__ */ new Date();
      if (current.isDisabled || current.startsAt > now || current.endsAt && current.endsAt <= now) {
        throw new Error(`Discount ${discount.code || discount.id} is no longer active`);
      }
      if (current.usageLimit !== null && current.usageCount >= current.usageLimit) {
        throw new Error(`Discount ${discount.code || discount.id} has reached its usage limit`);
      }
      const result = await tx.discount.updateMany({
        where: {
          id: discount.id,
          usageCount: current.usageCount,
          isDisabled: false,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }]
        },
        data: { usageCount: { increment: 1 } }
      });
      if (result.count !== 1) throw new Error("Discount usage changed; retry checkout");
    }
    if (checkoutAttemptId) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: { recoveryPoint: "resources_reserved", lockedAt: /* @__PURE__ */ new Date() }
      });
    }
  });
}
async function releaseCheckoutResources(prisma, lines, discounts, idempotencyKey, checkoutAttemptId, errorMessage) {
  const reservations = aggregateLines(lines);
  await prisma.$transaction(async (tx) => {
    for (const discount of discounts || []) {
      await tx.discount.updateMany({
        where: { id: discount.id, usageCount: { gt: 0 } },
        data: { usageCount: { decrement: 1 } }
      });
    }
    for (const { variant, quantity } of reservations) {
      if (!variant.manageInventory) continue;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { inventoryQuantity: { increment: quantity } }
      });
      await tx.stockMovement.create({
        data: {
          type: "RECEIVE",
          quantity,
          reason: "checkout_release",
          note: idempotencyKey,
          variantId: variant.id
        }
      });
    }
    await tx.idempotencyKey.update({
      where: { id: checkoutAttemptId },
      data: {
        recoveryPoint: "started",
        responseBody: { error: errorMessage },
        responseCode: 409,
        lockedAt: null
      }
    });
  });
}

// features/keystone/checkout/order-commit.ts
var import_node_crypto3 = __toESM(require("node:crypto"));

// features/webhooks/delivery-policy.ts
var WEBHOOK_DELIVERY_MAX_ATTEMPTS = 12;
var WEBHOOK_DELIVERY_TIMEOUT_MS = 15e3;
var WEBHOOK_DELIVERY_LEASE_MS = 2 * 6e4;
function webhookDeliveryLease(now = Date.now()) {
  return new Date(now + WEBHOOK_DELIVERY_LEASE_MS);
}
function nextWebhookAttempt(attempts, now = Date.now()) {
  if (attempts >= WEBHOOK_DELIVERY_MAX_ATTEMPTS) return null;
  const delay = Math.min(Math.pow(2, attempts) * 6e4, 24 * 60 * 60 * 1e3);
  return new Date(now + delay);
}

// features/webhooks/outbox.ts
async function subscribedWebhookEndpointIds(context, eventType, userId) {
  const scopeFilters = [{ scope: { equals: "STORE" } }];
  if (userId) {
    scopeFilters.push({
      scope: { equals: "USER" },
      user: { id: { equals: userId } }
    });
  }
  const endpoints = await context.query.WebhookEndpoint.findMany({
    where: {
      isActive: { equals: true },
      OR: scopeFilters
    },
    query: "id events"
  });
  return endpoints.filter(
    (endpoint2) => Array.isArray(endpoint2.events) && (endpoint2.events.includes(eventType) || endpoint2.events.includes("*"))
  ).map((endpoint2) => endpoint2.id);
}
async function enqueueWebhookOutbox(tx, endpointIds, eventType, resourceType, resourceId, data) {
  const payload = {
    event: eventType,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    listKey: resourceType,
    operation: eventType.split(".").pop(),
    data
  };
  const eventIds = [];
  for (const endpointId of endpointIds) {
    const event = await tx.webhookEvent.create({
      data: {
        eventType,
        resourceType,
        resourceId,
        payload,
        endpointId,
        delivered: false,
        deliveryAttempts: 0,
        nextAttempt: webhookDeliveryLease()
      },
      select: { id: true }
    });
    eventIds.push(event.id);
  }
  return eventIds;
}

// features/webhooks/webhook-plugin.ts
var import_crypto = __toESM(require("crypto"));

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
var WEBHOOK_INTERNAL_LISTS = /* @__PURE__ */ new Set(["WebhookEndpoint", "WebhookEvent"]);
function isWebhookInternalList(listKey2) {
  return WEBHOOK_INTERNAL_LISTS.has(listKey2);
}
function withWebhooks(config2) {
  const enhancedLists = Object.fromEntries(
    Object.entries(config2.lists || {}).map(([listKey2, listConfig]) => {
      if (isWebhookInternalList(listKey2)) return [listKey2, listConfig];
      return [
        listKey2,
        {
          ...listConfig,
          hooks: {
            ...listConfig.hooks,
            afterOperation: async (args) => {
              const originalAfterOperation = listConfig.hooks?.afterOperation;
              if (typeof originalAfterOperation === "function") {
                await originalAfterOperation(args);
              } else if (originalAfterOperation?.[args.operation]) {
                await originalAfterOperation[args.operation](args);
              }
              try {
                await triggerWebhook({
                  listKey: listKey2,
                  operation: args.operation,
                  item: args.item,
                  originalItem: args.originalItem,
                  context: args.context.sudo()
                });
              } catch (error) {
                console.error(`Webhook enqueue failed for ${listKey2}:`, error);
              }
            }
          }
        }
      ];
    })
  );
  return {
    ...config2,
    lists: enhancedLists
  };
}
async function triggerWebhook({ listKey: listKey2, operation, item, originalItem, context }) {
  if (isWebhookInternalList(listKey2)) return;
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
        isActive: { equals: true },
        scope: { equals: "STORE" }
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
async function deliverWebhook(webhook, eventType, payload, context, existingEvent) {
  let webhookEvent = existingEvent;
  try {
    if (!webhookEvent) {
      webhookEvent = await context.query.WebhookEvent.createOne({
        data: {
          eventType,
          resourceType: payload.listKey,
          resourceId: payload.data?.id || "unknown",
          payload,
          endpoint: { connect: { id: webhook.id } },
          deliveryAttempts: 0,
          nextAttempt: webhookDeliveryLease()
        },
        query: "id deliveryAttempts"
      });
    }
    await context.query.WebhookEvent.updateOne({
      where: { id: webhookEvent.id },
      data: { deliveryAttempts: (webhookEvent.deliveryAttempts || 0) + 1, lastAttempt: /* @__PURE__ */ new Date() }
    });
    if (!webhook.secret) {
      throw new Error("Webhook endpoint secret is required");
    }
    const secret = webhook.secret;
    const signature = import_crypto.default.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-OpenFront-Webhook-Signature": `sha256=${signature}`,
        "X-OpenFront-Topic": eventType,
        "X-OpenFront-ListKey": payload.listKey,
        "X-OpenFront-Operation": payload.operation,
        "X-OpenFront-Delivery-ID": webhookEvent.id
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(WEBHOOK_DELIVERY_TIMEOUT_MS)
    });
    if (response.ok) {
      const responseBody = (await response.text()).slice(0, 64e3);
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent.id },
        data: {
          delivered: true,
          responseStatus: response.status,
          responseBody,
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
      const errorText = (await response.text()).slice(0, 64e3);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
  } catch (error) {
    try {
      const attempts = Number(webhookEvent?.deliveryAttempts || 0) + 1;
      const nextAttempt = nextWebhookAttempt(attempts);
      await context.query.WebhookEvent.updateOne({
        where: { id: webhookEvent?.id },
        data: {
          delivered: false,
          responseStatus: 0,
          responseBody: error instanceof Error ? error.message : String(error),
          lastAttempt: /* @__PURE__ */ new Date(),
          nextAttempt,
          ...nextAttempt ? {} : { deadLetteredAt: /* @__PURE__ */ new Date() }
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
async function deliverWebhookEventsById(context, eventIds) {
  const uniqueEventIds = [...new Set(eventIds.filter(Boolean))];
  for (const eventId of uniqueEventIds) {
    const event = await context.sudo().query.WebhookEvent.findOne({
      where: { id: eventId },
      query: `
        id eventType payload deliveryAttempts delivered
        endpoint { id url secret failureCount }
      `
    });
    if (!event || event.delivered || !event.endpoint) continue;
    await deliverWebhook(
      event.endpoint,
      event.eventType,
      event.payload,
      context.sudo(),
      event
    );
  }
  return uniqueEventIds.length;
}
async function retryPendingWebhookDeliveries(context, limit = 25) {
  const boundedLimit = Math.max(1, Math.min(limit, 100));
  const sudo = context.sudo();
  const now = /* @__PURE__ */ new Date();
  const candidates = await sudo.prisma.webhookEvent.findMany({
    where: {
      delivered: false,
      deadLetteredAt: null,
      nextAttempt: { lte: now },
      deliveryAttempts: { lt: WEBHOOK_DELIVERY_MAX_ATTEMPTS },
      endpointId: { not: null }
    },
    orderBy: { nextAttempt: "asc" },
    take: boundedLimit,
    select: { id: true }
  });
  let claimed = 0;
  for (const candidate of candidates) {
    const claim = await sudo.prisma.webhookEvent.updateMany({
      where: {
        id: candidate.id,
        delivered: false,
        deadLetteredAt: null,
        nextAttempt: { lte: now },
        deliveryAttempts: { lt: WEBHOOK_DELIVERY_MAX_ATTEMPTS }
      },
      data: { nextAttempt: webhookDeliveryLease() }
    });
    if (claim.count !== 1) continue;
    const event = await sudo.query.WebhookEvent.findOne({
      where: { id: candidate.id },
      query: `
        id eventType payload deliveryAttempts
        endpoint { id url secret failureCount }
      `
    });
    if (!event?.endpoint) continue;
    claimed += 1;
    await deliverWebhook(event.endpoint, event.eventType, event.payload, sudo, event);
  }
  return claimed;
}

// features/keystone/checkout/order-commit.ts
async function createOrderFromCartAtomically(cart, sudo) {
  const prepared = [];
  for (const line of cart.lineItems) {
    const prices = await sudo.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: line.productVariant.id } },
        region: { id: { equals: cart.region.id } },
        currency: { code: { equals: cart.region.currency.code } }
      },
      take: 1,
      query: "id calculatedPrice { calculatedAmount originalAmount currencyCode }"
    });
    const price = prices[0]?.calculatedPrice;
    if (!price) throw new Error(`No valid price for variant ${line.productVariant.id}`);
    const thumbnail = line.productVariant.primaryImage ? line.productVariant.primaryImage.image?.url || line.productVariant.primaryImage.imagePath : line.productVariant.product.thumbnail;
    prepared.push({ line, price, thumbnail });
  }
  const userId = cart.user?.id || cart.shippingAddress?.user?.id;
  const orderWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "order.created",
    userId
  );
  const secretKey = userId ? "" : import_node_crypto3.default.randomBytes(32).toString("hex");
  const commercialSnapshot = {
    currency: cart.region.currency.code,
    tax: {
      rate: cart.region.taxRate || 0,
      regionId: cart.region.id,
      destinationCountry: cart.shippingAddress?.country?.iso2 || null
    },
    acceptedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const commit = await sudo.prisma.$transaction(async (tx) => {
    const existing = await tx.order.findFirst({ where: { cart: { id: cart.id } }, select: { id: true } });
    if (existing) return { orderId: existing.id, webhookEventIds: [] };
    const lineItemIds = [];
    const webhookLineItems = [];
    for (const { line, price, thumbnail } of prepared) {
      const money = await tx.orderMoneyAmount.create({
        data: {
          amount: price.calculatedAmount,
          originalAmount: price.originalAmount,
          currencyId: cart.region.currency.id,
          regionId: cart.region.id,
          priceData: {
            prices: line.productVariant.prices,
            currencyCode: cart.region.currency.code,
            regionId: cart.region.id,
            taxRate: cart.region.taxRate
          },
          metadata: line.metadata
        }
      });
      const item = await tx.orderLineItem.create({
        data: {
          quantity: line.quantity,
          title: line.productVariant.product.title,
          sku: line.productVariant.sku,
          metadata: line.metadata,
          productData: {
            id: line.productVariant.product.id,
            title: line.productVariant.product.title,
            thumbnail,
            description: line.productVariant.product.description,
            metadata: line.productVariant.product.metadata
          },
          variantData: {
            id: line.productVariant.id,
            sku: line.productVariant.sku,
            title: line.productVariant.title,
            measurements: line.productVariant.measurements || []
          },
          variantTitle: line.productVariant.title,
          formattedUnitPrice: line.unitPrice,
          formattedTotal: line.total,
          productVariantId: line.productVariant.id,
          originalLineItemId: line.id,
          moneyAmountId: money.id
        }
      });
      lineItemIds.push(item.id);
      webhookLineItems.push({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        sku: item.sku,
        thumbnail,
        moneyAmount: {
          amount: price.calculatedAmount,
          originalAmount: price.originalAmount
        },
        productVariant: {
          id: line.productVariant.id,
          title: line.productVariant.title,
          sku: line.productVariant.sku,
          product: {
            id: line.productVariant.product.id,
            title: line.productVariant.product.title,
            thumbnail
          }
        }
      });
    }
    const order = await tx.order.create({
      data: {
        cart: { connect: { id: cart.id } },
        email: cart.email,
        userId,
        regionId: cart.region.id,
        currencyId: cart.region.currency.id,
        billingAddressId: cart.billingAddress.id,
        shippingAddressId: cart.shippingAddress.id,
        discounts: { connect: (cart.discounts || []).map((item) => ({ id: item.id })) },
        shippingMethods: { connect: (cart.shippingMethods || []).map((item) => ({ id: item.id })) },
        lineItems: { connect: lineItemIds.map((id) => ({ id })) },
        status: "pending",
        displayId: Math.floor(Date.now() / 1e3),
        taxRate: cart.region.taxRate || 0,
        metadata: { ...cart.metadata || {}, commercialSnapshot },
        secretKey,
        events: {
          create: {
            type: "ORDER_PLACED",
            data: { cartId: cart.id, isGuestOrder: !userId }
          }
        }
      }
    });
    await tx.cart.update({ where: { id: cart.id }, data: { orderId: order.id } });
    const webhookEventIds = await enqueueWebhookOutbox(
      tx,
      orderWebhookEndpointIds,
      "order.created",
      "Order",
      order.id,
      {
        id: order.id,
        cartId: cart.id,
        displayId: order.displayId,
        email: order.email,
        status: order.status,
        rawTotal: cart.rawTotal,
        currency: { id: cart.region.currency.id, code: cart.region.currency.code },
        shippingAddress: cart.shippingAddress,
        lineItems: webhookLineItems
      }
    );
    if (cart.email) {
      await tx.notification.create({
        data: {
          eventName: "ORDER_CONFIRMATION",
          resourceType: "Order",
          resourceId: order.id,
          to: cart.email,
          userId: userId || null,
          data: { orderId: order.id, status: "pending_delivery" }
        }
      });
    }
    return { orderId: order.id, webhookEventIds };
  });
  if (commit.webhookEventIds.length) {
    try {
      await deliverWebhookEventsById(sudo, commit.webhookEventIds);
    } catch (error) {
      console.error(
        "Immediate order webhook delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  return sudo.query.Order.findOne({
    where: { id: commit.orderId },
    query: `
      id status displayId secretKey subtotal total shipping discount tax paymentDetails
      shippingAddress { id firstName lastName company address1 address2 city province postalCode country { id iso2 } phone }
    `
  });
}

// features/keystone/mutations/completeActiveCart.ts
async function completeActiveCart(root, { cartId, paymentSessionId }, context) {
  await assertCartAccess(context, cartId, { allowCompleted: true });
  if (paymentSessionId) {
    await assertPaymentSessionBelongsToCart(context, cartId, paymentSessionId);
  }
  const sudoContext = context.sudo();
  const user = context.session?.itemId;
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      rawTotal
      metadata
      order {
        id
        status
        displayId
        secretKey
        payments { id }
        account { id }
        shippingAddress { country { iso2 } }
      }
      user {
        id
        hasAccount
      }
      shippingAddress {
        id
        country { iso2 }
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
        code
      }
      giftCards { id }
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
          inventoryQuantity
          manageInventory
          allowBackorder
          primaryImage {
            image {
              url
            }
            imagePath
          }
          product {
            id
            title
            thumbnail
            productTags { id }
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
            capturePaymentFunction
            getPaymentStatusFunction
            credentials
          }
        }
      }
    `
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  if (cart.order?.id) {
    const existingAttempt = await sudoContext.prisma.idempotencyKey.findUnique({
      where: { idempotencyKey: checkoutKey(cartId) }
    });
    if (paymentSessionId && !cart.order.payments?.length) {
      const selectedSession = cart.paymentCollection?.paymentSessions?.find(
        (session) => session.id === paymentSessionId
      );
      const paymentResult = existingAttempt?.responseBody?.paymentResult;
      if (!selectedSession || !paymentResult || existingAttempt.recoveryPoint !== "payment_confirmed") {
        throw new Error("Checkout requires payment reconciliation");
      }
      await createPaymentRecord(paymentResult, selectedSession, cart.order, cart, sudoContext);
    } else if (!paymentSessionId && !cart.order.account?.id) {
      if (!user) throw new Error("Checkout requires account reconciliation");
      const accounts = await sudoContext.query.Account.findMany({
        where: {
          user: { id: { equals: user } },
          accountType: { equals: "business" },
          status: { equals: "active" }
        },
        take: 1,
        query: "id"
      });
      if (!accounts[0]) throw new Error("Checkout requires account reconciliation");
      await addOrderToAccount(accounts[0].id, cart.order, sudoContext);
    }
    if (existingAttempt) {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        existingAttempt.id,
        "completed",
        { orderId: cart.order.id },
        200
      );
    }
    return sudoContext.query.Order.findOne({
      where: { id: cart.order.id },
      query: "id status displayId secretKey shippingAddress { country { iso2 } }"
    });
  }
  const attempt = await getOrCreateCheckoutAttempt(
    sudoContext.prisma,
    cartId,
    paymentSessionId
  );
  if (attempt.recoveryPoint === "completed" && attempt.responseBody?.orderId) {
    return sudoContext.query.Order.findOne({
      where: { id: attempt.responseBody.orderId },
      query: "id status displayId secretKey shippingAddress { country { iso2 } }"
    });
  }
  let inventoryReserved = attempt.recoveryPoint !== "started";
  let discountsReserved = [
    "resources_reserved",
    "payment_unknown",
    "order_created",
    "payment_confirmed"
  ].includes(attempt.recoveryPoint);
  try {
    if (!inventoryReserved) {
      await reserveCartInventory(
        sudoContext.prisma,
        cart.lineItems,
        checkoutKey(cartId),
        attempt.id
      );
      inventoryReserved = true;
      attempt.recoveryPoint = "stock_reserved";
    }
    if (!discountsReserved) {
      await reserveDiscountUsage(
        sudoContext.prisma,
        cart.discounts || [],
        attempt.id
      );
      discountsReserved = true;
      attempt.recoveryPoint = "resources_reserved";
    }
    const order = !paymentSessionId ? await handleAccountOrder(cart, user, sudoContext, attempt) : await handlePaidOrder(cart, paymentSessionId, sudoContext, attempt);
    await updateCheckoutAttempt(
      sudoContext.prisma,
      attempt.id,
      "completed",
      { orderId: order.id },
      200
    );
    return order;
  } catch (error) {
    if (inventoryReserved && !["payment_unknown", "order_created", "payment_confirmed"].includes(attempt.recoveryPoint)) {
      await releaseCheckoutResources(
        sudoContext.prisma,
        cart.lineItems,
        discountsReserved ? cart.discounts || [] : [],
        checkoutKey(cartId),
        attempt.id,
        error instanceof Error ? error.message : "Checkout failed"
      );
    }
    throw error;
  }
}
async function handleAccountOrder(cart, user, sudoContext, attempt) {
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
  if (cartCurrency !== activeAccount.currency.code) {
    throw new Error("Cross-currency account orders are outside the supported launch boundary");
  }
  const orderInAccountCurrency = cart.rawTotal;
  const order = await createOrderFromCartAtomically(cart, sudoContext);
  await updateCheckoutAttempt(
    sudoContext.prisma,
    attempt.id,
    "order_created",
    { orderId: order.id }
  );
  attempt.recoveryPoint = "order_created";
  await addOrderToAccount(activeAccount.id, order, sudoContext);
  return order;
}
async function handlePaidOrder(cart, paymentSessionId, sudoContext, attempt) {
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
  if (selectedSession.amount !== cart.rawTotal) {
    throw new Error("Payment session amount no longer matches cart total");
  }
  let paymentResult = attempt.responseBody?.paymentResult;
  if (attempt.recoveryPoint !== "payment_confirmed" || !paymentResult) {
    try {
      paymentResult = await settlePaymentSession(selectedSession, cart);
    } catch (error) {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        attempt.id,
        "payment_unknown",
        { error: error instanceof Error ? error.message : String(error) }
      );
      attempt.recoveryPoint = "payment_unknown";
      throw error;
    }
    if (paymentResult.status !== "succeeded") {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        attempt.id,
        "resources_reserved",
        { paymentResult }
      );
      attempt.recoveryPoint = "resources_reserved";
      throw new Error(`Payment failed: ${paymentResult.error || paymentResult.status}`);
    }
    await updateCheckoutAttempt(
      sudoContext.prisma,
      attempt.id,
      "payment_confirmed",
      { paymentResult }
    );
    attempt.recoveryPoint = "payment_confirmed";
    attempt.responseBody = { paymentResult };
  }
  const order = await createOrderFromCartAtomically(cart, sudoContext);
  await createPaymentRecord(paymentResult, selectedSession, order, cart, sudoContext);
  return order;
}
async function settlePaymentSession(session, cart) {
  const provider = session.paymentProvider;
  if (provider.code === "pp_system_default") {
    throw new Error("Manual tender cannot complete storefront checkout");
  }
  const paymentId = session.data?.paymentIntentId || session.data?.clientSecret?.split("_secret_")[0] || session.data?.orderId;
  if (!paymentId) throw new Error("Payment provider reference is missing");
  let result = await getPaymentStatus({ provider, paymentId });
  const normalizedStatus = String(result.status || "").toLowerCase();
  if (["requires_capture", "approved", "authorized"].includes(normalizedStatus)) {
    result = await capturePayment({
      provider,
      paymentId,
      amount: cart.rawTotal,
      currency: cart.region.currency.code,
      idempotencyKey: checkoutKey(cart.id)
    });
  }
  const finalStatus = String(result.status || "").toLowerCase();
  const succeeded = ["succeeded", "completed", "captured"].includes(finalStatus);
  const resultAmount = Number(result.amount);
  const expectedCurrency = String(cart.region.currency.code).toUpperCase();
  const resultCurrency = String(result.currency || expectedCurrency).toUpperCase();
  if (!succeeded) {
    return { status: "failed", paymentIntentId: paymentId, error: `Payment status: ${result.status}` };
  }
  if (!Number.isInteger(resultAmount) || resultAmount !== cart.rawTotal) {
    throw new Error("Provider payment amount does not match cart total");
  }
  if (resultCurrency !== expectedCurrency) {
    throw new Error("Provider payment currency does not match cart currency");
  }
  return {
    status: "succeeded",
    paymentIntentId: paymentId,
    amount: resultAmount,
    currency: resultCurrency,
    data: result.data
  };
}
async function addOrderToAccount(accountId, order, sudoContext) {
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
      const existing = await tx.accountLineItem.findUnique({
        where: { orderKey: order.id },
        select: { id: true, accountId: true }
      });
      if (existing && existing.accountId !== accountId) {
        throw new Error("Order is already posted to a different account");
      }
      if (!existing) {
        const amount = orderDetails.rawTotal || 0;
        const accountRows = await tx.$queryRaw`SELECT id, status, "totalAmount", "paidAmount", "creditLimit" FROM "Account" WHERE id = ${accountId} FOR UPDATE`;
        const account = accountRows[0];
        if (!account || account.status !== "active") {
          throw new Error("Business account is not active");
        }
        const availableCredit = account.creditLimit - ((account.totalAmount || 0) - (account.paidAmount || 0));
        if (amount > availableCredit) throw new Error("Insufficient account credit");
        await tx.account.update({
          where: { id: accountId },
          data: { totalAmount: { increment: amount } }
        });
        await tx.accountLineItem.create({
          data: {
            accountId,
            orderId: order.id,
            orderKey: order.id,
            regionId: orderDetails.region.id,
            description: `Order #${orderDetails.displayId} - ${orderDetails.lineItems?.length || 0} items`,
            amount,
            orderDisplayId: String(orderDetails.displayId),
            itemCount: orderDetails.lineItems?.length || 0,
            paymentStatus: "unpaid"
          }
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: { accountId }
      });
    }, { isolationLevel: "Serializable" });
    console.log(`Order #${orderDetails.displayId} added to account ${accountId} for ${orderDetails.rawTotal} ${orderDetails.currency.code}`);
  } catch (error) {
    console.error("Error adding order to account:", error);
    throw new Error(
      `Failed to add order to account: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
async function createPaymentRecord(paymentResult, selectedSession, order, cart, sudoContext) {
  const paymentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudoContext,
    "payment.captured"
  );
  await sudoContext.prisma.$transaction(async (tx) => {
    const existing = await tx.payment.findFirst({
      where: { orderId: order.id, paymentCollectionId: cart.paymentCollection.id }
    });
    if (existing) return;
    const payment = await tx.payment.create({
      data: {
        status: "captured",
        amount: cart.rawTotal,
        currencyCode: cart.region.currency.code,
        data: {
          ...selectedSession.data,
          ...paymentResult.data,
          paymentProviderId: selectedSession.paymentProvider.id,
          paymentIntentId: paymentResult.paymentIntentId
        },
        metadata: { checkoutIdempotencyKey: checkoutKey(cart.id) },
        idempotencyKey: checkoutKey(cart.id),
        capturedAt: /* @__PURE__ */ new Date(),
        paymentCollectionId: cart.paymentCollection.id,
        orderId: order.id,
        userId: cart.user?.id || cart.shippingAddress?.user?.id || null
      }
    });
    await tx.capture.create({
      data: {
        amount: cart.rawTotal,
        paymentId: payment.id,
        metadata: {
          paymentProviderId: selectedSession.paymentProvider.id,
          paymentIntentId: paymentResult.paymentIntentId
        },
        createdBy: "checkout"
      }
    });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: "PAYMENT_CAPTURED",
        data: {
          paymentId: payment.id,
          amount: cart.rawTotal,
          currencyCode: cart.region.currency.code,
          source: "checkout"
        }
      }
    });
    await enqueueWebhookOutbox(
      tx,
      paymentWebhookEndpointIds,
      "payment.captured",
      "Payment",
      payment.id,
      { id: payment.id, orderId: order.id, amount: cart.rawTotal, currencyCode: cart.region.currency.code }
    );
  });
}
var completeActiveCart_default = completeActiveCart;

// features/keystone/mutations/addActiveCartShippingMethod.ts
async function addActiveCartShippingMethod(root, { cartId, shippingMethodId }, context) {
  await assertCartAccess(context, cartId);
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({
    where: { id: cartId },
    query: "id region { id }"
  });
  const option = await sudo.query.ShippingOption.findOne({
    where: { id: shippingMethodId },
    query: "id amount name region { id } adminOnly isReturn"
  });
  if (!cart || !option || option.region?.id !== cart.region?.id || option.adminOnly || option.isReturn) {
    throw new Error("Shipping option not found");
  }
  await sudo.prisma.$transaction(async (tx) => {
    await tx.shippingMethod.deleteMany({ where: { cartId } });
    await tx.shippingMethod.create({
      data: {
        cartId,
        shippingOptionId: option.id,
        price: option.amount,
        data: { name: option.name }
      }
    });
    await tx.cart.update({
      where: { id: cartId },
      data: { paymentCollectionId: null }
    });
  });
  return sudo.query.Cart.findOne({
    where: { id: cartId },
    query: "id shippingMethods { id price data shippingOption { id name } }"
  });
}
var addActiveCartShippingMethod_default = addActiveCartShippingMethod;

// features/keystone/queries/activeCartShippingOptions.ts
async function activeCartShippingOptions(root, { cartId }, context) {
  await assertCartAccess(context, cartId);
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
  return providers.filter(
    (provider) => isPaymentProviderConfigured(provider.code || "")
  );
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

// features/keystone/mutations/initiatePaymentSession.ts
async function initiatePaymentSession(root, { cartId, paymentProviderId }, context) {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      rawTotal
      metadata
      shippingAddress { id country { iso2 } }
      billingAddress { id }
      lineItems { productVariant { product { productTags { id } } } }
      region {
        id
        taxRate
        paymentProviders { id }
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
          amount
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
  if (!cart.shippingAddress?.id || !cart.billingAddress?.id || cart.rawTotal <= 0) {
    throw new Error("A positive cart with billing and shipping addresses is required");
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
  if (!provider || !provider.isInstalled || !isPaymentProviderConfigured(provider.code) || !cart.region.paymentProviders?.some((item) => item.id === provider.id)) {
    throw new Error("Payment provider not found, installed, and configured for this region");
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
    (session) => session.paymentProvider.code === paymentProviderId
  );
  if (existingSession?.isInitiated && existingSession.amount === cart.rawTotal && existingSession.data && Object.keys(existingSession.data).length) {
    await sudoContext.prisma.$transaction(async (tx) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false }
      });
      await tx.paymentSession.update({
        where: { id: existingSession.id },
        data: { isSelected: true }
      });
    });
    return { ...existingSession, isSelected: true };
  }
  if (existingSession) {
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code
    });
    await sudoContext.prisma.$transaction(async (tx) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false }
      });
      await tx.paymentSession.update({
        where: { id: existingSession.id },
        data: {
          isSelected: true,
          isInitiated: true,
          amount: cart.rawTotal,
          data: sessionData
        }
      });
      await tx.paymentCollection.update({
        where: { id: cart.paymentCollection.id },
        data: { amount: cart.rawTotal }
      });
    });
    return { ...existingSession, amount: cart.rawTotal, data: sessionData, isInitiated: true };
  }
  try {
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code
    });
    const newSession = await sudoContext.prisma.$transaction(async (tx) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false }
      });
      await tx.paymentCollection.update({
        where: { id: cart.paymentCollection.id },
        data: { amount: cart.rawTotal }
      });
      return tx.paymentSession.create({
        data: {
          paymentCollectionId: cart.paymentCollection.id,
          paymentProviderId: provider.id,
          amount: cart.rawTotal,
          isSelected: true,
          isInitiated: true,
          data: sessionData
        }
      });
    });
    return newSession;
  } catch (error) {
    console.error("Payment session creation failed:", error);
    throw error;
  }
}
var initiatePaymentSession_default = initiatePaymentSession;

// features/keystone/orders/order-lifecycle.ts
async function reconcileOrderFulfillmentStatus(tx, orderId, { reason, actorId = null, paymentRecovered = false }) {
  const order = await tx.order.findUnique({
    where: { id: orderId },
    select: {
      status: true,
      lineItems: { select: { id: true, quantity: true } },
      fulfillments: {
        where: { canceledAt: null },
        select: {
          fulfillmentItems: { select: { lineItemId: true, quantity: true } }
        }
      }
    }
  });
  if (!order) throw new Error("Order not found");
  const fulfilledByLine = /* @__PURE__ */ new Map();
  for (const fulfillment of order.fulfillments) {
    for (const item of fulfillment.fulfillmentItems) {
      if (!item.lineItemId) continue;
      fulfilledByLine.set(
        item.lineItemId,
        (fulfilledByLine.get(item.lineItemId) || 0) + item.quantity
      );
    }
  }
  const fullyFulfilled = order.lineItems.length > 0 && order.lineItems.every(
    (line) => (fulfilledByLine.get(line.id) || 0) >= line.quantity
  );
  let status = order.status;
  if (!["canceled", "archived"].includes(order.status)) {
    if (fullyFulfilled) {
      status = "completed";
    } else if (order.status === "completed" || paymentRecovered && order.status === "requires_action") {
      status = "pending";
    }
  }
  if (status !== order.status) {
    await tx.order.update({ where: { id: orderId }, data: { status } });
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        data: {
          previousStatus: order.status,
          newStatus: status,
          reason,
          projection: "active_fulfillment_quantities"
        },
        ...actorId ? { userId: actorId, createdById: actorId } : {}
      }
    });
  }
  return { previousStatus: order.status, status, fullyFulfilled };
}

// features/keystone/mutations/handlePaymentProviderWebhook.ts
var NO_DIVISION_CURRENCIES2 = /* @__PURE__ */ new Set([
  "JPY",
  "KRW",
  "VND",
  "CLP",
  "PYG",
  "XAF",
  "XOF",
  "BIF",
  "DJF",
  "GNF",
  "KMF",
  "MGA",
  "RWF",
  "XPF",
  "HTG",
  "VUV",
  "XAG",
  "XDR",
  "XAU"
]);
function assertProviderAmount(providerCode, resource, payment) {
  const expectedCurrency = String(payment.currencyCode).toUpperCase();
  if (providerCode.includes("stripe")) {
    const amount = Number(resource.amount_received ?? resource.amount);
    if (amount !== payment.amount || String(resource.currency).toUpperCase() !== expectedCurrency) {
      throw new Error("Provider webhook amount or currency mismatch");
    }
    return;
  }
  if (providerCode.includes("paypal")) {
    const evidence = resource.amount;
    const divisor = NO_DIVISION_CURRENCIES2.has(expectedCurrency) ? 1 : 100;
    if (!evidence || Number(evidence.value) !== payment.amount / divisor || String(evidence.currency_code).toUpperCase() !== expectedCurrency) {
      throw new Error("Provider webhook amount or currency mismatch");
    }
  }
}
function normalizedHeaders(headers) {
  return Object.fromEntries(
    Object.entries(headers || {}).map(([key, value]) => [
      key.toLowerCase(),
      Array.isArray(value) ? String(value[0] || "") : String(value || "")
    ])
  );
}
async function handlePaymentProviderWebhook(root, { providerId, event, headers }, context) {
  const sudo = context.sudo();
  const provider = await sudo.query.PaymentProvider.findOne({
    where: { id: providerId },
    query: `
      id code isInstalled handleWebhookFunction credentials
    `
  });
  if (!provider?.isInstalled) throw new Error("Payment provider not found");
  const verified = await handleWebhook({
    provider,
    event,
    headers: normalizedHeaders(headers)
  });
  const type = String(verified.type || "");
  const resource = verified.resource || {};
  const providerEventId = String(verified.event?.id || event?.id || resource.id || "");
  if (!providerEventId) throw new Error("Provider event ID is required");
  const dedupeKey = `provider-webhook:${provider.id}:${providerEventId}`;
  const existing = await sudo.prisma.idempotencyKey.findUnique({
    where: { idempotencyKey: dedupeKey }
  });
  if (existing?.recoveryPoint === "completed") {
    return { success: true, message: "Duplicate event acknowledged" };
  }
  let attempt = existing;
  if (attempt) {
    const acquired = await sudo.prisma.idempotencyKey.updateMany({
      where: {
        id: attempt.id,
        OR: [
          { lockedAt: null },
          { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1e3) } }
        ]
      },
      data: { lockedAt: /* @__PURE__ */ new Date() }
    });
    if (acquired.count !== 1) {
      throw new Error("Event is already being processed");
    }
  }
  if (!attempt) {
    try {
      attempt = await sudo.prisma.idempotencyKey.create({
        data: {
          idempotencyKey: dedupeKey,
          requestMethod: "POST",
          requestPath: "payment-provider-webhook",
          requestParams: { providerId: provider.id, providerEventId, type },
          recoveryPoint: "verified",
          lockedAt: /* @__PURE__ */ new Date()
        }
      });
    } catch (error) {
      attempt = await sudo.prisma.idempotencyKey.findUnique({
        where: { idempotencyKey: dedupeKey }
      });
      if (attempt?.recoveryPoint === "completed") {
        return { success: true, message: "Duplicate event acknowledged" };
      }
      if (attempt) {
        throw new Error("Event is already being processed");
      }
      throw error;
    }
  }
  const succeeded = /payment_intent\.succeeded|PAYMENT\.CAPTURE\.COMPLETED/.test(type);
  const failed = /payment_intent\.payment_failed|PAYMENT\.CAPTURE\.DENIED/.test(type);
  const authorized = /payment_intent\.amount_capturable_updated|PAYMENT\.AUTHORIZATION\.CREATED/.test(type);
  const voided = /payment_intent\.canceled|PAYMENT\.AUTHORIZATION\.VOIDED/.test(type);
  const cartId = resource.metadata?.cartId || resource.custom_id;
  const explicitPaymentId = resource.metadata?.paymentId;
  let orderId = resource.metadata?.orderId;
  let paymentId = explicitPaymentId;
  let checkoutAttemptId;
  let checkoutPaymentResult;
  if (cartId && (!paymentId || !orderId)) {
    const cart = await sudo.query.Cart.findOne({
      where: { id: cartId },
      query: `
        id rawTotal
        region { currency { code } }
        paymentCollection {
          paymentSessions { id amount data isSelected paymentProvider { id } }
        }
        order {
          id payments { id data paymentCollection { paymentSessions { isSelected paymentProvider { id } } } }
        }
      `
    });
    orderId ||= cart?.order?.id;
    paymentId ||= cart?.order?.payments?.find(
      (payment) => payment.paymentCollection?.paymentSessions?.some(
        (session) => session.isSelected && session.paymentProvider?.id === provider.id
      )
    )?.id;
    if (succeeded && !paymentId) {
      const selectedSession = cart?.paymentCollection?.paymentSessions?.find(
        (session) => session.isSelected && session.paymentProvider?.id === provider.id
      );
      if (selectedSession) {
        assertProviderAmount(provider.code, resource, {
          amount: selectedSession.amount,
          currencyCode: cart.region.currency.code
        });
        const checkoutAttempt = await sudo.prisma.idempotencyKey.findUnique({
          where: { idempotencyKey: `checkout:${cartId}` }
        });
        checkoutAttemptId = checkoutAttempt?.id;
        checkoutPaymentResult = {
          status: "succeeded",
          paymentIntentId: selectedSession.data?.paymentIntentId || selectedSession.data?.orderId || resource.id,
          amount: selectedSession.amount,
          currency: cart.region.currency.code,
          data: resource
        };
      }
    }
  }
  await sudo.prisma.$transaction(async (tx) => {
    if (succeeded && checkoutAttemptId && checkoutPaymentResult) {
      await tx.idempotencyKey.update({
        where: { id: checkoutAttemptId },
        data: {
          recoveryPoint: "payment_confirmed",
          responseBody: { paymentResult: checkoutPaymentResult },
          lockedAt: null
        }
      });
    }
    if (paymentId) {
      if (succeeded) {
        const currentPayment = await tx.payment.findUnique({
          where: { id: paymentId },
          select: { amount: true, currencyCode: true }
        });
        if (!currentPayment) throw new Error("Payment not found for provider event");
        assertProviderAmount(provider.code, resource, currentPayment);
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: "captured",
            capturedAt: /* @__PURE__ */ new Date(),
            data: resource
          }
        });
        const captureExists = await tx.capture.findFirst({
          where: { paymentId, metadata: { path: ["providerEventId"], equals: providerEventId } }
        });
        if (!captureExists && currentPayment) {
          await tx.capture.create({
            data: {
              amount: currentPayment.amount,
              paymentId,
              metadata: { providerId: provider.id, providerEventId, resourceId: resource.id },
              createdBy: "provider-webhook"
            }
          });
        }
      } else if (failed) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "failed", data: resource }
        });
      } else if (authorized) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "authorized", data: resource }
        });
      } else if (voided) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: "canceled", canceledAt: /* @__PURE__ */ new Date(), data: resource }
        });
      }
    }
    if (orderId) {
      if (succeeded) {
        await reconcileOrderFulfillmentStatus(tx, orderId, {
          reason: "payment_provider_capture_reconciled",
          paymentRecovered: true
        });
        await tx.orderEvent.create({
          data: {
            orderId,
            type: "PAYMENT_CAPTURED",
            data: { paymentId: paymentId || null, providerId: provider.id, providerEventId }
          }
        });
      } else if (failed || voided) {
        const currentOrder = await tx.order.findUnique({
          where: { id: orderId },
          select: { status: true }
        });
        if (currentOrder && !["completed", "canceled", "archived"].includes(currentOrder.status)) {
          await tx.order.update({ where: { id: orderId }, data: { status: "requires_action" } });
          if (currentOrder.status !== "requires_action") {
            await tx.orderEvent.create({
              data: {
                orderId,
                type: "STATUS_CHANGE",
                data: {
                  previousStatus: currentOrder.status,
                  newStatus: "requires_action",
                  reason: failed ? "payment_provider_failed" : "payment_provider_voided",
                  providerEventId
                }
              }
            });
          }
        }
      }
    }
    await tx.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "completed",
        responseCode: 200,
        responseBody: { providerEventId, type, paymentId: paymentId || null, orderId: orderId || null },
        lockedAt: null
      }
    });
  });
  return {
    success: true,
    message: paymentId || orderId ? "Provider event reconciled" : "Provider event recorded for manual reconciliation"
  };
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
      formattedTotalPaid
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
  if (!context.session?.itemId || !permissions.canReadOrders({ session: context.session }) || !permissions.canReadProducts({ session: context.session })) {
    throw new Error("Access denied");
  }
  const allowedTimeframes = /* @__PURE__ */ new Set(["24h", "7d", "30d", "90d"]);
  if (!allowedTimeframes.has(timeframe)) throw new Error("Invalid timeframe");
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

// features/keystone/mutations/adjustInventory.ts
async function adjustInventory(root, { variantId, delta, reason, note }, context) {
  if (!permissions.canManageProducts({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!variantId || !Number.isInteger(delta) || delta === 0) {
    throw new Error("A non-zero integer inventory delta is required");
  }
  if (!reason?.trim()) throw new Error("Inventory adjustment reason is required");
  await context.sudo().prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, inventoryQuantity: true, allowBackorder: true }
    });
    if (!variant) throw new Error("Product variant not found");
    const adjusted = await tx.productVariant.updateMany({
      where: {
        id: variantId,
        ...delta < 0 && !variant.allowBackorder ? { inventoryQuantity: { gte: Math.abs(delta) } } : {}
      },
      data: { inventoryQuantity: { increment: delta } }
    });
    if (adjusted.count !== 1) {
      throw new Error("Inventory adjustment would make stock negative");
    }
    await tx.stockMovement.create({
      data: {
        type: delta > 0 ? "RECEIVE" : "REMOVE",
        quantity: Math.abs(delta),
        reason: reason.trim(),
        note: note?.trim() || "",
        variantId
      }
    });
  });
  return context.query.ProductVariant.findOne({
    where: { id: variantId },
    query: "id title sku inventoryQuantity"
  });
}
var adjustInventory_default = adjustInventory;

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
async function createLabel({ provider, order, rateId, dimensions, lineItems, idempotencyKey }) {
  return executeAdapterFunction2({
    provider,
    functionName: "createLabelFunction",
    args: { order, rateId, dimensions, lineItems, idempotencyKey }
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
  const hasAccess = permissions.canManageFulfillments({ session: context.session });
  if (!hasAccess) {
    throw new Error(
      "Access denied: You do not have permission to cancel shipping labels"
    );
  }
  const sudo = context.sudo();
  const localLabel = await sudo.query.ShippingLabel.findOne({
    where: { id: labelId },
    query: "id data metadata provider { id }"
  });
  if (!localLabel || localLabel.provider?.id !== providerId) {
    throw new Error("Shipping label not found");
  }
  const provider = await sudo.db.ShippingProvider.findOne({
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
  const labelData = localLabel.data;
  const providerLabelId = labelData?.label_id || labelData?.object_id || labelData?.id;
  if (!providerLabelId) throw new Error("Provider label reference is missing");
  const result = await cancelLabel({
    provider: {
      ...provider,
      accessToken: provider.accessToken
    },
    labelId: providerLabelId
  });
  await sudo.query.ShippingLabel.updateOne({
    where: { id: labelId },
    data: {
      metadata: {
        ...localLabel.metadata || {},
        cancellation: {
          status: result?.success && (!result?.refundStatus || result.refundStatus === "SUCCESS") ? "confirmed" : result?.success ? "pending" : "unknown",
          refundStatus: result?.refundStatus || null,
          canceledById: context.session.itemId,
          recordedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      }
    }
  });
  return result;
}
var cancelShippingLabel_default = cancelShippingLabel;

// features/keystone/mutations/createOrderFulfillment.ts
var import_node_crypto4 = __toESM(require("node:crypto"));
function trackingUrl(carrier, number) {
  const value = encodeURIComponent(number);
  switch (carrier.toLowerCase()) {
    case "ups":
      return `https://www.ups.com/track?tracknum=${value}`;
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${value}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${value}`;
    case "dhl":
      return `https://www.dhl.com/en/express/tracking.html?AWB=${value}`;
    default:
      return "";
  }
}
async function createOrderFulfillment(root, {
  orderId,
  lineItems,
  trackingNumber,
  carrier,
  noNotification = false,
  idempotencyKey,
  deferWebhookDelivery = false,
  suppressWebhookEnqueue = false,
  deferLifecycleProjection = false
}, context) {
  if (!permissions.canManageFulfillments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!Array.isArray(lineItems) || !lineItems.length) throw new Error("Line items are required");
  const requested = /* @__PURE__ */ new Map();
  for (const item of lineItems) {
    if (!item?.lineItemId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("Fulfillment quantities must be positive integers");
    }
    requested.set(item.lineItemId, (requested.get(item.lineItemId) || 0) + item.quantity);
  }
  if (Boolean(trackingNumber) !== Boolean(carrier)) {
    throw new Error("Carrier and tracking number must be provided together");
  }
  const normalized = [...requested.entries()].sort(([a], [b]) => a.localeCompare(b));
  if (!idempotencyKey?.trim()) throw new Error("Fulfillment idempotency key is required");
  const normalizedIdempotencyKey = idempotencyKey.trim();
  const isIntegrationTrackingRelay = normalizedIdempotencyKey.startsWith("openship-tracking:");
  const businessKey = `fulfillment:${orderId}:${import_node_crypto4.default.createHash("sha256").update(normalizedIdempotencyKey).digest("hex")}`;
  const sudo = context.sudo();
  const orderIdentity = await sudo.query.Order.findOne({
    where: { id: orderId },
    query: "id user { id }"
  });
  if (!orderIdentity) throw new Error("Order not found");
  const fulfillmentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "fulfillment.created",
    orderIdentity.user?.id
  );
  const fulfillmentResult = await sudo.prisma.$transaction(async (tx) => {
    const existing = await tx.fulfillment.findFirst({
      where: { idempotencyKey: businessKey, canceledAt: null },
      select: { id: true }
    });
    if (existing) return { fulfillmentId: existing.id, webhookEventIds: [] };
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { status: true }
    });
    if (!order || !["pending", "completed"].includes(order.status)) {
      throw new Error("Order is not fulfillable");
    }
    const orderLines = await tx.orderLineItem.findMany({
      where: { orderId, id: { in: normalized.map(([id]) => id) } },
      select: { id: true, quantity: true, metadata: true }
    });
    if (orderLines.length !== normalized.length) throw new Error("Order line item not found");
    const fulfilled = await tx.fulfillmentItem.groupBy({
      by: ["lineItemId"],
      where: { lineItemId: { in: normalized.map(([id]) => id) }, fulfillment: { canceledAt: null } },
      _sum: { quantity: true }
    });
    const fulfilledByLine = new Map(
      fulfilled.map(
        (item) => [item.lineItemId, item._sum.quantity || 0]
      )
    );
    for (const line of orderLines) {
      const quantity = requested.get(line.id);
      if (quantity > line.quantity - (fulfilledByLine.get(line.id) || 0)) {
        throw new Error(`Fulfillment exceeds remaining quantity for line ${line.id}`);
      }
    }
    const orderLinesById = new Map(
      orderLines.map((line) => [line.id, line])
    );
    const webhookLineItems = normalized.map(([lineItemId, quantity]) => {
      const metadata = orderLinesById.get(lineItemId)?.metadata;
      const cartItemId = String(metadata?.openshipCartItemId || "").trim();
      return {
        lineItemId,
        quantity,
        ...cartItemId ? { cartItemId } : {}
      };
    });
    const fulfillmentProvider = await tx.fulfillmentProvider.findUnique({
      where: { code: "fp_manual" },
      select: { id: true }
    });
    if (!fulfillmentProvider) throw new Error("Manual fulfillment provider is not configured");
    const fulfillment = await tx.fulfillment.create({
      data: {
        orderId,
        fulfillmentProviderId: fulfillmentProvider.id,
        idempotencyKey: businessKey,
        noNotification,
        metadata: {
          source: isIntegrationTrackingRelay ? "openship-tracking-relay" : "operator-command",
          createdById: context.session.itemId
        },
        fulfillmentItems: {
          create: normalized.map(([lineItemId, quantity]) => ({
            quantity,
            lineItem: { connect: { id: lineItemId } }
          }))
        },
        ...trackingNumber && carrier ? {
          shippingLabels: {
            create: {
              status: "created",
              carrier,
              trackingNumber,
              trackingUrl: trackingUrl(carrier, trackingNumber),
              order: { connect: { id: orderId } },
              metadata: { source: "operator-command" }
            }
          }
        } : {}
      }
    });
    const webhookEventIds = isIntegrationTrackingRelay || suppressWebhookEnqueue ? [] : await enqueueWebhookOutbox(
      tx,
      fulfillmentWebhookEndpointIds,
      "fulfillment.created",
      "Fulfillment",
      fulfillment.id,
      {
        id: fulfillment.id,
        orderId,
        order: { id: orderId },
        lineItems: webhookLineItems,
        trackingNumber: trackingNumber || null,
        trackingCompany: carrier || null
      }
    );
    if (!noNotification) {
      await tx.notification.create({
        data: {
          eventName: "FULFILLMENT_CREATED",
          resourceType: "Fulfillment",
          resourceId: fulfillment.id,
          to: "notification-operations",
          data: { orderId, fulfillmentId: fulfillment.id, status: "pending_delivery" }
        }
      });
    }
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "FULFILLMENT_STATUS_CHANGE",
        data: {
          fulfillmentId: fulfillment.id,
          action: "created",
          lineItems: normalized,
          trackingNumber: trackingNumber || null,
          carrier: carrier || null
        },
        userId: context.session.itemId,
        createdById: context.session.itemId
      }
    });
    if (!deferLifecycleProjection) {
      await reconcileOrderFulfillmentStatus(tx, orderId, {
        reason: "fulfillment_created",
        actorId: context.session.itemId
      });
    }
    return { fulfillmentId: fulfillment.id, webhookEventIds };
  }, { isolationLevel: "Serializable" });
  if (!deferWebhookDelivery && fulfillmentResult.webhookEventIds.length) {
    try {
      await deliverWebhookEventsById(sudo, fulfillmentResult.webhookEventIds);
    } catch (error) {
      console.error(
        "Immediate fulfillment webhook delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
  return sudo.query.Fulfillment.findOne({
    where: { id: fulfillmentResult.fulfillmentId },
    query: "id idempotencyKey fulfillmentItems { id quantity lineItem { id } } shippingLabels { id status trackingNumber trackingUrl carrier }"
  });
}
var createOrderFulfillment_default = createOrderFulfillment;

// features/keystone/mutations/createProviderShippingLabel.ts
async function createProviderShippingLabel(root, { orderId, providerId, rateId, dimensions, lineItems, idempotencyKey }, context) {
  const hasAccess = permissions.canManageFulfillments({ session: context.session });
  if (!hasAccess) {
    throw new Error("Access denied: You do not have permission to create shipping labels");
  }
  const sudo = context.sudo();
  const order = await sudo.query.Order.findOne({
    where: { id: orderId },
    query: `
      id
      user { id }
      lineItems {
        id
        quantity
        metadata
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
  const provider = await sudo.query.ShippingProvider.findOne({
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
  const fulfillmentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "fulfillment.created",
    order.user?.id
  );
  const fulfillment = await createOrderFulfillment_default(
    null,
    {
      orderId,
      lineItems,
      noNotification: true,
      idempotencyKey,
      deferWebhookDelivery: true,
      suppressWebhookEnqueue: true,
      deferLifecycleProjection: true
    },
    context
  );
  const existingLabel = fulfillment.shippingLabels?.[0];
  if (existingLabel) return existingLabel;
  let labelData;
  try {
    labelData = await createLabel({
      provider,
      order,
      rateId,
      dimensions,
      lineItems,
      idempotencyKey
    });
  } catch (error) {
    await sudo.prisma.fulfillment.update({
      where: { id: fulfillment.id },
      data: {
        metadata: {
          source: "provider-command",
          labelStatus: "unknown",
          providerId,
          rateId,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    });
    throw new Error(
      `Label outcome is unknown; fulfillment ${fulfillment.id} remains reserved for reconciliation`
    );
  }
  const finalized = await sudo.prisma.$transaction(async (tx) => {
    const label = await tx.shippingLabel.create({
      data: {
        status: "purchased",
        providerId,
        fulfillmentId: fulfillment.id,
        orderId,
        labelUrl: labelData.labelUrl,
        carrier: labelData.carrier,
        service: labelData.service,
        trackingNumber: labelData.trackingNumber,
        trackingUrl: labelData.trackingUrl,
        rate: labelData.rate,
        data: labelData.data,
        metadata: { rateId, source: "provider-command" }
      }
    });
    await tx.fulfillment.update({
      where: { id: fulfillment.id },
      data: {
        metadata: {
          source: "provider-command",
          labelStatus: "purchased",
          providerId,
          rateId
        }
      }
    });
    await reconcileOrderFulfillmentStatus(tx, orderId, {
      reason: "provider_shipping_label_purchased",
      actorId: context.session.itemId
    });
    const webhookEventIds = await enqueueWebhookOutbox(
      tx,
      fulfillmentWebhookEndpointIds,
      "fulfillment.created",
      "Fulfillment",
      fulfillment.id,
      {
        id: fulfillment.id,
        orderId,
        order: { id: orderId },
        lineItems: lineItems.map((item) => {
          const sourceLine = order.lineItems.find((line) => line.id === item.lineItemId);
          const cartItemId = String(sourceLine?.metadata?.openshipCartItemId || "").trim();
          return {
            lineItemId: item.lineItemId,
            quantity: item.quantity,
            ...cartItemId ? { cartItemId } : {}
          };
        }),
        trackingNumber: labelData.trackingNumber || null,
        trackingCompany: labelData.carrier || null
      }
    );
    return { label, webhookEventIds };
  });
  if (finalized.webhookEventIds.length) {
    await deliverWebhookEventsById(sudo, finalized.webhookEventIds);
  }
  return finalized.label;
}
var createProviderShippingLabel_default = createProviderShippingLabel;

// features/keystone/mutations/cancelOrderFulfillment.ts
async function cancelOrderFulfillment(root, { fulfillmentId, reason }, context) {
  if (!permissions.canManageFulfillments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!reason?.trim()) throw new Error("Cancellation reason is required");
  const sudo = context.sudo();
  const endpointIds = await subscribedWebhookEndpointIds(sudo, "fulfillment.canceled");
  const result = await sudo.prisma.$transaction(async (tx) => {
    const current = await tx.fulfillment.findUnique({
      where: { id: fulfillmentId },
      select: {
        id: true,
        orderId: true,
        canceledAt: true,
        metadata: true,
        shippingLabels: { select: { id: true, metadata: true, providerId: true } }
      }
    });
    if (!current) throw new Error("Fulfillment not found");
    if (current.canceledAt) return current;
    if (current.shippingLabels.some(
      (label) => label.providerId && label.metadata?.cancellation?.status !== "confirmed"
    )) {
      throw new Error("Cancel the purchased shipping label before canceling fulfillment");
    }
    const canceled = await tx.fulfillment.update({
      where: { id: fulfillmentId },
      data: {
        canceledAt: /* @__PURE__ */ new Date(),
        metadata: {
          ...current.metadata || {},
          cancellationReason: reason.trim(),
          canceledById: context.session.itemId
        }
      }
    });
    await enqueueWebhookOutbox(
      tx,
      endpointIds,
      "fulfillment.canceled",
      "Fulfillment",
      fulfillmentId,
      { id: fulfillmentId, orderId: current.orderId, reason: reason.trim() }
    );
    await tx.orderEvent.create({
      data: {
        orderId: current.orderId,
        type: "FULFILLMENT_STATUS_CHANGE",
        data: { fulfillmentId, action: "canceled", reason: reason.trim() },
        userId: context.session.itemId,
        createdById: context.session.itemId
      }
    });
    await reconcileOrderFulfillmentStatus(tx, current.orderId, {
      reason: "fulfillment_canceled",
      actorId: context.session.itemId
    });
    return canceled;
  });
  return { id: result.id, canceledAt: result.canceledAt };
}
var cancelOrderFulfillment_default = cancelOrderFulfillment;

// features/keystone/mutations/transitionOrderStatus.ts
async function transitionOrderStatus(root, { orderId, status, reason }, context) {
  if (!permissions.canManageOrders({ session: context.session })) throw new Error("Access denied");
  if (!reason?.trim()) throw new Error("Transition reason is required");
  if (!["canceled", "archived"].includes(status)) {
    throw new Error("Order status is controlled by payment and fulfillment commands");
  }
  const sudo = context.sudo();
  const endpointIds = await subscribedWebhookEndpointIds(sudo, `order.${status}`);
  await sudo.prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        payments: {
          select: { amount: true, amountRefunded: true, refunds: { select: { amount: true } } }
        },
        fulfillments: { where: { canceledAt: null }, select: { id: true } },
        accountLineItems: {
          select: {
            id: true,
            accountId: true,
            amount: true,
            paymentStatus: true,
            invoiceLineItems: { select: { id: true } }
          }
        },
        discounts: { select: { id: true } },
        lineItems: {
          select: {
            quantity: true,
            productVariant: {
              select: { id: true, manageInventory: true }
            }
          }
        }
      }
    });
    if (!order) throw new Error("Order not found");
    if (order.status === status) return;
    if (status === "archived") {
      if (order.status !== "completed") throw new Error("Only completed orders can be archived");
    } else {
      if (!["pending", "completed", "requires_action"].includes(order.status)) {
        throw new Error("Order cannot be canceled from its current state");
      }
      if (order.fulfillments.length) throw new Error("Cancel active fulfillments before canceling the order");
      if (order.payments.some(
        (payment) => payment.refunds.reduce((sum, refund) => sum + refund.amount, 0) < payment.amount
      )) {
        throw new Error("Captured payments must be fully refunded before cancellation");
      }
      for (const line of order.lineItems) {
        if (!line.productVariant?.manageInventory) continue;
        await tx.productVariant.update({
          where: { id: line.productVariant.id },
          data: { inventoryQuantity: { increment: line.quantity } }
        });
        await tx.stockMovement.create({
          data: {
            type: "RECEIVE",
            quantity: line.quantity,
            reason: "order_cancellation",
            note: `order:${orderId}`,
            variantId: line.productVariant.id
          }
        });
      }
      if (order.accountLineItems.some(
        (item) => item.paymentStatus !== "unpaid" || item.invoiceLineItems.length
      )) {
        throw new Error("Invoiced account orders require an approved credit-note workflow");
      }
      for (const item of order.accountLineItems) {
        await tx.accountLineItem.update({
          where: { id: item.id },
          data: { paymentStatus: "canceled" }
        });
        if (item.accountId) {
          const adjustedAccount = await tx.account.updateMany({
            where: { id: item.accountId, totalAmount: { gte: item.amount } },
            data: { totalAmount: { decrement: item.amount } }
          });
          if (adjustedAccount.count !== 1) {
            throw new Error("Account balance is inconsistent; cancellation stopped");
          }
        }
      }
      for (const discount of order.discounts) {
        await tx.discount.updateMany({
          where: { id: discount.id, usageCount: { gt: 0 } },
          data: { usageCount: { decrement: 1 } }
        });
      }
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        status,
        ...status === "canceled" ? { canceledAt: /* @__PURE__ */ new Date() } : {}
      }
    });
    await tx.orderEvent.create({
      data: {
        orderId,
        type: "STATUS_CHANGE",
        data: { previousStatus: order.status, newStatus: status, reason: reason.trim() },
        userId: context.session.itemId,
        createdById: context.session.itemId
      }
    });
    await enqueueWebhookOutbox(
      tx,
      endpointIds,
      `order.${status}`,
      "Order",
      orderId,
      { id: orderId, previousStatus: order.status, status, reason: reason.trim() }
    );
  }, { isolationLevel: "Serializable" });
  return sudo.query.Order.findOne({
    where: { id: orderId },
    query: "id status canceledAt displayId"
  });
}
var transitionOrderStatus_default = transitionOrderStatus;

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
    const newToken = generateOpaqueToken("ctok_");
    await sudoContext.query.User.updateOne({
      where: { id: userId },
      data: {
        customerToken: customerTokenDigest(newToken),
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
      formattedCreditLimit
      availableCredit
      totalOwedInAccountCurrency
      formattedTotalOwedInAccountCurrency
      availableCreditInAccountCurrency
      formattedAvailableCreditInAccountCurrency
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

// features/keystone/mutations/createInvoiceFromLineItems.ts
var import_node_crypto5 = __toESM(require("node:crypto"));
async function createInvoiceFromLineItems(root, { accountId, regionId, lineItemIds, dueDate }, context) {
  if (!lineItemIds?.length || new Set(lineItemIds).size !== lineItemIds.length) {
    throw new Error("Unique line item IDs are required");
  }
  if (dueDate && !Number.isFinite(new Date(dueDate).getTime())) {
    throw new Error("Due date is invalid");
  }
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
  const canManagePayments = permissions.canManagePayments({ session: context.session });
  if (!canManagePayments && account.user?.id !== context.session.itemId) {
    throw new Error("Account not found");
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
  if (region2.currency.code !== account.currency.code) {
    throw new Error("Cross-currency invoicing is outside the supported launch boundary");
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
  const totalAmount = lineItems.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  if (totalAmount <= 0) {
    throw new Error("Invoice total must be greater than zero");
  }
  try {
    const result = await sudoContext.prisma.$transaction(async (tx) => {
      const currentItems = await tx.accountLineItem.findMany({
        where: {
          id: { in: lineItemIds },
          accountId,
          regionId,
          paymentStatus: "unpaid"
        },
        select: { id: true, amount: true }
      });
      if (currentItems.length !== lineItemIds.length) {
        throw new Error("Invoice line items changed; reload and retry");
      }
      const existingInvoiceLines = await tx.invoiceLineItem.findMany({
        where: { accountLineItemId: { in: lineItemIds } },
        select: { id: true, invoiceId: true, accountLineItemId: true }
      });
      if (existingInvoiceLines.length) {
        const invoiceIds = new Set(existingInvoiceLines.map((item) => item.invoiceId));
        const linkedItemIds = new Set(existingInvoiceLines.map((item) => item.accountLineItemId));
        if (existingInvoiceLines.length === lineItemIds.length && invoiceIds.size === 1 && lineItemIds.every((id) => linkedItemIds.has(id))) {
          const existingInvoice = await tx.invoice.findUnique({
            where: { id: [...invoiceIds][0] },
            include: { lineItems: true }
          });
          if (existingInvoice?.accountId === accountId && existingInvoice.totalAmount === totalAmount && existingInvoice.status === "sent") {
            return { invoice: existingInvoice, reused: true };
          }
        }
        throw new Error("One or more line items are already invoiced");
      }
      const transactionTotal = currentItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      if (transactionTotal !== totalAmount) throw new Error("Invoice amount changed; reload and retry");
      const invoice = await tx.invoice.create({
        data: {
          userId: account.user.id,
          accountId,
          invoiceNumber: `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${import_node_crypto5.default.randomBytes(4).toString("hex").toUpperCase()}`,
          currencyId: region2.currency.id,
          totalAmount,
          title: `${region2.name} Invoice for Account ${account.id}`,
          description: `Payment invoice for ${lineItems.length} ${region2.name} orders (${lineItems.map((item) => `#${item.orderDisplayId}`).join(", ")})`,
          status: "sent",
          paidAt: null,
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
          metadata: {
            regionId,
            regionName: region2.name,
            createdFromLineItems: lineItemIds,
            orderDisplayIds: lineItems.map((item) => item.orderDisplayId),
            itemCount: lineItems.reduce(
              (sum, item) => sum + (item.itemCount || 0),
              0
            )
          }
        }
      });
      const invoiceLineItems = [];
      for (const lineItem of lineItems) {
        invoiceLineItems.push(await tx.invoiceLineItem.create({
          data: { invoiceId: invoice.id, accountLineItemId: lineItem.id }
        }));
      }
      return { invoice: { ...invoice, lineItems: invoiceLineItems } };
    }, { isolationLevel: "Serializable" });
    return {
      success: true,
      invoiceId: result.invoice.id,
      message: `Invoice created with ${lineItems.length} orders`
    };
  } catch (error) {
    throw new Error(
      `Failed to create invoice: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
var createInvoiceFromLineItems_default = createInvoiceFromLineItems;

// features/keystone/security/invoice-access.ts
async function assertInvoiceAccess(context, invoiceId) {
  if (!context.session?.itemId) throw new Error("Invoice not found");
  const invoice = await context.sudo().query.Invoice.findOne({
    where: { id: invoiceId },
    query: "id status account { user { id } } user { id }"
  });
  if (!invoice) throw new Error("Invoice not found");
  const canManage = permissions.canManagePayments({ session: context.session }) || permissions.canManageOrders({ session: context.session });
  const ownerId = invoice.account?.user?.id || invoice.user?.id;
  if (!canManage && ownerId !== context.session.itemId) {
    throw new Error("Invoice not found");
  }
  return invoice;
}

// features/keystone/mutations/getInvoicePaymentSessions.ts
async function getInvoicePaymentSessions(root, { invoiceId }, context) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  try {
    const paymentCollection = await sudoContext.query.PaymentCollection.findOne({
      where: { invoice: { id: { equals: invoiceId } } },
      query: `
        id
        paymentSessions {
          id
          amount
          data
          isSelected
          isInitiated
          paymentProvider {
            id
            code
          }
        }
      `
    });
    if (!paymentCollection) {
      return [];
    }
    return paymentCollection.paymentSessions || [];
  } catch (error) {
    console.error("Error getting invoice payment sessions:", error);
    return [];
  }
}
var getInvoicePaymentSessions_default = getInvoicePaymentSessions;

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
        formattedAmount: formatCurrencyAmount(item.amount, currency.code),
        order: item.order
      });
      acc[regionId].totalAmount += item.amount || 0;
      acc[regionId].itemCount += 1;
      return acc;
    }, {});
    const regionsWithLineItems = Object.values(lineItemsByRegion).map((regionData) => ({
      ...regionData,
      formattedTotalAmount: formatCurrencyAmount(
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
    throw new Error(`Failed to get unpaid line items: ${error.message}`);
  }
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
var getUnpaidLineItemsByRegion_default = getUnpaidLineItemsByRegion;

// features/keystone/mutations/createInvoicePaymentSessions.ts
async function createInvoicePaymentSessions(root, { invoiceId }, context) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      totalAmount
      currency {
        id
        code
      }
      account {
        id
        user {
          id
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
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  const invoiceLineItems = await sudoContext.query.InvoiceLineItem.findMany({
    where: { invoice: { id: { equals: invoiceId } } },
    query: `
      accountLineItem {
        region {
          id
          paymentProviders {
            id
            code
            isInstalled
          }
        }
      }
    `
  });
  const invoiceLineItem = invoiceLineItems[0];
  const availableProviders = invoiceLineItem?.accountLineItem?.region?.paymentProviders?.filter(
    (provider) => provider.isInstalled && isPaymentProviderConfigured(provider.code || "")
  ) || [];
  if (availableProviders.length === 0) {
    throw new Error("No payment providers are available for this region");
  }
  let paymentCollection = invoice.paymentCollection;
  if (!paymentCollection) {
    paymentCollection = await sudoContext.db.PaymentCollection.createOne({
      data: {
        description: "default",
        amount: invoice.totalAmount || 0
      },
      query: "id"
    });
    await sudoContext.db.Invoice.updateOne({
      where: { id: invoiceId },
      data: { paymentCollection: { connect: { id: paymentCollection.id } } },
      query: "id"
    });
  }
  for (let i = 0; i < availableProviders.length; i++) {
    const provider = availableProviders[i];
    const existingSession = invoice.paymentCollection?.paymentSessions?.find(
      (s) => s.paymentProvider.id === provider.id
    );
    if (!existingSession) {
      const newSession = await sudoContext.db.PaymentSession.createOne({
        data: {
          paymentCollection: { connect: { id: paymentCollection.id } },
          paymentProvider: { connect: { id: provider.id } },
          amount: invoice.totalAmount || 0,
          data: {},
          // Initialize with empty data object
          isSelected: i === 0,
          // Only select the first provider by default
          isInitiated: false
        },
        query: "id"
      });
    }
  }
  return sudoContext.prisma.invoice.findUnique({ where: { id: invoiceId } });
}
var createInvoicePaymentSessions_default = createInvoicePaymentSessions;

// features/keystone/payments/invoice-payment-recovery.ts
var STALE_LOCK_MS = 5 * 60 * 1e3;
function invoicePaymentKey(paymentSessionId) {
  return `invoice-payment:${paymentSessionId}`;
}
async function getOrCreateInvoicePaymentAttempt(prisma, invoiceId, paymentSessionId) {
  const { attempt, replay } = await getOrCreateIdempotencyAttempt(prisma, {
    key: invoicePaymentKey(paymentSessionId),
    requestPath: "completeInvoicePayment",
    requestParams: { invoiceId, paymentSessionId }
  });
  if (!replay || attempt.recoveryPoint === "completed") return attempt;
  const acquired = await prisma.idempotencyKey.updateMany({
    where: {
      id: attempt.id,
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - STALE_LOCK_MS) } }
      ]
    },
    data: { lockedAt: /* @__PURE__ */ new Date() }
  });
  if (acquired.count !== 1) {
    throw new Error("Invoice payment is already in progress");
  }
  return prisma.idempotencyKey.findUnique({ where: { id: attempt.id } });
}
async function claimInvoicePaymentCommit(tx, invoiceId, paidAt) {
  const claimed = await tx.invoice.updateMany({
    where: {
      id: invoiceId,
      status: { in: ["sent", "overdue"] }
    },
    data: { status: "paid", paidAt }
  });
  return claimed.count === 1;
}

// features/keystone/mutations/completeInvoicePayment.ts
var SUCCESS = /* @__PURE__ */ new Set(["succeeded", "captured", "completed", "paid"]);
var AUTHORIZED = /* @__PURE__ */ new Set(["authorized", "requires_capture", "approved"]);
function providerReference(data) {
  return data?.paymentIntentId || data?.payment_intent_id || data?.orderId || data?.id;
}
async function completeInvoicePayment(root, { paymentSessionId }, context) {
  const sudo = context.sudo();
  const session = await sudo.query.PaymentSession.findOne({
    where: { id: paymentSessionId },
    query: `
      id amount data
      paymentProvider { id code capturePaymentFunction getPaymentStatusFunction credentials }
      paymentCollection {
        id payments { id }
        invoice {
          id invoiceNumber totalAmount status
          currency { code }
          account { id paidAmount currency { code } user { id } }
          lineItems { accountLineItem { id paymentStatus } }
        }
      }
    `
  });
  const invoice = session?.paymentCollection?.invoice;
  if (!invoice) throw new Error("Invoice not found");
  await assertInvoiceAccess(context, invoice.id);
  if (invoice.status === "paid") {
    return { id: invoice.id, status: "succeeded", success: true, message: "Invoice is already paid" };
  }
  if (!["sent", "overdue"].includes(invoice.status)) {
    throw new Error("Invoice is not payable");
  }
  if (session.amount !== invoice.totalAmount) throw new Error("Invoice payment amount mismatch");
  if (invoice.currency.code !== invoice.account.currency.code) {
    throw new Error("Cross-currency invoices require an approved accounting conversion workflow");
  }
  const provider = session.paymentProvider;
  if (!provider?.code || provider.code.includes("manual")) {
    throw new Error("Manual invoice tenders require operator verification");
  }
  const reference = providerReference(session.data);
  if (!reference) throw new Error("Provider payment reference is missing");
  const key = invoicePaymentKey(session.id);
  const attempt = await getOrCreateInvoicePaymentAttempt(
    sudo.prisma,
    invoice.id,
    paymentSessionId
  );
  if (attempt.recoveryPoint === "completed") {
    return { id: invoice.id, status: "succeeded", success: true, message: "Invoice is already paid" };
  }
  let result = attempt.responseBody?.providerResult;
  if (attempt.recoveryPoint !== "provider_captured" || !result) {
    result = await getPaymentStatus({ provider, paymentId: reference });
    if (AUTHORIZED.has(String(result.status).toLowerCase())) {
      result = await capturePayment({
        provider,
        paymentId: reference,
        amount: invoice.totalAmount,
        currency: invoice.currency.code,
        idempotencyKey: key
      });
    }
    if (!SUCCESS.has(String(result.status).toLowerCase())) {
      throw new Error(`Provider payment is not complete: ${result.status}`);
    }
    if (Number(result.amount) !== invoice.totalAmount) throw new Error("Provider amount mismatch");
    if (String(result.currency).toUpperCase() !== invoice.currency.code.toUpperCase()) {
      throw new Error("Provider currency mismatch");
    }
    await sudo.prisma.idempotencyKey.update({
      where: { id: attempt.id },
      data: { recoveryPoint: "provider_captured", responseBody: { providerResult: result } }
    });
  }
  const paymentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "payment.captured"
  );
  await sudo.prisma.$transaction(async (tx) => {
    const paidAt = /* @__PURE__ */ new Date();
    const claimed = await claimInvoicePaymentCommit(tx, invoice.id, paidAt);
    if (!claimed) {
      const existingPayment = await tx.payment.findFirst({
        where: {
          paymentCollectionId: session.paymentCollection.id,
          metadata: { path: ["idempotencyKey"], equals: key }
        },
        select: { id: true }
      });
      if (!existingPayment) {
        throw new Error("Invoice is not payable or payment reconciliation is required");
      }
      await tx.idempotencyKey.update({
        where: { id: attempt.id },
        data: {
          recoveryPoint: "completed",
          responseCode: 200,
          responseBody: { providerResult: result, paymentId: existingPayment.id },
          lockedAt: null
        }
      });
      return { paymentId: existingPayment.id };
    }
    const payment = await tx.payment.create({
      data: {
        status: "captured",
        amount: invoice.totalAmount,
        currencyCode: invoice.currency.code,
        data: result,
        metadata: { invoiceId: invoice.id, idempotencyKey: key },
        capturedAt: /* @__PURE__ */ new Date(),
        userId: invoice.account.user.id,
        paymentCollectionId: session.paymentCollection.id
      }
    });
    await tx.capture.create({
      data: {
        amount: invoice.totalAmount,
        paymentId: payment.id,
        metadata: { invoiceId: invoice.id, idempotencyKey: key },
        createdBy: "invoice-checkout"
      }
    });
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        metadata: { providerResult: result, paymentId: payment.id, paidAt: paidAt.toISOString() }
      }
    });
    const ids = invoice.lineItems.map((item) => item.accountLineItem?.id).filter(Boolean);
    await tx.accountLineItem.updateMany({ where: { id: { in: ids } }, data: { paymentStatus: "paid" } });
    await tx.account.update({
      where: { id: invoice.account.id },
      data: { paidAmount: { increment: invoice.totalAmount } }
    });
    await enqueueWebhookOutbox(
      tx,
      paymentWebhookEndpointIds,
      "payment.captured",
      "Payment",
      payment.id,
      { id: payment.id, invoiceId: invoice.id, amount: invoice.totalAmount, currencyCode: invoice.currency.code }
    );
    await tx.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "completed",
        responseCode: 200,
        responseBody: { providerResult: result, paymentId: payment.id },
        lockedAt: null
      }
    });
    return { paymentId: payment.id };
  });
  return {
    id: invoice.id,
    status: "succeeded",
    success: true,
    message: `Invoice ${invoice.invoiceNumber} paid`
  };
}
var completeInvoicePayment_default = completeInvoicePayment;

// features/keystone/mutations/initiateInvoicePaymentSession.ts
async function initiateInvoicePaymentSession(root, { invoiceId, paymentProviderId }, context) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      totalAmount
      currency {
        code
        noDivisionCurrency
      }
      account {
        id
        user {
          id
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
  if (!invoice) {
    throw new Error("Invoice not found");
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
  if (!provider || !provider.isInstalled || !isPaymentProviderConfigured(provider.code)) {
    throw new Error("Payment provider not found, installed, and configured");
  }
  if (!invoice.paymentCollection) {
    invoice.paymentCollection = await sudoContext.query.PaymentCollection.createOne({
      data: {
        invoice: { connect: { id: invoice.id } },
        amount: invoice.totalAmount,
        description: "default"
      },
      query: "id"
    });
  }
  const existingSession = invoice.paymentCollection?.paymentSessions?.find(
    (s) => s.paymentProvider.code === paymentProviderId && !s.isInitiated
  );
  if (existingSession) {
    const needsInitialization = !existingSession.data || Object.keys(existingSession.data).length === 0;
    let sessionData = existingSession.data;
    if (needsInitialization) {
      try {
        sessionData = await createPayment({
          provider,
          cart: invoice,
          amount: invoice.totalAmount,
          currency: invoice.currency.code
        });
        await sudoContext.query.PaymentSession.updateOne({
          where: { id: existingSession.id },
          data: {
            data: sessionData,
            isInitiated: true
          }
        });
      } catch (error) {
        throw error;
      }
    }
    const otherSessions = invoice.paymentCollection.paymentSessions.filter(
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
    return {
      ...existingSession,
      data: sessionData
    };
  }
  try {
    const sessionData = await createPayment({
      provider,
      cart: invoice,
      // Pass invoice as cart parameter
      amount: invoice.totalAmount,
      currency: invoice.currency.code
    });
    const existingSelectedSessions = invoice.paymentCollection.paymentSessions?.filter(
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
        paymentCollection: { connect: { id: invoice.paymentCollection.id } },
        paymentProvider: { connect: { id: provider.id } },
        amount: invoice.totalAmount,
        isSelected: true,
        isInitiated: true,
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
    throw error;
  }
}
var initiateInvoicePaymentSession_default = initiateInvoicePaymentSession;

// features/keystone/mutations/setInvoicePaymentSession.ts
async function setInvoicePaymentSession(root, { invoiceId, providerId }, context) {
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
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
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  if (!invoice.paymentCollection) {
    throw new Error("Invoice has no payment collection");
  }
  for (const session of invoice.paymentCollection.paymentSessions || []) {
    await sudoContext.db.PaymentSession.updateOne({
      where: { id: session.id },
      data: { isSelected: false }
    });
  }
  const selectedSession = invoice.paymentCollection.paymentSessions?.find(
    (s) => s.paymentProvider.id === providerId
  );
  if (!selectedSession) {
    throw new Error("Payment session not found");
  }
  await sudoContext.db.PaymentSession.updateOne({
    where: { id: selectedSession.id },
    data: { isSelected: true }
  });
  return await sudoContext.db.Invoice.findOne({
    where: { id: invoiceId }
  });
}
var setInvoicePaymentSession_default = setInvoicePaymentSession;

// features/keystone/mutations/activeInvoice.ts
async function activeInvoice(root, { invoiceId }, context) {
  if (!invoiceId) {
    throw new Error("Invoice ID is required");
  }
  await assertInvoiceAccess(context, invoiceId);
  const sudoContext = context.sudo();
  const invoice = await sudoContext.query.Invoice.findOne({
    where: { id: invoiceId },
    query: `
      id
      invoiceNumber
      status
      totalAmount
      currency {
        code
        noDivisionCurrency
      }
      account {
        id
        user {
          id
        }
      }
      lineItems {
        id
        accountLineItem {
          id
          description
          orderDisplayId
          itemCount
          formattedAmount
          createdAt
          order {
            id
            displayId
            createdAt
            total
          }
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
    `
  });
  if (!invoice) {
    return null;
  }
  return invoice;
}
var activeInvoice_default = activeInvoice;

// features/keystone/mutations/getCustomerPaidInvoices.ts
async function getCustomerPaidInvoices(root, { limit = 10, offset = 0 }, context) {
  if (!context.session?.itemId) {
    throw new Error("Not authenticated");
  }
  const boundedLimit = Math.max(1, Math.min(Number(limit) || 10, 100));
  const boundedOffset = Math.max(0, Number(offset) || 0);
  const sudoContext = context.sudo();
  const invoices = await sudoContext.query.Invoice.findMany({
    where: {
      account: {
        user: { id: { equals: context.session.itemId } }
      },
      status: { equals: "paid" }
    },
    orderBy: { paidAt: "desc" },
    take: boundedLimit,
    skip: boundedOffset,
    query: `
      id
      invoiceNumber
      totalAmount
      status
      paidAt
      dueDate
      createdAt
      currency {
        id
        code
        symbol
        noDivisionCurrency
      }
      account {
        id
        accountNumber
        title
      }
      formattedTotal
      lineItems {
        id
        orderDisplayId
        formattedAmount
        orderDetails
        accountLineItem {
          id
          orderDisplayId
          itemCount
          paymentStatus
          description
          amount
          order {
            id
            displayId
          }
        }
      }
    `
  });
  return invoices;
}
var getCustomerPaidInvoices_default = getCustomerPaidInvoices;

// features/keystone/queries/getProductsSortedByPrice.ts
async function getProductsSortedByPrice(root, { countryCode, limit, offset, priceOrder, collectionId, categoryId }, context) {
  const prisma = context.prisma;
  const productWhere = {
    status: "published",
    productVariants: {
      some: {
        prices: {
          some: {
            region: {
              countries: {
                some: {
                  iso2: countryCode
                }
              }
            }
          }
        }
      }
    }
  };
  if (collectionId) {
    productWhere.productCollections = {
      some: { id: collectionId }
    };
  }
  if (categoryId) {
    productWhere.productCategories = {
      some: { id: categoryId }
    };
  }
  const region2 = await prisma.region.findFirst({
    where: {
      countries: {
        some: { iso2: countryCode }
      }
    },
    select: { id: true }
  });
  if (!region2) {
    return {
      products: [],
      count: 0
    };
  }
  const orderDirection = priceOrder === "asc" ? "ASC" : "DESC";
  let whereConditions = `p."status" = 'published'`;
  if (collectionId) {
    whereConditions += ` AND EXISTS (
      SELECT 1 FROM "_Product_productCollections" ptpc
      WHERE ptpc."A" = p."id" AND ptpc."B" = '${collectionId}'
    )`;
  }
  if (categoryId) {
    whereConditions += ` AND EXISTS (
      SELECT 1 FROM "_Product_productCategories" ptpc
      WHERE ptpc."A" = p."id" AND ptpc."B" = '${categoryId}'
    )`;
  }
  const sqlQuery = `
    SELECT p."id", MIN(ma."amount") as min_price
    FROM "Product" p
    INNER JOIN "ProductVariant" pv ON pv."product" = p."id"
    INNER JOIN "MoneyAmount" ma ON ma."productVariant" = pv."id"
    WHERE ma."region" = '${region2.id}'
      AND ${whereConditions}
    GROUP BY p."id"
    ORDER BY min_price ${orderDirection}
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  const rawResult = await prisma.$queryRawUnsafe(sqlQuery);
  const sortedProductIds = Array.isArray(rawResult) ? rawResult : [];
  const countRaw = await prisma.$queryRawUnsafe(`
    SELECT COUNT(DISTINCT p."id") as count
    FROM "Product" p
    INNER JOIN "ProductVariant" pv ON pv."product" = p."id"
    INNER JOIN "MoneyAmount" ma ON ma."productVariant" = pv."id"
    WHERE ma."region" = '${region2.id}'
      AND ${whereConditions}
  `);
  const countResult = Array.isArray(countRaw) ? countRaw : [];
  const totalCount = Number(countResult[0]?.count || 0);
  if (sortedProductIds.length === 0) {
    return {
      products: [],
      count: totalCount
    };
  }
  const productIds = sortedProductIds.map((p) => p.id);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds }
    },
    include: {
      productVariants: {
        include: {
          prices: {
            where: {
              region: {
                countries: {
                  some: { iso2: countryCode }
                }
              }
            },
            include: {
              currency: true
            }
          }
        }
      }
    }
  });
  const productMap = new Map(products.map((p) => [p.id, p]));
  const sortedProducts = productIds.map((id) => productMap.get(id)).filter(Boolean);
  return {
    products: sortedProducts,
    count: totalCount
  };
}

// features/keystone/mutations/processReturnRefund.ts
function providerPaymentReference(payment) {
  return payment.data?.purchase_units?.[0]?.payments?.captures?.[0]?.id || payment.data?.payment_intent_id || payment.data?.paymentIntentId || payment.data?.orderId || payment.data?.id;
}
async function processReturnRefund(root, { returnId, paymentId, idempotencyKey }, context) {
  if (!permissions.canManageReturns({ session: context.session }) || !permissions.canManagePayments({ session: context.session })) {
    throw new Error("Access denied");
  }
  if (!idempotencyKey?.trim()) throw new Error("Idempotency key is required");
  const sudo = context.sudo();
  const businessKey = `refund:${idempotencyKey.trim()}`;
  const idempotencyRequest = {
    key: businessKey,
    requestPath: "processReturnRefund",
    requestParams: { returnId, paymentId }
  };
  const priorAttempt = await findIdempotencyAttempt(sudo.prisma, idempotencyRequest);
  if (priorAttempt?.recoveryPoint === "completed" && priorAttempt.responseBody?.refundId) {
    return sudo.query.Refund.findOne({
      where: { id: priorAttempt.responseBody.refundId },
      query: "id amount reason idempotencyKey payment { id amount amountRefunded }"
    });
  }
  const returnRecord = await sudo.query.Return.findOne({
    where: { id: returnId },
    query: `id status refundAmount metadata order { id payments { id } }`
  });
  if (!returnRecord?.order?.id || returnRecord.refundAmount <= 0) {
    throw new Error("Return is not refundable");
  }
  if (!returnRecord.order.payments?.some((payment2) => payment2.id === paymentId)) {
    throw new Error("Payment does not belong to return order");
  }
  const payment = await sudo.query.Payment.findOne({
    where: { id: paymentId },
    query: `
      id amount amountRefunded currencyCode data
      refunds { id amount idempotencyKey }
      paymentCollection {
        paymentSessions {
          isSelected
          paymentProvider {
            id code refundPaymentFunction credentials
          }
        }
      }
    `
  });
  if (!payment) throw new Error("Payment not found");
  const alreadyRefunded = payment.refunds?.reduce((sum, refund2) => sum + refund2.amount, 0) || 0;
  if (alreadyRefunded + returnRecord.refundAmount > payment.amount) {
    throw new Error("Refund exceeds captured payment amount");
  }
  const provider = payment.paymentCollection?.paymentSessions?.find((session) => session.isSelected)?.paymentProvider || payment.paymentCollection?.paymentSessions?.[0]?.paymentProvider;
  const providerReference2 = providerPaymentReference(payment);
  if (!provider || !providerReference2) throw new Error("Refund provider reference is missing");
  if (provider.code?.includes("manual")) {
    throw new Error("Manual tender refunds require operator verification");
  }
  const { attempt, replay } = priorAttempt ? { attempt: priorAttempt, replay: true } : await getOrCreateIdempotencyAttempt(sudo.prisma, idempotencyRequest);
  if (attempt.recoveryPoint === "completed" && attempt.responseBody?.refundId) {
    return sudo.query.Refund.findOne({
      where: { id: attempt.responseBody.refundId },
      query: "id amount reason idempotencyKey payment { id amount amountRefunded }"
    });
  }
  if (replay) {
    const acquired = await sudo.prisma.idempotencyKey.updateMany({
      where: {
        id: attempt.id,
        OR: [
          { lockedAt: null },
          { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1e3) } }
        ]
      },
      data: { lockedAt: /* @__PURE__ */ new Date() }
    });
    if (acquired.count !== 1) throw new Error("Refund is already in progress");
  }
  if (attempt.recoveryPoint === "started") {
    await sudo.prisma.$transaction(async (tx) => {
      const reserved = await tx.payment.updateMany({
        where: {
          id: paymentId,
          amountRefunded: { lte: payment.amount - returnRecord.refundAmount }
        },
        data: { amountRefunded: { increment: returnRecord.refundAmount } }
      });
      if (reserved.count !== 1) {
        throw new Error("Concurrent refund exceeds captured payment amount");
      }
      await tx.idempotencyKey.update({
        where: { id: attempt.id },
        data: { recoveryPoint: "amount_reserved", lockedAt: /* @__PURE__ */ new Date() }
      });
    });
    attempt.recoveryPoint = "amount_reserved";
  }
  let providerResult = attempt.responseBody?.providerResult;
  if (attempt.recoveryPoint !== "provider_refunded" || !providerResult) {
    providerResult = await refundPayment({
      provider,
      paymentId: providerReference2,
      amount: returnRecord.refundAmount,
      currency: payment.currencyCode,
      idempotencyKey: businessKey
    });
    const status = String(providerResult.status || "").toLowerCase();
    if (!["succeeded", "completed", "refunded"].includes(status)) {
      throw new Error(`Provider refund is not complete: ${providerResult.status}`);
    }
    if (Number(providerResult.amount) !== returnRecord.refundAmount) {
      throw new Error("Provider refund amount mismatch");
    }
    if (providerResult.currency && String(providerResult.currency).toUpperCase() !== String(payment.currencyCode).toUpperCase()) {
      throw new Error("Provider refund currency mismatch");
    }
    await sudo.prisma.idempotencyKey.update({
      where: { id: attempt.id },
      data: {
        recoveryPoint: "provider_refunded",
        responseBody: { providerResult },
        lockedAt: /* @__PURE__ */ new Date()
      }
    });
  }
  const refundWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudo,
    "refund.created"
  );
  const refund = await sudo.prisma.$transaction(async (tx) => {
    const duplicate = await tx.refund.findFirst({
      where: { idempotencyKey: businessKey }
    });
    if (duplicate) return duplicate;
    const created = await tx.refund.create({
      data: {
        amount: returnRecord.refundAmount,
        reason: "return",
        note: `Return ${returnId}`,
        idempotencyKey: businessKey,
        paymentId,
        metadata: { providerId: provider.id, providerResult }
      }
    });
    await tx.return.update({
      where: { id: returnId },
      data: {
        status: "received",
        receivedAt: /* @__PURE__ */ new Date(),
        metadata: {
          ...returnRecord.metadata || {},
          refundId: created.id,
          refundStatus: "completed"
        }
      }
    });
    await tx.orderEvent.create({
      data: {
        orderId: returnRecord.order.id,
        type: "REFUND_PROCESSED",
        data: { returnId, refundId: created.id, amount: created.amount },
        time: /* @__PURE__ */ new Date(),
        userId: context.session.itemId,
        createdById: context.session.itemId
      }
    });
    await enqueueWebhookOutbox(
      tx,
      refundWebhookEndpointIds,
      "refund.created",
      "Refund",
      created.id,
      { id: created.id, returnId, paymentId, orderId: returnRecord.order.id, amount: created.amount }
    );
    return created;
  });
  await sudo.prisma.idempotencyKey.update({
    where: { id: attempt.id },
    data: {
      recoveryPoint: "completed",
      responseCode: 200,
      responseBody: { refundId: refund.id, providerResult },
      lockedAt: null
    }
  });
  return sudo.query.Refund.findOne({
    where: { id: refund.id },
    query: "id amount reason idempotencyKey payment { id amount amountRefunded }"
  });
}
var processReturnRefund_default = processReturnRefund;

// features/keystone/mutations/retryWebhookDeliveries.ts
async function retryWebhookDeliveries(root, { limit = 25 }, context) {
  if (!permissions.canManageWebhooks({ session: context.session })) {
    throw new Error("Access denied");
  }
  return retryPendingWebhookDeliveries(context, limit);
}
var retryWebhookDeliveries_default = retryWebhookDeliveries;

// features/keystone/models/WebhookEndpoint.ts
var import_core = require("@keystone-6/core");
var import_fields3 = require("@keystone-6/core/fields");
var import_node_crypto7 = __toESM(require("node:crypto"));

// features/webhooks/subscriptions.ts
var import_node_crypto6 = __toESM(require("node:crypto"));
function normalizeWebhookUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    throw new Error("Webhook URL must be an absolute URL");
  }
  const localDevelopment = process.env.NODE_ENV !== "production" && (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1" || url.hostname.endsWith(".local"));
  if (url.protocol !== "https:" && !(localDevelopment && url.protocol === "http:")) {
    throw new Error("Webhook URL must use HTTPS");
  }
  if (url.username || url.password || url.hash) {
    throw new Error("Webhook URL cannot contain credentials or a fragment");
  }
  return url.toString();
}
function normalizeWebhookEvents(value) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("At least one webhook event is required");
  }
  const events = value.map((event) => String(event || "").trim()).filter(Boolean);
  if (events.length !== value.length) throw new Error("Webhook event names cannot be empty");
  return [...new Set(events)].sort();
}
function normalizeWebhookRegistrationKey(value) {
  const key = String(value || "").trim();
  if (!key || key.length > 255) {
    throw new Error("Webhook registration key must be between 1 and 255 characters");
  }
  return key;
}
function requireWebhookScope(actual, required) {
  if (required === void 0 || required === null || required === "") return;
  const expected = String(required).trim().toUpperCase();
  if (expected !== "STORE" && expected !== "USER") {
    throw new Error("Required webhook scope must be STORE or USER");
  }
  if (expected !== actual) {
    throw new Error(`Webhook registration requires ${expected} scope`);
  }
}
function webhookSubscriptionKey(scope, ownerId, registrationKey) {
  if (scope === "USER" && !ownerId) throw new Error("USER webhook subscriptions require an owner");
  const principal = scope === "USER" ? ownerId : "store";
  return import_node_crypto6.default.createHash("sha256").update(`webhook-subscription:v1\0${scope}\0${principal}\0${registrationKey}`).digest("hex");
}

// features/keystone/models/WebhookEndpoint.ts
var CUSTOMER_WEBHOOK_EVENTS = /* @__PURE__ */ new Set(["fulfillment.created"]);
function isCustomerTokenSession(session) {
  return Boolean(session?.customerToken && session?.itemId);
}
function customerEndpointFilter(session) {
  return {
    scope: { equals: "USER" },
    user: { id: { equals: session.itemId } }
  };
}
function canReadEndpoints({ session }) {
  return permissions.canReadWebhooks({ session }) || isCustomerTokenSession(session);
}
function canManageEndpoints({ session }) {
  return permissions.canManageWebhooks({ session }) || isCustomerTokenSession(session);
}
function readEndpointFilter({ session }) {
  if (permissions.canReadWebhooks({ session })) return true;
  return isCustomerTokenSession(session) ? customerEndpointFilter(session) : false;
}
function manageEndpointFilter({ session }) {
  if (permissions.canManageWebhooks({ session })) return true;
  return isCustomerTokenSession(session) ? customerEndpointFilter(session) : false;
}
function validateCustomerEndpoint(urlValue, eventsValue, addValidationError) {
  try {
    normalizeWebhookUrl(urlValue);
  } catch (error) {
    addValidationError(error instanceof Error ? error.message : "Invalid webhook URL");
  }
  let events = [];
  try {
    events = normalizeWebhookEvents(eventsValue);
  } catch (error) {
    addValidationError(error instanceof Error ? error.message : "Invalid webhook events");
  }
  if (events.some((event) => !CUSTOMER_WEBHOOK_EVENTS.has(event))) {
    addValidationError("Customer tokens may subscribe only to fulfillment.created");
  }
}
var WebhookEndpoint = (0, import_core.list)({
  access: {
    operation: {
      query: canReadEndpoints,
      create: canManageEndpoints,
      update: canManageEndpoints,
      delete: canManageEndpoints
    },
    filter: {
      query: readEndpointFilter,
      update: manageEndpointFilter,
      delete: manageEndpointFilter
    }
  },
  hooks: {
    resolveInput: {
      create: ({ context, resolvedData }) => {
        if (!context.session?.itemId) return resolvedData;
        const scope = isCustomerTokenSession(context.session) ? "USER" : "STORE";
        const registrationKey = normalizeWebhookRegistrationKey(
          resolvedData.registrationKey || `manual:${import_node_crypto7.default.randomUUID()}`
        );
        return {
          ...resolvedData,
          url: normalizeWebhookUrl(resolvedData.url),
          events: normalizeWebhookEvents(resolvedData.events),
          registrationKey,
          subscriptionKey: webhookSubscriptionKey(
            scope,
            scope === "USER" ? context.session.itemId : null,
            registrationKey
          ),
          scope,
          user: { connect: { id: context.session.itemId } }
        };
      },
      update: ({ context, resolvedData }) => ({
        ...resolvedData,
        ...resolvedData.url !== void 0 ? { url: normalizeWebhookUrl(resolvedData.url) } : {},
        ...resolvedData.events !== void 0 ? { events: normalizeWebhookEvents(resolvedData.events) } : {},
        ...isCustomerTokenSession(context.session) ? { scope: "USER", user: { connect: { id: context.session.itemId } } } : {}
      })
    },
    validateInput: async ({ context, resolvedData, item, addValidationError }) => {
      if (!isCustomerTokenSession(context.session)) return;
      validateCustomerEndpoint(
        resolvedData.url ?? item?.url,
        resolvedData.events ?? item?.events,
        addValidationError
      );
    }
  },
  ui: {
    hideCreate: (args) => !permissions.canManageWebhooks(args),
    hideDelete: (args) => !permissions.canManageWebhooks(args),
    listView: {
      initialColumns: ["url", "scope", "isActive", "events", "lastTriggered", "failureCount"]
    }
  },
  fields: {
    url: (0, import_fields3.text)({
      validation: { isRequired: true },
      ui: { description: "The URL where webhook events will be sent" }
    }),
    registrationKey: (0, import_fields3.text)({
      db: { isNullable: true },
      access: { read: () => false, create: () => false, update: () => false },
      ui: { itemView: { fieldMode: "hidden" }, listView: { fieldMode: "hidden" } }
    }),
    subscriptionKey: (0, import_fields3.text)({
      db: { isNullable: true },
      isIndexed: "unique",
      access: { read: () => false, create: () => false, update: () => false },
      ui: { itemView: { fieldMode: "hidden" }, listView: { fieldMode: "hidden" } }
    }),
    events: (0, import_fields3.json)({
      defaultValue: [],
      ui: {
        description: 'Events to subscribe to, e.g. ["order.created", "fulfillment.created"]'
      }
    }),
    scope: (0, import_fields3.select)({
      options: [
        { label: "Store", value: "STORE" },
        { label: "User", value: "USER" }
      ],
      defaultValue: "STORE",
      validation: { isRequired: true },
      access: { create: () => false, update: () => false },
      ui: { itemView: { fieldMode: "read" } }
    }),
    user: (0, import_fields3.relationship)({
      ref: "User.webhookEndpoints",
      access: { create: () => false, update: () => false },
      ui: { itemView: { fieldMode: "read" } }
    }),
    isActive: (0, import_fields3.checkbox)({
      defaultValue: true,
      ui: { description: "Whether this webhook endpoint is currently active" }
    }),
    secret: (0, import_fields3.text)({
      access: { read: () => false },
      ui: {
        itemView: { fieldMode: "hidden" },
        description: "Secret key for webhook signature verification (auto-generated)"
      },
      hooks: {
        resolveInput: ({ resolvedData, operation }) => {
          if (operation === "create" && !resolvedData.secret) {
            return import_node_crypto7.default.randomBytes(32).toString("hex");
          }
          return resolvedData.secret;
        }
      }
    }),
    lastTriggered: (0, import_fields3.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Last time this webhook was triggered"
      }
    }),
    failureCount: (0, import_fields3.integer)({
      defaultValue: 0,
      ui: {
        itemView: { fieldMode: "read" },
        description: "Number of consecutive delivery failures"
      }
    }),
    webhookEvents: (0, import_fields3.relationship)({
      ref: "WebhookEvent.endpoint",
      many: true,
      ui: {
        displayMode: "count",
        description: "Events sent to this endpoint"
      }
    }),
    createdAt: (0, import_fields3.timestamp)({
      defaultValue: { kind: "now" },
      ui: { itemView: { fieldMode: "read" } }
    }),
    updatedAt: (0, import_fields3.timestamp)({
      db: { updatedAt: true },
      ui: { itemView: { fieldMode: "read" } }
    })
  }
});

// features/keystone/mutations/registerWebhookEndpoint.ts
var CUSTOMER_WEBHOOK_EVENTS2 = /* @__PURE__ */ new Set(["fulfillment.created"]);
async function registerWebhookEndpoint(_root, {
  registrationKey: registrationKeyInput,
  url: urlInput,
  events: eventsInput,
  secret: secretInput,
  requiredScope: requiredScopeInput
}, context) {
  const session = context.session;
  const customerSession = isCustomerTokenSession(session);
  if (!session?.itemId || !customerSession && !permissions.canManageWebhooks({ session })) {
    throw new Error("Webhook management permission required");
  }
  const scope = customerSession ? "USER" : "STORE";
  requireWebhookScope(scope, requiredScopeInput);
  const ownerId = customerSession ? session.itemId : null;
  const registrationKey = normalizeWebhookRegistrationKey(registrationKeyInput);
  const subscriptionKey = webhookSubscriptionKey(scope, ownerId, registrationKey);
  const url = normalizeWebhookUrl(urlInput);
  const events = normalizeWebhookEvents(eventsInput);
  const secret = String(secretInput || "").trim();
  if (!secret) throw new Error("Webhook signing secret is required");
  if (customerSession && events.some((event) => !CUSTOMER_WEBHOOK_EVENTS2.has(event))) {
    throw new Error("Customer tokens may subscribe only to fulfillment.created");
  }
  const sudo = context.sudo();
  const endpoint2 = await sudo.prisma.$transaction(async (tx) => {
    const saved = await tx.webhookEndpoint.upsert({
      where: { subscriptionKey },
      create: {
        registrationKey,
        subscriptionKey,
        url,
        events,
        scope,
        userId: session.itemId,
        isActive: true,
        secret,
        failureCount: 0
      },
      update: {
        url,
        events,
        isActive: true,
        secret
      },
      select: { id: true }
    });
    await tx.webhookEndpoint.updateMany({
      where: {
        id: { not: saved.id },
        scope,
        url,
        registrationKey: { startsWith: "legacy:" },
        ...scope === "USER" ? { userId: session.itemId } : {}
      },
      data: { isActive: false }
    });
    return saved;
  });
  return context.db.WebhookEndpoint.findOne({ where: { id: endpoint2.id } });
}
var registerWebhookEndpoint_default = registerWebhookEndpoint;

// features/keystone/queries/getFinanceClose.ts
var import_node_crypto8 = __toESM(require("node:crypto"));
async function getFinanceClose(root, { start, end }, context) {
  if (!context.session?.itemId || !permissions.canReadPayments({ session: context.session })) {
    throw new Error("Access denied");
  }
  const startAt = new Date(start);
  const endAt = new Date(end);
  if (!Number.isFinite(startAt.getTime()) || !Number.isFinite(endAt.getTime()) || startAt >= endAt || endAt.getTime() - startAt.getTime() > 31 * 24 * 60 * 60 * 1e3) {
    throw new Error("Finance close range must be valid and no longer than 31 days");
  }
  const payments = await context.sudo().query.Payment.findMany({
    where: { createdAt: { gte: startAt.toISOString(), lt: endAt.toISOString() } },
    orderBy: { createdAt: "asc" },
    take: 5e3,
    query: `
      id status amount amountRefunded currencyCode capturedAt createdAt data
      captures { id amount createdAt metadata }
      refunds { id amount reason createdAt metadata }
      order { id displayId status metadata }
    `
  });
  if (payments.length === 5e3) {
    throw new Error("Finance close exceeded the bounded export limit");
  }
  const rows = payments.map((payment) => {
    const captured = payment.captures?.reduce((sum, item) => sum + item.amount, 0) || (payment.status === "captured" ? payment.amount : 0);
    const refunded = payment.refunds?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const providerReference2 = payment.data?.paymentIntentId || payment.data?.orderId || payment.data?.id || null;
    return {
      paymentId: payment.id,
      orderId: payment.order?.id || null,
      orderDisplayId: payment.order?.displayId || null,
      currency: payment.currencyCode,
      status: payment.status,
      captured,
      refunded,
      netTender: captured - refunded,
      providerReference: providerReference2,
      capturedAt: payment.capturedAt,
      accountingPolicyVersion: payment.order?.metadata?.commercialSnapshot?.accountingPolicyVersion || null,
      exception: payment.status === "captured" && (!providerReference2 || captured !== payment.amount) ? "CAPTURE_EVIDENCE_MISMATCH" : null
    };
  });
  const byCurrency = Object.values(
    rows.reduce((result, row) => {
      const current = result[row.currency] || {
        currency: row.currency,
        captured: 0,
        refunded: 0,
        netTender: 0,
        count: 0
      };
      current.captured += row.captured;
      current.refunded += row.refunded;
      current.netTender += row.netTender;
      current.count += 1;
      result[row.currency] = current;
      return result;
    }, {})
  );
  const controlPayload = JSON.stringify({ start, end, byCurrency, rows });
  return {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    range: { start: startAt.toISOString(), end: endAt.toISOString() },
    legalEntityId: null,
    reportingCurrency: byCurrency.length === 1 ? byCurrency[0].currency : null,
    accountingPolicyVersion: null,
    providerSettlementStatus: "OWNER_DATA_REQUIRED",
    rows,
    byCurrency,
    exceptions: rows.filter((row) => row.exception),
    control: {
      rowCount: rows.length,
      sha256: import_node_crypto8.default.createHash("sha256").update(controlPayload).digest("hex")
    }
  };
}
var getFinanceClose_default = getFinanceClose;

// features/keystone/mutations/privacy.ts
var allowedActions = /* @__PURE__ */ new Set(["access", "correct", "delete", "restrict", "object"]);
async function updatePrivacyPreferences(root, { preferences }, context) {
  const userId = context.session?.itemId;
  if (!userId) throw new Error("Authentication required");
  const analytics = preferences?.analytics;
  const marketingEmail = preferences?.marketingEmail;
  if (typeof analytics !== "boolean" || typeof marketingEmail !== "boolean") {
    throw new Error("Privacy preferences must contain boolean analytics and marketingEmail values");
  }
  const receipt = {
    analytics,
    marketingEmail,
    recordedAt: (/* @__PURE__ */ new Date()).toISOString(),
    source: "customer-account"
  };
  const sudo = context.sudo();
  const user = await sudo.query.User.findOne({
    where: { id: userId },
    query: "id userField { id preferences }"
  });
  if (!user) throw new Error("User not found");
  if (user.userField?.id) {
    await sudo.query.UserField.updateOne({
      where: { id: user.userField.id },
      data: {
        preferences: {
          ...user.userField.preferences || {},
          privacy: receipt
        }
      }
    });
  } else {
    await sudo.query.UserField.createOne({
      data: {
        user: { connect: { id: userId } },
        preferences: { privacy: receipt }
      }
    });
  }
  return receipt;
}
async function requestPrivacyAction(root, { action, details }, context) {
  const userId = context.session?.itemId;
  if (!userId) throw new Error("Authentication required");
  if (!allowedActions.has(action)) throw new Error("Unsupported privacy action");
  const request = await context.sudo().query.Notification.createOne({
    data: {
      eventName: "PRIVACY_REQUEST",
      resourceType: "User",
      resourceId: userId,
      to: "privacy-operations",
      user: { connect: { id: userId } },
      data: {
        action,
        details: typeof details === "string" ? details.slice(0, 2e3) : null,
        status: "pending_identity_verification",
        requestedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    },
    query: "id eventName createdAt data"
  });
  return request;
}
async function getMyPrivacyData(root, args, context) {
  const userId = context.session?.itemId;
  if (!userId) throw new Error("Authentication required");
  const user = await context.sudo().query.User.findOne({
    where: { id: userId },
    query: `
      id name email phone createdAt updatedAt onboardingStatus
      addresses { id firstName lastName company address1 address2 city province postalCode phone country { iso2 } }
      userField { preferences }
      orders(orderBy: { createdAt: desc }, take: 250) { id displayId status createdAt email }
    `
  });
  if (!user) throw new Error("User not found");
  return {
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    user
  };
}

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
        getInvoicePaymentSessions(invoiceId: ID!): [PaymentSession!]!
        getAnalytics(timeframe: String): JSON
        activeInvoice(invoiceId: ID!): JSON
        getCustomerPaidInvoices(limit: Int, offset: Int): JSON
        getFinanceClose(start: String!, end: String!): JSON!
        getMyPrivacyData: JSON!
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
        createActiveCart(regionId: ID!): JSON!
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
        importInventory: Boolean
        adjustInventory(variantId: ID!, delta: Int!, reason: String!, note: String): ProductVariant
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
          idempotencyKey: String!
        ): ProviderShippingLabel
        createOrderFulfillment(
          orderId: ID!
          lineItems: [LineItemInput!]!
          trackingNumber: String
          carrier: String
          noNotification: Boolean
          idempotencyKey: String!
        ): Fulfillment!
        cancelOrderFulfillment(fulfillmentId: ID!, reason: String!): Fulfillment!
        transitionOrderStatus(orderId: ID!, status: String!, reason: String!): Order!
        regenerateCustomerToken: CustomerTokenResult!
        createInvoiceFromLineItems(accountId: ID!, regionId: ID!, lineItemIds: [ID!]!, dueDate: String): InvoiceCreationResult!
        createInvoicePaymentSessions(invoiceId: ID!): Invoice!
        initiateInvoicePaymentSession(invoiceId: ID!, paymentProviderId: String!): PaymentSession
        setInvoicePaymentSession(invoiceId: ID!, providerId: ID!): Invoice
        completeInvoicePayment(paymentSessionId: ID!): InvoicePaymentResult!
        processReturnRefund(returnId: ID!, paymentId: ID!, idempotencyKey: String!): Refund
        retryWebhookDeliveries(limit: Int): Int!
        registerWebhookEndpoint(
          registrationKey: String!
          url: String!
          events: [String!]!
          secret: String!
          requiredScope: String
        ): WebhookEndpoint!
        updatePrivacyPreferences(preferences: JSON!): JSON!
        requestPrivacyAction(action: String!, details: String): Notification
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
      getInvoicePaymentSessions: getInvoicePaymentSessions_default,
      getAnalytics: getAnalytics_default,
      activeInvoice: activeInvoice_default,
      getCustomerPaidInvoices: getCustomerPaidInvoices_default,
      getFinanceClose: getFinanceClose_default,
      getMyPrivacyData,
      getProductsSortedByPrice
    },
    Mutation: {
      updateActiveUserPassword: updateActiveUserPassword_default,
      createActiveCart: createActiveCart_default,
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
      importInventory: importInventory_default,
      adjustInventory: adjustInventory_default,
      getRatesForOrder: getRatesForOrder_default,
      validateShippingAddress: validateShippingAddress_default,
      trackShipment: trackShipment_default,
      cancelShippingLabel: cancelShippingLabel_default,
      createProviderShippingLabel: createProviderShippingLabel_default,
      createOrderFulfillment: createOrderFulfillment_default,
      cancelOrderFulfillment: cancelOrderFulfillment_default,
      transitionOrderStatus: transitionOrderStatus_default,
      regenerateCustomerToken: regenerateCustomerToken_default,
      createInvoiceFromLineItems: createInvoiceFromLineItems_default,
      createInvoicePaymentSessions: createInvoicePaymentSessions_default,
      initiateInvoicePaymentSession: initiateInvoicePaymentSession_default,
      setInvoicePaymentSession: setInvoicePaymentSession_default,
      completeInvoicePayment: completeInvoicePayment_default,
      processReturnRefund: processReturnRefund_default,
      retryWebhookDeliveries: retryWebhookDeliveries_default,
      registerWebhookEndpoint: registerWebhookEndpoint_default,
      updatePrivacyPreferences,
      requestPrivacyAction
    }
  }
});

// features/keystone/models/Address.ts
var import_core2 = require("@keystone-6/core");
var import_fields5 = require("@keystone-6/core/fields");

// features/keystone/models/trackingFields.ts
var import_fields4 = require("@keystone-6/core/fields");
var trackingFields = {
  createdAt: (0, import_fields4.timestamp)({
    access: { read: () => true, create: () => false, update: () => false },
    validation: { isRequired: true },
    defaultValue: { kind: "now" },
    ui: {
      createView: { fieldMode: "hidden" },
      itemView: { fieldMode: "read" }
    }
  }),
  updatedAt: (0, import_fields4.timestamp)({
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

// features/keystone/security/address-input.ts
var CUSTOMER_ADDRESS_FIELDS = /* @__PURE__ */ new Set([
  "company",
  "firstName",
  "lastName",
  "address1",
  "address2",
  "city",
  "province",
  "postalCode",
  "phone",
  "isBilling",
  "metadata",
  "country"
]);
function resolveCustomerAddressData({
  inputData,
  resolvedData,
  userId
}) {
  const restrictedData = { ...resolvedData };
  for (const key of Object.keys(inputData ?? {})) {
    if (!CUSTOMER_ADDRESS_FIELDS.has(key)) delete restrictedData[key];
  }
  restrictedData.user = { connect: { id: userId } };
  return restrictedData;
}

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
var Address = (0, import_core2.list)({
  access: {
    operation: {
      create: isSignedIn,
      query: isSignedIn,
      update: isSignedIn,
      delete: isSignedIn
    },
    filter: {
      query: canManageAddresses,
      update: canManageAddresses,
      delete: canManageAddresses
    }
  },
  hooks: {
    resolveInput: ({ operation, inputData, resolvedData, context }) => {
      if ((operation === "create" || operation === "update") && !permissions.canManageUsers({ session: context.session })) {
        return resolveCustomerAddressData({
          inputData,
          resolvedData,
          userId: context.session.itemId
        });
      }
      return resolvedData;
    }
  },
  fields: {
    label: (0, import_fields5.virtual)({
      field: import_core2.graphql.field({
        type: import_core2.graphql.String,
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
    company: (0, import_fields5.text)(),
    firstName: (0, import_fields5.text)(),
    lastName: (0, import_fields5.text)(),
    address1: (0, import_fields5.text)(),
    address2: (0, import_fields5.text)(),
    city: (0, import_fields5.text)(),
    province: (0, import_fields5.text)(),
    postalCode: (0, import_fields5.text)(),
    phone: (0, import_fields5.text)(),
    isBilling: (0, import_fields5.checkbox)({ defaultValue: false }),
    metadata: (0, import_fields5.json)(),
    country: (0, import_fields5.relationship)({
      ref: "Country.addresses",
      many: false,
      validation: { isRequired: true }
    }),
    user: (0, import_fields5.relationship)({
      ref: "User.addresses",
      many: false,
      hooks: {
        resolveInput({ operation, resolvedData, context }) {
          if ((operation === "create" || operation === "update") && context.session?.itemId && !permissions.canManageUsers({ session: context.session })) {
            return { connect: { id: context.session.itemId } };
          }
          return resolvedData.user;
        }
      }
    }),
    shippingProviders: (0, import_fields5.relationship)({
      ref: "ShippingProvider.fromAddress",
      many: true
    }),
    cart: (0, import_fields5.relationship)({
      ref: "Cart.addresses",
      many: false
    }),
    claimOrders: (0, import_fields5.relationship)({
      ref: "ClaimOrder.address",
      many: true
    }),
    ordersUsingAsBillingAddress: (0, import_fields5.relationship)({
      ref: "Order.billingAddress",
      many: true
    }),
    ordersUsingAsShippingAddress: (0, import_fields5.relationship)({
      ref: "Order.shippingAddress",
      many: true
    }),
    cartsUsingAsBillingAddress: (0, import_fields5.relationship)({
      ref: "Cart.billingAddress",
      many: true
    }),
    cartsUsingAsShippingAddress: (0, import_fields5.relationship)({
      ref: "Cart.shippingAddress",
      many: true
    }),
    swaps: (0, import_fields5.relationship)({
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
var import_fields6 = require("@keystone-6/core/fields");
var import_core3 = require("@keystone-6/core");
var ApiKey = (0, import_core3.list)({
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
    name: (0, import_fields6.text)({
      validation: { isRequired: true },
      ui: {
        description: "A descriptive name for this API key (e.g. 'Production Bot', 'Analytics Dashboard')"
      }
    }),
    tokenSecret: (0, import_fields6.password)({
      validation: { isRequired: true },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" },
        description: "Secure API key token (hashed and never displayed)"
      }
    }),
    tokenPreview: (0, import_fields6.text)({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        listView: { fieldMode: "read" },
        description: "Preview of the API key (actual key is hidden for security)"
      }
    }),
    scopes: (0, import_fields6.json)({
      defaultValue: [],
      ui: {
        description: "Array of scopes for this API key. Available scopes: orders:read, orders:write, shops:read, shops:write, channels:read, channels:write, etc."
      }
    }),
    status: (0, import_fields6.select)({
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
    expiresAt: (0, import_fields6.timestamp)({
      ui: {
        description: "When this API key expires (optional - leave blank for no expiration)"
      }
    }),
    lastUsedAt: (0, import_fields6.timestamp)({
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Last time this API key was used"
      }
    }),
    usageCount: (0, import_fields6.json)({
      defaultValue: { total: 0, daily: {} },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "read" },
        description: "Usage statistics for this API key"
      }
    }),
    restrictedToIPs: (0, import_fields6.json)({
      defaultValue: [],
      ui: {
        description: "Optional: Restrict this key to specific IP addresses (array of IPs)"
      }
    }),
    user: (0, import_fields6.relationship)({
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
var import_core4 = require("@keystone-6/core");
var import_fields7 = require("@keystone-6/core/fields");
var BatchJob = (0, import_core4.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    type: (0, import_fields7.select)({
      type: "enum",
      options: [
        { label: "Product Import", value: "PRODUCT_IMPORT" },
        { label: "Order Export", value: "ORDER_EXPORT" },
        { label: "Inventory Update", value: "INVENTORY_UPDATE" },
        { label: "Price Update", value: "PRICE_UPDATE" }
      ],
      validation: { isRequired: true }
    }),
    status: (0, import_fields7.select)({
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
    context: (0, import_fields7.json)({
      defaultValue: {}
    }),
    result: (0, import_fields7.json)({
      defaultValue: {}
    }),
    error: (0, import_fields7.text)(),
    progress: (0, import_fields7.integer)({
      defaultValue: 0,
      validation: {
        min: 0,
        max: 100
      }
    }),
    createdBy: (0, import_fields7.relationship)({
      ref: "User.batchJobs",
      many: false
    }),
    completedAt: (0, import_fields7.timestamp)(),
    ...trackingFields
  }
});

// features/keystone/models/Capture.ts
var import_core5 = require("@keystone-6/core");
var import_fields8 = require("@keystone-6/core/fields");
var Capture = (0, import_core5.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    amount: (0, import_fields8.integer)({
      validation: {
        isRequired: true
      }
    }),
    payment: (0, import_fields8.relationship)({
      ref: "Payment.captures"
    }),
    metadata: (0, import_fields8.json)(),
    createdBy: (0, import_fields8.text)(),
    ...trackingFields
  }
});

// features/keystone/models/Cart.ts
var import_core6 = require("@keystone-6/core");
var import_fields9 = require("@keystone-6/core/fields");
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
  let totalDiscountAmount = 0;
  for (const discount of cart.discounts) {
    if (!discount.discountRule?.type) continue;
    const { type, value, allocation } = discount.discountRule;
    const conditions = discount.discountRule.discountConditions || [];
    const currencyMultiplier = cart.region?.currency?.noDivisionCurrency ? 1 : 100;
    const eligibleLineItems = [];
    for (const lineItem of cart.lineItems || []) {
      if (lineItem.productVariant?.product?.discountable === false) {
        continue;
      }
      const product = lineItem.productVariant?.product;
      if (!product) continue;
      const isEligible = validateProductAgainstConditions(product, conditions);
      if (isEligible) {
        eligibleLineItems.push(lineItem);
      }
    }
    if (eligibleLineItems.length === 0 && type !== "free_shipping") {
      continue;
    }
    let eligibleSubtotal = 0;
    for (const lineItem of eligibleLineItems) {
      const prices = await sudoContext.query.MoneyAmount.findMany({
        where: {
          productVariant: { id: { equals: lineItem.productVariant.id } },
          region: { id: { equals: cart.region?.id } },
          currency: { code: { equals: cart.region?.currency?.code } }
        },
        query: "calculatedPrice { calculatedAmount }"
      });
      const price = prices[0]?.calculatedPrice?.calculatedAmount || 0;
      eligibleSubtotal += price * lineItem.quantity;
    }
    switch (type) {
      case "percentage":
        totalDiscountAmount += eligibleSubtotal * (value / 100);
        break;
      case "fixed":
        if (allocation === "item") {
          const eligibleQuantity = eligibleLineItems.reduce((sum, li) => sum + li.quantity, 0);
          totalDiscountAmount += value * currencyMultiplier * eligibleQuantity;
        } else {
          totalDiscountAmount += value * currencyMultiplier;
        }
        break;
      case "free_shipping":
        totalDiscountAmount += cart.shippingMethods?.reduce(
          (total, method) => total + (method.price || 0),
          0
        ) || 0;
        break;
    }
  }
  const subtotal = await calculateCartSubtotal(cart, context);
  return Math.min(totalDiscountAmount, subtotal);
}
function validateProductAgainstConditions(product, conditions) {
  const productConditions = conditions.filter(
    (c) => c.type === "products" || c.type === "product_types" || c.type === "product_collections" || c.type === "product_tags"
  );
  if (productConditions.length === 0) {
    return true;
  }
  for (const condition of productConditions) {
    const { type, operator } = condition;
    let conditionEntityIds = [];
    let productEntityIds = [];
    switch (type) {
      case "products":
        conditionEntityIds = condition.products?.map((p) => p.id) || [];
        productEntityIds = [product.id];
        break;
      case "product_types":
        conditionEntityIds = condition.productTypes?.map((t) => t.id) || [];
        productEntityIds = product.productType ? [product.productType.id] : [];
        break;
      case "product_collections":
        conditionEntityIds = condition.productCollections?.map((c) => c.id) || [];
        productEntityIds = product.productCollections?.map((c) => c.id) || [];
        break;
      case "product_tags":
        conditionEntityIds = condition.productTags?.map((t) => t.id) || [];
        productEntityIds = product.productTags?.map((t) => t.id) || [];
        break;
      default:
        continue;
    }
    if (conditionEntityIds.length === 0) {
      continue;
    }
    const hasMatch = productEntityIds.some((id) => conditionEntityIds.includes(id));
    if (operator === "in" && !hasMatch) {
      return false;
    }
    if (operator === "not_in" && hasMatch) {
      return false;
    }
  }
  return true;
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
var Cart = (0, import_core6.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }) || Boolean(session?.customerToken),
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
      if (operation === "create" && !permissions.canManageOrders({ session: context.session })) {
        const allowedCreateFields = /* @__PURE__ */ new Set([
          "region",
          "type",
          ...context.session?.customerToken ? ["idempotencyKey"] : []
        ]);
        for (const key of Object.keys(resolvedData)) {
          if (!allowedCreateFields.has(key)) delete resolvedData[key];
        }
        resolvedData.type = "default";
      }
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
    email: (0, import_fields9.text)(),
    type: (0, import_fields9.select)({
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
    metadata: (0, import_fields9.json)(),
    idempotencyKey: (0, import_fields9.text)({
      isIndexed: "unique",
      db: { isNullable: true },
      ui: { itemView: { fieldMode: "read" } }
    }),
    context: (0, import_fields9.json)(),
    paymentAuthorizedAt: (0, import_fields9.timestamp)(),
    abandonedEmailSent: (0, import_fields9.checkbox)({ defaultValue: false }),
    // Track if abandoned cart email was sent
    user: (0, import_fields9.relationship)({
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
    region: (0, import_fields9.relationship)({
      ref: "Region.carts"
    }),
    addresses: (0, import_fields9.relationship)({
      ref: "Address.cart",
      many: true
    }),
    discounts: (0, import_fields9.relationship)({
      ref: "Discount.carts",
      many: true
    }),
    giftCards: (0, import_fields9.relationship)({
      ref: "GiftCard.carts",
      many: true
    }),
    draftOrder: (0, import_fields9.relationship)({
      ref: "DraftOrder.cart"
    }),
    order: (0, import_fields9.relationship)({
      ref: "Order.cart"
    }),
    lineItems: (0, import_fields9.relationship)({
      ref: "LineItem.cart",
      many: true
    }),
    customShippingOptions: (0, import_fields9.relationship)({
      ref: "CustomShippingOption.cart",
      many: true
    }),
    swap: (0, import_fields9.relationship)({
      ref: "Swap.cart"
    }),
    shippingMethods: (0, import_fields9.relationship)({
      ref: "ShippingMethod.cart",
      many: true
    }),
    payment: (0, import_fields9.relationship)({
      ref: "Payment.cart"
    }),
    paymentCollection: (0, import_fields9.relationship)({
      ref: "PaymentCollection.cart"
    }),
    billingAddress: (0, import_fields9.relationship)({
      ref: "Address.cartsUsingAsBillingAddress",
      many: false
    }),
    shippingAddress: (0, import_fields9.relationship)({
      ref: "Address.cartsUsingAsShippingAddress",
      many: false
    }),
    ...(0, import_core6.group)({
      label: "Virtual Fields",
      description: "Calculated fields for cart display and totals",
      fields: {
        abandonedFor: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.Int,
            resolve(item) {
              if (!item.updatedAt) return 0;
              const lastActivity = new Date(item.updatedAt).getTime();
              return Math.floor((Date.now() - lastActivity) / (1e3 * 60));
            }
          })
        }),
        status: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.enum({
              name: "CartStatus",
              values: import_core6.graphql.enumValues(["ACTIVE", "COMPLETED"])
            }),
            resolve(item) {
              return item.order ? "COMPLETED" : "ACTIVE";
            }
          })
        }),
        isActive: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.Boolean,
            resolve(item) {
              return !item.order;
            }
          })
        }),
        subtotal: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
        total: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
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
        rawTotal: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.Int,
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
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
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
        rawSubtotal: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
        rawTotalBreakdown: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
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
        discount: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
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
        giftCardTotal: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
        tax: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
                      }
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
        shipping: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
        cheapestShipping: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
        discountsById: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.JSON,
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
                      product {
                        id
                        discountable
                        productType { id }
                        productCollections { id }
                        productTags { id }
                      }
                    }
                  }
                  discounts {
                    id
                    discountRule {
                      type
                      value
                      allocation
                      discountConditions {
                        id
                        type
                        operator
                        products { id }
                        productTypes { id }
                        productCollections { id }
                        productTags { id }
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
        checkoutStep: (0, import_fields9.virtual)({
          field: import_core6.graphql.field({
            type: import_core6.graphql.String,
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
var import_core7 = require("@keystone-6/core");
var import_fields10 = require("@keystone-6/core/fields");
var ClaimImage = (0, import_core7.list)({
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
    image: (0, import_fields10.image)({ storage: "my_images" }),
    url: (0, import_fields10.text)({
      label: "Image URL",
      ui: {
        description: "Direct URL to the image file"
      }
    }),
    altText: (0, import_fields10.text)(),
    claimItem: (0, import_fields10.relationship)({ ref: "ClaimItem.claimImages" }),
    metadata: (0, import_fields10.json)(),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ["image", "altText", "product"]
    }
  }
});

// features/keystone/models/ClaimItem.ts
var import_core8 = require("@keystone-6/core");
var import_fields11 = require("@keystone-6/core/fields");
var ClaimItem = (0, import_core8.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    reason: (0, import_fields11.select)({
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
    note: (0, import_fields11.text)(),
    quantity: (0, import_fields11.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields11.json)(),
    productVariant: (0, import_fields11.relationship)({
      ref: "ProductVariant.claimItems"
    }),
    lineItem: (0, import_fields11.relationship)({
      ref: "LineItem.claimItems"
    }),
    claimOrder: (0, import_fields11.relationship)({
      ref: "ClaimOrder.claimItems"
    }),
    claimImages: (0, import_fields11.relationship)({
      ref: "ClaimImage.claimItem",
      many: true
    }),
    claimTags: (0, import_fields11.relationship)({
      ref: "ClaimTag.claimItems",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ClaimOrder.ts
var import_core9 = require("@keystone-6/core");
var import_fields12 = require("@keystone-6/core/fields");
var ClaimOrder = (0, import_core9.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    paymentStatus: (0, import_fields12.select)({
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
    fulfillmentStatus: (0, import_fields12.select)({
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
    type: (0, import_fields12.select)({
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
    refundAmount: (0, import_fields12.integer)(),
    canceledAt: (0, import_fields12.timestamp)(),
    metadata: (0, import_fields12.json)(),
    idempotencyKey: (0, import_fields12.text)(),
    noNotification: (0, import_fields12.checkbox)(),
    address: (0, import_fields12.relationship)({
      ref: "Address.claimOrders"
    }),
    order: (0, import_fields12.relationship)({
      ref: "Order.claimOrders"
    }),
    claimItems: (0, import_fields12.relationship)({
      ref: "ClaimItem.claimOrder",
      many: true
    }),
    fulfillments: (0, import_fields12.relationship)({
      ref: "Fulfillment.claimOrder",
      many: true
    }),
    lineItems: (0, import_fields12.relationship)({
      ref: "LineItem.claimOrder",
      many: true
    }),
    return: (0, import_fields12.relationship)({
      ref: "Return.claimOrder"
    }),
    shippingMethods: (0, import_fields12.relationship)({
      ref: "ShippingMethod.claimOrder",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ClaimTag.ts
var import_core10 = require("@keystone-6/core");
var import_fields13 = require("@keystone-6/core/fields");
var ClaimTag = (0, import_core10.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    value: (0, import_fields13.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields13.text)(),
    metadata: (0, import_fields13.json)(),
    claimItems: (0, import_fields13.relationship)({
      ref: "ClaimItem.claimTags",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Country.ts
var import_core11 = require("@keystone-6/core");
var import_fields14 = require("@keystone-6/core/fields");
var Country = (0, import_core11.list)({
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
    iso2: (0, import_fields14.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    iso3: (0, import_fields14.text)({
      validation: {
        isRequired: true
      }
    }),
    numCode: (0, import_fields14.integer)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields14.text)({
      validation: {
        isRequired: true
      }
    }),
    displayName: (0, import_fields14.text)({
      validation: {
        isRequired: true
      }
    }),
    region: (0, import_fields14.relationship)({
      ref: "Region.countries"
    }),
    addresses: (0, import_fields14.relationship)({
      ref: "Address.country",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Currency.ts
var import_core12 = require("@keystone-6/core");
var import_fields15 = require("@keystone-6/core/fields");
var NO_DIVISION_CURRENCIES3 = ["jpy", "krw", "vnd"];
var Currency = (0, import_core12.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    code: (0, import_fields15.text)({
      isIndexed: "unique",
      validation: { isRequired: true }
    }),
    symbol: (0, import_fields15.text)({
      validation: { isRequired: true }
    }),
    symbolNative: (0, import_fields15.text)({
      validation: { isRequired: true }
    }),
    name: (0, import_fields15.text)({
      validation: { isRequired: true }
    }),
    moneyAmounts: (0, import_fields15.relationship)({
      ref: "MoneyAmount.currency",
      many: true
    }),
    orders: (0, import_fields15.relationship)({
      ref: "Order.currency",
      many: true
    }),
    payments: (0, import_fields15.relationship)({
      ref: "Payment.currency",
      many: true
    }),
    regions: (0, import_fields15.relationship)({
      ref: "Region.currency",
      many: true
    }),
    stores: (0, import_fields15.relationship)({
      ref: "Store.currencies",
      many: true
    }),
    accounts: (0, import_fields15.relationship)({
      ref: "Account.currency",
      many: true
    }),
    invoices: (0, import_fields15.relationship)({
      ref: "Invoice.currency",
      many: true
    }),
    ...(0, import_core12.group)({
      label: "Virtual Fields",
      description: "Virtual fields for currency",
      fields: {
        noDivisionCurrency: (0, import_fields15.virtual)({
          field: import_core12.graphql.field({
            type: import_core12.graphql.Boolean,
            resolve(item) {
              return NO_DIVISION_CURRENCIES3.includes(item.code.toLowerCase());
            }
          })
        })
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/CustomerGroup.ts
var import_core13 = require("@keystone-6/core");
var import_fields16 = require("@keystone-6/core/fields");
var CustomerGroup = (0, import_core13.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    name: (0, import_fields16.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields16.json)(),
    users: (0, import_fields16.relationship)({
      ref: "User.customerGroups",
      many: true
    }),
    discountConditions: (0, import_fields16.relationship)({
      ref: "DiscountCondition.customerGroups",
      many: true
    }),
    priceLists: (0, import_fields16.relationship)({
      ref: "PriceList.customerGroups",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/CustomShippingOption.ts
var import_core14 = require("@keystone-6/core");
var import_fields17 = require("@keystone-6/core/fields");
var CustomShippingOption = (0, import_core14.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    price: (0, import_fields17.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields17.json)(),
    shippingOption: (0, import_fields17.relationship)({
      ref: "ShippingOption.customShippingOptions"
    }),
    cart: (0, import_fields17.relationship)({
      ref: "Cart.customShippingOptions"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Discount.ts
var import_core15 = require("@keystone-6/core");
var import_fields18 = require("@keystone-6/core/fields");
var Discount = (0, import_core15.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    code: (0, import_fields18.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    isDynamic: (0, import_fields18.checkbox)(),
    isDisabled: (0, import_fields18.checkbox)(),
    stackable: (0, import_fields18.checkbox)({
      defaultValue: false
    }),
    startsAt: (0, import_fields18.timestamp)({
      defaultValue: { kind: "now" },
      validation: {
        isRequired: true
      }
    }),
    endsAt: (0, import_fields18.timestamp)({
      validation: {
        isRequired: false
      }
    }),
    metadata: (0, import_fields18.json)(),
    usageLimit: (0, import_fields18.integer)(),
    usageCount: (0, import_fields18.integer)({
      defaultValue: 0,
      validation: {
        isRequired: true
      }
    }),
    validDuration: (0, import_fields18.text)(),
    discountRule: (0, import_fields18.relationship)({
      ref: "DiscountRule.discounts"
    }),
    carts: (0, import_fields18.relationship)({
      ref: "Cart.discounts",
      many: true
    }),
    lineItemAdjustments: (0, import_fields18.relationship)({
      ref: "LineItemAdjustment.discount",
      many: true
    }),
    regions: (0, import_fields18.relationship)({
      ref: "Region.discounts",
      many: true
    }),
    orders: (0, import_fields18.relationship)({
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
var import_core16 = require("@keystone-6/core");
var import_fields19 = require("@keystone-6/core/fields");
var DiscountCondition = (0, import_core16.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    type: (0, import_fields19.select)({
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
    operator: (0, import_fields19.select)({
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
    metadata: (0, import_fields19.json)(),
    discountRule: (0, import_fields19.relationship)({
      ref: "DiscountRule.discountConditions"
    }),
    customerGroups: (0, import_fields19.relationship)({
      ref: "CustomerGroup.discountConditions",
      many: true
    }),
    products: (0, import_fields19.relationship)({
      ref: "Product.discountConditions",
      many: true
    }),
    productCollections: (0, import_fields19.relationship)({
      ref: "ProductCollection.discountConditions",
      many: true
    }),
    productCategories: (0, import_fields19.relationship)({
      ref: "ProductCategory.discountConditions",
      many: true
    }),
    productTags: (0, import_fields19.relationship)({
      ref: "ProductTag.discountConditions",
      many: true
    }),
    productTypes: (0, import_fields19.relationship)({
      ref: "ProductType.discountConditions",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/DiscountRule.ts
var import_core17 = require("@keystone-6/core");
var import_fields20 = require("@keystone-6/core/fields");
var DiscountRule = (0, import_core17.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    description: (0, import_fields20.text)(),
    type: (0, import_fields20.select)({
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
    value: (0, import_fields20.integer)({
      validation: {
        isRequired: true
      }
    }),
    allocation: (0, import_fields20.select)({
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
    metadata: (0, import_fields20.json)(),
    discounts: (0, import_fields20.relationship)({
      ref: "Discount.discountRule",
      many: true
    }),
    discountConditions: (0, import_fields20.relationship)({
      ref: "DiscountCondition.discountRule",
      many: true
    }),
    products: (0, import_fields20.relationship)({
      ref: "Product.discountRules",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/DraftOrder.ts
var import_core18 = require("@keystone-6/core");
var import_fields21 = require("@keystone-6/core/fields");
var DraftOrder = (0, import_core18.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    status: (0, import_fields21.select)({
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
    displayId: (0, import_fields21.integer)({
      validation: {
        isRequired: true
      }
    }),
    canceledAt: (0, import_fields21.timestamp)(),
    completedAt: (0, import_fields21.timestamp)(),
    metadata: (0, import_fields21.json)(),
    idempotencyKey: (0, import_fields21.text)(),
    noNotificationOrder: (0, import_fields21.checkbox)(),
    cart: (0, import_fields21.relationship)({
      ref: "Cart.draftOrder"
    }),
    order: (0, import_fields21.relationship)({
      ref: "Order.draftOrder"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Fulfillment.ts
var import_core19 = require("@keystone-6/core");
var import_fields22 = require("@keystone-6/core/fields");
var Fulfillment = (0, import_core19.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    // Status fields
    shippedAt: (0, import_fields22.timestamp)(),
    canceledAt: (0, import_fields22.timestamp)(),
    // Data fields
    data: (0, import_fields22.json)(),
    metadata: (0, import_fields22.json)(),
    idempotencyKey: (0, import_fields22.text)(),
    noNotification: (0, import_fields22.checkbox)({
      defaultValue: false
    }),
    // Relationships
    order: (0, import_fields22.relationship)({
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
    claimOrder: (0, import_fields22.relationship)({
      ref: "ClaimOrder.fulfillments",
      many: false
    }),
    swap: (0, import_fields22.relationship)({
      ref: "Swap.fulfillments",
      many: false
    }),
    fulfillmentProvider: (0, import_fields22.relationship)({
      ref: "FulfillmentProvider.fulfillments",
      many: false,
      validation: { isRequired: true }
    }),
    fulfillmentItems: (0, import_fields22.relationship)({
      ref: "FulfillmentItem.fulfillment",
      many: true
    }),
    shippingLabels: (0, import_fields22.relationship)({
      ref: "ShippingLabel.fulfillment",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/FulfillmentItem.ts
var import_core20 = require("@keystone-6/core");
var import_fields23 = require("@keystone-6/core/fields");
var FulfillmentItem = (0, import_core20.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    quantity: (0, import_fields23.integer)({
      validation: {
        isRequired: true
      }
    }),
    fulfillment: (0, import_fields23.relationship)({
      ref: "Fulfillment.fulfillmentItems",
      many: false,
      validation: { isRequired: true }
    }),
    lineItem: (0, import_fields23.relationship)({
      ref: "OrderLineItem.fulfillmentItems",
      many: false,
      validation: { isRequired: true }
    }),
    ...trackingFields
  }
});

// features/keystone/models/FulfillmentProvider.ts
var import_core21 = require("@keystone-6/core");
var import_fields24 = require("@keystone-6/core/fields");
var FulfillmentProvider = (0, import_core21.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: permissions.canManageFulfillments,
      update: permissions.canManageFulfillments,
      delete: permissions.canManageFulfillments
    }
  },
  fields: {
    name: (0, import_fields24.text)({
      validation: { isRequired: true }
    }),
    code: (0, import_fields24.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true,
        match: {
          regex: /^fp_[a-zA-Z0-9-_]+$/,
          explanation: 'Code must start with "fp_" followed by letters, numbers, hyphens or underscores'
        }
      }
    }),
    isInstalled: (0, import_fields24.checkbox)({
      defaultValue: true
    }),
    credentials: (0, import_fields24.json)({
      ui: {
        itemView: { fieldMode: "hidden" }
      }
    }),
    metadata: (0, import_fields24.json)(),
    // Relationships
    fulfillments: (0, import_fields24.relationship)({
      ref: "Fulfillment.fulfillmentProvider",
      many: true
    }),
    regions: (0, import_fields24.relationship)({
      ref: "Region.fulfillmentProviders",
      many: true
    }),
    shippingOptions: (0, import_fields24.relationship)({
      ref: "ShippingOption.fulfillmentProvider",
      many: true
    }),
    shippingProviders: (0, import_fields24.relationship)({
      ref: "ShippingProvider.fulfillmentProvider",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/GiftCard.ts
var import_core22 = require("@keystone-6/core");
var import_fields25 = require("@keystone-6/core/fields");
var GiftCard = (0, import_core22.list)({
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
    code: (0, import_fields25.text)({
      validation: {
        isRequired: true
      },
      isIndexed: "unique"
    }),
    value: (0, import_fields25.integer)({
      validation: {
        isRequired: true
      }
    }),
    balance: (0, import_fields25.integer)({
      validation: {
        isRequired: true
      }
    }),
    isDisabled: (0, import_fields25.checkbox)(),
    endsAt: (0, import_fields25.timestamp)(),
    metadata: (0, import_fields25.json)(),
    order: (0, import_fields25.relationship)({
      ref: "Order.giftCards"
    }),
    carts: (0, import_fields25.relationship)({
      ref: "Cart.giftCards",
      many: true
    }),
    giftCardTransactions: (0, import_fields25.relationship)({
      ref: "GiftCardTransaction.giftCard",
      many: true
    }),
    region: (0, import_fields25.relationship)({
      ref: "Region.giftCards"
    }),
    ...trackingFields
  }
});

// features/keystone/models/GiftCardTransaction.ts
var import_core23 = require("@keystone-6/core");
var import_fields26 = require("@keystone-6/core/fields");
var GiftCardTransaction = (0, import_core23.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadGiftCards({ session }) || permissions.canManageGiftCards({ session }),
      create: permissions.canManageGiftCards,
      update: permissions.canManageGiftCards,
      delete: permissions.canManageGiftCards
    }
  },
  fields: {
    amount: (0, import_fields26.integer)({
      validation: {
        isRequired: true
      }
    }),
    isTaxable: (0, import_fields26.checkbox)(),
    taxRate: (0, import_fields26.float)(),
    giftCard: (0, import_fields26.relationship)({
      ref: "GiftCard.giftCardTransactions"
    }),
    order: (0, import_fields26.relationship)({
      ref: "Order.giftCardTransactions"
    }),
    ...trackingFields
  }
});

// features/keystone/models/IdempotencyKey.ts
var import_core24 = require("@keystone-6/core");
var import_fields27 = require("@keystone-6/core/fields");
var IdempotencyKey = (0, import_core24.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadIdempotencyKeys({ session }) || permissions.canManageIdempotencyKeys({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    idempotencyKey: (0, import_fields27.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    requestMethod: (0, import_fields27.text)(),
    requestParams: (0, import_fields27.json)(),
    requestPath: (0, import_fields27.text)(),
    responseCode: (0, import_fields27.integer)(),
    responseBody: (0, import_fields27.json)(),
    recoveryPoint: (0, import_fields27.text)({
      defaultValue: "started",
      validation: {
        isRequired: true
      }
    }),
    lockedAt: (0, import_fields27.timestamp)(),
    ...trackingFields
  }
});

// features/keystone/models/Invite.ts
var import_core25 = require("@keystone-6/core");
var import_fields28 = require("@keystone-6/core/fields");
var Invite = (0, import_core25.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    userEmail: (0, import_fields28.text)({
      validation: {
        isRequired: true
      }
    }),
    role: (0, import_fields28.select)({
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
    accepted: (0, import_fields28.checkbox)(),
    metadata: (0, import_fields28.json)(),
    token: (0, import_fields28.text)({
      validation: {
        isRequired: true
      }
    }),
    expiresAt: (0, import_fields28.timestamp)({
      defaultValue: { kind: "now" },
      validation: {
        isRequired: true
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/Account.ts
var import_core26 = require("@keystone-6/core");
var import_fields29 = require("@keystone-6/core/fields");
var Account = (0, import_core26.list)({
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
    user: (0, import_fields29.relationship)({
      ref: "User.accounts",
      many: false,
      validation: { isRequired: true }
    }),
    accountNumber: (0, import_fields29.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    title: (0, import_fields29.text)({
      validation: { isRequired: true },
      defaultValue: "Business Account"
    }),
    description: (0, import_fields29.text)({
      ui: { displayMode: "textarea" },
      defaultValue: "Running business account for automated orders placed through API integration"
    }),
    // Financial fields (amounts in cents)
    totalAmount: (0, import_fields29.integer)({
      defaultValue: 0
    }),
    paidAmount: (0, import_fields29.integer)({
      defaultValue: 0
    }),
    creditLimit: (0, import_fields29.integer)({
      validation: { isRequired: true },
      defaultValue: 1e5
      // $1000 default
    }),
    currency: (0, import_fields29.relationship)({
      ref: "Currency.accounts",
      many: false,
      validation: { isRequired: true }
    }),
    // Status and dates
    status: (0, import_fields29.select)({
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
    dueDate: (0, import_fields29.timestamp)(),
    paidAt: (0, import_fields29.timestamp)(),
    suspendedAt: (0, import_fields29.timestamp)(),
    notApprovedAt: (0, import_fields29.timestamp)(),
    // Account type
    accountType: (0, import_fields29.select)({
      options: [
        { label: "Business", value: "business" },
        { label: "Personal", value: "personal" }
      ],
      defaultValue: "business",
      validation: { isRequired: true }
    }),
    // Metadata for additional context
    metadata: (0, import_fields29.json)({
      defaultValue: {}
    }),
    // Relationships
    orders: (0, import_fields29.relationship)({
      ref: "Order.account",
      many: true
    }),
    lineItems: (0, import_fields29.relationship)({
      ref: "AccountLineItem.account",
      many: true
    }),
    invoices: (0, import_fields29.relationship)({
      ref: "Invoice.account",
      many: true
    }),
    // Virtual computed fields
    ...(0, import_core26.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for account display",
      fields: {
        balanceDue: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.Int,
            resolve(item) {
              return (item.totalAmount || 0) - (item.paidAmount || 0);
            }
          })
        }),
        formattedTotal: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
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
        formattedCreditLimit: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
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
        availableCredit: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.Int,
            resolve(item) {
              const used = (item.totalAmount || 0) - (item.paidAmount || 0);
              return Math.max(0, (item.creditLimit || 0) - used);
            }
          })
        }),
        // New currency-aware fields for multi-region support
        totalOwedInAccountCurrency: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.Int,
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
        availableCreditInAccountCurrency: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.Int,
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
        formattedTotalOwedInAccountCurrency: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
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
        formattedAvailableCreditInAccountCurrency: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
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
        // Proper current balance calculated from unpaid line items (same logic as unpaidLineItemsByRegion)
        formattedCurrentBalance: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.String,
            async resolve(item, args, context) {
              const account = await context.sudo().query.Account.findOne({
                where: { id: item.id },
                query: `
                  currency {
                    code
                    symbol
                    noDivisionCurrency
                  }
                `
              });
              if (!account?.currency) return "$0.00";
              const unpaidLineItems = await context.sudo().query.AccountLineItem.findMany({
                where: {
                  account: { id: { equals: item.id } },
                  paymentStatus: { equals: "unpaid" }
                },
                query: `
                  amount
                  region {
                    currency {
                      code
                      noDivisionCurrency
                    }
                  }
                `
              });
              if (unpaidLineItems.length === 0) {
                return "$0.00";
              }
              let totalUnpaidAmount = 0;
              for (const lineItem of unpaidLineItems) {
                totalUnpaidAmount += lineItem.amount || 0;
              }
              const divisor = account.currency.noDivisionCurrency ? 1 : 100;
              const balance = totalUnpaidAmount / divisor;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency.code
              }).format(balance);
            }
          })
        }),
        unpaidLineItemsByRegion: (0, import_fields29.virtual)({
          field: import_core26.graphql.field({
            type: import_core26.graphql.JSON,
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
                    // This will count unique orders
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
                acc[regionId].itemCount += 1;
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
        const timestamp28 = Date.now();
        resolvedData.accountNumber = `ACC-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(timestamp28).slice(-6)}`;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/AccountLineItem.ts
var import_core27 = require("@keystone-6/core");
var import_fields30 = require("@keystone-6/core/fields");
var AccountLineItem = (0, import_core27.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    // Core relationships
    account: (0, import_fields30.relationship)({
      ref: "Account.lineItems",
      many: false,
      validation: { isRequired: true }
    }),
    order: (0, import_fields30.relationship)({
      ref: "Order.accountLineItems",
      many: false,
      validation: { isRequired: true }
    }),
    orderKey: (0, import_fields30.text)({
      isIndexed: "unique",
      db: { isNullable: true },
      ui: { itemView: { fieldMode: "read" }, createView: { fieldMode: "hidden" } }
    }),
    region: (0, import_fields30.relationship)({
      ref: "Region.accountLineItems",
      many: false
    }),
    // Line item details
    description: (0, import_fields30.text)({
      validation: { isRequired: true },
      defaultValue: "Order line item"
    }),
    amount: (0, import_fields30.integer)({
      validation: { isRequired: true },
      label: "Amount (in cents)"
    }),
    orderDisplayId: (0, import_fields30.text)({
      validation: { isRequired: true },
      isIndexed: true
    }),
    itemCount: (0, import_fields30.integer)({
      validation: { isRequired: true },
      defaultValue: 0
    }),
    paymentStatus: (0, import_fields30.select)({
      options: [
        { label: "Unpaid", value: "unpaid" },
        { label: "Paid", value: "paid" },
        { label: "Canceled", value: "canceled" }
      ],
      defaultValue: "unpaid",
      validation: { isRequired: true }
    }),
    // Junction relationship to track which invoices paid this item
    invoiceLineItems: (0, import_fields30.relationship)({
      ref: "InvoiceLineItem.accountLineItem",
      many: true
    }),
    // Virtual computed fields
    ...(0, import_core27.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for line item display",
      fields: {
        formattedAmount: (0, import_fields30.virtual)({
          field: import_core27.graphql.field({
            type: import_core27.graphql.String,
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
        orderDetails: (0, import_fields30.virtual)({
          field: import_core27.graphql.field({
            type: import_core27.graphql.JSON,
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
        }),
        paidAt: (0, import_fields30.virtual)({
          field: import_core27.graphql.field({
            type: import_core27.graphql.String,
            async resolve(item, args, context) {
              try {
                const lineItem = await context.sudo().query.AccountLineItem.findOne({
                  where: { id: item.id },
                  query: `
                    paymentStatus
                    invoiceLineItems {
                      invoice {
                        paidAt
                        status
                      }
                    }
                  `
                });
                if (lineItem?.paymentStatus !== "paid") {
                  return null;
                }
                const paidInvoices = lineItem?.invoiceLineItems?.map((ili) => ili.invoice)?.filter((invoice) => invoice?.status === "paid" && invoice?.paidAt);
                if (paidInvoices && paidInvoices.length > 0) {
                  const mostRecentPaidAt = paidInvoices.map((inv) => new Date(inv.paidAt)).sort((a, b) => b.getTime() - a.getTime())[0];
                  return mostRecentPaidAt.toISOString();
                }
                return null;
              } catch (error) {
                console.error("Error resolving AccountLineItem paidAt:", error);
                return null;
              }
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
var import_core28 = require("@keystone-6/core");
var import_fields31 = require("@keystone-6/core/fields");
var Invoice = (0, import_core28.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    // Core invoice data
    user: (0, import_fields31.relationship)({
      ref: "User.invoices",
      many: false,
      validation: { isRequired: true }
    }),
    invoiceNumber: (0, import_fields31.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    title: (0, import_fields31.text)({
      validation: { isRequired: true },
      defaultValue: "Payment Invoice"
    }),
    description: (0, import_fields31.text)({
      ui: { displayMode: "textarea" },
      defaultValue: "Invoice for selected orders payment"
    }),
    // Financial fields (amounts in cents)
    totalAmount: (0, import_fields31.integer)({
      validation: { isRequired: true },
      defaultValue: 0
    }),
    currency: (0, import_fields31.relationship)({
      ref: "Currency.invoices",
      many: false,
      validation: { isRequired: true }
    }),
    // Status and dates
    status: (0, import_fields31.select)({
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
    dueDate: (0, import_fields31.timestamp)(),
    paidAt: (0, import_fields31.timestamp)({
      defaultValue: { kind: "now" }
      // Default to now since most are paid immediately
    }),
    // Metadata for payment details
    metadata: (0, import_fields31.json)({
      defaultValue: {}
    }),
    // Relationships
    account: (0, import_fields31.relationship)({
      ref: "Account.invoices",
      many: false,
      validation: { isRequired: true }
    }),
    lineItems: (0, import_fields31.relationship)({
      ref: "InvoiceLineItem.invoice",
      many: true
    }),
    paymentCollection: (0, import_fields31.relationship)({
      ref: "PaymentCollection.invoice",
      db: { foreignKey: true }
    }),
    // Virtual computed fields
    ...(0, import_core28.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for invoice display",
      fields: {
        formattedTotal: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.String,
            async resolve(item, args, context) {
              try {
                let currency = item.currency;
                if (!currency && item.currencyId) {
                  const invoice = await context.sudo().query.Invoice.findOne({
                    where: { id: item.id },
                    query: `
                      currency {
                        id
                        code
                        symbol
                        noDivisionCurrency
                      }
                    `
                  });
                  currency = invoice?.currency;
                }
                if (!currency || !item.totalAmount) {
                  return "$0.00";
                }
                const divisor = currency.noDivisionCurrency ? 1 : 100;
                const amount = (item.totalAmount || 0) / divisor;
                return new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: currency.code
                }).format(amount);
              } catch (error) {
                return "$0.00";
              }
            }
          })
        }),
        itemCount: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.Int,
            async resolve(item, args, context) {
              try {
                if (item.lineItems && Array.isArray(item.lineItems)) {
                  return item.lineItems.length;
                }
                const invoice = await context.sudo().query.Invoice.findOne({
                  where: { id: item.id },
                  query: `
                    lineItems {
                      id
                    }
                  `
                });
                return invoice?.lineItems?.length || 0;
              } catch (error) {
                return 0;
              }
            }
          })
        }),
        paymentSessions: (0, import_fields31.virtual)({
          field: import_core28.graphql.field({
            type: import_core28.graphql.list(import_core28.graphql.nonNull(import_core28.graphql.JSON)),
            async resolve(item, args, context) {
              try {
                if (item.paymentCollection?.paymentSessions && Array.isArray(item.paymentCollection.paymentSessions)) {
                  return item.paymentCollection.paymentSessions;
                }
                const invoice = await context.sudo().query.Invoice.findOne({
                  where: { id: item.id },
                  query: `
                    paymentCollection {
                      id
                      paymentSessions {
                        id
                        paymentProvider {
                          id
                          code
                        }
                        data
                        isSelected
                        isInitiated
                        amount
                      }
                    }
                  `
                });
                return invoice?.paymentCollection?.paymentSessions || [];
              } catch (error) {
                return [];
              }
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
        const timestamp28 = Date.now();
        resolvedData.invoiceNumber = `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(timestamp28).slice(-6)}`;
      }
      return resolvedData;
    }
  }
});

// features/keystone/models/InvoiceLineItem.ts
var import_core29 = require("@keystone-6/core");
var import_fields32 = require("@keystone-6/core/fields");
var InvoiceLineItem = (0, import_core29.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    // Junction table relationships
    invoice: (0, import_fields32.relationship)({
      ref: "Invoice.lineItems",
      many: false,
      validation: { isRequired: true }
    }),
    accountLineItem: (0, import_fields32.relationship)({
      ref: "AccountLineItem.invoiceLineItems",
      many: false,
      validation: { isRequired: true }
    }),
    // Virtual computed fields
    ...(0, import_core29.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields from related account line item",
      fields: {
        orderDisplayId: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
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
        formattedAmount: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.String,
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
        orderDetails: (0, import_fields32.virtual)({
          field: import_core29.graphql.field({
            type: import_core29.graphql.JSON,
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
var import_core30 = require("@keystone-6/core");
var import_fields33 = require("@keystone-6/core/fields");
var BusinessAccountRequest = (0, import_core30.list)({
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
    user: (0, import_fields33.relationship)({
      ref: "User.businessAccountRequest",
      many: false
    }),
    // Request details
    businessName: (0, import_fields33.text)({
      validation: { isRequired: true }
    }),
    businessType: (0, import_fields33.select)({
      options: [
        { label: "Wholesale Partner", value: "wholesale" },
        { label: "Distribution Channel", value: "distribution" },
        { label: "Authorized Reseller", value: "reseller" },
        { label: "B2B Platform", value: "b2b_platform" },
        { label: "Other", value: "other" }
      ],
      validation: { isRequired: true }
    }),
    monthlyOrderVolume: (0, import_fields33.select)({
      options: [
        { label: "1-50 orders/month", value: "low" },
        { label: "51-200 orders/month", value: "medium" },
        { label: "201-1000 orders/month", value: "high" },
        { label: "1000+ orders/month", value: "enterprise" }
      ],
      validation: { isRequired: true }
    }),
    requestedCreditLimit: (0, import_fields33.integer)({
      validation: { isRequired: true },
      label: "Requested Credit Limit (in cents)"
    }),
    businessDescription: (0, import_fields33.text)({
      ui: { displayMode: "textarea" },
      validation: { isRequired: true }
    }),
    // Status tracking
    status: (0, import_fields33.select)({
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
    reviewedBy: (0, import_fields33.relationship)({
      ref: "User",
      many: false,
      label: "Reviewed By Admin"
    }),
    reviewNotes: (0, import_fields33.text)({
      ui: { displayMode: "textarea" },
      label: "Admin Review Notes"
    }),
    approvedCreditLimit: (0, import_fields33.integer)({
      label: "Approved Credit Limit (in cents)"
    }),
    // Timestamps
    submittedAt: (0, import_fields33.timestamp)({
      defaultValue: { kind: "now" },
      validation: { isRequired: true }
    }),
    reviewedAt: (0, import_fields33.timestamp)(),
    // Generated account (once approved)
    generatedAccount: (0, import_fields33.relationship)({
      ref: "Account",
      many: false,
      label: "Generated Account"
    }),
    // Virtual computed fields
    ...(0, import_core30.group)({
      label: "Computed Fields",
      description: "Auto-calculated fields for request display",
      fields: {
        formattedRequestedCredit: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            resolve(item) {
              const amount = Number(item.requestedCreditLimit || 0) / 100;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(amount);
            }
          })
        }),
        formattedApprovedCredit: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
            resolve(item) {
              if (!item.approvedCreditLimit) return null;
              const amount = Number(item.approvedCreditLimit || 0) / 100;
              return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD"
              }).format(amount);
            }
          })
        }),
        businessTypeLabel: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
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
        volumeLabel: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
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
        statusLabel: (0, import_fields33.virtual)({
          field: import_core30.graphql.field({
            type: import_core30.graphql.String,
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
    validateInput: async ({ operation, resolvedData, item, addValidationError }) => {
      if (operation === "create" && !resolvedData.user) {
        addValidationError("A user is required");
      }
      if (operation === "update" && resolvedData.status === "approved" && !resolvedData.approvedCreditLimit && !item?.approvedCreditLimit) {
        addValidationError("An approved credit limit is required");
      }
    },
    afterOperation: async ({ operation, item, originalItem, context }) => {
      if (operation === "update" && item?.status === "approved" && originalItem?.status !== "approved" && !item.generatedAccountId) {
        const accountId = await createAccountFromApprovedRequest(item, context);
        if (accountId) {
          await context.sudo().query.BusinessAccountRequest.updateOne({
            where: { id: String(item.id) },
            data: { generatedAccount: { connect: { id: accountId } } }
          });
        }
      }
    }
  }
});
async function createAccountFromApprovedRequest(request, context) {
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
    if (!fullRequest) {
      return null;
    }
    const defaultCurrency = await context.sudo().query.Currency.findOne({
      where: { code: "usd" },
      query: "id code"
    });
    if (!defaultCurrency) {
      return null;
    }
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
    return account.id;
  } catch (error) {
    console.error("Error creating account from approved request:", error);
    return null;
  }
}

// features/keystone/models/LineItem.ts
var import_core31 = require("@keystone-6/core");
var import_fields34 = require("@keystone-6/core/fields");
var formatCurrency2 = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
};
var LineItem = (0, import_core31.list)({
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
    quantity: (0, import_fields34.integer)({
      validation: { isRequired: true }
    }),
    metadata: (0, import_fields34.json)(),
    isReturn: (0, import_fields34.checkbox)(),
    isGiftcard: (0, import_fields34.checkbox)(),
    shouldMerge: (0, import_fields34.checkbox)({
      defaultValue: true
    }),
    allowDiscounts: (0, import_fields34.checkbox)({
      defaultValue: true
    }),
    hasShipping: (0, import_fields34.checkbox)(),
    // Relationships
    claimOrder: (0, import_fields34.relationship)({
      ref: "ClaimOrder.lineItems"
    }),
    cart: (0, import_fields34.relationship)({
      ref: "Cart.lineItems"
    }),
    swap: (0, import_fields34.relationship)({
      ref: "Swap.lineItems"
    }),
    productVariant: (0, import_fields34.relationship)({
      ref: "ProductVariant.lineItems"
    }),
    claimItems: (0, import_fields34.relationship)({
      ref: "ClaimItem.lineItem",
      many: true
    }),
    lineItemAdjustments: (0, import_fields34.relationship)({
      ref: "LineItemAdjustment.lineItem",
      many: true
    }),
    lineItemTaxLines: (0, import_fields34.relationship)({
      ref: "LineItemTaxLine.lineItem",
      many: true
    }),
    returnItems: (0, import_fields34.relationship)({
      ref: "ReturnItem.lineItem",
      many: true
    }),
    ...(0, import_core31.group)({
      label: "Virtual Fields",
      description: "Virtual fields for line item",
      fields: {
        title: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
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
        thumbnail: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
            async resolve(item, args, context) {
              const sudoContext = context.sudo();
              const lineItem = await sudoContext.query.LineItem.findOne({
                where: { id: item.id },
                query: `
                  productVariant {
                    primaryImage {
                      image { url }
                      imagePath
                    }
                    product { thumbnail }
                  }
                `
              });
              if (!lineItem?.productVariant) {
                return null;
              }
              const primaryImage = lineItem.productVariant.primaryImage;
              if (primaryImage) {
                return primaryImage.image?.url || primaryImage.imagePath || null;
              }
              return lineItem.productVariant.product?.thumbnail || null;
            }
          })
        }),
        description: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.JSON,
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
        originalPrice: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
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
        unitPrice: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
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
        total: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
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
        availableInRegion: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.String,
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
        percentageOff: (0, import_fields34.virtual)({
          field: import_core31.graphql.field({
            type: import_core31.graphql.Int,
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
        })
      }
    }),
    ...trackingFields
  }
});

// features/keystone/models/LineItemAdjustment.ts
var import_core32 = require("@keystone-6/core");
var import_fields35 = require("@keystone-6/core/fields");
var LineItemAdjustment = (0, import_core32.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    description: (0, import_fields35.text)({
      validation: {
        isRequired: true
      }
    }),
    amount: (0, import_fields35.integer)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields35.json)(),
    discount: (0, import_fields35.relationship)({
      ref: "Discount.lineItemAdjustments"
    }),
    lineItem: (0, import_fields35.relationship)({
      ref: "LineItem.lineItemAdjustments"
    }),
    ...trackingFields
  }
});

// features/keystone/models/LineItemTaxLine.ts
var import_core33 = require("@keystone-6/core");
var import_fields36 = require("@keystone-6/core/fields");
var LineItemTaxLine = (0, import_core33.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    rate: (0, import_fields36.float)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields36.text)({
      validation: {
        isRequired: true
      }
    }),
    code: (0, import_fields36.text)(),
    metadata: (0, import_fields36.json)(),
    lineItem: (0, import_fields36.relationship)({
      ref: "LineItem.lineItemTaxLines"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Location.ts
var import_core34 = require("@keystone-6/core");
var import_fields37 = require("@keystone-6/core/fields");
var Location = (0, import_core34.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    name: (0, import_fields37.text)({
      validation: { isRequired: true }
    }),
    description: (0, import_fields37.text)(),
    address: (0, import_fields37.text)(),
    variants: (0, import_fields37.relationship)({
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
var import_core35 = require("@keystone-6/core");
var import_fields38 = require("@keystone-6/core/fields");
var UNITS = {
  weight: ["g", "kg", "oz", "lb"],
  dimensions: ["cm", "m", "in", "ft"]
};
var Measurement = (0, import_core35.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields38.float)({
      validation: {
        isRequired: true,
        min: 0
      }
    }),
    unit: (0, import_fields38.select)({
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
    type: (0, import_fields38.select)({
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
    productVariant: (0, import_fields38.relationship)({
      ref: "ProductVariant.measurements"
    }),
    ...trackingFields
  }
});

// features/keystone/models/MoneyAmount.ts
var import_core36 = require("@keystone-6/core");
var import_fields39 = require("@keystone-6/core/fields");
var MoneyAmount = (0, import_core36.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    amount: (0, import_fields39.integer)({
      validation: {
        isRequired: true
      }
    }),
    compareAmount: (0, import_fields39.integer)(),
    minQuantity: (0, import_fields39.integer)(),
    maxQuantity: (0, import_fields39.integer)(),
    productVariant: (0, import_fields39.relationship)({
      ref: "ProductVariant.prices"
    }),
    region: (0, import_fields39.relationship)({
      ref: "Region.moneyAmounts"
    }),
    currency: (0, import_fields39.relationship)({
      ref: "Currency.moneyAmounts"
    }),
    priceList: (0, import_fields39.relationship)({
      ref: "PriceList.moneyAmounts"
    }),
    priceSet: (0, import_fields39.relationship)({
      ref: "PriceSet.prices"
    }),
    priceRules: (0, import_fields39.relationship)({
      ref: "PriceRule.moneyAmounts",
      many: true
    }),
    ...(0, import_core36.group)({
      label: "Virtual Fields",
      description: "Virtual fields for money amount",
      fields: {
        displayPrice: (0, import_fields39.virtual)({
          field: import_core36.graphql.field({
            type: import_core36.graphql.String,
            resolve: async (item, args, context) => {
              const { currency, amount } = await context.query.MoneyAmount.findOne({
                where: { id: item.id },
                query: "currency { symbol } amount"
              });
              return `${currency.symbol}${(amount / 100).toFixed(2)}`;
            }
          })
        }),
        calculatedPrice: (0, import_fields39.virtual)({
          field: import_core36.graphql.field({
            type: import_core36.graphql.object()({
              name: "CalculatedPrice",
              fields: {
                calculatedAmount: import_core36.graphql.field({ type: import_core36.graphql.Int }),
                originalAmount: import_core36.graphql.field({ type: import_core36.graphql.Int }),
                currencyCode: import_core36.graphql.field({ type: import_core36.graphql.String }),
                moneyAmountId: import_core36.graphql.field({ type: import_core36.graphql.ID }),
                variantId: import_core36.graphql.field({ type: import_core36.graphql.ID }),
                priceListId: import_core36.graphql.field({ type: import_core36.graphql.ID }),
                priceListType: import_core36.graphql.field({ type: import_core36.graphql.String })
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
                const startDate = moneyAmount.priceList.startsAt ? new Date(moneyAmount.priceList.startsAt) : null;
                const endDate = moneyAmount.priceList.endsAt ? new Date(moneyAmount.priceList.endsAt) : null;
                if (moneyAmount.priceList.status === "active" && (!startDate || startDate <= now) && (!endDate || endDate >= now)) {
                  appliedPriceList = moneyAmount.priceList;
                }
              }
              if (moneyAmount.priceSet) {
                const validPrices = moneyAmount.priceSet.prices.filter(
                  (price) => {
                    if (price.currency.code !== currencyCode) return false;
                    if (price.priceList) {
                      const startDate = price.priceList.startsAt ? new Date(price.priceList.startsAt) : null;
                      const endDate = price.priceList.endsAt ? new Date(price.priceList.endsAt) : null;
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
var import_core37 = require("@keystone-6/core");
var import_fields40 = require("@keystone-6/core/fields");
var Note = (0, import_core37.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    value: (0, import_fields40.text)({
      validation: {
        isRequired: true
      }
    }),
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
    authorId: (0, import_fields40.text)(),
    metadata: (0, import_fields40.json)(),
    ...trackingFields
  }
});

// features/keystone/models/Notification.ts
var import_core38 = require("@keystone-6/core");
var import_fields41 = require("@keystone-6/core/fields");
var Notification = (0, import_core38.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    eventName: (0, import_fields41.text)(),
    resourceType: (0, import_fields41.text)({
      validation: {
        isRequired: true
      }
    }),
    resourceId: (0, import_fields41.text)({
      validation: {
        isRequired: true
      }
    }),
    to: (0, import_fields41.text)({
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields41.json)(),
    parentId: (0, import_fields41.text)(),
    notificationProvider: (0, import_fields41.relationship)({
      ref: "NotificationProvider.notifications"
    }),
    user: (0, import_fields41.relationship)({
      ref: "User.notifications"
    }),
    otherNotifications: (0, import_fields41.relationship)({
      ref: "Notification",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/NotificationProvider.ts
var import_core39 = require("@keystone-6/core");
var import_fields42 = require("@keystone-6/core/fields");
var NotificationProvider = (0, import_core39.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    isInstalled: (0, import_fields42.checkbox)({
      defaultValue: true
    }),
    notifications: (0, import_fields42.relationship)({
      ref: "Notification.notificationProvider",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/OAuthApp.ts
var import_core40 = require("@keystone-6/core");
var import_fields43 = require("@keystone-6/core/fields");
var OAuthApp = (0, import_core40.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadApps({ session }) || permissions.canManageApps({ session }),
      create: ({ session }) => permissions.canManageApps({ session }),
      update: ({ session }) => permissions.canManageApps({ session }),
      delete: ({ session }) => permissions.canManageApps({ session })
    }
  },
  fields: {
    name: (0, import_fields43.text)({
      validation: {
        isRequired: true
      }
    }),
    clientId: (0, import_fields43.text)({
      isIndexed: "unique",
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === "create" && !resolvedData.clientId) {
            return generateOpaqueToken("of_");
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
    clientSecret: (0, import_fields43.text)({
      access: {
        read: () => false
      },
      hooks: {
        resolveInput: ({ operation, resolvedData }) => {
          if (operation === "create" && !resolvedData.clientSecret) {
            throw new Error("OAuth apps must be created through the show-once credential command");
          }
          if (resolvedData.clientSecret) {
            return oauthClientSecretDigest(resolvedData.clientSecret);
          }
          return void 0;
        }
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        // displayMode: "textarea",
        description: "Auto-generated secret key. Keep this secure - it's used to authenticate your application."
      }
    }),
    redirectUris: (0, import_fields43.json)({
      defaultValue: [],
      ui: {
        description: "Array of allowed redirect URIs for OAuth callbacks"
      }
    }),
    scopes: (0, import_fields43.json)({
      defaultValue: DEFAULT_SCOPES,
      ui: {
        description: "Array of allowed OAuth scopes that map to permissions"
      }
    }),
    webhookUrl: (0, import_fields43.text)({
      ui: {
        description: "URL to receive webhook notifications"
      }
    }),
    status: (0, import_fields43.select)({
      options: [
        { label: "Active", value: "active" },
        { label: "Suspended", value: "suspended" },
        { label: "Pending", value: "pending" }
      ],
      defaultValue: "active"
    }),
    installUrl: (0, import_fields43.text)({
      ui: {
        description: "URL where users can install this app"
      }
    }),
    uninstallUrl: (0, import_fields43.text)({
      ui: {
        description: "URL to handle app uninstallation"
      }
    }),
    description: (0, import_fields43.text)({
      ui: {
        displayMode: "textarea"
      }
    }),
    metadata: (0, import_fields43.json)({
      defaultValue: {},
      ui: {
        description: "Additional app-specific configuration and settings"
      }
    }),
    developerEmail: (0, import_fields43.text)(),
    privacyPolicyUrl: (0, import_fields43.text)(),
    termsOfServiceUrl: (0, import_fields43.text)(),
    supportUrl: (0, import_fields43.text)(),
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
var import_core41 = require("@keystone-6/core");
var import_fields44 = require("@keystone-6/core/fields");

// features/keystone/security/oauth-credentials.ts
function storedOAuthToken(rawToken) {
  return oauthTokenDigest(rawToken);
}
async function findOAuthToken(context, rawToken, query) {
  if (!rawToken) return null;
  let token = await context.sudo().query.OAuthToken.findOne({
    where: { token: storedOAuthToken(rawToken) },
    query
  });
  if (!token && process.env.NODE_ENV !== "production") {
    token = await context.sudo().query.OAuthToken.findOne({
      where: { token: rawToken },
      query
    });
  }
  return token;
}

// features/keystone/models/OAuthToken.ts
var digestTokenInput = {
  resolveInput: ({ resolvedData, fieldKey }) => resolvedData[fieldKey] ? storedOAuthToken(resolvedData[fieldKey]) : resolvedData[fieldKey]
};
var OAuthToken = (0, import_core41.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadApps({ session }) || permissions.canManageApps({ session }),
      create: ({ session }) => permissions.canManageApps({ session }),
      update: ({ session }) => permissions.canManageApps({ session }),
      delete: ({ session }) => permissions.canManageApps({ session })
    }
  },
  fields: {
    tokenType: (0, import_fields44.select)({
      options: [
        { label: "Authorization Code", value: "authorization_code" },
        { label: "Access Token", value: "access_token" },
        { label: "Refresh Token", value: "refresh_token" }
      ],
      validation: {
        isRequired: true
      }
    }),
    token: (0, import_fields44.text)({
      access: { read: () => false },
      validation: {
        isRequired: true
      },
      isIndexed: "unique",
      hooks: digestTokenInput
    }),
    clientId: (0, import_fields44.text)({
      validation: {
        isRequired: true
      },
      isIndexed: true
    }),
    user: (0, import_fields44.relationship)({
      ref: "User",
      ui: {
        description: "The user who authorized this token"
      }
    }),
    scopes: (0, import_fields44.json)({
      defaultValue: [],
      ui: {
        description: "Array of granted scopes"
      }
    }),
    redirectUri: (0, import_fields44.text)({
      ui: {
        description: "The redirect URI used during authorization"
      }
    }),
    expiresAt: (0, import_fields44.timestamp)({
      ui: {
        description: "When this token expires"
      }
    }),
    isRevoked: (0, import_fields44.select)({
      options: [
        { label: "Active", value: "false" },
        { label: "Revoked", value: "true" }
      ],
      defaultValue: "false"
    }),
    authorizationCode: (0, import_fields44.text)({
      access: { read: () => false },
      hooks: digestTokenInput,
      ui: {
        description: "The authorization code that was exchanged for this token (for access tokens)"
      }
    }),
    refreshToken: (0, import_fields44.text)({
      access: { read: () => false },
      hooks: digestTokenInput,
      ui: {
        description: "Associated refresh token (for access tokens)"
      }
    }),
    accessToken: (0, import_fields44.text)({
      access: { read: () => false },
      hooks: digestTokenInput,
      ui: {
        description: "Associated access token (for refresh tokens)"
      }
    }),
    state: (0, import_fields44.text)({
      ui: {
        description: "OAuth state parameter for CSRF protection"
      }
    }),
    codeChallenge: (0, import_fields44.text)({
      ui: {
        description: "PKCE code challenge"
      }
    }),
    codeChallengeMethod: (0, import_fields44.select)({
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
var import_core42 = require("@keystone-6/core");
var import_fields45 = require("@keystone-6/core/fields");
var formatCurrency3 = (amount, currencyCode) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
};
var Order = (0, import_core42.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canManageOrders({ session }) || Boolean(session?.customerToken),
      create: () => false,
      update: () => false,
      delete: () => false
    },
    filter: {
      query: ({ session }) => {
        if (permissions.canManageOrders({ session })) return true;
        if (session?.customerToken && session?.itemId) {
          return { user: { id: { equals: session.itemId } } };
        }
        return false;
      }
    }
  },
  fields: {
    status: (0, import_fields45.select)({
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
      access: {
        update: () => false
      }
    }),
    displayId: (0, import_fields45.integer)({
      validation: {
        isRequired: true
      }
    }),
    email: (0, import_fields45.text)({
      validation: {
        isRequired: true
      }
    }),
    taxRate: (0, import_fields45.float)(),
    canceledAt: (0, import_fields45.timestamp)(),
    metadata: (0, import_fields45.json)(),
    idempotencyKey: (0, import_fields45.text)(),
    noNotification: (0, import_fields45.checkbox)(),
    externalId: (0, import_fields45.text)(),
    shippingAddress: (0, import_fields45.relationship)({
      ref: "Address.ordersUsingAsShippingAddress",
      many: false
    }),
    billingAddress: (0, import_fields45.relationship)({
      ref: "Address.ordersUsingAsBillingAddress",
      many: false
    }),
    currency: (0, import_fields45.relationship)({
      ref: "Currency.orders"
    }),
    draftOrder: (0, import_fields45.relationship)({
      ref: "DraftOrder.order"
    }),
    cart: (0, import_fields45.relationship)({
      ref: "Cart.order"
    }),
    user: (0, import_fields45.relationship)({
      ref: "User.orders"
    }),
    region: (0, import_fields45.relationship)({
      ref: "Region.orders"
    }),
    claimOrders: (0, import_fields45.relationship)({
      ref: "ClaimOrder.order",
      many: true
    }),
    fulfillments: (0, import_fields45.relationship)({
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
    giftCards: (0, import_fields45.relationship)({
      ref: "GiftCard.order",
      many: true
    }),
    giftCardTransactions: (0, import_fields45.relationship)({
      ref: "GiftCardTransaction.order",
      many: true
    }),
    lineItems: (0, import_fields45.relationship)({
      ref: "OrderLineItem.order",
      many: true
    }),
    discounts: (0, import_fields45.relationship)({
      ref: "Discount.orders",
      many: true
    }),
    payments: (0, import_fields45.relationship)({
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
    returns: (0, import_fields45.relationship)({
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
    shippingMethods: (0, import_fields45.relationship)({
      ref: "ShippingMethod.order",
      many: true
    }),
    swaps: (0, import_fields45.relationship)({
      ref: "Swap.order",
      many: true
    }),
    // Account relationship for Openship integration
    account: (0, import_fields45.relationship)({
      ref: "Account.orders",
      many: false
    }),
    accountLineItems: (0, import_fields45.relationship)({
      ref: "AccountLineItem.order",
      many: true
    }),
    secretKey: (0, import_fields45.text)({
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
    ...(0, import_core42.group)({
      label: "Virtual Fields",
      description: "Calculated fields for order display and totals",
      fields: {
        subtotal: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
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
        shipping: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
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
        discount: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
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
        tax: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
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
        total: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
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
        rawTotal: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.Int,
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
        fulfillmentDetails: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.JSON,
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
        unfulfilled: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.JSON,
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
        fulfillmentStatus: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.JSON,
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
        paymentDetails: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.JSON,
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
        totalPaid: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.Int,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                  accountLineItems {
                    id
                    paymentStatus
                    amount
                  }
                `
              });
              let totalPaid = order.payments?.reduce((total, payment) => {
                if (payment.status === "captured") {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;
              if (totalPaid === 0 && order.accountLineItems?.length > 0) {
                const hasPaidLineItems = order.accountLineItems.some(
                  (lineItem) => lineItem.paymentStatus === "paid"
                );
                if (hasPaidLineItems) {
                  totalPaid = order.accountLineItems.reduce((total, lineItem) => {
                    if (lineItem.paymentStatus === "paid") {
                      return total + (lineItem.amount || 0);
                    }
                    return total;
                  }, 0);
                }
              }
              return totalPaid;
            }
          })
        }),
        formattedTotalPaid: (0, import_fields45.virtual)({
          field: import_core42.graphql.field({
            type: import_core42.graphql.String,
            async resolve(item, args, context) {
              const order = await context.sudo().query.Order.findOne({
                where: { id: item.id },
                query: `
                  payments {
                    amount
                    status
                  }
                  accountLineItems {
                    id
                    paymentStatus
                    amount
                  }
                  currency {
                    code
                    symbol
                  }
                `
              });
              let totalPaid = order.payments?.reduce((total, payment) => {
                if (payment.status === "captured") {
                  return total + payment.amount;
                }
                return total;
              }, 0) || 0;
              if (totalPaid === 0 && order.accountLineItems?.length > 0) {
                const hasPaidLineItems = order.accountLineItems.some(
                  (lineItem) => lineItem.paymentStatus === "paid"
                );
                if (hasPaidLineItems) {
                  totalPaid = order.accountLineItems.reduce((total, lineItem) => {
                    if (lineItem.paymentStatus === "paid") {
                      return total + (lineItem.amount || 0);
                    }
                    return total;
                  }, 0);
                }
              }
              if (!order.currency) return `${(totalPaid / 100).toFixed(2)}`;
              return `${order.currency.symbol}${(totalPaid / 100).toFixed(2)}`;
            }
          })
        })
      }
    }),
    events: (0, import_fields45.relationship)({
      ref: "OrderEvent.order",
      many: true
    }),
    note: (0, import_fields45.text)({
      label: "Note"
    }),
    shippingLabels: (0, import_fields45.relationship)({
      ref: "ShippingLabel.order",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/OrderEvent.ts
var import_core43 = require("@keystone-6/core");
var import_fields46 = require("@keystone-6/core/fields");
var OrderEvent = (0, import_core43.list)({
  fields: {
    order: (0, import_fields46.relationship)({
      ref: "Order.events",
      many: false
    }),
    user: (0, import_fields46.relationship)({
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
    type: (0, import_fields46.select)({
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
    data: (0, import_fields46.json)({
      defaultValue: {}
    }),
    time: (0, import_fields46.timestamp)({
      defaultValue: { kind: "now" }
    }),
    createdBy: (0, import_fields46.relationship)({
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
      update: () => false,
      delete: () => false
    }
  }
});

// features/keystone/models/OrderLineItem.ts
var import_core44 = require("@keystone-6/core");
var import_fields47 = require("@keystone-6/core/fields");
var import_core45 = require("@keystone-6/core");
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
var OrderLineItem = (0, import_core44.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    quantity: (0, import_fields47.integer)({
      validation: { isRequired: true }
    }),
    title: (0, import_fields47.text)({
      validation: { isRequired: true }
    }),
    sku: (0, import_fields47.text)(),
    thumbnail: (0, import_fields47.virtual)({
      field: import_core45.graphql.field({
        type: import_core45.graphql.String,
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
                primaryImage {
                  image { url }
                  imagePath
                }
                product {
                  thumbnail
                }
              }
            `
          });
          const primaryImage = orderLineItem?.productVariant?.primaryImage;
          if (primaryImage) {
            return primaryImage.image?.url || primaryImage.imagePath || null;
          }
          return orderLineItem?.productVariant?.product?.thumbnail || null;
        }
      })
    }),
    metadata: (0, import_fields47.json)(),
    productData: (0, import_fields47.json)({
      description: "Snapshot of product data at time of order"
    }),
    variantData: (0, import_fields47.json)({
      description: "Snapshot of variant data at time of order"
    }),
    // Formatted values for display
    variantTitle: (0, import_fields47.text)(),
    formattedUnitPrice: (0, import_fields47.text)(),
    formattedTotal: (0, import_fields47.text)(),
    order: (0, import_fields47.relationship)({
      ref: "Order.lineItems"
    }),
    productVariant: (0, import_fields47.relationship)({
      ref: "ProductVariant",
      description: "Optional reference to product variant (may be deleted)"
    }),
    moneyAmount: (0, import_fields47.relationship)({
      ref: "OrderMoneyAmount.orderLineItem"
    }),
    originalLineItem: (0, import_fields47.relationship)({
      ref: "LineItem",
      description: "Reference to the original cart line item"
    }),
    fulfillmentItems: (0, import_fields47.relationship)({
      ref: "FulfillmentItem.lineItem",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/OrderMoneyAmount.ts
var import_core46 = require("@keystone-6/core");
var import_fields48 = require("@keystone-6/core/fields");
var OrderMoneyAmount = (0, import_core46.list)({
  access: {
    operation: {
      query: permissions.canManageOrders,
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    amount: (0, import_fields48.integer)({
      validation: { isRequired: true }
    }),
    originalAmount: (0, import_fields48.integer)({
      validation: { isRequired: true }
    }),
    priceData: (0, import_fields48.json)({
      description: "Snapshot of complete price data including rules, lists, etc."
    }),
    metadata: (0, import_fields48.json)(),
    orderLineItem: (0, import_fields48.relationship)({
      ref: "OrderLineItem.moneyAmount"
    }),
    currency: (0, import_fields48.relationship)({
      ref: "Currency"
    }),
    region: (0, import_fields48.relationship)({
      ref: "Region"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Payment.ts
var import_core47 = require("@keystone-6/core");
var import_fields49 = require("@keystone-6/core/fields");
var import_core48 = require("@keystone-6/core");
var Payment = (0, import_core47.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    status: (0, import_fields49.select)({
      type: "enum",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Authorized", value: "authorized" },
        { label: "Captured", value: "captured" },
        { label: "Failed", value: "failed" },
        { label: "Canceled", value: "canceled" }
      ],
      defaultValue: "pending",
      validation: { isRequired: true }
    }),
    amount: (0, import_fields49.integer)({
      validation: {
        isRequired: true
      }
    }),
    currencyCode: (0, import_fields49.text)({
      validation: {
        isRequired: true
      }
    }),
    amountRefunded: (0, import_fields49.integer)({
      defaultValue: 0,
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields49.json)(),
    capturedAt: (0, import_fields49.timestamp)(),
    canceledAt: (0, import_fields49.timestamp)(),
    metadata: (0, import_fields49.json)(),
    idempotencyKey: (0, import_fields49.text)(),
    cart: (0, import_fields49.relationship)({
      ref: "Cart.payment"
    }),
    paymentCollection: (0, import_fields49.relationship)({
      ref: "PaymentCollection.payments"
    }),
    swap: (0, import_fields49.relationship)({
      ref: "Swap.payment"
    }),
    currency: (0, import_fields49.relationship)({
      ref: "Currency.payments"
    }),
    order: (0, import_fields49.relationship)({
      ref: "Order.payments"
    }),
    captures: (0, import_fields49.relationship)({
      ref: "Capture.payment",
      many: true
    }),
    refunds: (0, import_fields49.relationship)({
      ref: "Refund.payment",
      many: true
    }),
    user: (0, import_fields49.relationship)({
      ref: "User.payments"
    }),
    paymentLink: (0, import_fields49.virtual)({
      field: import_core48.graphql.field({
        type: import_core48.graphql.String,
        resolve(item) {
          if (!item.data) return null;
          const data = item.data;
          if (data.provider_id?.startsWith("pp_stripe_")) {
            const paymentIntentId = data.payment_intent_id;
            if (paymentIntentId) {
              return `https://dashboard.stripe.com/payments/${paymentIntentId}`;
            }
          }
          if (data.provider_id?.startsWith("pp_paypal_")) {
            const paypalOrderId = data.id;
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
var import_core49 = require("@keystone-6/core");
var import_fields50 = require("@keystone-6/core/fields");
var PaymentCollection = (0, import_core49.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    description: (0, import_fields50.select)({
      type: "enum",
      options: [
        { label: "Default", value: "default" },
        { label: "Refund", value: "refund" }
      ],
      defaultValue: "default"
    }),
    amount: (0, import_fields50.integer)({
      validation: { isRequired: true }
    }),
    authorizedAmount: (0, import_fields50.integer)({
      defaultValue: 0
    }),
    refundedAmount: (0, import_fields50.integer)({
      defaultValue: 0
    }),
    metadata: (0, import_fields50.json)(),
    paymentSessions: (0, import_fields50.relationship)({
      ref: "PaymentSession.paymentCollection",
      many: true
    }),
    payments: (0, import_fields50.relationship)({
      ref: "Payment.paymentCollection",
      many: true
    }),
    cart: (0, import_fields50.relationship)({
      ref: "Cart.paymentCollection"
    }),
    invoice: (0, import_fields50.relationship)({
      ref: "Invoice.paymentCollection"
    }),
    ...trackingFields
  }
});

// features/keystone/models/PaymentProvider.ts
var import_core50 = require("@keystone-6/core");
var import_fields51 = require("@keystone-6/core/fields");
var PaymentProvider = (0, import_core50.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    name: (0, import_fields51.text)({
      validation: { isRequired: true }
    }),
    code: (0, import_fields51.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true,
        match: {
          regex: /^pp_[a-zA-Z0-9-_]+$/,
          explanation: 'Payment provider code must start with "pp_" followed by alphanumeric characters, hyphens or underscores'
        }
      }
    }),
    isInstalled: (0, import_fields51.checkbox)({
      defaultValue: true
    }),
    credentials: (0, import_fields51.json)({
      defaultValue: {}
    }),
    metadata: (0, import_fields51.json)({
      defaultValue: {}
    }),
    // Adapter function fields
    createPaymentFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to create payments"
      }
    }),
    capturePaymentFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to capture payments"
      }
    }),
    refundPaymentFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to refund payments"
      }
    }),
    getPaymentStatusFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to check payment status"
      }
    }),
    generatePaymentLinkFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to generate payment dashboard links"
      }
    }),
    handleWebhookFunction: (0, import_fields51.text)({
      validation: { isRequired: true },
      ui: {
        description: "Name of the adapter function to handle provider webhooks"
      }
    }),
    regions: (0, import_fields51.relationship)({
      ref: "Region.paymentProviders",
      many: true
    }),
    sessions: (0, import_fields51.relationship)({
      ref: "PaymentSession.paymentProvider",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/PaymentSession.ts
var import_core51 = require("@keystone-6/core");
var import_fields52 = require("@keystone-6/core/fields");
var import_core52 = require("@keystone-6/core");
var PaymentSession = (0, import_core51.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadPayments({ session }) || permissions.canManagePayments({ session }),
      create: permissions.canManagePayments,
      update: permissions.canManagePayments,
      delete: permissions.canManagePayments
    }
  },
  fields: {
    isSelected: (0, import_fields52.checkbox)({
      defaultValue: false
    }),
    isInitiated: (0, import_fields52.checkbox)({
      defaultValue: false
    }),
    amount: (0, import_fields52.integer)({
      validation: { isRequired: true }
    }),
    formattedAmount: (0, import_fields52.virtual)({
      field: import_core52.graphql.field({
        type: import_core52.graphql.String,
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
    data: (0, import_fields52.json)({
      defaultValue: {}
    }),
    idempotencyKey: (0, import_fields52.text)({
      isIndexed: true
    }),
    paymentCollection: (0, import_fields52.relationship)({
      ref: "PaymentCollection.paymentSessions"
    }),
    paymentProvider: (0, import_fields52.relationship)({
      ref: "PaymentProvider.sessions",
      many: false
    }),
    paymentAuthorizedAt: (0, import_fields52.timestamp)(),
    ...trackingFields
  }
});

// features/keystone/models/PriceList.ts
var import_core53 = require("@keystone-6/core");
var import_fields53 = require("@keystone-6/core/fields");
var PriceList = (0, import_core53.list)({
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
    name: (0, import_fields53.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields53.text)({
      validation: {
        isRequired: true
      }
    }),
    type: (0, import_fields53.select)({
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
    status: (0, import_fields53.select)({
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
    startsAt: (0, import_fields53.timestamp)(),
    endsAt: (0, import_fields53.timestamp)(),
    moneyAmounts: (0, import_fields53.relationship)({
      ref: "MoneyAmount.priceList",
      many: true
    }),
    customerGroups: (0, import_fields53.relationship)({
      ref: "CustomerGroup.priceLists",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/PriceRule.ts
var import_core54 = require("@keystone-6/core");
var import_fields54 = require("@keystone-6/core/fields");
var PriceRule = (0, import_core54.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    type: (0, import_fields54.select)({
      type: "enum",
      options: [
        { label: "Fixed", value: "fixed" },
        { label: "Percentage", value: "percentage" }
      ],
      validation: { isRequired: true }
    }),
    value: (0, import_fields54.float)({ validation: { isRequired: true } }),
    priority: (0, import_fields54.integer)({ defaultValue: 0 }),
    ruleAttribute: (0, import_fields54.text)({ validation: { isRequired: true } }),
    ruleValue: (0, import_fields54.text)({ validation: { isRequired: true } }),
    moneyAmounts: (0, import_fields54.relationship)({ ref: "MoneyAmount.priceRules", many: true }),
    priceSet: (0, import_fields54.relationship)({ ref: "PriceSet.priceRules" }),
    ...trackingFields
  }
});

// features/keystone/models/PriceSet.ts
var import_core55 = require("@keystone-6/core");
var import_fields55 = require("@keystone-6/core/fields");
var PriceSet = (0, import_core55.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    prices: (0, import_fields55.relationship)({ ref: "MoneyAmount.priceSet", many: true }),
    priceRules: (0, import_fields55.relationship)({ ref: "PriceRule.priceSet", many: true }),
    ruleTypes: (0, import_fields55.relationship)({ ref: "RuleType.priceSets", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/Product.ts
var import_core56 = require("@keystone-6/core");
var import_fields56 = require("@keystone-6/core/fields");
var import_fields_document = require("@keystone-6/fields-document");
var Product = (0, import_core56.list)({
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
    title: (0, import_fields56.text)({
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
    handle: (0, import_fields56.text)({
      isIndexed: "unique"
    }),
    subtitle: (0, import_fields56.text)(),
    isGiftcard: (0, import_fields56.checkbox)(),
    thumbnail: (0, import_fields56.virtual)({
      field: import_core56.graphql.field({
        type: import_core56.graphql.String,
        resolve: async (item, args, context) => {
          const product = await context.query.Product.findOne({
            where: { id: item.id },
            query: "productImages(take: 1) { image { url } imagePath }"
          });
          return product.productImages[0]?.image?.url || product.productImages[0]?.imagePath || null;
        }
      })
    }),
    dimensionsRange: (0, import_fields56.virtual)({
      field: import_core56.graphql.field({
        type: import_core56.graphql.JSON,
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
    defaultDimensions: (0, import_fields56.virtual)({
      field: import_core56.graphql.field({
        type: import_core56.graphql.JSON,
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
    metadata: (0, import_fields56.json)(),
    discountable: (0, import_fields56.checkbox)({
      defaultValue: true
    }),
    status: (0, import_fields56.select)({
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
    externalId: (0, import_fields56.text)(),
    productCollections: (0, import_fields56.relationship)({
      ref: "ProductCollection.products",
      many: true
    }),
    productCategories: (0, import_fields56.relationship)({
      ref: "ProductCategory.products",
      many: true
    }),
    shippingProfile: (0, import_fields56.relationship)({
      ref: "ShippingProfile.products"
    }),
    productType: (0, import_fields56.relationship)({
      ref: "ProductType.products"
    }),
    discountConditions: (0, import_fields56.relationship)({
      ref: "DiscountCondition.products",
      many: true
    }),
    discountRules: (0, import_fields56.relationship)({
      ref: "DiscountRule.products",
      many: true
    }),
    productImages: (0, import_fields56.relationship)({
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
    productOptions: (0, import_fields56.relationship)({
      ref: "ProductOption.product",
      many: true
    }),
    productTags: (0, import_fields56.relationship)({
      ref: "ProductTag.products",
      many: true
    }),
    taxRates: (0, import_fields56.relationship)({
      ref: "TaxRate.products",
      many: true
    }),
    productVariants: (0, import_fields56.relationship)({
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
var import_core57 = require("@keystone-6/core");
var import_fields57 = require("@keystone-6/core/fields");
var ProductCategory = (0, import_core57.list)({
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
    isInternal: (0, import_fields57.checkbox)({
      defaultValue: false
    }),
    isActive: (0, import_fields57.checkbox)({
      defaultValue: true
    }),
    discountConditions: (0, import_fields57.relationship)({
      ref: "DiscountCondition.productCategories",
      many: true
    }),
    products: (0, import_fields57.relationship)({
      ref: "Product.productCategories",
      many: true
    }),
    parentCategory: (0, import_fields57.relationship)({
      ref: "ProductCategory.categoryChildren",
      many: false
    }),
    categoryChildren: (0, import_fields57.relationship)({
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
var import_core58 = require("@keystone-6/core");
var import_fields58 = require("@keystone-6/core/fields");
var ProductCollection = (0, import_core58.list)({
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
    title: (0, import_fields58.text)({
      validation: {
        isRequired: true
      }
    }),
    handle: (0, import_fields58.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields58.json)(),
    discountConditions: (0, import_fields58.relationship)({
      ref: "DiscountCondition.productCollections",
      many: true
    }),
    products: (0, import_fields58.relationship)({
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
var import_core59 = require("@keystone-6/core");
var import_fields59 = require("@keystone-6/core/fields");
var ProductImage = (0, import_core59.list)({
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
    image: (0, import_fields59.image)({ storage: "my_images" }),
    imagePath: (0, import_fields59.text)(),
    altText: (0, import_fields59.text)(),
    order: (0, import_fields59.integer)({
      defaultValue: 0
    }),
    products: (0, import_fields59.relationship)({ ref: "Product.productImages", many: true }),
    productVariants: (0, import_fields59.relationship)({ ref: "ProductVariant.primaryImage", many: true }),
    metadata: (0, import_fields59.json)(),
    ...trackingFields
  },
  ui: {
    listView: {
      initialColumns: ["image", "imagePath", "altText", "products"]
    }
  }
});

// features/keystone/models/ProductOption.ts
var import_core60 = require("@keystone-6/core");
var import_fields60 = require("@keystone-6/core/fields");
var ProductOption = (0, import_core60.list)({
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
    title: (0, import_fields60.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields60.json)(),
    product: (0, import_fields60.relationship)({
      ref: "Product.productOptions"
    }),
    productOptionValues: (0, import_fields60.relationship)({
      ref: "ProductOptionValue.productOption",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ProductOptionValue.ts
var import_core61 = require("@keystone-6/core");
var import_fields61 = require("@keystone-6/core/fields");
var ProductOptionValue = (0, import_core61.list)({
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
    value: (0, import_fields61.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields61.json)(),
    productVariants: (0, import_fields61.relationship)({
      ref: "ProductVariant.productOptionValues",
      many: true
    }),
    productOption: (0, import_fields61.relationship)({
      ref: "ProductOption.productOptionValues"
    }),
    ...trackingFields
  },
  ui: {
    labelField: "value"
  }
});

// features/keystone/models/ProductTag.ts
var import_core62 = require("@keystone-6/core");
var import_fields62 = require("@keystone-6/core/fields");
var ProductTag = (0, import_core62.list)({
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
      ref: "DiscountCondition.productTags",
      many: true
    }),
    products: (0, import_fields62.relationship)({ ref: "Product.productTags", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/ProductType.ts
var import_core63 = require("@keystone-6/core");
var import_fields63 = require("@keystone-6/core/fields");
var ProductType = (0, import_core63.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    value: (0, import_fields63.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields63.json)(),
    discountConditions: (0, import_fields63.relationship)({
      ref: "DiscountCondition.productTypes",
      many: true
    }),
    products: (0, import_fields63.relationship)({
      ref: "Product.productType",
      many: true
    }),
    taxRates: (0, import_fields63.relationship)({
      ref: "TaxRate.productTypes",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ProductVariant.ts
var import_core64 = require("@keystone-6/core");
var import_fields64 = require("@keystone-6/core/fields");
var ProductVariant = (0, import_core64.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    fullTitle: (0, import_fields64.virtual)({
      field: import_core64.graphql.field({
        type: import_core64.graphql.String,
        resolve: async (item, args, context) => {
          const { product } = await context.query.ProductVariant.findOne({
            where: { id: item.id.toString() },
            query: "product { title }"
          });
          return `${product?.title ? `${product.title} - ` : ""}${item.title}`;
        }
      })
    }),
    title: (0, import_fields64.text)({
      validation: {
        isRequired: true
      }
    }),
    sku: (0, import_fields64.text)(),
    barcode: (0, import_fields64.text)(),
    ean: (0, import_fields64.text)(),
    upc: (0, import_fields64.text)(),
    inventoryQuantity: (0, import_fields64.integer)({
      validation: {
        isRequired: true
      }
    }),
    allowBackorder: (0, import_fields64.checkbox)(),
    manageInventory: (0, import_fields64.checkbox)({
      defaultValue: true
    }),
    hsCode: (0, import_fields64.text)(),
    originCountry: (0, import_fields64.text)(),
    midCode: (0, import_fields64.text)(),
    material: (0, import_fields64.text)(),
    metadata: (0, import_fields64.json)(),
    variantRank: (0, import_fields64.integer)({
      defaultValue: 0
    }),
    product: (0, import_fields64.relationship)({
      ref: "Product.productVariants"
    }),
    claimItems: (0, import_fields64.relationship)({
      ref: "ClaimItem.productVariant",
      many: true
    }),
    lineItems: (0, import_fields64.relationship)({
      ref: "LineItem.productVariant",
      many: true
    }),
    prices: (0, import_fields64.relationship)({
      ref: "MoneyAmount.productVariant",
      many: true
    }),
    productOptionValues: (0, import_fields64.relationship)({
      ref: "ProductOptionValue.productVariants",
      many: true
    }),
    location: (0, import_fields64.relationship)({
      ref: "Location.variants"
    }),
    stockMovements: (0, import_fields64.relationship)({
      ref: "StockMovement.variant",
      many: true
    }),
    measurements: (0, import_fields64.relationship)({
      ref: "Measurement.productVariant",
      many: true
    }),
    primaryImage: (0, import_fields64.relationship)({
      ref: "ProductImage.productVariants",
      many: false
    }),
    ...trackingFields
  },
  ui: {
    labelField: "fullTitle"
  }
});

// features/keystone/models/Refund.ts
var import_core65 = require("@keystone-6/core");
var import_fields65 = require("@keystone-6/core/fields");
var Refund = (0, import_core65.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    amount: (0, import_fields65.integer)({
      validation: {
        isRequired: true
      }
    }),
    note: (0, import_fields65.text)(),
    reason: (0, import_fields65.select)({
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
    metadata: (0, import_fields65.json)(),
    idempotencyKey: (0, import_fields65.text)(),
    payment: (0, import_fields65.relationship)({
      ref: "Payment.refunds"
    }),
    ...trackingFields
  }
});

// features/keystone/models/Region.ts
var import_core66 = require("@keystone-6/core");
var import_fields66 = require("@keystone-6/core/fields");
var Region = (0, import_core66.list)({
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
    code: (0, import_fields66.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields66.text)({
      validation: {
        isRequired: true
      }
    }),
    taxRate: (0, import_fields66.float)({
      validation: {
        isRequired: true
      }
    }),
    taxCode: (0, import_fields66.text)(),
    metadata: (0, import_fields66.json)(),
    giftCardsTaxable: (0, import_fields66.checkbox)({
      defaultValue: true
    }),
    automaticTaxes: (0, import_fields66.checkbox)({
      defaultValue: true
    }),
    currency: (0, import_fields66.relationship)({
      ref: "Currency.regions"
    }),
    carts: (0, import_fields66.relationship)({
      ref: "Cart.region",
      many: true
    }),
    countries: (0, import_fields66.relationship)({
      ref: "Country.region",
      many: true
    }),
    discounts: (0, import_fields66.relationship)({
      ref: "Discount.regions",
      many: true
    }),
    giftCards: (0, import_fields66.relationship)({
      ref: "GiftCard.region",
      many: true
    }),
    moneyAmounts: (0, import_fields66.relationship)({
      ref: "MoneyAmount.region",
      many: true
    }),
    orders: (0, import_fields66.relationship)({
      ref: "Order.region",
      many: true
    }),
    taxProvider: (0, import_fields66.relationship)({
      ref: "TaxProvider.regions"
    }),
    fulfillmentProviders: (0, import_fields66.relationship)({
      ref: "FulfillmentProvider.regions",
      many: true
    }),
    paymentProviders: (0, import_fields66.relationship)({
      ref: "PaymentProvider.regions",
      many: true
    }),
    shippingOptions: (0, import_fields66.relationship)({
      ref: "ShippingOption.region",
      many: true
    }),
    taxRates: (0, import_fields66.relationship)({
      ref: "TaxRate.region",
      many: true
    }),
    shippingProviders: (0, import_fields66.relationship)({
      ref: "ShippingProvider.regions",
      many: true
    }),
    accountLineItems: (0, import_fields66.relationship)({
      ref: "AccountLineItem.region",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Return.ts
var import_core67 = require("@keystone-6/core");
var import_fields67 = require("@keystone-6/core/fields");
var Return = (0, import_core67.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    status: (0, import_fields67.select)({
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
    shippingData: (0, import_fields67.json)(),
    refundAmount: (0, import_fields67.integer)({
      validation: {
        isRequired: true
      }
    }),
    receivedAt: (0, import_fields67.timestamp)(),
    metadata: (0, import_fields67.json)(),
    idempotencyKey: (0, import_fields67.text)(),
    noNotification: (0, import_fields67.checkbox)(),
    claimOrder: (0, import_fields67.relationship)({
      ref: "ClaimOrder.return"
    }),
    swap: (0, import_fields67.relationship)({
      ref: "Swap.return"
    }),
    order: (0, import_fields67.relationship)({
      ref: "Order.returns"
    }),
    returnItems: (0, import_fields67.relationship)({
      ref: "ReturnItem.return",
      many: true
    }),
    shippingMethod: (0, import_fields67.relationship)({
      ref: "ShippingMethod.return"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ReturnItem.ts
var import_core68 = require("@keystone-6/core");
var import_fields68 = require("@keystone-6/core/fields");
var ReturnItem = (0, import_core68.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    quantity: (0, import_fields68.integer)({
      validation: {
        isRequired: true
      }
    }),
    isRequested: (0, import_fields68.checkbox)({
      defaultValue: true
    }),
    requestedQuantity: (0, import_fields68.integer)(),
    receivedQuantity: (0, import_fields68.integer)(),
    metadata: (0, import_fields68.json)(),
    note: (0, import_fields68.text)(),
    return: (0, import_fields68.relationship)({
      ref: "Return.returnItems"
    }),
    lineItem: (0, import_fields68.relationship)({
      ref: "LineItem.returnItems"
    }),
    returnReason: (0, import_fields68.relationship)({
      ref: "ReturnReason.returnItems"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ReturnReason.ts
var import_core69 = require("@keystone-6/core");
var import_fields69 = require("@keystone-6/core/fields");
var ReturnReason = (0, import_core69.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadReturns({ session }) || permissions.canManageReturns({ session }),
      create: permissions.canManageReturns,
      update: permissions.canManageReturns,
      delete: permissions.canManageReturns
    }
  },
  fields: {
    value: (0, import_fields69.text)({
      isIndexed: "unique",
      validation: {
        isRequired: true
      }
    }),
    label: (0, import_fields69.text)({
      validation: {
        isRequired: true
      }
    }),
    description: (0, import_fields69.text)(),
    metadata: (0, import_fields69.json)(),
    parentReturnReason: (0, import_fields69.relationship)({
      ref: "ReturnReason"
    }),
    returnItems: (0, import_fields69.relationship)({
      ref: "ReturnItem.returnReason",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Role.ts
var import_fields70 = require("@keystone-6/core/fields");
var import_core70 = require("@keystone-6/core");
var Role = (0, import_core70.list)({
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
    name: (0, import_fields70.text)({ validation: { isRequired: true } }),
    ...permissionFields,
    assignedTo: (0, import_fields70.relationship)({
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
var import_core71 = require("@keystone-6/core");
var import_fields72 = require("@keystone-6/core/fields");
var RuleType = (0, import_core71.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageProducts,
      update: permissions.canManageProducts,
      delete: permissions.canManageProducts
    }
  },
  fields: {
    name: (0, import_fields72.text)({ validation: { isRequired: true } }),
    ruleAttribute: (0, import_fields72.text)({ validation: { isRequired: true }, isIndexed: "unique" }),
    priceSets: (0, import_fields72.relationship)({ ref: "PriceSet.ruleTypes", many: true }),
    ...trackingFields
  }
});

// features/keystone/models/SalesChannel.ts
var import_core72 = require("@keystone-6/core");
var import_fields73 = require("@keystone-6/core/fields");
var SalesChannel = (0, import_core72.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadSalesChannels({ session }) || permissions.canManageSalesChannels({ session }),
      create: permissions.canManageSalesChannels,
      update: permissions.canManageSalesChannels,
      delete: permissions.canManageSalesChannels
    }
  },
  fields: {
    name: (0, import_fields73.text)(),
    description: (0, import_fields73.text)(),
    isDisabled: (0, import_fields73.checkbox)(),
    ...trackingFields
  }
});

// features/keystone/models/ShippingLabel.ts
var import_core73 = require("@keystone-6/core");
var import_fields74 = require("@keystone-6/core/fields");
var ShippingLabel = (0, import_core73.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadFulfillments({ session }) || permissions.canManageFulfillments({ session }),
      create: () => false,
      update: permissions.canManageFulfillments,
      delete: () => false
    }
  },
  fields: {
    status: (0, import_fields74.select)({
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
    labelUrl: (0, import_fields74.text)(),
    carrier: (0, import_fields74.text)(),
    service: (0, import_fields74.text)(),
    rate: (0, import_fields74.json)(),
    // Tracking information
    trackingNumber: (0, import_fields74.text)(),
    trackingUrl: (0, import_fields74.text)(),
    // Relationships
    order: (0, import_fields74.relationship)({
      ref: "Order.shippingLabels",
      many: false
    }),
    provider: (0, import_fields74.relationship)({
      ref: "ShippingProvider.labels",
      many: false
    }),
    fulfillment: (0, import_fields74.relationship)({
      ref: "Fulfillment.shippingLabels",
      many: false
    }),
    // Additional data
    data: (0, import_fields74.json)(),
    metadata: (0, import_fields74.json)(),
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
var import_core74 = require("@keystone-6/core");
var import_fields75 = require("@keystone-6/core/fields");
var ShippingMethod = (0, import_core74.list)({
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
    price: (0, import_fields75.integer)({
      validation: {
        isRequired: true
      }
    }),
    data: (0, import_fields75.json)(),
    return: (0, import_fields75.relationship)({
      ref: "Return.shippingMethod"
    }),
    order: (0, import_fields75.relationship)({
      ref: "Order.shippingMethods"
    }),
    claimOrder: (0, import_fields75.relationship)({
      ref: "ClaimOrder.shippingMethods"
    }),
    cart: (0, import_fields75.relationship)({
      ref: "Cart.shippingMethods"
    }),
    swap: (0, import_fields75.relationship)({
      ref: "Swap.shippingMethods"
    }),
    shippingOption: (0, import_fields75.relationship)({
      ref: "ShippingOption.shippingMethods"
    }),
    shippingMethodTaxLines: (0, import_fields75.relationship)({
      ref: "ShippingMethodTaxLine.shippingMethod",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingMethodTaxLine.ts
var import_core75 = require("@keystone-6/core");
var import_fields76 = require("@keystone-6/core/fields");
var ShippingMethodTaxLine = (0, import_core75.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    rate: (0, import_fields76.float)({
      validation: {
        isRequired: true
      }
    }),
    name: (0, import_fields76.text)({
      validation: {
        isRequired: true
      }
    }),
    code: (0, import_fields76.text)(),
    metadata: (0, import_fields76.json)(),
    shippingMethod: (0, import_fields76.relationship)({
      ref: "ShippingMethod.shippingMethodTaxLines"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingOption.ts
var import_core76 = require("@keystone-6/core");
var import_fields77 = require("@keystone-6/core/fields");
var import_core77 = require("@keystone-6/core");
function formatCurrency4(amount, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
}
var ShippingOption = (0, import_core76.list)({
  access: {
    operation: {
      query: () => true,
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    name: (0, import_fields77.text)({
      validation: {
        isRequired: true
      }
    }),
    uniqueKey: (0, import_fields77.text)({
      validation: { isRequired: true },
      isIndexed: "unique"
    }),
    priceType: (0, import_fields77.select)({
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
    amount: (0, import_fields77.integer)({
      validation: {
        isRequired: false
      }
    }),
    isReturn: (0, import_fields77.checkbox)(),
    data: (0, import_fields77.json)(),
    metadata: (0, import_fields77.json)(),
    adminOnly: (0, import_fields77.checkbox)(),
    region: (0, import_fields77.relationship)({
      ref: "Region.shippingOptions"
    }),
    fulfillmentProvider: (0, import_fields77.relationship)({
      ref: "FulfillmentProvider.shippingOptions"
    }),
    shippingProfile: (0, import_fields77.relationship)({
      ref: "ShippingProfile.shippingOptions"
    }),
    customShippingOptions: (0, import_fields77.relationship)({
      ref: "CustomShippingOption.shippingOption",
      many: true
    }),
    shippingMethods: (0, import_fields77.relationship)({
      ref: "ShippingMethod.shippingOption",
      many: true
    }),
    shippingOptionRequirements: (0, import_fields77.relationship)({
      ref: "ShippingOptionRequirement.shippingOption",
      many: true
    }),
    taxRates: (0, import_fields77.relationship)({
      ref: "TaxRate.shippingOptions",
      many: true
    }),
    calculatedAmount: (0, import_fields77.virtual)({
      field: import_core77.graphql.field({
        type: import_core77.graphql.String,
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
    isTaxInclusive: (0, import_fields77.virtual)({
      field: import_core77.graphql.field({
        type: import_core77.graphql.Boolean,
        resolve() {
          return true;
        }
      })
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingOptionRequirement.ts
var import_core78 = require("@keystone-6/core");
var import_fields78 = require("@keystone-6/core/fields");
var ShippingOptionRequirement = (0, import_core78.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    type: (0, import_fields78.select)({
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
    amount: (0, import_fields78.integer)({
      validation: {
        isRequired: true
      }
    }),
    shippingOption: (0, import_fields78.relationship)({
      ref: "ShippingOption.shippingOptionRequirements"
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingProfile.ts
var import_core79 = require("@keystone-6/core");
var import_fields79 = require("@keystone-6/core/fields");
var ShippingProfile = (0, import_core79.list)({
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
      validation: {
        isRequired: true
      }
    }),
    type: (0, import_fields79.select)({
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
    metadata: (0, import_fields79.json)(),
    products: (0, import_fields79.relationship)({
      ref: "Product.shippingProfile",
      many: true
    }),
    shippingOptions: (0, import_fields79.relationship)({
      ref: "ShippingOption.shippingProfile",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/ShippingProvider.ts
var import_core80 = require("@keystone-6/core");
var import_fields80 = require("@keystone-6/core/fields");
var ShippingProvider = (0, import_core80.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    name: (0, import_fields80.text)({
      validation: { isRequired: true }
    }),
    isActive: (0, import_fields80.checkbox)({
      defaultValue: false
    }),
    accessToken: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        itemView: { fieldMode: "hidden" }
      }
    }),
    // Adapter function fields
    createLabelFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the order data"
      }
    }),
    getRatesFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the order data"
      }
    }),
    validateAddressFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the address data"
      }
    }),
    trackShipmentFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the tracking number"
      }
    }),
    cancelLabelFunction: (0, import_fields80.text)({
      validation: { isRequired: true },
      ui: {
        description: "Either an adapter name (e.g. 'shippo') or an HTTP endpoint that will be called with the label ID"
      }
    }),
    metadata: (0, import_fields80.json)(),
    // Relationships
    regions: (0, import_fields80.relationship)({
      ref: "Region.shippingProviders",
      many: true
    }),
    labels: (0, import_fields80.relationship)({
      ref: "ShippingLabel.provider",
      many: true
    }),
    fulfillmentProvider: (0, import_fields80.relationship)({
      ref: "FulfillmentProvider.shippingProviders",
      many: false
    }),
    fromAddress: (0, import_fields80.relationship)({
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
var import_core81 = require("@keystone-6/core");
var import_fields81 = require("@keystone-6/core/fields");
var StockMovement = (0, import_core81.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadProducts({ session }) || permissions.canManageProducts({ session }),
      create: () => false,
      update: () => false,
      delete: () => false
    }
  },
  fields: {
    type: (0, import_fields81.select)({
      type: "enum",
      options: [
        { label: "Receive", value: "RECEIVE" },
        { label: "Remove", value: "REMOVE" }
      ],
      validation: { isRequired: true }
    }),
    quantity: (0, import_fields81.integer)({
      validation: { isRequired: true }
    }),
    reason: (0, import_fields81.text)(),
    note: (0, import_fields81.text)(),
    variant: (0, import_fields81.relationship)({
      ref: "ProductVariant.stockMovements",
      many: false
    }),
    ...trackingFields
  }
});

// features/keystone/models/Store.ts
var import_core82 = require("@keystone-6/core");
var import_fields82 = require("@keystone-6/core/fields");
var import_core83 = require("@keystone-6/core");

// features/platform/store-settings/lib/store-logo.ts
var DEFAULT_STORE_LOGO_ICON = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" height="100%" width="100%" viewBox="0 0 42 48"><path fill="#155eef" fill-rule="evenodd" d="m22.102 20.86 9.9-9.9L29.88 8.84l-7.339 7.339V3h-3v13.178l-7.339-7.34-2.121 2.122 9.9 9.9 1.06 1.06zm2.12 2.121 9.9-9.9 2.121 2.122-7.339 7.339H42v3H28.904l7.34 7.339L34.121 35l-9.9-9.899-1.06-1.06zM7.96 35.001l9.9-9.899 1.06-1.06-1.06-1.061-9.9-9.9-2.121 2.122 7.339 7.339H.002v3h13.176l-7.34 7.339zm12.02-7.777-9.9 9.9 2.122 2.12 7.339-7.338V45h3V31.906l7.339 7.338L32 37.124l-9.9-9.9-1.06-1.061z" clip-rule="evenodd"/></svg>';
var DEFAULT_STORE_LOGO_COLOR = "0";
function normalizeStoreLogoColor(value) {
  const numeric = Number.parseFloat(String(value ?? DEFAULT_STORE_LOGO_COLOR));
  if (!Number.isFinite(numeric)) return DEFAULT_STORE_LOGO_COLOR;
  return String((numeric % 360 + 360) % 360);
}

// features/keystone/utils/storeLogo.ts
var ALLOWED_ELEMENTS = /* @__PURE__ */ new Set([
  "svg",
  "g",
  "path",
  "defs",
  "lineargradient",
  "radialgradient",
  "stop",
  "clippath",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "title",
  "desc"
]);
var ALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set([
  "xmlns",
  "fill",
  "fill-rule",
  "clip-rule",
  "height",
  "width",
  "viewbox",
  "d",
  "clip-path",
  "id",
  "x1",
  "x2",
  "y1",
  "y2",
  "gradientunits",
  "gradienttransform",
  "offset",
  "stop-color",
  "stop-opacity",
  "opacity",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "transform",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "points",
  "role",
  "aria-hidden",
  "aria-label",
  "preserveaspectratio"
]);
var ATTRIBUTE_PATTERN = /\s+([A-Za-z_:][\w:.-]*)\s*=\s*("[^"]*"|'[^']*')/g;
var TAG_PATTERN = /<\/?\s*([A-Za-z][\w:-]*)([^<>]*)>/g;
function sanitizeStoreLogoSvg(svg) {
  const source = svg.trim();
  if (!source.startsWith("<svg") || !source.endsWith("</svg>") || source.length > 1e5) {
    return "";
  }
  if (/<!|<\?|\b(?:javascript|data|vbscript):|\bon[a-z]+\s*=|\b(?:href|src|style)\s*=/i.test(source)) {
    return "";
  }
  let tagCount = 0;
  let match;
  TAG_PATTERN.lastIndex = 0;
  while (match = TAG_PATTERN.exec(source)) {
    tagCount += 1;
    const element = match[1].toLowerCase();
    if (!ALLOWED_ELEMENTS.has(element)) return "";
    if (match[0].startsWith("</")) continue;
    const attributes = match[2];
    let consumed = "";
    ATTRIBUTE_PATTERN.lastIndex = 0;
    let attributeMatch;
    while (attributeMatch = ATTRIBUTE_PATTERN.exec(attributes)) {
      consumed += attributeMatch[0];
      const attribute = attributeMatch[1].toLowerCase();
      const value = attributeMatch[2].slice(1, -1);
      if (!ALLOWED_ATTRIBUTES.has(attribute)) return "";
      if (attribute === "id" && !/^[A-Za-z_][\w:.-]*$/.test(value)) return "";
      if (/url\(/i.test(value) && !/^url\(#[A-Za-z_][\w:.-]*\)$/.test(value)) return "";
    }
    const remainder = attributes.replace(consumed, "").replace(/\//g, "").trim();
    if (remainder) return "";
  }
  TAG_PATTERN.lastIndex = 0;
  if (tagCount === 0 || source.replace(TAG_PATTERN, "").trim()) return "";
  return source;
}

// features/keystone/models/Store.ts
var Store = (0, import_core82.list)({
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
    name: (0, import_fields82.text)({
      defaultValue: "Openfront Store",
      validation: {
        isRequired: true
      }
    }),
    defaultCurrencyCode: (0, import_fields82.text)({
      defaultValue: "usd",
      validation: {
        isRequired: true
      }
    }),
    homepageTitle: (0, import_fields82.text)({
      defaultValue: "Openfront Next.js Starter"
    }),
    homepageDescription: (0, import_fields82.text)({
      defaultValue: "A performant frontend e-commerce starter template with Next.js 15 and Openfront."
    }),
    logoIcon: (0, import_fields82.text)({
      defaultValue: DEFAULT_STORE_LOGO_ICON,
      hooks: {
        resolveInput: ({ resolvedData, fieldKey }) => {
          const value = resolvedData[fieldKey];
          if (value === void 0 || value === null || value === "") return value;
          return typeof value === "string" ? sanitizeStoreLogoSvg(value) : "";
        },
        validate: ({ inputData, resolvedData, fieldKey, addValidationError }) => {
          const submitted = inputData?.[fieldKey];
          if (typeof submitted === "string" && submitted.trim() && !resolvedData?.[fieldKey]) {
            addValidationError("Logo must be a valid, safe SVG document");
          }
        }
      }
    }),
    logoColor: (0, import_fields82.text)({
      defaultValue: DEFAULT_STORE_LOGO_COLOR,
      hooks: {
        resolveInput: ({ resolvedData, fieldKey }) => {
          const value = resolvedData[fieldKey];
          return value === void 0 ? value : normalizeStoreLogoColor(value);
        }
      }
    }),
    metadata: (0, import_fields82.json)(),
    swapLinkTemplate: (0, import_fields82.text)(),
    paymentLinkTemplate: (0, import_fields82.text)(),
    inviteLinkTemplate: (0, import_fields82.text)(),
    // currency: relationship({
    //   ref: "Currency.stores",
    // }),
    currencies: (0, import_fields82.relationship)({
      ref: "Currency.stores",
      many: true
    }),
    paymentProviders: (0, import_fields82.virtual)({
      field: import_core83.graphql.field({
        type: import_core83.graphql.list(
          import_core83.graphql.object()({
            name: "PaymentProviderConfig",
            fields: {
              provider: import_core83.graphql.field({ type: import_core83.graphql.String }),
              publishableKey: import_core83.graphql.field({ type: import_core83.graphql.String })
            }
          })
        ),
        resolve: async (_item, _args, context) => {
          const installedProviders = await context.sudo().query.PaymentProvider.findMany({
            where: { isInstalled: { equals: true } },
            query: "code"
          });
          return installedProviders.map((provider) => getPublicPaymentProviderConfig(provider.code || "")).filter((provider) => Boolean(provider));
        }
      }),
      ui: { query: "{ provider publishableKey }" }
    }),
    ...trackingFields
  }
});

// features/keystone/models/Swap.ts
var import_core84 = require("@keystone-6/core");
var import_fields83 = require("@keystone-6/core/fields");
var Swap = (0, import_core84.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadOrders({ session }) || permissions.canManageOrders({ session }),
      create: permissions.canManageOrders,
      update: permissions.canManageOrders,
      delete: permissions.canManageOrders
    }
  },
  fields: {
    fulfillmentStatus: (0, import_fields83.select)({
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
    paymentStatus: (0, import_fields83.select)({
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
    differenceDue: (0, import_fields83.integer)(),
    confirmedAt: (0, import_fields83.timestamp)(),
    metadata: (0, import_fields83.json)(),
    idempotencyKey: (0, import_fields83.text)(),
    noNotification: (0, import_fields83.checkbox)(),
    canceledAt: (0, import_fields83.timestamp)(),
    allowBackorder: (0, import_fields83.checkbox)(),
    cart: (0, import_fields83.relationship)({
      ref: "Cart.swap"
    }),
    order: (0, import_fields83.relationship)({
      ref: "Order.swaps"
    }),
    address: (0, import_fields83.relationship)({
      ref: "Address.swaps"
    }),
    lineItems: (0, import_fields83.relationship)({
      ref: "LineItem.swap",
      many: true
    }),
    fulfillments: (0, import_fields83.relationship)({
      ref: "Fulfillment.swap",
      many: true
    }),
    payment: (0, import_fields83.relationship)({
      ref: "Payment.swap"
    }),
    return: (0, import_fields83.relationship)({
      ref: "Return.swap"
    }),
    shippingMethods: (0, import_fields83.relationship)({
      ref: "ShippingMethod.swap",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/TaxProvider.ts
var import_core85 = require("@keystone-6/core");
var import_fields84 = require("@keystone-6/core/fields");
var TaxProvider = (0, import_core85.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: ({ session }) => !!session?.data.isAdmin,
      update: ({ session }) => !!session?.data.isAdmin,
      delete: ({ session }) => !!session?.data.isAdmin
    }
  },
  fields: {
    isInstalled: (0, import_fields84.checkbox)({
      defaultValue: true
    }),
    regions: (0, import_fields84.relationship)({
      ref: "Region.taxProvider",
      many: true
    })
  }
});

// features/keystone/models/TaxRate.ts
var import_core86 = require("@keystone-6/core");
var import_fields85 = require("@keystone-6/core/fields");
var TaxRate = (0, import_core86.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    rate: (0, import_fields85.float)(),
    code: (0, import_fields85.text)(),
    name: (0, import_fields85.text)({
      validation: {
        isRequired: true
      }
    }),
    metadata: (0, import_fields85.json)(),
    products: (0, import_fields85.relationship)({
      ref: "Product.taxRates",
      many: true
    }),
    productTypes: (0, import_fields85.relationship)({
      ref: "ProductType.taxRates",
      many: true
    }),
    region: (0, import_fields85.relationship)({
      ref: "Region.taxRates"
    }),
    shippingOptions: (0, import_fields85.relationship)({
      ref: "ShippingOption.taxRates",
      many: true
    }),
    ...trackingFields
  }
});

// features/keystone/models/Team.ts
var import_core87 = require("@keystone-6/core");
var import_fields86 = require("@keystone-6/core/fields");
var canManageTeams = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { id: { equals: session?.itemId } };
};
var Team = (0, import_core87.list)({
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
    name: (0, import_fields86.text)({
      validation: { isRequired: true }
    }),
    description: (0, import_fields86.text)(),
    members: (0, import_fields86.relationship)({
      ref: "User.team",
      many: true
    }),
    leader: (0, import_fields86.relationship)({
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
var import_core88 = require("@keystone-6/core");
var import_fields87 = require("@keystone-6/core/fields");

// features/keystone/security/user-create.ts
var canCreateUserRole = permissions.canManageUsers;
var PUBLIC_USER_CREATE_FIELDS = /* @__PURE__ */ new Set([
  "name",
  "email",
  "password",
  "phone",
  // createAuth merges initFirstItem.itemData into the DB API input before list
  // hooks run. Public callers cannot supply role because User.role field access
  // is enforced before resolveInput; allowing it here preserves the first admin.
  "role",
  // Guest checkout sends this explicitly. It is always forced to false below.
  "hasAccount"
]);
function resolvePublicUserCreateData({
  inputData,
  resolvedData
}) {
  const restrictedData = { ...resolvedData };
  for (const key of Object.keys(inputData ?? {})) {
    if (!PUBLIC_USER_CREATE_FIELDS.has(key)) {
      delete restrictedData[key];
    }
  }
  restrictedData.hasAccount = false;
  return restrictedData;
}

// features/keystone/models/User.ts
var canManageUsers = ({ session }) => {
  if (!isSignedIn({ session })) {
    return false;
  }
  if (permissions.canManageUsers({ session })) {
    return true;
  }
  return { id: { equals: session?.itemId } };
};
var User = (0, import_core88.list)({
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
  hooks: {
    resolveInput: ({ operation, inputData, resolvedData, context }) => {
      if (operation === "create" && !permissions.canManageUsers({ session: context.session })) {
        return resolvePublicUserCreateData({ inputData, resolvedData });
      }
      return resolvedData;
    }
  },
  ui: {
    // hide the backend UI from regular users
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args)
  },
  fields: {
    name: (0, import_fields87.text)({
      validation: { isRequired: true }
    }),
    email: (0, import_fields87.text)({ isIndexed: "unique", validation: { isRequired: true } }),
    password: (0, import_fields87.password)({
      validation: {
        length: { min: 10, max: 1e3 },
        isRequired: true,
        rejectCommon: true
      }
    }),
    role: (0, import_fields87.relationship)({
      ref: "Role.assignedTo",
      access: {
        create: canCreateUserRole,
        update: permissions.canManageUsers
      },
      ui: {
        itemView: {
          fieldMode: (args) => permissions.canManageUsers(args) ? "edit" : "read"
        }
      }
    }),
    apiKeys: (0, import_fields87.relationship)({ ref: "ApiKey.user", many: true }),
    phone: (0, import_fields87.text)(),
    hasAccount: (0, import_fields87.checkbox)(),
    addresses: (0, import_fields87.relationship)({
      ref: "Address.user",
      many: true
    }),
    orders: (0, import_fields87.relationship)({
      ref: "Order.user",
      many: true
    }),
    orderEvents: (0, import_fields87.relationship)({
      ref: "OrderEvent.user",
      many: true
    }),
    carts: (0, import_fields87.relationship)({
      ref: "Cart.user",
      many: true
    }),
    customerGroups: (0, import_fields87.relationship)({
      ref: "CustomerGroup.users",
      many: true
    }),
    notifications: (0, import_fields87.relationship)({
      ref: "Notification.user",
      many: true
    }),
    payments: (0, import_fields87.relationship)({
      ref: "Payment.user",
      many: true
    }),
    batchJobs: (0, import_fields87.relationship)({
      ref: "BatchJob.createdBy",
      many: true
    }),
    team: (0, import_fields87.relationship)({
      ref: "Team.members",
      many: false
    }),
    teamLead: (0, import_fields87.relationship)({
      ref: "Team.leader",
      many: true
    }),
    userField: (0, import_fields87.relationship)({
      ref: "UserField.user",
      many: false
    }),
    onboardingStatus: (0, import_fields87.select)({
      options: [
        { label: "Not Started", value: "not_started" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Dismissed", value: "dismissed" }
      ],
      defaultValue: "not_started"
    }),
    // Account system fields
    accounts: (0, import_fields87.relationship)({
      ref: "Account.user",
      many: true
    }),
    webhookEndpoints: (0, import_fields87.relationship)({
      ref: "WebhookEndpoint.user",
      many: true,
      ui: { displayMode: "count" }
    }),
    invoices: (0, import_fields87.relationship)({
      ref: "Invoice.user",
      many: true
    }),
    businessAccountRequest: (0, import_fields87.relationship)({
      ref: "BusinessAccountRequest.user",
      many: false
    }),
    customerToken: (0, import_fields87.text)({
      access: {
        read: () => false,
        create: () => false,
        update: () => false
      },
      ui: {
        createView: { fieldMode: "hidden" },
        itemView: { fieldMode: "hidden" },
        listView: { fieldMode: "hidden" }
      },
      db: {
        isNullable: true
      }
    }),
    tokenGeneratedAt: (0, import_fields87.timestamp)(),
    ...(0, import_core88.group)({
      label: "Virtual Fields",
      description: "Calculated fields for user display and cart status",
      fields: {
        firstName: (0, import_fields87.virtual)({
          field: import_core88.graphql.field({
            type: import_core88.graphql.String,
            resolve(item) {
              if (!item.name) return "";
              const parts = item.name.trim().split(/\s+/);
              return parts[0] || "";
            }
          })
        }),
        lastName: (0, import_fields87.virtual)({
          field: import_core88.graphql.field({
            type: import_core88.graphql.String,
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
        activeCartId: (0, import_fields87.virtual)({
          field: import_core88.graphql.field({
            type: import_core88.graphql.String,
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
        billingAddress: (0, import_fields87.virtual)({
          field: (lists) => import_core88.graphql.field({
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
var import_core89 = require("@keystone-6/core");
var import_fields88 = require("@keystone-6/core/fields");
var UserField = (0, import_core89.list)({
  access: {
    operation: {
      query: ({ session }) => permissions.canReadUsers({ session }) || permissions.canManageUsers({ session }),
      create: permissions.canManageUsers,
      update: permissions.canManageUsers,
      delete: permissions.canManageUsers
    }
  },
  fields: {
    user: (0, import_fields88.relationship)({
      ref: "User.userField",
      many: false
    }),
    lastLoginIp: (0, import_fields88.text)(),
    lastLoginUserAgent: (0, import_fields88.text)(),
    loginHistory: (0, import_fields88.json)({
      defaultValue: []
    }),
    preferences: (0, import_fields88.json)({
      defaultValue: {
        theme: "light",
        notifications: true,
        emailNotifications: true
      }
    }),
    notes: (0, import_fields88.text)(),
    lastPasswordChange: (0, import_fields88.timestamp)(),
    failedLoginAttempts: (0, import_fields88.json)({
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

// features/keystone/models/WebhookEvent.ts
var import_core90 = require("@keystone-6/core");
var import_fields89 = require("@keystone-6/core/fields");
var WebhookEvent = (0, import_core90.list)({
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
    deadLetteredAt: (0, import_fields89.timestamp)({
      ui: {
        itemView: { fieldMode: "read" },
        description: "Set when the delivery exhausted its retry budget"
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
  },
  db: {
    extendPrismaSchema: (schema) => schema.replace(
      /(model [^}]+)}/g,
      '$1@@index([delivered, deadLetteredAt, nextAttempt], map: "WebhookEvent_retry_queue_idx")\n}'
    )
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

// features/keystone/index.ts
var import_iron = __toESM(require("@hapi/iron"));
var cookie = __toESM(require("cookie"));
var import_bcryptjs = __toESM(require("bcryptjs"));
function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
function productionEnv(name, developmentFallback) {
  if (process.env[name]) return process.env[name];
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} is required in production`);
  }
  return developmentFallback;
}
var databaseURL = requiredEnv("DATABASE_URL");
var sessionSecret = requiredEnv("SESSION_SECRET");
if (sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long");
}
var listKey = "User";
var trustedProxyIps = new Set(
  (process.env.TRUSTED_PROXY_IPS || "").split(",").map((value) => value.trim()).filter(Boolean)
);
function requestClientIp(req) {
  const remote = String(
    req.socket?.remoteAddress || req.connection?.remoteAddress || ""
  ).replace(/^::ffff:/, "");
  if (trustedProxyIps.has(remote)) {
    const forwarded = req.headers["x-forwarded-for"];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (typeof first === "string" && first.trim()) {
      return first.split(",")[0].trim().replace(/^::ffff:/, "");
    }
    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string" && realIp.trim()) return realIp.trim();
  }
  return remote;
}
var basePath = "/dashboard";
var sessionConfig = {
  maxAge: 60 * 60 * 24 * 30,
  secret: sessionSecret
};
var bucketName = productionEnv("S3_BUCKET_NAME", "keystone-test");
var region = productionEnv("S3_REGION", "ap-southeast-2");
var accessKeyId = productionEnv("S3_ACCESS_KEY_ID", "keystone");
var secretAccessKey = productionEnv("S3_SECRET_ACCESS_KEY", "keystone");
var endpoint = productionEnv("S3_ENDPOINT", "https://sfo3.digitaloceanspaces.com");
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
            const actualClientIP = requestClientIp(context.req);
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
          const oauthToken = await findOAuthToken(
            context,
            accessToken,
            `id clientId scopes expiresAt tokenType isRevoked user { id }`
          );
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
            const digest = customerTokenDigest(accessToken);
            let users = await context.sudo().query.User.findMany({
              where: { customerToken: { equals: digest } },
              take: 1,
              query: `
                id
                tokenGeneratedAt
                accounts(where: { status: { equals: "active" }, accountType: { equals: "business" } }) {
                  id
                  status
                }
              `
            });
            if (!users[0] && process.env.NODE_ENV !== "production") {
              users = await context.sudo().query.User.findMany({
                where: { customerToken: { equals: accessToken } },
                take: 1,
                query: `id tokenGeneratedAt accounts(where: { status: { equals: "active" }, accountType: { equals: "business" } }) { id status }`
              });
            }
            const user = users[0];
            const activeAccount = user?.accounts?.[0];
            if (!user || !activeAccount || !user.tokenGeneratedAt) return;
            const maxAgeDays = Number(process.env.CUSTOMER_TOKEN_MAX_AGE_DAYS || 90);
            const expiresAt = new Date(user.tokenGeneratedAt).getTime() + maxAgeDays * 24 * 60 * 60 * 1e3;
            if (!Number.isFinite(expiresAt) || Date.now() >= expiresAt) return;
            return {
              itemId: user.id,
              listKey,
              customerToken: true,
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
    (0, import_core91.config)({
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
