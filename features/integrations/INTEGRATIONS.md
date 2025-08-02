# Openfront Final 2 Integration System

## Overview

Openfront Final 2 uses a sophisticated adapter-based integration system for payment and shipping providers. This system enables flexible, standardized integrations with external services while maintaining consistent APIs and workflows throughout the e-commerce platform.

## Architecture

### Provider-Based Integration System

#### Payment Providers
- **PaymentProvider**: Defines integration capabilities for payment processors (Stripe, PayPal, etc.)
- **Payment Processing**: Handles payment creation, capture, refunds, and webhook processing
- **Multi-Currency Support**: Automatic currency conversion and regional payment processing

#### Shipping Providers  
- **ShippingProvider**: Defines integration capabilities for shipping services (Shippo, ShipEngine, etc.)
- **Shipping Operations**: Rate calculation, label generation, address validation, tracking
- **Multi-Regional Shipping**: Global shipping with region-specific providers

### Adapter Pattern

The adapter pattern provides consistent interfaces for all integrations:

```typescript
// Payment provider integration
const paymentResult = await paymentProviderAdapter.createPaymentFunction({
  cart,
  amount: cart.total,
  currency: cart.currency.code,
  customer: cart.customer
});

// Shipping provider integration
const rates = await shippingProviderAdapter.getRatesFunction({
  provider,
  fromAddress: warehouse.address,
  toAddress: order.shippingAddress,
  packages: order.packages
});
```

## Payment Integrations

### Payment Provider Functions

Each PaymentProvider must implement these standardized functions:

#### Required Functions
- `createPaymentFunction` - Create payment intents/sessions
- `capturePaymentFunction` - Capture authorized payments
- `refundPaymentFunction` - Process refunds
- `getPaymentStatusFunction` - Check payment status
- `generatePaymentLinkFunction` - Create payment dashboard links
- `handleWebhookFunction` - Process provider webhooks

### Payment Provider Configuration

```typescript
PaymentProvider {
  name: "Stripe",
  code: "pp_stripe", // Must start with pp_
  isInstalled: true,
  credentials: {
    secretKey: "sk_...",
    publishableKey: "pk_...",
    webhookSecret: "whsec_..."
  },
  
  // Function name mappings
  createPaymentFunction: "createPaymentFunction",
  capturePaymentFunction: "capturePaymentFunction", 
  refundPaymentFunction: "refundPaymentFunction",
  getPaymentStatusFunction: "getPaymentStatusFunction",
  generatePaymentLinkFunction: "generatePaymentLinkFunction",
  handleWebhookFunction: "handleWebhookFunction",
  
  // Regional assignment
  regions: [→ Region]
}
```

### Stripe Integration

Openfront includes a complete Stripe payment integration:

#### Function Implementations
```typescript
// Payment creation with Stripe Payment Intents
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

// Payment capture
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

// Refund processing
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

// Webhook verification and processing
export async function handleWebhookFunction({ event, headers }) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripeClient();

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
}
```

### PayPal Integration

Openfront includes PayPal payment processing:

#### Key Features
- PayPal Order creation and capture
- Automatic payment processing
- Webhook verification and processing
- Multi-currency support

### Manual Payment Integration

For cash, check, and other manual payment methods:

#### Features
- Manual payment recording
- Status tracking
- Administrative controls
- Audit trails

## Shipping Integrations

### Shipping Provider Functions

Each ShippingProvider must implement these standardized functions:

#### Required Functions
- `getRatesFunction` - Calculate shipping rates
- `createLabelFunction` - Generate shipping labels
- `cancelLabelFunction` - Cancel shipping labels
- `validateAddressFunction` - Validate shipping addresses
- `trackShipmentFunction` - Track shipment status

### Shipping Provider Configuration

```typescript
ShippingProvider {
  name: "Shippo",
  code: "sp_shippo", // Must start with sp_
  isInstalled: true,
  credentials: {
    apiKey: "shippo_live_...",
    testMode: false
  },
  
  // Function name mappings
  getRatesFunction: "getRatesFunction",
  createLabelFunction: "createLabelFunction",
  cancelLabelFunction: "cancelLabelFunction", 
  validateAddressFunction: "validateAddressFunction",
  trackShipmentFunction: "trackShipmentFunction",
  
  // Regional assignment
  regions: [→ Region],
  shippingOptions: [→ ShippingOption]
}
```

### Shippo Integration

Openfront includes a comprehensive Shippo shipping integration:

#### Function Implementations
```typescript
// Rate calculation with multiple carriers
export async function getRatesFunction({ provider, order, dimensions }) {
  // Create shipment with package dimensions
  const shipmentResponse = await fetch(`${SHIPPO_API_URL}/shipments/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      address_from: provider.fromAddress,
      address_to: order.shippingAddress,
      parcels: [{
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height,
        weight: dimensions.weight,
        distance_unit: dimensions.unit,
        mass_unit: dimensions.weightUnit,
      }],
    }),
  });

  const shipment = await shipmentResponse.json();
  
  // Return formatted rates
  return shipment.rates.map((rate) => ({
    id: rate.object_id,
    providerId: provider.id,
    service: rate.servicelevel.name,
    carrier: rate.provider,
    price: rate.amount,
    currency: rate.currency,
    estimatedDays: rate.estimated_days,
  }));
}

