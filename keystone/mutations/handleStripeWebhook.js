import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function handleStripeWebhook(root, { event, headers }, context) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Stripe webhook secret is not configured');
  }

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      JSON.stringify(event),
      headers['stripe-signature'],
      webhookSecret
    );
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  const sudoContext = context.sudo();

  // Handle the event
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = stripeEvent.data.object;
      
      // Update payment status if payment ID exists
      if (paymentIntent.metadata.paymentId) {
        const payment = await sudoContext.query.Payment.updateOne({
          where: { id: paymentIntent.metadata.paymentId },
          data: {
            status: 'captured',
            capturedAt: new Date().toISOString(),
            data: {
              ...paymentIntent,
            },
          },
        });

        // Create capture record
        await sudoContext.query.Capture.createOne({
          data: {
            amount: paymentIntent.amount,
            payment: { connect: { id: payment.id } },
            metadata: {
              stripePaymentIntentId: paymentIntent.id,
            },
            createdBy: 'system',
          },
        });
      }

      // Update order status if order ID exists
      if (paymentIntent.metadata.orderId) {
        await sudoContext.query.Order.updateOne({
          where: { id: paymentIntent.metadata.orderId },
          data: {
            status: 'confirmed',
            paymentStatus: 'captured',
          },
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = stripeEvent.data.object;
      
      if (paymentIntent.metadata.paymentId) {
        await sudoContext.query.Payment.updateOne({
          where: { id: paymentIntent.metadata.paymentId },
          data: {
            status: 'failed',
            data: {
              ...paymentIntent,
              error: paymentIntent.last_payment_error,
            },
          },
        });
      }

      if (paymentIntent.metadata.orderId) {
        await sudoContext.query.Order.updateOne({
          where: { id: paymentIntent.metadata.orderId },
          data: {
            status: 'failed',
            paymentStatus: 'failed',
          },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return { success: true };
} 

export default handleStripeWebhook;