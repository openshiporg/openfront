import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  Tool,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// MCP UI helper function to create proper UI resources
function createUIResource(options: {
  uri: string;
  content: { type: 'rawHtml'; htmlString: string } | { type: 'externalUrl'; iframeUrl: string };
  encoding: 'text' | 'blob';
}) {
  const { uri, content, encoding } = options;

  if (content.type === 'rawHtml') {
    return {
      type: 'resource' as const,
      resource: {
        uri,
        mimeType: 'text/html' as const,
        [encoding]: content.htmlString,
      },
    };
  } else if (content.type === 'externalUrl') {
    return {
      type: 'resource' as const,
      resource: {
        uri,
        mimeType: 'text/uri-list' as const,
        [encoding]: content.iframeUrl,
      },
    };
  }

  throw new Error(`Unsupported content type: ${(content as any).type}`);
}
import { 
  getIntrospectionQuery, 
  buildClientSchema, 
  GraphQLSchema,
  isNonNullType,
  isListType,
  isInputObjectType,
} from 'graphql';
import { getBaseUrl } from '@/features/dashboard/lib/getBaseUrl';

// Get simple type name for display
function getSimpleTypeName(type: any): string {
  if (isNonNullType(type)) {
    return getSimpleTypeName(type.ofType);
  }
  if (isListType(type)) {
    return `[${getSimpleTypeName(type.ofType)}]`;
  }
  return type.name || type.toString();
}

// Execute GraphQL query with authentication
async function executeGraphQL(query: string, graphqlEndpoint: string, cookie: string, variables?: any): Promise<any> {
  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL execution failed: ${JSON.stringify(result.errors)}`);
  }
  return result;
}

// Get GraphQL schema from introspection
async function getGraphQLSchema(graphqlEndpoint: string, cookie: string): Promise<GraphQLSchema> {
  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL introspection failed: ${JSON.stringify(result.errors)}`);
  }
  
  return buildClientSchema(result.data);
}

