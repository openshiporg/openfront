// Currencies that don't use decimal places (amount is in whole units, not cents)
const NO_DIVISION_CURRENCIES = [
  "JPY", "KRW", "VND", "CLP", "PYG", "XAF", "XOF",
  "BIF", "DJF", "GNF", "KMF", "MGA", "RWF", "XPF",
  "HTG", "VUV", "XAG", "XDR", "XAU"
];

// Get PayPal API base URL based on sandbox/production mode
const getPayPalBaseUrl = () => {
  const isSandbox = process.env.NEXT_PUBLIC_PAYPAL_SANDBOX !== "false";
  return isSandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
};

// Format amount for PayPal API (handles no-division currencies)
const formatPayPalAmount = (amount: number, currency: string): string => {
  const upperCurrency = currency.toUpperCase();
  const isNoDivision = NO_DIVISION_CURRENCIES.includes(upperCurrency);

  if (isNoDivision) {
    // No division needed - amount is already in whole units
    return amount.toString();
  }
  // Standard currencies - divide by 100 to convert cents to dollars
  return (amount / 100).toFixed(2);
};

// Parse amount from PayPal API response back to internal format (cents)
const parsePayPalAmount = (value: string, currency: string): number => {
  const upperCurrency = currency.toUpperCase();
  const isNoDivision = NO_DIVISION_CURRENCIES.includes(upperCurrency);

  if (isNoDivision) {
    return parseInt(value, 10);
  }
  return Math.round(parseFloat(value) * 100);
};

const getPayPalAccessToken = async () => {
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
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    }
  );

  const { access_token } = await response.json();
  if (!access_token) {
    throw new Error("Failed to get PayPal access token");
  }

  return access_token;
};

export async function handleWebhookFunction({ event, headers }) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error('PayPal webhook ID is not configured');
  }

  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });

  const verification = await response.json();
  const isValid = verification.verification_status === 'SUCCESS';

  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  return {
    isValid: true,
    event,
    type: event.event_type,
    resource: event.resource,
  };
}

export async function createPaymentFunction({ cart, amount, currency }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "AUTHORIZE",
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: formatPayPalAmount(amount, currency),
            },
          },
        ],
      }),
    }
  );

  const order = await response.json();
  if (order.error) {
    throw new Error(`PayPal order creation failed: ${order.error.message}`);
  }

  return {
    orderId: order.id,
    status: order.status,
  };
}

export async function capturePaymentFunction({ paymentId }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paymentId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
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
    data: capture,
  };
}

export async function refundPaymentFunction({ paymentId, amount, currency = "USD" }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(
    `${baseUrl}/v2/payments/captures/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: {
          value: formatPayPalAmount(amount, currency),
          currency_code: currency.toUpperCase(),
        },
      }),
    }
  );

  const refund = await response.json();
  if (refund.error) {
    throw new Error(`PayPal refund failed: ${refund.error.message}`);
  }

  return {
    status: refund.status,
    amount: parsePayPalAmount(refund.amount.value, refund.amount.currency_code),
    data: refund,
  };
}

export async function getPaymentStatusFunction({ paymentId }) {
  const accessToken = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(
    `${baseUrl}/v2/checkout/orders/${paymentId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
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
    data: order,
  };
}

export async function generatePaymentLinkFunction({ paymentId }) {
  return `https://www.paypal.com/activity/payment/${paymentId}`;
} 