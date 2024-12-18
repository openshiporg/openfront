import { buffer } from 'micro';
import { gql } from 'graphql-request';
import { openfrontClient } from '@storefront/lib/config';

export const config = {
  api: {
    bodyParser: false,
  },
};

const HANDLE_STRIPE_WEBHOOK = gql`
  mutation HandleStripeWebhook($event: JSON!, $headers: JSON!) {
    handleStripeWebhook(event: $event, headers: $headers)
  }
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  try {
    const buf = await buffer(req);
    const event = JSON.parse(buf.toString());
    const headers = {
      'stripe-signature': req.headers['stripe-signature']
    };

    // Call the mutation to handle the webhook
    const result = await openfrontClient.request(HANDLE_STRIPE_WEBHOOK, {
      event,
      headers,
    });

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: `Webhook Error: ${err.message}` });
  }
} 