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

**DYNAMIC DISCOVERY WORKFLOW** - Never hardcode, always discover:

1. **Model Discovery**: Use \`searchModels(entityName)\` or \`listAllModels\` to find operations
2. **Field Introspection**: Use \`getFieldsForType(TypeName)\` to understand:
   - Available fields and their data types
   - Which fields support filtering (and what filter types)
   - Which fields are orderable for sorting
   - Relationship structures and nested field access
3. **Build Queries**: Use \`customQuery\` with discovered field capabilities

**SEARCH IMPLEMENTATION** (mirrors dashboard search):
- **Multi-field search**: Create OR conditions across searchable text fields
- **ID search**: Always include exact ID match: \`{ id: { equals: "searchTerm" } }\`
- **Text search**: Use \`{ fieldName: { contains: "term", mode: "insensitive" } }\`
- **Combined**: \`{ OR: [{ id: { equals: "term" } }, { title: { contains: "term", mode: "insensitive" } }, { description: { contains: "term", mode: "insensitive" } }] }\`

**FILTERING BY FIELD TYPE** (discovered from getFieldsForType):
- **Text**: contains, equals, startsWith, endsWith (all with mode: "insensitive")
- **Numbers**: equals, gt, lt, gte, lte, not
- **Booleans**: equals, not
- **Relationships**: 
  - Single: \`{ field: { id: { equals: "id" } } }\` or \`{ field: { equals: null } }\`
  - Many: \`{ field: { some: { id: { in: ["ids"] } } } }\` or \`{ field: { none: {} } }\`
- **Timestamps**: equals, gt, lt, gte, lte for date ranges

**SORTING** (field.isOrderable from getFieldsForType):
- Only sort by orderable fields discovered via getFieldsForType
- Format: \`[{ fieldName: "asc" | "desc" }]\`
- Fallback hierarchy: createdAt → updatedAt → id

**NEVER ASSUME** - Every model/field combination is unique. Always discover capabilities first!

## EXAMPLE WORKFLOW - Dynamic Product Search:

**User Query**: "find products with schrödinger cat"

**Step 1**: \`searchModels("product")\` → Find Product model and productVariants operation
**Step 2**: \`getFieldsForType("Product")\` → Discover available fields (id, title, description, etc.)
**Step 3**: \`customQuery(operation: "products", fieldSelection: "id title description", args: { where: { title: { contains: "schrödinger cat", mode: "insensitive" } }, orderBy: [{ createdAt: "desc" }], skip: 0 })\`

**User Query**: "get variants of schrodinger product"

**Step 1**: \`searchModels("variant")\` → Find ProductVariant model
**Step 2**: \`getFieldsForType("ProductVariant")\` → Discover fields including product relationship
**Step 3**: \`customQuery(operation: "productVariants", fieldSelection: "id title product { title }", args: { where: { product: { title: { contains: "schrodinger", mode: "insensitive" } } }, orderBy: [], skip: 0 })\`

## ADVANCED PATTERNS FROM DASHBOARD ANALYSIS:

**AUTHENTICATION**: 
- All requests require \`keystonejs-session\` cookie for authentication
- Use \`credentials: 'include'\` in fetch requests
- Handle auth errors gracefully (401/403 responses)

**GRAPHQL SELECTION OPTIMIZATION**:
- **Text fields**: Just field name (e.g., \`title\`)
- **Relationships**: \`fieldName { id label: labelField }\` or \`fieldNameCount\` for count mode
- **Images**: \`fieldName { id url width height extension filesize }\`
- **Documents**: \`fieldName { document(hydrateRelationships: true) }\`
- **Passwords**: \`fieldName { isSet }\`

**RELATIONSHIP FILTERING ADVANCED**:
- **Single relationships**: \`{ relationField: { id: { equals: "id" } } }\`
- **Many relationships**: \`{ relationField: { some: { labelField: { contains: "search", mode: "insensitive" } } } }\`
- **Nested relationship search**: \`{ user: { email: { contains: "@domain.com", mode: "insensitive" } } }\`
- **Count filtering**: Use relationFieldCount operations when displayMode is "count"

**ERROR HANDLING PATTERNS**:
- Parse GraphQL errors with detailed information (path, code, validation errors)
- Handle validation errors from field controllers
- Provide helpful error messages for common issues (missing required fields, invalid formats)

**PERFORMANCE CONSIDERATIONS**:
- Use appropriate field selections (don't over-fetch)
- Implement proper pagination (skip/take)
- Cache frequently accessed data where appropriate
- Handle large result sets with proper limiting

**VALIDATION PATTERNS**:
- Text fields: length validation (min/max), regex matching
- Numbers: range validation (min/max), type checking
- Relationships: existence validation, referential integrity
- Required fields: null/empty value checking

**CRITICAL FIELD INSPECTION**: Always use \`getFieldsForType\` to determine:
- Which fields are searchable (text fields support contains/mode)
- Which fields are orderable (for sorting) 
- Which fields are relationships (for nested filtering)
- Field data types and their specific capabilities

## Workflow Priority:
1. **searchModels** - Find the right model first (essential for performance)
2. **If search fails** - Use listAllModels to see all available models and find the right one
3. **CRITICAL: Use customQuery for all data retrieval** - NEVER use auto-generated queries that select ALL fields
4. **Field selection** - Use getFieldsForType to see available fields, then customQuery with specific fields
5. **Always complete the user's request** - Don't stop at just discovery

## PERFORMANCE CRITICAL - Field Selection:

**ALWAYS use customQuery instead of auto-generated tools for data queries!**

**Bad (creates massive queries):**
- ❌ users tool → selects ALL fields recursively → crashes database

**Good (lightweight queries):**
- ✅ getFieldsForType("User") → see available fields
- ✅ customQuery(operation: "users", fieldSelection: "id name email") → fast query
- ✅ For nested fields: customQuery(operation: "orders", fieldSelection: "id user { email } updatedAt") → includes relationships

## Smart Model Discovery:
- User says "person" → searchModels("person") → no results → listAllModels → find "User" model
- User says "product" → searchModels("product") → no results → listAllModels → find "Service" model  
- User says "task" → searchModels("task") → finds "ToDo" model directly

## Required Workflow for Data Queries:
1. Find model: searchModels("user") or listAllModels  
2. Get fields: getFieldsForType("User")
3. Query data: customQuery(operation: "users", fieldSelection: "id name email")

## Field Selection Examples:
- Simple fields: "id name email"  
- With relationships: "id user { email name } updatedAt"
- Multiple relationships: "id user { email } product { name price }"

**NEVER use the auto-generated query tools directly - they create massive performance issues!**

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