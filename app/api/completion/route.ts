import { streamText, experimental_createMCPClient } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { getBaseUrl } from '@/features/dashboard/lib/getBaseUrl';
import { StreamableHTTPClientTransport, StreamableHTTPClientTransportOptions } from '@modelcontextprotocol/sdk/client/streamableHttp';

// Cookie-aware transport that properly handles cookie forwarding
class CookieAwareTransport extends StreamableHTTPClientTransport {
  private cookies: string[] = [];
  private originalFetch: typeof fetch;

  constructor(url: URL, opts?: StreamableHTTPClientTransportOptions, cookies?: string) {
    super(url, opts);
    
    this.originalFetch = global.fetch;
    
    // Set initial cookies if provided
    if (cookies) {
      this.cookies = [cookies];
    }
    
    // Override global fetch to include cookies
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      init = init || {};
      const headers = new Headers(init.headers);
      
      if (this.cookies.length > 0) {
        headers.set('Cookie', this.cookies.join('; '));
      }
      
      init.headers = headers;
      
      const response = await this.originalFetch(input, init);
      
      // Store any new cookies from response
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        const newCookies = setCookieHeader.split(',').map(cookie => cookie.trim());
        this.cookies = [...this.cookies, ...newCookies];
      }
      
      return response;
    };
  }
  
  async close(): Promise<void> {
    // Restore original fetch
    global.fetch = this.originalFetch;
    this.cookies = [];
    await super.close();
  }
}

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function POST(req: Request) {
  let mcpClient: any = null;
  
  try {
    const body = await req.json();
    const prompt = body.prompt || body.messages?.[body.messages.length - 1]?.content || '';

    // Get dynamic base URL like the MCP route does
    const baseUrl = await getBaseUrl();
    const mcpEndpoint = `${baseUrl}/api/mcp/http`;
    
    const cookie = req.headers.get('cookie') || '';

    // Create MCP client with cookie-aware transport
    const transport = new CookieAwareTransport(
      new URL(mcpEndpoint),
      undefined,
      cookie
    );
    
    mcpClient = await experimental_createMCPClient({
      transport,
    });
    
    const aiTools = await mcpClient.tools();
    
    const systemInstructions = `
You are an AI assistant with access to a GraphQL API through MCP tools. Your primary goal is to help users get results quickly.

## PERFORMANCE OPTIMIZATION - Model Discovery:

**ALWAYS START WITH MODEL SEARCH** when users mention entities:
- Use \`searchModels\` tool FIRST to find relevant models before using other operations
- Examples: 
  - User says "tasks" → searchModels("task") to find ToDo, Task, etc.
  - User says "users" → searchModels("user") to find User, UserProfile, etc.
  - User says "orders" → searchModels("order") to find Order, OrderItem, etc.

**This prevents loading hundreds of tools and dramatically improves performance!**

## Quick Reference for Common Tasks:

**For simple list queries** (when user wants "all" items):
- For todos: Use empty where filter (empty object, not string)
- For users: Use empty where filter (empty object, not string)  
- Set skip to 0, omit take for all results
- Example: \`todos\` tool with where as empty object {}, orderBy as empty array [], skip as number 0

**When you need input structure details**:
- Use lookupWhereInput(typeName) for filter structures  
- Use lookupInputType(typeName) for creation/update structures
- Use lookupEnumValues(enumName) for enum options

## Workflow Priority:
1. **searchModels** - Find the right model first (essential for performance)
2. **If search fails** - Use listAllModels to see all available models and find the right one
3. **For simple requests** - Try the direct query with minimal required params
4. **If that fails** - Then use lookup tools to understand the structure
5. **Always complete the user's request** - Don't stop at just discovery

## Smart Model Discovery:
- User says "person" → searchModels("person") → no results → listAllModels → find "User" model
- User says "product" → searchModels("product") → no results → listAllModels → find "Service" model  
- User says "task" → searchModels("task") → finds "ToDo" model directly

## Common Patterns:
- Empty filters: Pass where as empty object {} (not string), gets all records
- Required orderBy: Use empty array [] for default ordering  
- Required skip: Use number 0 to start from beginning
- Optional take: Omit to get all results

**CRITICAL**: Always pass where as an object {}, orderBy as array [], skip as number. Never pass where as a string.

**CRITICAL**: After calling tools and getting results, ALWAYS continue to provide a final response to the user explaining what you found. You MUST interpret the tool results and give a natural language answer. Do NOT stop after making a tool call.

**ALWAYS CONTINUE AFTER TOOL CALLS**: When you get tool results, process them and give the user a clear, helpful response about what you found.

**Remember**: Users want results, not just type discovery. Complete their requests with a final answer explaining the data!
`;

    try {
      
      const response = streamText({
        model: openrouter(process.env.OPENROUTER_MODEL ?? (() => {
          throw new Error('OPENROUTER_MODEL is not provided. Please go to openrouter.ai, find a model, copy its key and put it in the env file as OPENROUTER_MODEL variable.');
        })()),
        tools: aiTools,
        prompt,
        system: systemInstructions,
        maxSteps: 5, // Allow multiple steps for tool calls + final response
        onFinish: async (result) => {
          await mcpClient.close();
        },
        onError: async (error) => {
          await mcpClient.close();
        },
      });

      return response.toDataStreamResponse({
        getErrorMessage: (error) => {
          if (error && typeof error === 'object' && 'message' in error) {
            return `Tool execution failed: ${(error as { message: string }).message}`;
          }
          return `Tool execution failed: ${String(error)}`;
        }
      });
    } catch (streamError) {
      // Clean up MCP client on error
      try {
        await mcpClient.close();
      } catch (closeError) {}
      
      throw streamError;
    }
  } catch (error) {
    // Clean up MCP client if it was created
    if (mcpClient) {
      try {
        await mcpClient.close();
      } catch (closeError) {}
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}