// Label generation
export async function createLabelFunction({ provider, order, rateId, dimensions }) {
  // Create transaction (label) with specific rate
  const transactionResponse = await fetch(`${SHIPPO_API_URL}/transactions/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rate: rateId,
      label_file_type: "PDF",
      async: false,
    }),
  });

  const transaction = await transactionResponse.json();
  
  return {
    status: "purchased",
    data: transaction,
    trackingNumber: transaction.tracking_number,
    trackingUrl: transaction.tracking_url_provider,
    labelUrl: transaction.label_url,
    carrier: transaction.provider,
    service: transaction.servicelevel?.name,
  };
}

// Address validation
export async function validateAddressFunction({ provider, address }) {
  const response = await fetch(`${SHIPPO_API_URL}/addresses/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...address,
      validate: true,
    }),
  });

  const validation = await response.json();
  
  return {
    isValid: validation.validation_results.is_valid,
    suggestedAddress: validation.validation_results.is_valid ? {
      address1: validation.street1,
      address2: validation.street2,
      city: validation.city,
      province: validation.state,
      postalCode: validation.zip,
      country: validation.country,
    } : null,
    errors: validation.validation_results.messages || [],
  };
}

// Shipment tracking
export async function trackShipmentFunction({ provider, trackingNumber }) {
  const response = await fetch(`${SHIPPO_API_URL}/tracks/`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${provider.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      carrier: "usps",
      tracking_number: trackingNumber,
    }),
  });

  const tracking = await response.json();
  
  return {
    status: tracking.tracking_status.status,
    estimatedDelivery: tracking.eta,
    trackingUrl: tracking.tracking_url,
    events: tracking.tracking_history.map((event) => ({
      status: event.status,
      location: event.location,
      timestamp: event.status_date,
      message: event.status_details,
    })),
  };
}
```

### ShipEngine Integration

Openfront supports ShipEngine integration (documented but implementation in progress):

#### Planned Features
- Multi-carrier rate shopping
- Label generation and printing
- Address validation and correction
- Shipment tracking and notifications
- Returns management

### Manual Shipping Integration

For custom shipping processes:

#### Features
- Manual rate entry
- Custom shipping labels
- Flexible tracking options
- Administrative controls

## Integration Workflows

### Payment Processing Workflow

1. **Payment Session Creation**: Customer initiates checkout
2. **Provider Selection**: System selects appropriate payment provider based on region/currency
3. **Payment Intent Creation**: Provider adapter creates payment session
4. **Customer Payment**: Customer completes payment on frontend
5. **Webhook Processing**: Provider webhook confirms payment status
6. **Order Completion**: Order status updated and fulfillment triggered

### Shipping Processing Workflow

1. **Rate Calculation**: System requests rates from configured shipping providers
2. **Rate Selection**: Customer selects preferred shipping option
3. **Address Validation**: System validates shipping address
4. **Label Generation**: Shipping label created when order fulfillment begins
5. **Tracking Updates**: Tracking information updated via webhooks or polling
6. **Delivery Confirmation**: Final delivery status recorded

## Multi-Regional Support

### Regional Provider Assignment

```typescript
Region {
  name: "United States",
  currencyCode: "USD",
  
  // Assigned providers
  paymentProviders: [stripeProvider, paypalProvider],
  shippingProviders: [shippoProvider, manualProvider],
  
  // Regional settings
  taxRate: 0.08,
  automaticTaxes: true,
  giftCardsTaxable: false
}
```

### Currency Handling

- Automatic currency conversion
- Regional pricing support
- Multi-currency payment processing
- Exchange rate management

### Tax Compliance

- Regional tax rate application
- Tax-inclusive vs tax-exclusive pricing
- Automatic tax calculations
- Compliance reporting

## Error Handling and Resilience

### Payment Error Handling

```typescript
// Payment provider failover
async function processPayment(cart, paymentData) {
  const providers = getAvailablePaymentProviders(cart.region);
  
  for (const provider of providers) {
    try {
      return await provider.createPaymentFunction(paymentData);
    } catch (error) {
      console.error(`Payment failed with ${provider.name}:`, error);
      // Try next provider
    }
  }
  
  throw new Error('All payment providers failed');
}
```

### Shipping Error Handling

```typescript
// Shipping rate calculation with fallbacks
async function getShippingRates(order) {
  const providers = getAvailableShippingProviders(order.region);
  const rates = [];
  
  for (const provider of providers) {
    try {
      const providerRates = await provider.getRatesFunction(order);
      rates.push(...providerRates);
    } catch (error) {
      console.error(`Rate calculation failed for ${provider.name}:`, error);
      // Continue with other providers
    }
  }
  
  // Add manual shipping if no rates available
  if (rates.length === 0) {
    rates.push(getManualShippingRates(order));
  }
  
  return rates;
}
```

### Retry Strategies

- Exponential backoff for transient errors
- Circuit breaker pattern for provider failures
- Dead letter queues for failed operations
- Graceful degradation to manual processing

## Security and Compliance

### Webhook Security

```typescript
// Webhook signature verification
export async function verifyWebhookSignature(provider, headers, body) {
  switch (provider.code) {
    case 'pp_stripe':
      return verifyStripeSignature(headers, body);
    case 'pp_paypal':
      return verifyPayPalSignature(headers, body);
    default:
      throw new Error(`Unsupported provider: ${provider.code}`);
  }
}
```

### PCI Compliance

- No storage of payment card data
- Secure tokenization through providers
- Encrypted credential storage
- Audit logging for all payment operations

### Data Protection

- Encrypted storage of provider credentials
- Secure API communication (HTTPS/TLS)
- PII data handling compliance
- GDPR/CCPA compliance features

## Development Guidelines

### Adding New Payment Providers

#### 1. Create Provider Adapter
```typescript
// features/integrations/payment/newprovider.ts
export async function createPaymentFunction({ cart, amount, currency }) {
  // Implementation specific to new provider API
}

