import { GraphQLClient, RequestDocument, Variables } from "graphql-request";
import { parse, DocumentNode } from "graphql";

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
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use window.location
    return window.location.origin;
  }
  
  // Server-side: construct URL from headers or fallback to localhost
  if (typeof process !== 'undefined') {
    // In production, this should be set properly by your deployment
    return process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
  }
  
  return 'http://localhost:3000';
}

// Simple GraphQL client that creates endpoint on each request
class OpenfrontClient {
  private getEndpoint(): string {
    return `${getBaseUrl()}/api/graphql`;
  }

  async request<T = any, V extends Variables = Variables>(
    document: RequestDocument,
    variables?: V,
    requestHeaders?: HeadersInit
  ): Promise<T> {
    try {
      const endpoint = this.getEndpoint();
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
      console.error(`GraphQL error: ${errorMessage}`);
      console.error('Full error:', error);
      return getEmptyResponseForQuery(document) as T;
    }
  }
}

export const openfrontClient = new OpenfrontClient();