export async function POST(request: Request, { params }: { params: Promise<{ transport: string }> }) {
  // Track if any CRUD operations occurred during this request
  let dataHasChanged = false;
  
  try {
    const { transport } = await params;
    
    // Construct GraphQL endpoint
    const baseUrl = await getBaseUrl();
    const graphqlEndpoint = `${baseUrl}/api/graphql`;
    
    // Extract cookie from request
    const cookie = request.headers.get('cookie') || ''
  
    // Get the GraphQL schema
    const schema = await getGraphQLSchema(graphqlEndpoint, cookie);
    
    // Parse the JSON-RPC request
    const body = await request.json();
    
    // Handle the request based on method
    if (body.method === 'initialize') {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: body.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true }
          },
          serverInfo: {
            name: 'simple-mcp-server',
            version: '1.0.0'
          }
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (body.method === 'notifications/initialized') {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: body.id,
        result: {}
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (body.method === 'tools/list') {
      // Return tools with comprehensive e-commerce workflow guidance
      const tools: Tool[] = [{
        name: 'listModels',
        description: 'List all available GraphQL models/types in the system',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }, {
        name: 'queryData',
        description: 'Execute a GraphQL query to get actual data from the system',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              description: 'The GraphQL operation name (e.g., "users", "todos", "roles")'
            },
            fields: {
              type: 'string',
              description: 'The fields to select (e.g., "id name email" or "id title description")'
            }
          },
          required: ['operation', 'fields']
        }
      }, {
        name: 'searchModels',
        description: 'Search for models by name pattern',
        inputSchema: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string',
              description: 'The search term to find models (e.g., "User", "Todo", "Role")'
            }
          },
          required: ['searchTerm']
        }
      }, {
        name: 'getFieldsForType',
        description: 'Get all available fields for a specific GraphQL type',
        inputSchema: {
          type: 'object',
          properties: {
            typeName: {
              type: 'string',
              description: 'The GraphQL type name to get fields for (e.g., "User", "Todo", "Role")'
            }
          },
          required: ['typeName']
        }
      }, {
        name: 'lookupInputType',
        description: 'Get the structure of a GraphQL input type for mutations',
        inputSchema: {
          type: 'object',
          properties: {
            inputTypeName: {
              type: 'string',
              description: 'The GraphQL input type name (e.g., "UserCreateInput", "TodoUpdateInput")'
            }
          },
          required: ['inputTypeName']
        }
      }, {
        name: 'createData',
        description: 'Execute a GraphQL mutation to create new data',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              description: 'The GraphQL create mutation name (e.g., "createUser", "createTodo")'
            },
            data: {
              type: 'string',
              description: 'JSON string of the data object to create'
            },
            fields: {
              type: 'string',
              description: 'The fields to return from the created item'
            }
          },
          required: ['operation', 'data', 'fields']
        }
      }, {
        name: 'updateData',
        description: 'Execute a GraphQL mutation to update existing data',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              description: 'The GraphQL update mutation name (e.g., "updateUser", "updateTodo")'
            },
            where: {
              type: 'string',
              description: 'JSON string of the where clause to identify the item to update'
            },
            data: {
              type: 'string',
              description: 'JSON string of the data object with fields to update'
            },
            fields: {
              type: 'string',
              description: 'The fields to return from the updated item'
            }
          },
          required: ['operation', 'where', 'data', 'fields']
        }
      }, {
        name: 'deleteData',
        description: 'Execute a GraphQL mutation to delete data',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              description: 'The GraphQL delete mutation name (e.g., "deleteUser", "deleteTodo")'
            },
            where: {
              type: 'string',
              description: 'JSON string of the where clause to identify the item to delete'
            },
            fields: {
              type: 'string',
              description: 'The fields to return from the deleted item'
            }
          },
          required: ['operation', 'where', 'fields']
        }
      }, {
        name: 'modelSpecificSearch',
        description: 'Perform intelligent search on a specific model using the same logic as the dashboard search functionality',
        inputSchema: {
          type: 'object',
          properties: {
            modelName: {
              type: 'string',
              description: 'The model name to search (e.g., "Product", "User", "Todo"). Will be automatically converted to the correct GraphQL operation name.'
            },
            searchQuery: {
              type: 'string',
              description: 'The search term to find within the model. Supports both ID matching and text field searching with case-insensitive matching.'
            },
            fields: {
              type: 'string',
              description: 'The fields to return from matching items (e.g., "id name email" or "id title description")'
            }
          },
          required: ['modelName', 'searchQuery', 'fields']
        }
      }, 
      // Commerce-specific tools
      /*
      ================================================================================================
      IMPORTANT GUIDANCE FOR AI COMPLETION CLIENTS:
      
      When users ask to "place an order" or "buy products", DO NOT try to directly create Order records
      using createData/createOrder. Instead, follow this proper e-commerce workflow:
      
      PROPER ORDER PLACEMENT WORKFLOW:
      1. createCart (with customer's country)
      2. searchProducts (to find products) 
      3. getProduct (to get specific variants and pricing)
      4. addToCart (add specific product variants)
      5. setShippingAddress (with customer details)
      6. getShippingOptions & setShippingMethod (select shipping)
      7. placeOrder (attempt to complete the order)
      8. getCheckoutLink (if placeOrder fails, provide checkout link)
      
      CUSTOMER FLOW EXAMPLES:
      - "I want to buy a black t-shirt" → Ask for country → createCart → searchProducts "black t-shirt" → show variants → addToCart → get address → complete checkout
      - "Place an order for shoes size 10" → Follow full workflow above
      - "Complete my purchase" → Check if cart exists, complete checkout flow
      
      DO NOT use generic schema tools (searchModels, createData) for e-commerce operations.
      USE the specialized commerce tools below instead.
      
      Uncomment this guidance in your completion route system prompt if needed.
      ================================================================================================
      */
      {
        name: 'searchProducts',
        description: 'Search for products with filtering capabilities. IMPORTANT: If countryCode is missing, you MUST first call getAvailableCountries to get the list of countries we ship to, then ask the user "Which country should I show pricing for?" or "Where would you like this shipped?" Present the available countries in a friendly way. This is required for accurate pricing.',
        inputSchema: {
          type: 'object',
          properties: {
            countryCode: {
              type: 'string',
              description: 'Country code for regional pricing and shipping (e.g., "us", "ca", "gb"). If not provided, you must ask the user where they want items shipped with friendly language.'
            }
          },
          required: ['countryCode']
        }
      }, {
        name: 'getProduct',
        description: 'Get detailed product information by ID',
        inputSchema: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID'
            },
            countryCode: {
              type: 'string',
              description: 'Country code for pricing (e.g., "us", "ca", "gb")'
            }
          },
          required: ['productId', 'countryCode']
        }
      }, {
        name: 'createCart',
        description: 'Create a new shopping cart for a specific country/region',
        inputSchema: {
          type: 'object',
          properties: {
            countryCode: {
              type: 'string',
              description: 'Country code (e.g., "us", "ca", "gb")'
            }
          },
          required: ['countryCode']
        }
      }, {
        name: 'getCart',
        description: 'Get cart details including items, totals, and addresses',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            }
          },
          required: ['cartId']
        }
      }, {
        name: 'addToCart',
        description: 'Add a product variant to the cart',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            },
            variantId: {
              type: 'string',
              description: 'Product variant ID to add'
            },
            quantity: {
              type: 'number',
              description: 'Quantity to add (default: 1)'
            }
          },
          required: ['cartId', 'variantId', 'quantity']
        }
      }, {
        name: 'updateCartItem',
        description: 'Update quantity of an item in the cart',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            },
            lineItemId: {
              type: 'string',
              description: 'Line item ID to update'
            },
            quantity: {
              type: 'number',
              description: 'New quantity'
            }
          },
          required: ['cartId', 'lineItemId', 'quantity']
        }
      }, {
        name: 'removeCartItem',
        description: 'Remove an item from the cart',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            },
            lineItemId: {
              type: 'string',
              description: 'Line item ID to remove'
            }
          },
          required: ['cartId', 'lineItemId']
        }
      }, {
        name: 'applyDiscount',
        description: 'Apply a discount code to the cart',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            },
            discountCode: {
              type: 'string',
              description: 'Discount code to apply'
            }
          },
          required: ['cartId', 'discountCode']
        }
      }, {
        name: 'setShippingAddress',
        description: 'Set shipping address for the cart (creates guest user if needed)',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            },
            email: {
              type: 'string',
              description: 'Customer email'
            },
            firstName: {
              type: 'string',
              description: 'First name'
            },
            lastName: {
              type: 'string',
              description: 'Last name'
            },
            address1: {
              type: 'string',
              description: 'Address line 1'
            },
            city: {
              type: 'string',
              description: 'City'
            },
            postalCode: {
              type: 'string',
              description: 'Postal/ZIP code'
            },
            countryCode: {
              type: 'string',
              description: 'Country code (e.g., "us", "ca", "gb")'
            },
            province: {
              type: 'string',
              description: 'State or Province'
            },
            company: {
              type: 'string',
              description: 'Company name'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            }
          },
          required: ['cartId', 'email', 'firstName', 'lastName', 'address1', 'city', 'postalCode', 'countryCode', 'province', 'company', 'phone']
        }
      }, {
        name: 'getShippingOptions',
        description: 'Get available shipping methods for the cart',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            }
          },
          required: ['cartId']
        }
      }, {
        name: 'setShippingMethod',
        description: 'Select a shipping method for the cart',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            },
            shippingMethodId: {
              type: 'string',
              description: 'Shipping method ID'
            }
          },
          required: ['cartId', 'shippingMethodId']
        }
      }, {
        name: 'setPaymentMethod',
        description: 'Set payment provider for the cart',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            },
            providerId: {
              type: 'string',
              description: 'Payment provider ID'
            }
          },
          required: ['cartId', 'providerId']
        }
      }, {
        name: 'placeOrder',
        description: 'Complete the checkout and create an order',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID to complete'
            }
          },
          required: ['cartId']
        }
      }, {
        name: 'getOrder',
        description: 'Get order details by ID',
        inputSchema: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'Order ID'
            },
            secretKey: {
              type: 'string',
              description: 'Secret key for guest orders'
            }
          },
          required: ['orderId', 'secretKey']
        }
      }, {
        name: 'getAvailableRegions',
        description: 'Get list of countries we ship to. Use this when user first asks about shopping by asking "Where would you like these items shipped?" since we sell different products in different countries.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }, {
        name: 'getAvailableCountries',
        description: 'Get list of countries we ship to for customer selection. Use this when user asks about products but hasn\'t specified their country.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      }, {
        name: 'setBillingAddress',
        description: 'Set billing address for the cart (separate from shipping address)',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            },
            firstName: {
              type: 'string',
              description: 'First name'
            },
            lastName: {
              type: 'string',
              description: 'Last name'
            },
            address1: {
              type: 'string',
              description: 'Address line 1'
            },
            city: {
              type: 'string',
              description: 'City'
            },
            postalCode: {
              type: 'string',
              description: 'Postal/ZIP code'
            },
            countryCode: {
              type: 'string',
              description: 'Country code (e.g., "us", "ca", "gb")'
            },
            province: {
              type: 'string',
              description: 'State or Province'
            },
            company: {
              type: 'string',
              description: 'Company name'
            },
            phone: {
              type: 'string',
              description: 'Phone number'
            }
          },
          required: ['cartId', 'firstName', 'lastName', 'address1', 'city', 'postalCode', 'countryCode', 'province', 'company', 'phone']
        }
      }, {
        name: 'getPaymentProviders',
        description: 'Get available payment providers for the cart',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            }
          },
          required: ['cartId']
        }
      }, {
        name: 'createPaymentSessions',
        description: 'Initialize payment sessions for the cart before payment method selection',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID'
            }
          },
          required: ['cartId']
        }
      }, {
        name: 'getCheckoutLink',
        description: 'Generate a secure checkout link for cart completion. WARNING: For best customer experience, ensure cart has: 1) Products added, 2) Shipping address set, 3) Shipping method selected. The checkout link will show missing steps to customer.',
        inputSchema: {
          type: 'object',
          properties: {
            cartId: {
              type: 'string',
              description: 'Cart ID to create checkout link for'
            },
            countryCode: {
              type: 'string',
              description: 'Country code for the checkout URL (e.g., "us", "ca", "gb")'
            }
          },
          required: ['cartId', 'countryCode']
        }
      }];
      
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: body.id,
        result: { tools }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (body.method === 'tools/call') {
      // Handle tool call
      const { name, arguments: args } = body.params;

      try {
        if (name === 'listModels') {
          const allModels: any[] = [];
          
          // Get all types from schema
          const typeMap = schema.getTypeMap();
          
          for (const [typeName, type] of Object.entries(typeMap)) {
            // Skip built-in GraphQL types
            if (typeName.startsWith('__')) continue;
            
            // Find related operations for this type
            const relatedOps: string[] = [];
            
            // Check queries
            if (schema.getQueryType()) {
              const queryFields = schema.getQueryType()!.getFields();
              for (const [queryName] of Object.entries(queryFields)) {
                const baseTypeName = typeName.toLowerCase().replace(/input$|type$/i, '');
                if (queryName.toLowerCase().includes(baseTypeName) || 
                    queryName.toLowerCase() === baseTypeName + 's' ||
                    queryName.toLowerCase() === baseTypeName) {
                  relatedOps.push(`Query: ${queryName}`);
                }
              }
            }
            
            // Check mutations  
            if (schema.getMutationType()) {
              const mutationFields = schema.getMutationType()!.getFields();
              for (const [mutationName] of Object.entries(mutationFields)) {
                const baseTypeName = typeName.toLowerCase().replace(/input$|type$/i, '');
                if (mutationName.toLowerCase().includes(baseTypeName)) {
                  relatedOps.push(`Mutation: ${mutationName}`);
                }
              }
            }
            
            allModels.push({
              typeName,
              description: type.description || `GraphQL type: ${typeName}`,
              kind: type.constructor.name,
              relatedOperations: relatedOps
            });
          }
          
          // Sort by name
          allModels.sort((a, b) => a.typeName.localeCompare(b.typeName));
          
          const result = {
            totalModels: allModels.length,
            models: allModels
          };
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'queryData') {
          const { operation, fields } = args;
          
          // Build a simple GraphQL query
          const queryString = `
            query ${operation.charAt(0).toUpperCase() + operation.slice(1)} {
              ${operation} {
                ${fields}
              }
            }
          `.trim();
          
          // Execute the query
          const result = await executeGraphQL(queryString, graphqlEndpoint, cookie || '');
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'searchModels') {
          const { searchTerm } = args;
          const searchLower = searchTerm.toLowerCase();
          
          const matchingModels: any[] = [];
          
          // Get all types from schema
          const typeMap = schema.getTypeMap();
          
          for (const [typeName, type] of Object.entries(typeMap)) {
            // Skip built-in GraphQL types
            if (typeName.startsWith('__')) continue;
            
            // Check if type name matches search term
            if (typeName.toLowerCase().includes(searchLower)) {
              // Find related operations for this type
              const relatedOps: string[] = [];
              
              // Check queries
              if (schema.getQueryType()) {
                const queryFields = schema.getQueryType()!.getFields();
                for (const [queryName] of Object.entries(queryFields)) {
                  const baseTypeName = typeName.toLowerCase().replace(/input$|type$/i, '');
                  if (queryName.toLowerCase().includes(baseTypeName) || 
                      queryName.toLowerCase() === baseTypeName + 's' ||
                      queryName.toLowerCase() === baseTypeName) {
                    relatedOps.push(`Query: ${queryName}`);
                  }
                }
              }
              
              // Check mutations  
              if (schema.getMutationType()) {
                const mutationFields = schema.getMutationType()!.getFields();
                for (const [mutationName] of Object.entries(mutationFields)) {
                  const baseTypeName = typeName.toLowerCase().replace(/input$|type$/i, '');
                  if (mutationName.toLowerCase().includes(baseTypeName)) {
                    relatedOps.push(`Mutation: ${mutationName}`);
                  }
                }
              }
              
              matchingModels.push({
                typeName,
                description: type.description || `GraphQL type: ${typeName}`,
                kind: type.constructor.name,
                relatedOperations: relatedOps
              });
            }
          }
          
          // Sort by name
          matchingModels.sort((a, b) => a.typeName.localeCompare(b.typeName));
          
          const result = {
            searchTerm,
            matchingModels: matchingModels.length,
            models: matchingModels
          };
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'getFieldsForType') {
          const { typeName } = args;
          
          // Get the specific type from schema
          const typeMap = schema.getTypeMap();
          const type = typeMap[typeName];
          
          if (!type) {
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              result: {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    error: `Type '${typeName}' not found in schema`,
                    availableTypes: Object.keys(typeMap).filter(name => !name.startsWith('__'))
                  }, null, 2),
                }],
              }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          
          const fields: any[] = [];
          
          // Check if type has fields (ObjectType or InputObjectType)
          if ('getFields' in type && typeof type.getFields === 'function') {
            const typeFields = type.getFields();
            
            for (const [fieldName, field] of Object.entries(typeFields)) {
              const fieldInfo: any = {
                name: fieldName,
                type: getSimpleTypeName(field.type),
                description: field.description || null
              };
              
              // Add args if it's a field with arguments
              if ('args' in field && field.args && field.args.length > 0) {
                fieldInfo.args = field.args.map((arg: any) => ({
                  name: arg.name,
                  type: getSimpleTypeName(arg.type),
                  description: arg.description || null,
                  defaultValue: arg.defaultValue
                }));
              }
              
              fields.push(fieldInfo);
            }
          }
          
          const result = {
            typeName,
            typeKind: type.constructor.name,
            description: type.description || null,
            fields: fields
          };
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'lookupInputType') {
          const { inputTypeName } = args;
          
          // Get the specific input type from schema
          const typeMap = schema.getTypeMap();
          const inputType = typeMap[inputTypeName];
          
          if (!inputType) {
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              result: {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    error: `Input type '${inputTypeName}' not found in schema`,
                    availableInputTypes: Object.keys(typeMap).filter(name => 
                      !name.startsWith('__') && name.toLowerCase().includes('input')
                    )
                  }, null, 2),
                }],
              }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          
          const inputFields: any[] = [];
          
          // Check if it's an input object type
          if (isInputObjectType(inputType)) {
            const fields = inputType.getFields();
            
            for (const [fieldName, field] of Object.entries(fields)) {
              const inputField = field as any;
              const inputFieldInfo: any = {
                name: fieldName,
                type: getSimpleTypeName(inputField.type),
                description: inputField.description || null,
                required: isNonNullType(inputField.type),
                defaultValue: inputField.defaultValue
              };
              
              inputFields.push(inputFieldInfo);
            }
          }
          
          const result = {
            inputTypeName,
            typeKind: inputType.constructor.name,
            description: inputType.description || null,
            fields: inputFields,
            isInputType: isInputObjectType(inputType)
          };
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'createData') {
          const { operation, data, fields } = args;
          
          // Parse the data JSON string
          const dataObject = JSON.parse(data);
          
          const mutationString = `
            mutation Create${operation.charAt(0).toUpperCase() + operation.slice(1)} {
              ${operation}(data: ${JSON.stringify(dataObject).replace(/\"([^\"]+)\":/g, '$1:')}) {
                ${fields}
              }
            }
          `.trim();
          
          // Execute the mutation
          const result = await executeGraphQL(mutationString, graphqlEndpoint, cookie || '');
          
          // Mark that data has changed
          dataHasChanged = true;
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Data-Changed': 'true'
            },
          });
        }
        
        if (name === 'updateData') {
          const { operation, where, data, fields } = args;
          
          // Parse the JSON strings
          const whereObject = JSON.parse(where);
          const dataObject = JSON.parse(data);
          
          const mutationString = `
            mutation Update${operation.charAt(0).toUpperCase() + operation.slice(1)} {
              ${operation}(where: ${JSON.stringify(whereObject).replace(/\"([^\"]+)\":/g, '$1:')}, data: ${JSON.stringify(dataObject).replace(/\"([^\"]+)\":/g, '$1:')}) {
                ${fields}
              }
            }
          `.trim();
          
          // Execute the mutation
          const result = await executeGraphQL(mutationString, graphqlEndpoint, cookie || '');
          
          // Mark that data has changed
          dataHasChanged = true;
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Data-Changed': 'true'
            },
          });
        }
        
        if (name === 'deleteData') {
          const { operation, where, fields } = args;
          
          // Parse the where JSON string
          const whereObject = JSON.parse(where);
          
          const mutationString = `
            mutation Delete${operation.charAt(0).toUpperCase() + operation.slice(1)} {
              ${operation}(where: ${JSON.stringify(whereObject).replace(/\"([^\"]+)\":/g, '$1:')}) {
                ${fields}
              }
            }
          `.trim();
          
          // Execute the mutation
          const result = await executeGraphQL(mutationString, graphqlEndpoint, cookie || '');
          
          // Mark that data has changed
          dataHasChanged = true;
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Data-Changed': 'true'
            },
          });
        }
        
        if (name === 'modelSpecificSearch') {
          const { modelName, searchQuery, fields, limit = 10 } = args;
          
          // Get all types from schema to find the correct model
          const typeMap = schema.getTypeMap();
          let foundModel = null;
          let operationName = null;
          
          // Find the model by name (case-insensitive)
          const modelNameLower = modelName.toLowerCase();
          for (const [typeName] of Object.entries(typeMap)) {
            if (typeName.toLowerCase() === modelNameLower || 
                typeName.toLowerCase() === modelNameLower + 's' ||
                typeName.toLowerCase().replace(/s$/, '') === modelNameLower) {
              foundModel = typeName;
              break;
            }
          }
          
          if (!foundModel) {
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              result: {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    error: `Model '${modelName}' not found in schema`,
                    availableModels: Object.keys(typeMap).filter(name => !name.startsWith('__'))
                  }, null, 2),
                }],
              }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          
          // Find the corresponding query operation
          if (schema.getQueryType()) {
            const queryFields = schema.getQueryType()!.getFields();
            const modelLower = foundModel.toLowerCase();
            
            // Try various naming conventions
            const possibleNames = [
              modelLower + 's',  // products
              modelLower,        // product
              foundModel.charAt(0).toLowerCase() + foundModel.slice(1) + 's', // Products -> products
              foundModel.charAt(0).toLowerCase() + foundModel.slice(1)        // Products -> product
            ];
            
            for (const name of possibleNames) {
              if (queryFields[name]) {
                operationName = name;
                break;
              }
            }
          }
          
          if (!operationName) {
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              result: {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    error: `No query operation found for model '${modelName}'`,
                    foundModel,
                    availableOperations: schema.getQueryType() ? Object.keys(schema.getQueryType()!.getFields()) : []
                  }, null, 2),
                }],
              }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          
          // Get the actual fields available on this model by checking the GraphQL schema
          const queryField = schema.getQueryType()?.getFields()[operationName];
          const returnType = queryField?.type;
          let availableFields: string[] = [];
          
          // Extract the element type from list types and non-null wrappers
          let elementType = returnType;
          while (elementType && (isListType(elementType) || isNonNullType(elementType))) {
            elementType = elementType.ofType;
          }
          
          if (elementType && 'getFields' in elementType && typeof elementType.getFields === 'function') {
            const modelFields = elementType.getFields();
            availableFields = Object.keys(modelFields);
          }
          
          // Build search conditions using only fields that exist on the model
          const searchConditions = [];
          const searchTerm = searchQuery.trim();
          
          // Add ID search (exact match) - ID should always exist
          if (searchTerm && availableFields.includes('id')) {
            searchConditions.push(`{ id: { equals: "${searchTerm}" } }`);
          }
          
          // Add text field search (case-insensitive contains) for fields that exist
          const commonSearchFields = ['name', 'title', 'label', 'email', 'handle'];
          const validSearchFields = commonSearchFields.filter(field => availableFields.includes(field));
          
          for (const fieldName of validSearchFields) {
            searchConditions.push(`{ ${fieldName}: { contains: "${searchTerm}", mode: insensitive } }`);
          }
          
          // Build the GraphQL query manually to avoid JSON.stringify issues with enums
          let whereClause = '';
          if (searchConditions.length > 0) {
            whereClause = `where: { OR: [${searchConditions.join(', ')}] },`;
          }
          
          const queryString = `
            query Search${foundModel} {
              ${operationName}(
                ${whereClause}
                take: ${limit}
              ) {
                ${fields}
              }
            }
          `.trim();
          
          // Execute the search query
          const result = await executeGraphQL(queryString, graphqlEndpoint, cookie || '');
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  searchQuery: searchTerm,
                  modelName: foundModel,
                  operationName,
                  availableFields,
                  validSearchFields,
                  queryUsed: queryString,
                  results: result,
                  total: result?.data?.[operationName]?.length || 0
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        // Commerce tool handlers
        if (name === 'searchProducts') {
          const { countryCode, limit = 10 } = args;

          // Simple query to get all products - filtering will be basic
          const queryString = `
            query {
              products(take: ${limit}) {
                id
                title
                handle
                thumbnail
                description {
                  document
                }
                productVariants {
                  id
                  title
                  sku
                  inventoryQuantity
                  prices(where: { region: { countries: { some: { iso2: { equals: "${countryCode.toUpperCase()}" } } } } }) {
                    id
                    amount
                    currency {
                      code
                      symbol
                    }
                    calculatedPrice {
                      calculatedAmount
                      originalAmount
                      currencyCode
                    }
                  }
                  productOptionValues {
                    id
                    value
                    productOption {
                      id
                      title
                    }
                  }
                }
                productOptions {
                  id
                  title
                  productOptionValues {
                    id
                    value
                  }
                }
              }
            }
          `;

          const result = await executeGraphQL(queryString, graphqlEndpoint, cookie || '');
          const products = result.data?.products || [];

          // Generate beautiful HTML for products using MCP UI
          const productsHTML = products.map((product: any) => {
            const firstVariant = product.productVariants?.[0];
            const price = firstVariant?.prices?.[0];
            const formattedPrice = price ?
              `${price.currency.symbol}${(price.calculatedPrice?.calculatedAmount || price.amount) / 100}` :
              'Price unavailable';

            const hasMultipleVariants = product.productVariants?.length > 1;
            const variantText = hasMultipleVariants ?
              `<p class="text-sm text-gray-600">${product.productVariants.length} variants available</p>` : '';

            return `
              <div class="product-card border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
                <div class="flex gap-4">
                  ${product.thumbnail ? `
                    <img src="${product.thumbnail}" alt="${product.title}"
                         class="w-20 h-20 object-cover rounded-md flex-shrink-0">
                  ` : `
                    <div class="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center">
                      <span class="text-gray-400 text-xs">No image</span>
                    </div>
                  `}
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-lg text-gray-900 truncate">${product.title}</h3>
                    <p class="text-lg font-bold text-green-600">${formattedPrice}</p>
                    ${variantText}
                    <div class="mt-2 flex gap-2">
                      <button onclick="getProductDetails('${product.id}')"
                              class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        View Details
                      </button>
                      ${!hasMultipleVariants && firstVariant ? `
                        <button onclick="addToCart('${firstVariant.id}')"
                                class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                          Add to Cart
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('');

          const htmlContent = `
            <div class="products-grid">
              <div class="mb-4 p-3 bg-blue-50 rounded-lg">
                <h2 class="text-xl font-bold text-gray-900">Products for ${countryCode.toUpperCase()}</h2>
                <p class="text-gray-600">Found ${products.length} products</p>
              </div>
              <div class="space-y-4">
                ${productsHTML}
              </div>
              <style>
                .products-grid { max-width: 800px; margin: 0 auto; }
                .product-card { margin-bottom: 1rem; }
                button { cursor: pointer; transition: all 0.2s; }
                button:hover { transform: translateY(-1px); }
              </style>
              <script>
                function getProductDetails(productId) {
                  // Send proper MCP UI action
                  window.parent.postMessage({
                    type: 'tool',
                    payload: { toolName: 'getProduct', params: { productId, countryCode: '${countryCode}' } }
                  }, '*');
                }
                function addToCart(variantId) {
                  // Send proper MCP UI action
                  window.parent.postMessage({
                    type: 'tool',
                    payload: { toolName: 'addToCart', params: { variantId, quantity: 1 } }
                  }, '*');
                }
              </script>
            </div>
          `;

          // Use proper MCP UI format
          const uiResource = createUIResource({
            uri: `ui://openfront/products?country=${countryCode}`,
            content: { type: 'rawHtml', htmlString: htmlContent },
            encoding: 'text',
          });

          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [uiResource],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'getProduct') {
          const { productId, productHandle, countryCode } = args;

          const whereClause = productId ? { id: productId } : { handle: productHandle };
          if (!productId && !productHandle) {
            throw new Error('Either productId or productHandle is required');
          }

          const queryString = `
            query GetProduct($where: ProductWhereUniqueInput!) {
              product(where: $where) {
                id
                title
                handle
                thumbnail
                description {
                  document
                }
                productImages {
                  id
                  image {
                    url
                  }
                }
                productOptions {
                  id
                  title
                  productOptionValues {
                    id
                    value
                  }
                }
                productVariants {
                  id
                  title
                  sku
                  inventoryQuantity
                  allowBackorder
                  prices(where: { region: { countries: { some: { iso2: { equals: "${countryCode.toUpperCase()}" } } } } }) {
                    id
                    amount
                    currency {
                      code
                      symbol
                    }
                    calculatedPrice {
                      calculatedAmount
                      originalAmount
                      currencyCode
                    }
                  }
                  productOptionValues {
                    id
                    value
                    productOption {
                      id
                      title
                    }
                  }
                }
              }
            }
          `;

          const result = await executeGraphQL(queryString, graphqlEndpoint, cookie || '', { where: whereClause });
          const product = result.data?.product;

          if (!product) {
            throw new Error('Product not found');
          }

          // Generate HTML for product variants
          const variantsHTML = product.productVariants?.map((variant: any) => {
            const price = variant.prices?.[0];
            const formattedPrice = price ?
              `${price.currency.symbol}${(price.calculatedPrice?.calculatedAmount || price.amount) / 100}` :
              'Price unavailable';

            const options = variant.productOptionValues?.map((pov: any) =>
              `${pov.productOption.title}: ${pov.value}`
            ).join(', ') || '';

            const inStock = variant.inventoryQuantity > 0 || variant.allowBackorder;
            const stockText = inStock ?
              `✅ ${variant.inventoryQuantity} in stock` :
              '❌ Out of stock';

            return `
              <div class="variant-card border rounded p-3 ${inStock ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium">${variant.title || product.title}</h4>
                    ${options ? `<p class="text-sm text-gray-600">${options}</p>` : ''}
                    <p class="text-sm ${inStock ? 'text-green-600' : 'text-red-600'}">${stockText}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-bold text-green-600">${formattedPrice}</p>
                    ${inStock ? `
                      <button onclick="addToCart('${variant.id}')"
                              class="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Add to Cart
                      </button>
                    ` : `
                      <button disabled class="mt-2 px-3 py-1 bg-gray-300 text-gray-500 text-sm rounded cursor-not-allowed">
                        Out of Stock
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('') || '';

          // Generate images gallery
          const imagesHTML = product.productImages?.length > 0 ? `
            <div class="images-gallery mb-6">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                ${product.productImages.map((img: any) => `
                  <img src="${img.image.url}" alt="${product.title}"
                       class="w-full h-32 object-cover rounded border">
                `).join('')}
              </div>
            </div>
          ` : product.thumbnail ? `
            <div class="images-gallery mb-6">
              <img src="${product.thumbnail}" alt="${product.title}"
                   class="w-full max-w-md h-64 object-cover rounded border mx-auto">
            </div>
          ` : '';

          const htmlContent = `
            <div class="product-details max-w-4xl mx-auto p-4">
              <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">${product.title}</h1>
                <p class="text-gray-600">Product ID: ${product.id}</p>
              </div>

              ${imagesHTML}

              <div class="variants-section">
                <h3 class="text-xl font-semibold mb-4">
                  Available Options (${product.productVariants?.length || 0} variants)
                </h3>
                ${product.productVariants?.length > 1 ? `
                  <div class="mb-4 p-3 bg-blue-50 rounded">
                    <p class="text-blue-800">
                      💡 This product has multiple variants. Choose the specific option you want below.
                    </p>
                  </div>
                ` : ''}
                <div class="space-y-3">
                  ${variantsHTML}
                </div>
              </div>

              <style>
                .product-details { }
                .variant-card { transition: all 0.2s; }
                .variant-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                button { transition: all 0.2s; }
                button:hover:not(:disabled) { transform: translateY(-1px); }
                .images-gallery img { transition: transform 0.2s; }
                .images-gallery img:hover { transform: scale(1.05); }
              </style>

              <script>
                function addToCart(variantId) {
                  // Send proper MCP UI action
                  window.parent.postMessage({
                    type: 'tool',
                    payload: { toolName: 'addToCart', params: { variantId, quantity: 1 } }
                  }, '*');
                }
              </script>
            </div>
          `;

          // Use proper MCP UI format
          const uiResource = createUIResource({
            uri: `ui://openfront/product/${product.id}?country=${countryCode}`,
            content: { type: 'rawHtml', htmlString: htmlContent },
            encoding: 'text',
          });

          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [uiResource],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'createCart') {
          const { countryCode } = args;
          
          // First get region for country code
          const regionQuery = `
            query {
              regions(where: { countries: { some: { iso2: { equals: "${countryCode.toLowerCase()}" } } } }) {
                id
                name
                currency {
                  code
                }
              }
            }
          `;
          
          const regionResult = await executeGraphQL(regionQuery, graphqlEndpoint, cookie || '');
          const region = regionResult.data?.regions?.[0];
          
          if (!region) {
            throw new Error(`No region found for country code: ${countryCode}`);
          }
          
          const createCartMutation = `
            mutation CreateCart {
              createCart(data: { region: { connect: { id: "${region.id}" } } }) {
                id
                email
                type
                lineItems {
                  id
                  quantity
                  productVariant {
                    id
                    title
                    product {
                      thumbnail
                      title
                    }
                    prices {
                      amount
                      currency {
                        code
                      }
                      calculatedPrice {
                        calculatedAmount
                        originalAmount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          `;
          
          const cartResult = await executeGraphQL(createCartMutation, graphqlEndpoint, cookie || '');
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  cart: cartResult.data?.createCart,
                  countryCode,
                  region,
                  message: `Cart created successfully for ${countryCode.toUpperCase()}. Cart ID: ${cartResult.data?.createCart?.id}`
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'getCart') {
          const { cartId } = args;
          
          const queryString = `
            query GetCart($cartId: ID!) {
              activeCart(cartId: $cartId)
            }
          `;
          
          const result = await executeGraphQL(queryString, graphqlEndpoint, cookie || '', { cartId });
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  cart: result.data?.activeCart
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'addToCart') {
          const { cartId, variantId, quantity = 1 } = args;
          
          // Copy EXACT mutation from cart.ts - using updateActiveCart NOT updateCart
          const addToCartMutation = `
            mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
              updateActiveCart(cartId: $cartId, data: $data) {
                id
                lineItems {
                  id
                  quantity
                  productVariant {
                    id
                    title
                    prices {
                      amount
                      currency {
                        code
                      }
                    }
                  }
                }
              }
            }
          `;
          
          // Copy EXACT data structure from cart.ts  
          const result = await executeGraphQL(addToCartMutation, graphqlEndpoint, cookie || '', {
            cartId,
            data: {
              lineItems: {
                create: [
                  {
                    productVariant: {
                      connect: { id: variantId }
                    },
                    quantity
                  }
                ]
              }
            }
          });
          
          // Mark that data has changed
          dataHasChanged = true;
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  cart: result.data?.updateActiveCart,
                  message: `Added ${quantity} item(s) to cart`,
                  addedVariantId: variantId,
                  newItemCount: result.data?.updateActiveCart?.lineItems?.length || 0
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Data-Changed': 'true'
            },
          });
        }

        if (name === 'setShippingAddress') {
          const { cartId, email, firstName, lastName, address1, city, postalCode, countryCode, province, company, phone } = args;
          
          // This is a simplified version - full implementation would need user creation logic
          const setShippingAddressMutation = `
            mutation SetShippingAddress($cartId: ID!, $email: String!, $shippingAddress: AddressCreateInput!, $billingAddress: AddressCreateInput!) {
              updateActiveCart(
                cartId: $cartId
                data: {
                  email: $email
                  shippingAddress: {
                    create: $shippingAddress
                  }
                  billingAddress: {
                    create: $billingAddress
                  }
                }
              ) {
                id
                email
                shippingAddress {
                  id
                  firstName
                  lastName
                  address1
                  address2
                  city
                  province
                  postalCode
                  phone
                  country {
                    id
                    iso2
                    displayName
                  }
                }
                total
                subtotal
              }
            }
          `;
          
          const addressData = {
            firstName,
            lastName,
            address1,
            address2: "",
            city,
            province,
            postalCode,
            phone,
            company,
            country: {
              connect: {
                iso2: countryCode.toLowerCase()
              }
            }
          };
          
          const result = await executeGraphQL(setShippingAddressMutation, graphqlEndpoint, cookie || '', {
            cartId,
            email,
            shippingAddress: addressData,
            billingAddress: addressData
          });
          
          // Mark that data has changed
          dataHasChanged = true;
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  cart: result.data?.updateCart,
                  message: `Shipping address set successfully`,
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Data-Changed': 'true'
            },
          });
        }

        if (name === 'getAvailableRegions') {
          const queryString = `
            query {
              regions {
                id
                name
                currency {
                  code
                  symbol
                }
                countries {
                  iso2
                  displayName
                }
              }
            }
          `;
          
          const result = await executeGraphQL(queryString, graphqlEndpoint, cookie || '');
          
          // Create a flat list of countries for customer-friendly display
          const allCountries = result.data?.regions?.flatMap((region: any) => 
            region.countries.map((country: any) => ({
              countryCode: country.iso2.toUpperCase(),
              countryName: country.displayName,
              regionId: region.id,
              regionName: region.name,
              currency: region.currency.code.toUpperCase(),
              currencySymbol: region.currency.symbol
            }))
          ) || [];
          
          // Sort countries alphabetically by name
          allCountries.sort((a: any, b: any) => a.countryName.localeCompare(b.countryName));
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  countries: allCountries,
                  totalCountries: allCountries.length,
                  message: 'Available shipping destinations',
                  instruction: 'Please choose your country to see products and pricing for your area.',
                  friendlyCountryList: allCountries.map((c: any) => c.countryName).join(', ')
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'getAvailableCountries') {
          const queryString = `
            query {
              regions {
                id
                name
                currency {
                  code
                }
                countries {
                  id
                  iso2
                  iso3
                  displayName
                  numCode
                }
              }
            }
          `;
          
          const result = await executeGraphQL(queryString, graphqlEndpoint, cookie || '');
          
          // Create a flat list of countries for customer-facing display
          const allCountries = result.data?.regions?.flatMap((region: any) => 
            region.countries.map((country: any) => ({
              code: country.iso2,
              name: country.displayName,
              countryCode: country.iso2.toLowerCase(),
              currency: region.currency.code
            }))
          ) || [];
          
          // Sort countries alphabetically by name
          allCountries.sort((a: any, b: any) => a.name.localeCompare(b.name));
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  countries: allCountries,
                  totalCountries: allCountries.length,
                  availableCurrencies: [...new Set(allCountries.map((c: any) => c.currency))],
                  friendlyCountryList: allCountries.map((c: any) => c.name).join(', '),
                  message: `We ship to ${allCountries.length} countries worldwide!`
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'getPaymentProviders') {
          const { cartId } = args;
          
          // First get the cart to find the region ID
          const cartQuery = `
            query {
              activeCart(cartId: "${cartId}") {
                region {
                  id
                }
              }
            }
          `;
          
          const cartResult = await executeGraphQL(cartQuery, graphqlEndpoint, cookie || '');
          const regionId = cartResult.data?.activeCart?.region?.id;
          
          if (!regionId) {
            throw new Error('Cart not found or missing region information');
          }
          
          const paymentProvidersQuery = `
            query {
              activeCartPaymentProviders(regionId: "${regionId}") {
                id
                name
                code
                isInstalled
              }
            }
          `;
          
          const result = await executeGraphQL(paymentProvidersQuery, graphqlEndpoint, cookie || '');
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  paymentProviders: result.data?.activeCartPaymentProviders || [],
                  availableCount: result.data?.activeCartPaymentProviders?.length || 0,
                  cartId,
                  regionId
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        if (name === 'createPaymentSessions') {
          const { cartId } = args;
          
          const createSessionsMutation = `
            mutation {
              createActiveCartPaymentSessions(cartId: "${cartId}") {
                id
                paymentSessions {
                  id
                  paymentProvider {
                    id
                    code
                  }
                }
              }
            }
          `;
          
          const result = await executeGraphQL(createSessionsMutation, graphqlEndpoint, cookie || '');
          
          // Mark that data has changed
          dataHasChanged = true;
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  cart: result.data?.createActiveCartPaymentSessions,
                  message: 'Payment sessions created successfully',
                  sessionsCount: result.data?.createActiveCartPaymentSessions?.paymentSessions?.length || 0
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Data-Changed': 'true'
            },
          });
        }
        
        if (name === 'setBillingAddress') {
          const { cartId, firstName, lastName, address1, city, postalCode, countryCode, province, company, phone } = args;
          
          // Create billing address
          const createAddressMutation = `
            mutation {
              createAddress(data: {
                firstName: "${firstName}"
                lastName: "${lastName}"
                address1: "${address1}"
                address2: ""
                city: "${city}"
                postalCode: "${postalCode}"
                province: "${province || ''}"
                company: "${company || ''}"
                phone: "${phone || ''}"
                country: { connect: { iso2: "${countryCode.toUpperCase()}" } }
              }) {
                id
              }
            }
          `;
          
          const addressResult = await executeGraphQL(createAddressMutation, graphqlEndpoint, cookie || '');
          const addressId = addressResult.data?.createAddress?.id;
          
          if (!addressId) {
            throw new Error('Failed to create billing address');
          }
          
          // Update cart with billing address
          const updateCartMutation = `
            mutation {
              updateActiveCart(
                cartId: "${cartId}",
                data: {
                  billingAddress: { connect: { id: "${addressId}" } }
                }
              ) {
                id
                billingAddress {
                  id
                  firstName
                  lastName
                  address1
                  city
                  postalCode
                  country {
                    iso2
                    displayName
                  }
                }
              }
            }
          `;
          
          const result = await executeGraphQL(updateCartMutation, graphqlEndpoint, cookie || '');
          
          // Mark that data has changed
          dataHasChanged = true;
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  cart: result.data?.updateActiveCart,
                  message: 'Billing address set successfully',
                  addressId
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'X-Data-Changed': 'true'
            },
          });
        }

        if (name === 'placeOrder') {
          const { cartId } = args;
          
          const completeOrderMutation = `
            mutation {
              completeActiveCart(cartId: "${cartId}") {
                id
                displayId
                status
                total
                subtotal
                customer {
                  id
                  email
                }
                region {
                  id
                  name
                  currency {
                    code
                  }
                }
              }
            }
          `;
          
          try {
            const result = await executeGraphQL(completeOrderMutation, graphqlEndpoint, cookie || '');
            
            // Mark that data has changed
            dataHasChanged = true;
            
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              result: {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    order: result.data?.completeActiveCart,
                    success: true,
                    message: 'Order placed successfully!',
                    orderId: result.data?.completeActiveCart?.id
                  }, null, 2),
                }],
              }
            }), {
              status: 200,
              headers: { 
                'Content-Type': 'application/json',
                'X-Data-Changed': 'true'
              },
            });
          } catch (error) {
            // Order failed - likely due to missing business account or payment issues
            return new Response(JSON.stringify({
              jsonrpc: '2.0',
              id: body.id,
              result: {
                content: [{
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    error: 'PROGRAMMATIC_ORDER_FAILED',
                    message: 'Unable to place order programmatically. You may need a business account for automated orders, or there may be missing payment information. Would you like me to create a secure checkout link where you can complete this order manually?',
                    cartId,
                    canCreateCheckoutUrl: true
                  }, null, 2),
                }],
              }
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }

        if (name === 'getCheckoutLink') {
          const { cartId, countryCode } = args;
          
          // First, validate cart state to provide helpful warnings
          const cartQuery = `
            query GetCart($cartId: ID!) {
              activeCart(cartId: $cartId)
            }
          `;
          
          const cartResult = await executeGraphQL(cartQuery, graphqlEndpoint, cookie || '', { cartId });
          const cart = cartResult.data?.activeCart;
          
          if (!cart) {
            throw new Error(`Cart not found: ${cartId}`);
          }
          
          // Check cart completeness and prepare warnings
          const warnings = [];
          const recommendations = [];
          
          if (!cart.lineItems || cart.lineItems.length === 0) {
            warnings.push("⚠️  EMPTY CART: No products added to cart");
            recommendations.push("Use addToCart to add products before creating checkout link");
          }
          
          if (!cart.shippingAddress) {
            warnings.push("⚠️  MISSING SHIPPING: No shipping address set");
            recommendations.push("Use setShippingAddress to add customer details");
          }
          
          if (!cart.shippingMethods || cart.shippingMethods.length === 0) {
            warnings.push("⚠️  MISSING SHIPPING METHOD: No shipping method selected");
            recommendations.push("Use getShippingOptions and setShippingMethod");
          }
          
          if (!cart.email) {
            warnings.push("⚠️  MISSING EMAIL: No customer email provided");
            recommendations.push("Customer email is set via setShippingAddress");
          }
          
          const isComplete = warnings.length === 0;
          const status = isComplete ? "READY" : "INCOMPLETE";
          
          // Generate checkout link URL with country code
          const baseUrl = await getBaseUrl();
          const checkoutUrl = `${baseUrl}/${countryCode.toLowerCase()}/account/checkout-link?cartId=${cartId}`;
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  checkoutUrl,
                  cartId,
                  status,
                  isComplete,
                  message: isComplete 
                    ? '✅ Checkout link ready! Cart is complete and ready for payment.' 
                    : '⚠️  Checkout link created, but cart needs completion. Customer will need to fill missing information.',
                  warnings: warnings.length > 0 ? warnings : null,
                  recommendations: recommendations.length > 0 ? recommendations : null,
                  instructions: isComplete
                    ? 'Cart is ready! Customer can proceed directly to payment.'
                    : 'Customer will be guided through missing steps during checkout.',
                  cartSummary: {
                    itemCount: cart.lineItems?.length || 0,
                    hasShippingAddress: !!cart.shippingAddress,
                    hasShippingMethod: !!(cart.shippingMethods && cart.shippingMethods.length > 0),
                    hasEmail: !!cart.email,
                    total: cart.total || '$0.00'
                  }
                }, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`Tool ${name} not found`);
      } catch (error) {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            content: [{
              type: 'text',
              text: `Error executing ${name}: ${error}`,
            }],
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: body.id,
        error: { code: -32601, message: 'Method not found' }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { 
        code: -32603, 
        message: 'Internal error',
        data: error instanceof Error ? error.message : String(error)
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ transport: string }> }) {
  const { transport } = await params;
  
  const baseUrl = await getBaseUrl();
  const graphqlEndpoint = `${baseUrl}/api/graphql`;
  
  return new Response(JSON.stringify({ 
    message: 'Simple MCP Server is running',
    transport: transport,
    graphqlEndpoint
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}