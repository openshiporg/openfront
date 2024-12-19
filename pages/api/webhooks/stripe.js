import { openfrontClient } from '@storefront/lib/config';
import { gql } from 'graphql-request';

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

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const rawBody = Buffer.concat(chunks);

  try {
    const event = JSON.parse(rawBody.toString());
    const result = await openfrontClient.request(HANDLE_STRIPE_WEBHOOK, {
      event,
      headers: req.headers
    });

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
} 