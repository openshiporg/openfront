const getPayPalAccessToken = async () => {
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

  const response = await fetch('https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature', {
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

  const response = await fetch(
    "https://api-m.sandbox.paypal.com/v2/checkout/orders",
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
              value: (amount / 100).toFixed(2),
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

  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}/capture`,
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

  return {
    status: capture.status,
    amount: parseFloat(capture.purchase_units[0].payments.captures[0].amount.value) * 100,
    data: capture,
  };
}

export async function refundPaymentFunction({ paymentId, amount }) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/payments/captures/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        amount: {
          value: (amount / 100).toFixed(2),
          currency_code: "USD", // This should come from the original payment
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
    amount: parseFloat(refund.amount.value) * 100,
    data: refund,
  };
}

export async function getPaymentStatusFunction({ paymentId }) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}`,
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

  return {
    status: order.status,
    amount: parseFloat(order.purchase_units[0].amount.value) * 100,
    data: order,
  };
}

export async function generatePaymentLinkFunction({ paymentId }) {
  return `https://www.paypal.com/activity/payment/${paymentId}`;
} 