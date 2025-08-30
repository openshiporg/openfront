// Pay Invoice - Core payment processing for business accounts
async function payInvoice(root, { invoiceId, paymentData }, context) {
  const sudoContext = context.sudo();
  
  // Get invoice with all related data
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
    throw new Error('Invoice not found');
  }

  if (invoice.status === 'paid') {
    throw new Error('Invoice is already paid');
  }

  // Ensure user has permission to pay this invoice
  if (!context.session?.itemId || invoice.user.id !== context.session.itemId) {
    throw new Error('Unauthorized to pay this invoice');
  }

  // Note: With region-based invoicing, invoice currency may differ from account currency
  // This is expected behavior - EUR invoices can be paid against USD accounts using conversion

  try {
    // Process payment based on payment data
    let paymentResult;
    
    switch (paymentData.paymentMethod) {
      case 'stripe':
        paymentResult = await processStripePayment(paymentData, invoice);
        break;
      case 'paypal':
        paymentResult = await processPayPalPayment(paymentData, invoice);
        break;
      case 'manual':
        // Manual payment (bank transfer, check, etc.)
        paymentResult = {
          status: 'succeeded',
          paymentIntentId: `manual_${Date.now()}`,
          data: paymentData
        };
        break;
      default:
        throw new Error(`Unsupported payment method: ${paymentData.paymentMethod}`);
    }

    if (paymentResult.status !== 'succeeded') {
      throw new Error(`Payment failed: ${paymentResult.error}`);
    }

    // Use transaction to update all related records atomically
    const updates = await sudoContext.prisma.$transaction(async (tx) => {
      // Update invoice status
      const updatedInvoice = await sudoContext.query.Invoice.updateOne({
        where: { id: invoiceId },
        data: {
          status: 'paid',
          paidAt: new Date().toISOString(),
          metadata: {
            ...invoice.metadata,
            paymentResult,
            paidAt: new Date().toISOString()
          }
        }
      });

      // Update all related AccountLineItems to paid
      const lineItemUpdates = [];
      for (const lineItem of invoice.lineItems) {
        if (lineItem.accountLineItem.paymentStatus !== 'paid') {
          const updated = await sudoContext.query.AccountLineItem.updateOne({
            where: { id: lineItem.accountLineItem.id },
            data: { paymentStatus: 'paid' }
          });
          lineItemUpdates.push(updated);
        }
      }

      // Update account paidAmount with currency conversion if needed
      const totalLineItemAmount = invoice.lineItems.reduce(
        (sum, item) => sum + (item.accountLineItem.amount || 0), 
        0
      );
      
      // Convert invoice amount to account currency if different
      const convertCurrency = require('../utils/currencyConversion').default;
      const convertedAmount = invoice.currency.code !== invoice.account.currency.code 
        ? await convertCurrency(totalLineItemAmount, invoice.currency.code, invoice.account.currency.code)
        : totalLineItemAmount;
      
      const updatedAccount = await sudoContext.query.Account.updateOne({
        where: { id: invoice.account.id },
        data: {
          paidAmount: (invoice.account.paidAmount || 0) + convertedAmount
        }
      });

      // Create payment record
      const payment = await sudoContext.query.Payment.createOne({
        data: {
          status: 'captured',
          amount: invoice.totalAmount,
          currencyCode: invoice.currency.code,
          data: paymentResult,
          capturedAt: new Date().toISOString(),
          user: { connect: { id: invoice.user.id } },
          // Note: Need to add invoice relationship to Payment model
          metadata: {
            invoiceId: invoiceId,
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
    console.error('Payment processing error:', error);
    throw new Error(`Payment failed: ${error.message}`);
  }
}

// Stripe payment processing
async function processStripePayment(paymentData, invoice) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: invoice.totalAmount,
      currency: invoice.currency.code.toLowerCase(),
      payment_method: paymentData.paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        invoiceId: invoice.id,
        accountId: invoice.account.id,
        userId: invoice.user.id
      }
    });

    return {
      status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed',
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.status !== 'succeeded' ? `Stripe status: ${paymentIntent.status}` : null,
      data: paymentIntent
    };
  } catch (error) {
    return {
      status: 'failed',
      paymentIntentId: null,
      error: error.message,
      data: error
    };
  }
}

// PayPal payment processing
async function processPayPalPayment(paymentData, invoice) {
  try {
    // Get PayPal access token
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

    // Capture the PayPal order
    const captureResponse = await fetch(`${process.env.PAYPAL_API_URL || 'https://api.paypal.com'}/v2/checkout/orders/${paymentData.orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!captureResponse.ok) {
      throw new Error(`PayPal capture failed: ${captureResponse.status}`);
    }

    const captureData = await captureResponse.json();
    
    return {
      status: captureData.status === 'COMPLETED' ? 'succeeded' : 'failed',
      paymentIntentId: paymentData.orderId,
      error: captureData.status !== 'COMPLETED' ? `PayPal status: ${captureData.status}` : null,
      data: captureData
    };
  } catch (error) {
    return {
      status: 'failed',
      paymentIntentId: paymentData.orderId,
      error: error.message,
      data: error
    };
  }
}

export default payInvoice;