export async function capturePaymentFunction({ paymentId, amount }) {
  // Implementation specific to new provider API
}

// ... other required functions
```

#### 2. Register Provider
Create PaymentProvider record with function mappings and credentials schema.

#### 3. Test Integration
- Unit tests for adapter functions
- Integration tests with provider sandbox
- End-to-end payment workflow tests

### Adding New Shipping Providers

#### 1. Create Provider Adapter
```typescript
// features/integrations/shipping/newprovider.ts
export async function getRatesFunction({ provider, order, dimensions }) {
  // Implementation specific to new provider API
}

export async function createLabelFunction({ provider, order, rateId }) {
  // Implementation specific to new provider API
}

// ... other required functions
```

#### 2. Register Provider
Create ShippingProvider record with function mappings and credentials schema.

#### 3. Test Integration
- Unit tests for adapter functions
- Integration tests with provider sandbox
- End-to-end shipping workflow tests

### Best Practices

#### Function Implementation
- Always validate input parameters
- Handle errors gracefully with descriptive messages
- Return consistent data structures
- Use proper TypeScript types
- Include comprehensive logging

#### Data Security
- Never log sensitive credentials
- Validate all external input data
- Use environment variables for sensitive configuration
- Implement proper access controls
- Follow PCI DSS guidelines for payment data

#### Performance
- Cache provider responses when appropriate
- Implement timeout handling for external API calls
- Use connection pooling for HTTP requests
- Monitor and alert on performance degradation

## Testing Strategy

### Unit Tests
```typescript
describe('Stripe Payment Adapter', () => {
  it('should create payment intent', async () => {
    const result = await createPaymentFunction({
      cart: mockCart,
      amount: 1000,
      currency: 'USD'
    });
    
    expect(result.clientSecret).toBeDefined();
    expect(result.paymentIntentId).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Shippo Integration', () => {
  it('should calculate shipping rates', async () => {
    const rates = await getRatesFunction({
      provider: testProvider,
      order: testOrder,
      dimensions: testDimensions
    });
    
    expect(rates).toBeInstanceOf(Array);
    expect(rates.length).toBeGreaterThan(0);
  });
});
```

### End-to-End Tests
```typescript
describe('Payment Processing', () => {
  it('should complete payment workflow', async () => {
    // 1. Create cart with items
    // 2. Initiate payment
    // 3. Simulate webhook
    // 4. Verify order completion
  });
});
```

## Monitoring and Observability

### Metrics
- Payment success/failure rates by provider
- Shipping rate calculation performance
- Webhook processing times
- Error rates and types

### Logging
- Structured logging for all integration activities
- Payment and shipping transaction logging
- Webhook event processing logs
- Error logging with stack traces

### Alerting
- Payment provider connectivity issues
- High error rates or processing failures
- Webhook processing delays
- Rate limit threshold alerts

## Performance Optimization

### Caching Strategies
- Cache shipping rates for similar packages
- Cache address validation results
- Cache exchange rates for currency conversion
- Implement cache invalidation policies

### Connection Management
- Use connection pooling for provider APIs
- Implement timeout and retry logic
- Monitor connection health
- Use circuit breakers for failing providers

### Batch Processing
- Batch webhook processing when possible
- Group similar shipping rate requests
- Implement bulk label generation
- Use background jobs for heavy operations

This integration system provides a robust, secure, and scalable foundation for connecting Openfront to payment and shipping providers while maintaining consistency, reliability, and compliance across all integrations.