async function completeInvoicePayment(root, { paymentSessionId }, context) {
  console.log('🚀 BACKEND: completeInvoicePayment started with paymentSessionId:', paymentSessionId);
  
  const sudoContext = context.sudo();
  const user = context.session?.itemId;
  
  console.log('🚀 BACKEND: User ID:', user);

  // Get invoice with payment session data
  console.log('🚀 BACKEND: Fetching payment session...');
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
    console.log('❌ BACKEND: Payment session not found');
    throw new Error("Payment session not found");
  }

  console.log('🚀 BACKEND: Payment session found:', {
    id: paymentSession.id,
    provider: paymentSession.paymentProvider?.code,
    amount: paymentSession.amount,
    hasData: !!paymentSession.data
  });

  const invoice = paymentSession.paymentCollection.invoice;
  if (!invoice) {
    console.log('❌ BACKEND: Invoice not found');
    throw new Error("Invoice not found");
  }

  console.log('🚀 BACKEND: Invoice found:', {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    totalAmount: invoice.totalAmount,
    accountUserId: invoice.account.user.id
  });

  // Verify user has access to this invoice
  if (!user || invoice.account.user.id !== user) {
    console.log('❌ BACKEND: Unauthorized access - User:', user, 'Invoice user:', invoice.account.user.id);
    throw new Error("Unauthorized access to invoice");
  }

  console.log('✅ BACKEND: User authorized for invoice');

  // Process payment based on provider (exactly like checkout)
  console.log('💳 BACKEND: Processing payment with provider:', paymentSession.paymentProvider.code);
  let paymentResult;
  switch (paymentSession.paymentProvider.code) {
    case 'pp_stripe_stripe':
      console.log('💳 BACKEND: Calling captureStripePayment...');
      paymentResult = await captureStripePayment(paymentSession);
      break;
    case 'pp_paypal_paypal':
      console.log('💳 BACKEND: Calling capturePayPalPayment...');
      paymentResult = await capturePayPalPayment(paymentSession);
      break;
    case 'pp_system_default':
      console.log('💳 BACKEND: Manual payment - marking as pending');
      // Manual payment - invoice marked as paid
      paymentResult = { status: 'manual_pending', paymentIntentId: null };
      break;
    default:
      console.log('❌ BACKEND: Unsupported payment provider:', paymentSession.paymentProvider.code);
      throw new Error(`Unsupported payment provider: ${paymentSession.paymentProvider.code}`);
  }
  
  console.log('💳 BACKEND: Payment result:', paymentResult);
  
  if (paymentResult.status !== 'succeeded' && paymentResult.status !== 'manual_pending') {
    console.log('❌ BACKEND: Payment failed with result:', paymentResult);
    throw new Error(`Payment failed: ${paymentResult.error}`);
  }
  
  // Update invoice status to paid and create payment record
  console.log('📝 BACKEND: Updating invoice status to paid...');
  const updatedInvoice = await sudoContext.query.Invoice.updateOne({
    where: { id: invoice.id },
    data: {
      status: 'paid',
      paidAt: new Date().toISOString(),
    }
  });

  console.log('📝 BACKEND: Invoice updated:', {
    id: updatedInvoice.id,
    status: 'paid'
  });

  // Create payment record
  console.log('📝 BACKEND: Creating payment record...');
  await createInvoicePaymentRecord(paymentResult, invoice, paymentSession, sudoContext);
  
  // Update individual orders to show as paid
  console.log('📝 BACKEND: Marking individual orders as paid...');
  await markOrdersAsPaid(invoice, sudoContext);
  
  console.log('✅ BACKEND: Invoice payment completed successfully');
  
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
    
    console.log('=== captureStripePayment for Invoice ===');
    console.log('session.data:', session.data);
    console.log('paymentIntentId:', paymentIntentId);
    
    if (!paymentIntentId) {
      throw new Error('Invalid Stripe payment intent');
    }
    
    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('PaymentIntent status:', paymentIntent.status);
    console.log('PaymentIntent amount:', paymentIntent.amount);
    
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
    
    console.log('=== capturePayPalPayment for Invoice ===');
    console.log('PayPal Order ID:', session.data.orderId);
    console.log('PayPal Order Status:', orderData.status);

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
    console.error('PayPal verification error:', error);
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

    console.log('📝 BACKEND: Found invoice line items:', invoiceLineItems.length);

    // Update each AccountLineItem's payment status (this is what matters for the UI!)
    for (const lineItem of invoiceLineItems) {
      if (lineItem.accountLineItem) {
        const accountLineItem = lineItem.accountLineItem;
        console.log('📝 BACKEND: Updating AccountLineItem payment status:', {
          accountLineItemId: accountLineItem.id,
          orderDisplayId: accountLineItem.orderDisplayId,
          currentStatus: accountLineItem.paymentStatus,
          amount: accountLineItem.amount
        });

        // THIS IS THE KEY - Update AccountLineItem.paymentStatus to 'paid'
        await sudoContext.query.AccountLineItem.updateOne({
          where: { id: accountLineItem.id },
          data: {
            paymentStatus: 'paid'
          }
        });

        console.log('✅ BACKEND: AccountLineItem for Order #' + accountLineItem.orderDisplayId + ' marked as PAID');
      }
    }
  } catch (error) {
    console.error('❌ BACKEND: Error marking account line items as paid:', error);
    throw error;
  }
}


export default completeInvoicePayment;