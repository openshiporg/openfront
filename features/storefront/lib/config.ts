/**
 * GraphQL client for storefront
 * Uses dynamic endpoint resolution like the dashboard
 */

import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { getGraphQLEndpoint } from './getBaseUrl';
import { internalGraphqlEndpoint, withRequestIdentity } from '@/features/keystone/lib/internal-origin';

class OpenfrontClient {
  private clientPromise: Promise<GraphQLClient> | null = null;

  private async getClient(): Promise<GraphQLClient> {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        // On the server, call this process over loopback with the visitor's signed identity (read per call,
        // never cached in this singleton). Browser calls stay public.
        const loopback = typeof window === 'undefined' ? internalGraphqlEndpoint() : null;
        const endpoint = loopback ?? await getGraphQLEndpoint();
        return new GraphQLClient(endpoint, {
          ...(loopback ? { fetch: withRequestIdentity() } : {}),
          credentials: 'include',
          headers: {
            'Connection': 'keep-alive',
          },
          timeout: 10000,
        });
      })();
    }
    return this.clientPromise;
  }

  async request<T = any, V extends Variables = Variables>(
    document: RequestDocument,
    variables?: V,
    requestHeaders?: HeadersInit
  ): Promise<T> {
    const client = await this.getClient();
    return await client.request(document, variables, requestHeaders);
  }
}

export const openfrontClient = new OpenfrontClient();
