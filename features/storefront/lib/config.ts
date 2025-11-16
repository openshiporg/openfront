/**
 * GraphQL client for storefront
 * Uses dynamic endpoint resolution like the dashboard
 */

import { GraphQLClient, RequestDocument, Variables } from 'graphql-request';
import { getGraphQLEndpoint } from './getBaseUrl';

class OpenfrontClient {
  private clientPromise: Promise<GraphQLClient> | null = null;

  private async getClient(): Promise<GraphQLClient> {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        const endpoint = await getGraphQLEndpoint();
        return new GraphQLClient(endpoint, {
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
