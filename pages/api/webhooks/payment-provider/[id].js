import { openfrontClient } from '@storefront/lib/config';
import { gql } from 'graphql-request';

export const config = {
  api: {
    bodyParser: false,
  },
};

const HANDLE_PAYMENT_PROVIDER_WEBHOOK = gql`
  mutation HandlePaymentProviderWebhook($providerId: ID!, $event: JSON!, $headers: JSON!) {
    handlePaymentProviderWebhook(providerId: $providerId, event: $event, headers: $headers) {
      success
    }
  }
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { id: providerId } = req.query;

  // Parse raw body for webhook verification
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks);

  try {
    const event = JSON.parse(rawBody.toString());
    
    // Pass all headers to the webhook handler
    const result = await openfrontClient.request(HANDLE_PAYMENT_PROVIDER_WEBHOOK, {
      providerId,
      event,
      headers: req.headers,
    });

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}
