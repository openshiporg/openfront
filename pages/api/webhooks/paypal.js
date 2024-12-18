import { gql } from 'graphql-request';
import { openfrontClient } from '@storefront/lib/config';

const HANDLE_PAYPAL_WEBHOOK = gql`
  mutation HandlePayPalWebhook($event: JSON!, $headers: JSON!) {
    handlePayPalWebhook(event: $event, headers: $headers) {
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

  try {
    // Extract relevant headers for webhook verification
    const headers = {
      'paypal-auth-algo': req.headers['paypal-auth-algo'],
      'paypal-cert-url': req.headers['paypal-cert-url'],
      'paypal-transmission-id': req.headers['paypal-transmission-id'],
      'paypal-transmission-sig': req.headers['paypal-transmission-sig'],
      'paypal-transmission-time': req.headers['paypal-transmission-time'],
    };

    // Call the mutation to handle the webhook
    const result = await openfrontClient.request(HANDLE_PAYPAL_WEBHOOK, {
      event: req.body,
      headers,
    });

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: `Webhook Error: ${err.message}` });
  }
} 