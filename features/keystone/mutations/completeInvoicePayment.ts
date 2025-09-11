async function completeInvoicePayment(root, { paymentSessionId }, context) {
  const sudoContext = context.sudo();
  const user = context.session?.itemId;

  // Get invoice with payment session data
  const paymentSession = await sudoContext.query.PaymentSession.findOne({
    where: { id: paymentSessionId },
    query: `
      id
      amount
      data
      paymentProvider {
        id
        code
      }
      paymentCollection {
        id
        invoice {
          id
          invoiceNumber
          totalAmount
          status
          currency {
            code
          }
          account {
            id
            user {
              id
            }
          }
        }
      }
    `
  });

  if (!paymentSession) {
    throw new Error("Payment session not found");
  }

  const invoice = paymentSession.paymentCollection.invoice;
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  // Verify user has access to this invoice
  if (!user || invoice.account.user.id !== user) {
    throw new Error("Unauthorized access to invoice");
  }

  // Process payment based on provider (exactly like checkout)
  let paymentResult;
  switch (paymentSession.paymentProvider.code) {
    case 'pp_stripe_stripe':
      paymentResult = await captureStripePayment(paymentSession);
      break;
    case 'pp_paypal_paypal':
      paymentResult = await capturePayPalPayment(paymentSession);
      break;
    case 'pp_system_default':
      // Manual payment - invoice marked as paid
      paymentResult = { status: 'manual_pending', paymentIntentId: null };
      break;
    default:
      throw new Error(`Unsupported payment provider: ${paymentSession.paymentProvider.code}`);
  }
  
  if (paymentResult.status !== 'succeeded' && paymentResult.status !== 'manual_pending') {
    throw new Error(`Payment failed: ${paymentResult.error}`);
  }
  
  // Update invoice status to paid and create payment record
  const updatedInvoice = await sudoContext.query.Invoice.updateOne({
    where: { id: invoice.id },
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
    }
  });

  // Create payment record
  await createInvoicePaymentRecord(paymentResult, invoice, paymentSession, sudoContext);
  
  // Update individual orders to show as paid
  await markOrdersAsPaid(invoice, sudoContext);
  
  return {
    id: updatedInvoice.id,
    status: 'succeeded',
    success: true,
    message: `Invoice ${invoice.invoiceNumber} paid successfully`,
    error: null
  };
}

// Payment processing functions (copied from completeActiveCart.ts)
async function captureStripePayment(session) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  if (!stripe) {
    throw new Error('Stripe not configured');
  }
  
  try {
    // Get the payment intent from the session data
    const paymentIntentId = session.data.clientSecret?.split('_secret_')[0];
    
    if (!paymentIntentId) {
      throw new Error('Invalid Stripe payment intent');
    }
    
    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      return {
        status: 'succeeded',
        paymentIntentId: paymentIntent.id,
        error: null
      };
    } else if (paymentIntent.status === 'requires_capture') {
      // Capture the payment
      const captured = await stripe.paymentIntents.capture(paymentIntentId);
      return {
        status: captured.status === 'succeeded' ? 'succeeded' : 'failed',
        paymentIntentId: captured.id,
        error: captured.status !== 'succeeded' ? 'Payment capture failed' : null
      };
    } else {
      return {
        status: 'failed',
        paymentIntentId: paymentIntent.id,
        error: `Payment status: ${paymentIntent.status}`
      };
    }
  } catch (error) {
    return {
      status: 'failed',
      paymentIntentId: null,
      error: error.message
    };
  }
}

async function capturePayPalPayment(session) {
  if (!session.data.orderId) {
    return {
      status: 'failed',
      paymentIntentId: null,
      error: 'PayPal order ID not found'
    };
  }

  try {
    // Get PayPal access token (same as cart implementation)
    const authResponse = await fetch(`${process.env.PAYPAL_API_URL || 'https://api.paypal.com'}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      throw new Error('PayPal authentication failed');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Verify the order status with PayPal
    const orderResponse = await fetch(`${process.env.PAYPAL_API_URL || 'https://api.paypal.com'}/v2/checkout/orders/${session.data.orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!orderResponse.ok) {
      throw new Error(`PayPal order verification failed: ${orderResponse.status}`);
    }

    const orderData = await orderResponse.json();

    // Verify the order is completed/approved
    if (orderData.status === 'COMPLETED' || orderData.status === 'APPROVED') {
      return {
        status: 'succeeded',
        paymentIntentId: session.data.orderId,
        error: null
      };
    } else {
      return {
        status: 'failed',
        paymentIntentId: session.data.orderId,
        error: `PayPal order status: ${orderData.status}`
      };
    }
  } catch (error) {
    return {
      status: 'failed',
      paymentIntentId: session.data.orderId,
      error: error.message
    };
  }
}

// Helper function to create payment record for invoices
async function createInvoicePaymentRecord(paymentResult, invoice, paymentSession, sudoContext) {
  await sudoContext.query.Payment.createOne({
    data: {
      status: paymentResult.status === 'succeeded' ? 'captured' : 'pending',
      amount: invoice.totalAmount,
      currencyCode: invoice.currency.code,
      data: {
        ...paymentSession.data,
        paymentIntentId: paymentResult.paymentIntentId,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber
      },
      capturedAt: paymentResult.status === 'succeeded' ? new Date().toISOString() : null,
      paymentCollection: { connect: { id: paymentSession.paymentCollection.id } },
      user: invoice.account.user?.id ? { connect: { id: invoice.account.user.id } } : undefined,
    },
  });
}

// Helper function to mark individual orders as paid
async function markOrdersAsPaid(invoice, sudoContext) {
  try {
    // Get all invoice line items with their associated account line items
    const invoiceLineItems = await sudoContext.query.InvoiceLineItem.findMany({
      where: { invoice: { id: { equals: invoice.id } } },
      query: `
        id
        accountLineItem {
          id
          paymentStatus
          amount
          orderDisplayId
          order {
            id
            displayId
            total
          }
        }
      `
    });

    // Update each AccountLineItem's payment status (this is what matters for the UI!)
    for (const lineItem of invoiceLineItems) {
      if (lineItem.accountLineItem) {
        const accountLineItem = lineItem.accountLineItem;

        // THIS IS THE KEY - Update AccountLineItem.paymentStatus to 'paid'
        await sudoContext.query.AccountLineItem.updateOne({
          where: { id: accountLineItem.id },
          data: {
            paymentStatus: 'paid'
          }
        });
      }
    }
  } catch (error) {
    throw error;
  }
}


export default completeInvoicePayment;