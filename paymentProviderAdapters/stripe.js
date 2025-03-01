import Stripe from "stripe";

const getStripeClient = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("Stripe secret key not configured");
  }
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
};

export async function createPaymentFunction({ cart, amount, currency }) {
  const stripe = getStripeClient();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

export async function capturePaymentFunction({ paymentId, amount }) {
  const stripe = getStripeClient();

  const paymentIntent = await stripe.paymentIntents.capture(paymentId, {
    amount_to_capture: amount,
  });

  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount_captured,
    data: paymentIntent,
  };
}

export async function refundPaymentFunction({ paymentId, amount }) {
  const stripe = getStripeClient();

  const refund = await stripe.refunds.create({
    payment_intent: paymentId,
    amount,
  });

  return {
    status: refund.status,
    amount: refund.amount,
    data: refund,
  };
}

export async function getPaymentStatusFunction({ paymentId }) {
  const stripe = getStripeClient();

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);

  return {
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    data: paymentIntent,
  };
}

export async function generatePaymentLinkFunction({ paymentId }) {
  return `https://dashboard.stripe.com/payments/${paymentId}`;
}

export async function handleWebhookFunction({ event, headers }) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured');
  }

  const stripe = getStripeClient();

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      JSON.stringify(event),
      headers['stripe-signature'],
      webhookSecret
    );

    return {
      isValid: true,
      event: stripeEvent,
      type: stripeEvent.type,
      resource: stripeEvent.data.object,
    };
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
} 