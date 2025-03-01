"use server";

import { capturePayment, handleWebhook } from "../utils/paymentProviderAdapter";

async function handlePaymentProviderWebhook(root, { providerId, event, headers }, context) {
  const sudoContext = context.sudo();

  // Get the payment provider
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
    `,
  });

  if (!provider || !provider.isInstalled) {
    throw new Error("Payment provider not found or not installed");
  }

  // Verify and parse webhook using the adapter
  const { type, resource } = await handleWebhook({ provider, event, headers });

  // Handle the event based on type patterns
  if (type.match(/payment_intent\.succeeded|PAYMENT\.CAPTURE\.COMPLETED/)) {
    // Handle successful payment
    const paymentId = resource.metadata?.paymentId || resource.custom_id;
    if (paymentId) {
      const captureResult = await capturePayment({
        provider,
        paymentId: resource.id,
        amount: typeof resource.amount === 'number' ? 
          resource.amount : 
          parseInt(resource.amount.value * 100),
      });

      const payment = await sudoContext.query.Payment.updateOne({
        where: { id: paymentId },
        data: {
          status: captureResult.status,
          capturedAt: new Date().toISOString(),
          data: captureResult.data,
        },
      });

      // Create capture record
      await sudoContext.query.Capture.createOne({
        data: {
          amount: captureResult.amount,
          payment: { connect: { id: payment.id } },
          metadata: {
            providerId,
            paymentId: resource.id,
          },
          createdBy: 'system',
        },
      });

      // Update order if exists
      const orderId = resource.metadata?.orderId || resource.custom_id;
      if (orderId) {
        await sudoContext.query.Order.updateOne({
          where: { id: orderId },
          data: {
            status: 'completed',
            paymentStatus: 'captured',
          },
        });
      }
    }
  } else if (type.match(/payment_intent\.payment_failed|PAYMENT\.CAPTURE\.DENIED/)) {
    // Handle failed payment
    const paymentId = resource.metadata?.paymentId || resource.custom_id;
    if (paymentId) {
      await sudoContext.query.Payment.updateOne({
        where: { id: paymentId },
        data: {
          status: 'failed',
          data: {
            ...resource,
            error: resource.last_payment_error || resource.error,
          },
        },
      });

      // Update order if exists
      const orderId = resource.metadata?.orderId || resource.custom_id;
      if (orderId) {
        await sudoContext.query.Order.updateOne({
          where: { id: orderId },
          data: {
            status: 'failed',
            paymentStatus: 'failed',
          },
        });
      }
    }
  } else if (type === 'PAYMENT.AUTHORIZATION.CREATED') {
    // Handle payment authorization
    const paymentId = resource.custom_id;
    if (paymentId) {
      await sudoContext.query.Payment.updateOne({
        where: { id: paymentId },
        data: {
          status: 'authorized',
          data: resource,
        },
      });

      await sudoContext.query.Order.updateOne({
        where: { id: paymentId },
        data: {
          status: 'pending',
          paymentStatus: 'authorized',
        },
      });
    }
  } else if (type === 'PAYMENT.AUTHORIZATION.VOIDED') {
    // Handle voided authorization
    const paymentId = resource.custom_id;
    if (paymentId) {
      await sudoContext.query.Payment.updateOne({
        where: { id: paymentId },
        data: {
          status: 'canceled',
          canceledAt: new Date().toISOString(),
          data: resource,
        },
      });

      await sudoContext.query.Order.updateOne({
        where: { id: paymentId },
        data: {
          status: 'canceled',
          paymentStatus: 'canceled',
        },
      });
    }
  } else {
    console.log(`Unhandled webhook event type: ${type}`);
  }

  return { success: true };
}

export default handlePaymentProviderWebhook;
