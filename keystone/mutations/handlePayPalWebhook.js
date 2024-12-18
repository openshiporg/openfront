async function verifyPayPalWebhook(root, { event, headers }, context) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error('PayPal webhook ID is not configured');
  }

  const response = await fetch('https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64')}`,
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
  return verification.verification_status === 'SUCCESS';
}

export async function handlePayPalWebhook(root, { event, headers }, context) {
  // Verify webhook signature
  const isValid = await verifyPayPalWebhook(event, headers);
  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  const sudoContext = context.sudo();

  // Handle different PayPal webhook events
  switch (event.event_type) {
    case 'PAYMENT.AUTHORIZATION.CREATED': {
      const resource = event.resource;
      
      if (resource.custom_id) {
        await sudoContext.query.Payment.updateOne({
          where: { id: resource.custom_id },
          data: {
            status: 'authorized',
            data: {
              ...resource,
            },
          },
        });

        await sudoContext.query.Order.updateOne({
          where: { id: resource.custom_id },
          data: {
            status: 'pending',
            paymentStatus: 'authorized',
          },
        });
      }
      break;
    }

    case 'PAYMENT.AUTHORIZATION.VOIDED': {
      const resource = event.resource;
      
      if (resource.custom_id) {
        await sudoContext.query.Payment.updateOne({
          where: { id: resource.custom_id },
          data: {
            status: 'canceled',
            canceledAt: new Date().toISOString(),
            data: {
              ...resource,
            },
          },
        });

        await sudoContext.query.Order.updateOne({
          where: { id: resource.custom_id },
          data: {
            status: 'canceled',
            paymentStatus: 'canceled',
          },
        });
      }
      break;
    }

    case 'PAYMENT.CAPTURE.COMPLETED': {
      const resource = event.resource;
      
      if (resource.custom_id) {
        const payment = await sudoContext.query.Payment.updateOne({
          where: { id: resource.custom_id },
          data: {
            status: 'captured',
            capturedAt: new Date().toISOString(),
            data: {
              ...resource,
            },
          },
        });

        // Create capture record
        await sudoContext.query.Capture.createOne({
          data: {
            amount: parseInt(resource.amount.value * 100), // Convert to cents
            payment: { connect: { id: payment.id } },
            metadata: {
              paypalCaptureId: resource.id,
            },
            createdBy: 'system',
          },
        });

        await sudoContext.query.Order.updateOne({
          where: { id: resource.custom_id },
          data: {
            status: 'confirmed',
            paymentStatus: 'captured',
          },
        });
      }
      break;
    }

    case 'PAYMENT.CAPTURE.DENIED': {
      const resource = event.resource;
      
      if (resource.custom_id) {
        await sudoContext.query.Payment.updateOne({
          where: { id: resource.custom_id },
          data: {
            status: 'failed',
            data: {
              ...resource,
            },
          },
        });

        await sudoContext.query.Order.updateOne({
          where: { id: resource.custom_id },
          data: {
            status: 'failed',
            paymentStatus: 'failed',
          },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.event_type}`);
  }

  return { success: true };
} 

export default handlePayPalWebhook;