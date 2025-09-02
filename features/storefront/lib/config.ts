import { GraphQLClient, RequestDocument, Variables } from "graphql-request";
import { parse, DocumentNode } from "graphql";
import { headers } from "next/headers";

const getEmptyResponseForQuery = (query: RequestDocument): Record<string, any[] | null> => {
  const document = typeof query === "string" ? parse(query) : query;
  const emptyResponse: Record<string, any[] | null> = {};

  document.definitions.forEach((def) => {
    if (def.kind === "OperationDefinition") {
      def.selectionSet.selections.forEach((selection) => {
        if (selection.kind === "Field") {
          const name = selection.name.value;
          const isPlural = name.endsWith("s");
          emptyResponse[name] = isPlural ? [] : null;
        }
      });
    }
  });

  return emptyResponse;
};

// Function to get base URL dynamically
async function getBaseUrl(): Promise<string> {
  if (typeof window !== 'undefined') {
    // Client-side: use window.location
    return window.location.origin;
  }
  
  // Server-side: try to get from headers
  if (typeof process !== 'undefined') {
    try {
      // Import headers from next/headers (only works in app directory)
      const headersList = await headers();
      
      // Try x-forwarded-host first (common in production deployments)
      const host = headersList.get('x-forwarded-host') || headersList.get('host');
      const protocol = headersList.get('x-forwarded-proto') || 'https';
      
      if (host) {
        return `${protocol}://${host}`;
      }
    } catch (e) {
      // headers() might not be available in all contexts (e.g., API routes)
      // Fall through to default
    }
  }
  
  return 'http://localhost:3000';
}

// Simple GraphQL client that creates endpoint on each request
class OpenfrontClient {
  private async getEndpoint(): Promise<string> {
    // Check if external GraphQL endpoint is specified (for openfront-storefront)
    const externalEndpoint = process.env.OPENFRONT_GRAPHQL_ENDPOINT;
    if (externalEndpoint) {
      return externalEndpoint;
    }
    
    // Default to local endpoint (for main openfront)
    const baseUrl = await getBaseUrl();
    return `${baseUrl}/api/graphql`;
  }

  async request<T = any, V extends Variables = Variables>(
    document: RequestDocument,
    variables?: V,
    requestHeaders?: HeadersInit
  ): Promise<T> {
    try {
      const endpoint = await this.getEndpoint();
      const client = new GraphQLClient(endpoint, {
        headers: {
          'Connection': 'keep-alive',
        },
        timeout: 10000,
        fetch: fetch,
      });
      
      const response = await client.request(document, variables, requestHeaders);
      return response as T;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Don't log authentication errors - they're expected when users aren't logged in
      if (!errorMessage.includes('authenticatedItem') && !errorMessage.includes('authentication')) {
        console.error(`GraphQL error: ${errorMessage}`);
        console.error('Full error:', error);
      }
      
      return getEmptyResponseForQuery(document) as T;
    }
  }
}

export const openfrontClient = new OpenfrontClient();

