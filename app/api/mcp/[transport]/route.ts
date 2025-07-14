/*
 * GraphQL MCP Server - AI Client Usage Instructions
 * 
 * This MCP server provides AI clients with access to a GraphQL API through auto-generated tools.
 * Here's how AI clients should interact with this server:
 * 
 * ## Basic Workflow:
 * 
 * 1. **Discover Available Operations**: Use the tools list to see available queries and mutations
 * 2. **Understand Input Requirements**: When you see a tool that requires complex inputs, use lookup tools
 * 3. **Build Requests Incrementally**: Look up each input type to understand the required structure
 * 
 * ## Key Discovery Tools:
 * 
 * - `lookupInputType(typeName)` - Get the structure of any GraphQL input type (e.g., "OrderCreateInput")
 * - `lookupWhereInput(typeName)` - Get the structure of where/filter inputs (e.g., "OrderWhereInput") 
 * - `lookupEnumValues(enumName)` - Get available values for enums (e.g., "OrderStatusType")
 * 
 * ## Example Workflow - Creating an Order:
 * 
 * 1. **User**: "I want to create an order"
 * 2. **MCP Client**: Queries MCP server tools → finds `createOrder` tool → sees it requires `data: OrderCreateInput`
 * 3. **MCP Client**: Calls `lookupInputType("OrderCreateInput")` on MCP server → gets all available fields and their types
 * 4. **MCP Client**: Sees `lineItems` field requires `OrderLineItemRelateToManyForCreateInput` 
 * 5. **MCP Client**: Calls `lookupInputType("OrderLineItemRelateToManyForCreateInput")` on MCP server → gets line item structure
 * 6. **MCP Client**: Sees nested fields require additional input types (e.g. `ProductVariantWhereUniqueInput`)
 * 7. **MCP Client**: Calls `lookupWhereInput("ProductVariantWhereUniqueInput")` on MCP server → gets unique identifier options
 * 8. **MCP Client**: Now has enough information to construct the proper nested JSON and calls `createOrder` on MCP server
 * 
 * ## Example Workflow - Querying Orders:
 * 
 * 1. **User**: "Find orders for a specific customer"
 * 2. **MCP Client**: Queries MCP server tools → finds `orders` tool → sees it requires `where: OrderWhereInput`
 * 3. **MCP Client**: Calls `lookupWhereInput("OrderWhereInput")` on MCP server → gets all available filter options
 * 4. **MCP Client**: Sees `user` filter option requires `UserWhereInput`
 * 5. **MCP Client**: Calls `lookupWhereInput("UserWhereInput")` on MCP server → gets user filter structure
 * 6. **MCP Client**: Constructs proper where clause with nested user filters and calls `orders` on MCP server
 * 
 * ## Important Notes:
 * 
 * - **Always look up input types**: Never guess the structure of complex inputs
 * - **Follow the type chain**: If an input type references other types, look those up too
 * - **Use proper nesting**: GraphQL requires exact nested structure - use lookup tools to get it right
 * - **Check enum values**: Use `lookupEnumValues` for any enum fields to see valid options
 * - **Relationships**: Fields ending in "Input" usually require create/connect patterns
 * 
 * ## Type Discovery Pattern:
 * 
 * ```
 * createOrder(data: OrderCreateInput) 
 *   ↓ lookupInputType("OrderCreateInput")
 *   ↓ lineItems: LineItemCreateInput[]
 *   ↓ lookupInputType("LineItemCreateInput") 
 *   ↓ productVariant: ProductVariantWhereUniqueInput
 *   ↓ lookupWhereInput("ProductVariantWhereUniqueInput")
 *   ↓ id: ID | sku: String
 * ```
 * 
 * This allows you to build: `{ data: { lineItems: { create: [{ productVariant: { connect: { id: "..." } } }] } } }`
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  Tool,
  TextContent,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { 
  getIntrospectionQuery, 
  buildClientSchema, 
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLField,
  GraphQLArgument,
  isScalarType,
  isObjectType,
  isNonNullType,
  isListType,
  isInputObjectType,
} from 'graphql';
import { getBaseUrl } from '@/features/dashboard/lib/getBaseUrl';

// Schema caching
let cachedSchema: GraphQLSchema | null = null;
let lastIntrospectionTime = 0;
let cachedEndpoint: string | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Types
interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  description?: string;
}

type NestedSelection = Array<[string, NestedSelection | null]>;

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

// Get GraphQL schema from introspection with caching
async function getGraphQLSchema(graphqlEndpoint: string, cookie: string): Promise<GraphQLSchema> {
  const now = Date.now();
  
  // Check if we have a valid cached schema
  const isCacheValid = cachedSchema && 
    (now - lastIntrospectionTime) < CACHE_DURATION && 
    cachedEndpoint === graphqlEndpoint;
  
  if (isCacheValid) {
    console.log('✅ Using cached GraphQL schema');
    return cachedSchema;
  }
  
  // Log reason for cache miss
  if (!cachedSchema) {
    console.log('🔄 Fetching GraphQL schema (first time)...');
  } else if (cachedEndpoint !== graphqlEndpoint) {
    console.log('🔄 Fetching GraphQL schema (endpoint changed)...');
  } else {
    console.log('🔄 Fetching GraphQL schema (cache expired)...');
  }
  
  try {
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
    
    // Cache the schema
    cachedSchema = buildClientSchema(result.data);
    lastIntrospectionTime = now;
    cachedEndpoint = graphqlEndpoint;
    
    console.log('✅ GraphQL schema cached for 24 hours');
    
    return cachedSchema;
    
  } catch (error) {
    // If we have a cached schema and introspection fails, use the cached version
    if (cachedSchema) {
      console.warn('⚠️ Schema introspection failed, using cached schema:', error);
      return cachedSchema;
    }
    
    // No cached schema available, re-throw the error
    throw error;
  }
}

// Generate detailed tool description from GraphQL field  
function generateToolDescription(fieldName: string, field: GraphQLField<any, any>, operationType: 'query' | 'mutation'): string {
  const baseDescription = field.description || `${operationType === 'query' ? 'Query' : 'Mutation'}: ${fieldName}`;
  
  // Extract argument information
  const args = field.args || [];
  if (args.length === 0) {
    return baseDescription;
  }
  
  const requiredArgs = args.filter(arg => isNonNullType(arg.type));
  const optionalArgs = args.filter(arg => !isNonNullType(arg.type));
  
  let description = baseDescription + '\n\n';
  
  if (requiredArgs.length > 0) {
    description += 'Required arguments:\n';
    requiredArgs.forEach(arg => {
      const typeName = getSimpleTypeName(arg.type);
      const argDesc = arg.description ? ` - ${arg.description}` : '';
      description += `• ${arg.name} (${typeName})${argDesc}\n`;
    });
  }
  
  if (optionalArgs.length > 0) {
    description += requiredArgs.length > 0 ? '\nOptional arguments:\n' : 'Optional arguments:\n';
    optionalArgs.forEach(arg => {
      const typeName = getSimpleTypeName(arg.type);
      const argDesc = arg.description ? ` - ${arg.description}` : '';
      description += `• ${arg.name} (${typeName})${argDesc}\n`;
    });
  }
  
  return description.trim();
}

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


// Convert GraphQL type to JSON Schema
function convertTypeToJsonSchema(
  gqlType: GraphQLInputType,
  maxDepth: number = 3,
  currentDepth: number = 1
): JsonSchema {
  if (currentDepth > maxDepth) {
    return { type: 'object', description: 'Max depth reached' };
  }

  if (isNonNullType(gqlType)) {
    const innerSchema = convertTypeToJsonSchema(gqlType.ofType, maxDepth, currentDepth);
    (innerSchema as any).required = true;
    return innerSchema;
  }

  if (isListType(gqlType)) {
    const innerSchema = convertTypeToJsonSchema(gqlType.ofType, maxDepth, currentDepth);
    return { type: 'array', items: innerSchema };
  }

  if (isScalarType(gqlType)) {
    const typeName = gqlType.name.toLowerCase();
    if (typeName === 'string') return { type: 'string' };
    if (typeName === 'int') return { type: 'integer' };
    if (typeName === 'float') return { type: 'number' };
    if (typeName === 'boolean') return { type: 'boolean' };
    if (typeName === 'id') return { type: 'string' };
    return { type: 'string', description: `GraphQL scalar: ${gqlType.name}` };
  }

  if (isInputObjectType(gqlType)) {
    // For input object types, return proper object schema
    return { 
      type: 'object', 
      description: `${gqlType.name} - Use lookupInputType('${gqlType.name}') to see structure`,
      additionalProperties: true
    };
  }

  return { type: 'string', description: `Unknown GraphQL type: ${gqlType.toString()}` };
}

// Build nested field selections
function buildNestedSelection(
  fieldType: GraphQLObjectType,
  maxDepth: number,
  currentDepth: number = 1
): NestedSelection {
  if (currentDepth > maxDepth) return [];
  if (!fieldType.getFields) return [];

  const selections: NestedSelection = [];
  const fields = fieldType.getFields();
  
  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (fieldName.startsWith('__')) continue;

    let type = fieldValue.type;
    
    if (isScalarType(type)) {
      selections.push([fieldName, null]);
    } else if (isNonNullType(type)) {
      const ofType = type.ofType;
      if (isScalarType(ofType)) {
        selections.push([fieldName, null]);
      } else if (isObjectType(ofType)) {
        const nestedSelections = buildNestedSelection(ofType, maxDepth, currentDepth + 1);
        if (nestedSelections.length > 0) {
          selections.push([fieldName, nestedSelections]);
        }
      }
    } else if (isListType(type)) {
      let innerType = type.ofType;
      while (isNonNullType(innerType) || isListType(innerType)) {
        innerType = innerType.ofType;
      }
      if (isObjectType(innerType)) {
        const nestedSelections = buildNestedSelection(innerType, maxDepth, currentDepth + 1);
        if (nestedSelections.length > 0) {
          selections.push([fieldName, nestedSelections]);
        }
      }
    } else if (isObjectType(type)) {
      const nestedSelections = buildNestedSelection(type, maxDepth, currentDepth + 1);
      if (nestedSelections.length > 0) {
        selections.push([fieldName, nestedSelections]);
      }
    }
  }

  return selections;
}

// Build GraphQL selection string from nested selections
function buildSelectionString(selections: NestedSelection, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  const parts: string[] = [];
  
  for (const [fieldName, nestedSelections] of selections) {
    if (nestedSelections === null) {
      parts.push(`${indent}${fieldName}`);
    } else if (nestedSelections.length > 0) {
      const nestedString = buildSelectionString(nestedSelections, depth + 1);
      parts.push(`${indent}${fieldName} {\n${nestedString}\n${indent}}`);
    }
  }
  
  return parts.join('\n');
}

// Create and configure the MCP server
async function createMCPServer(graphqlEndpoint: string, cookie: string) {
  const server = new Server(
    {
      name: 'graphql-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Get the GraphQL schema
  let schema: GraphQLSchema;
  try {
    schema = await getGraphQLSchema(graphqlEndpoint, cookie);
    console.log('✅ Successfully introspected GraphQL schema');
  } catch (error) {
    console.error('❌ Failed to introspect GraphQL schema:', error);
    throw error;
  }

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = [];

    // Process Query fields
    if (schema.getQueryType()) {
      const queryFields = schema.getQueryType()!.getFields();
      
      for (const [queryName, field] of Object.entries(queryFields)) {
        if (queryName.startsWith('__')) continue;

        // Build argument schema
        const argsSchema: JsonSchema = { 
          type: 'object', 
          properties: {}, 
          required: [] 
        };
        
        // field.args is an array, we need to access the args differently
        if (field.args && field.args.length > 0) {
          for (const arg of field.args) {
            const argName = arg.name;
            const typeSchema = convertTypeToJsonSchema(arg.type, 3, 1);
            
            const isRequired = (typeSchema as any).required;
            if (isRequired) {
              delete (typeSchema as any).required;
              if (Array.isArray(argsSchema.required)) {
                argsSchema.required.push(argName);
              }
            }
            
            if (!argsSchema.properties) {
              argsSchema.properties = {};
            }
            argsSchema.properties[argName] = typeSchema;
            const baseDesc = arg.description || `${argName} field`;
            const typeInfo = getSimpleTypeName(arg.type);
            const requiredInfo = isNonNullType(arg.type) ? ' (required)' : ' (optional)';
            argsSchema.properties[argName].description = `${baseDesc} - Type: ${typeInfo}${requiredInfo}`;
          }
        }

        tools.push({
          name: queryName,
          description: generateToolDescription(queryName, field, 'query'),
          inputSchema: argsSchema as any,
        });
      }
    }

    // Process Mutation fields
    if (schema.getMutationType()) {
      const mutationFields = schema.getMutationType()!.getFields();
      
      for (const [mutationName, field] of Object.entries(mutationFields)) {
        if (mutationName.startsWith('__')) continue;

        // Build argument schema
        const argsSchema: JsonSchema = { 
          type: 'object', 
          properties: {}, 
          required: [] 
        };
        
        // field.args is an array, we need to access the args differently
        if (field.args && field.args.length > 0) {
          for (const arg of field.args) {
            const argName = arg.name;
            const typeSchema = convertTypeToJsonSchema(arg.type, 3, 1);
            
            const isRequired = (typeSchema as any).required;
            if (isRequired) {
              delete (typeSchema as any).required;
              if (Array.isArray(argsSchema.required)) {
                argsSchema.required.push(argName);
              }
            }
            
            if (!argsSchema.properties) {
              argsSchema.properties = {};
            }
            argsSchema.properties[argName] = typeSchema;
            // If typeSchema already has a description with lookup instructions, use that
            if (!typeSchema.description) {
              const baseDesc = arg.description || `${argName} argument`;
              const typeInfo = getSimpleTypeName(arg.type);
              const requiredInfo = isNonNullType(arg.type) ? ' (required)' : ' (optional)';
              argsSchema.properties[argName].description = `${baseDesc} - Type: ${typeInfo}${requiredInfo}`;
            }
          }
        }

        tools.push({
          name: mutationName,
          description: generateToolDescription(mutationName, field, 'mutation'),
          inputSchema: argsSchema as any,
        });
      }
    }

    // Add model discovery tool - helps AI find relevant models without loading all tools
    tools.push({
      name: 'searchModels',
      description: 'Search for GraphQL models/types by name or description. Use this FIRST to find the right model before using other operations.\n\nRequired arguments:\n• searchTerm (String) - Search term to find models (e.g., "user", "todo", "order", "task")',
      inputSchema: {
        type: 'object',
        properties: {
          searchTerm: {
            type: 'string',
            description: 'Search term to find relevant models/types. Can be partial model names (e.g., "user" finds User, UserProfile, etc.)'
          }
        },
        required: ['searchTerm']
      }
    });

    // Add list all models tool - for when search fails and AI needs to see everything
    tools.push({
      name: 'listAllModels',
      description: 'List ALL available GraphQL models/types in the system. Use this when searchModels returns no results and you need to see all available models to find the right one (e.g., user says "person" but model is called "User").\n\nNo arguments required.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    });

    // Add type discovery tools
    tools.push({
      name: 'lookupInputType',
      description: 'Look up the structure of a GraphQL input type\n\nRequired arguments:\n• typeName (String) - The name of the input type to look up (e.g., "OrderCreateInput")',
      inputSchema: {
        type: 'object',
        properties: {
          typeName: {
            type: 'string',
            description: 'The name of the GraphQL input type to inspect'
          }
        },
        required: ['typeName']
      }
    });

    tools.push({
      name: 'lookupWhereInput',
      description: 'Look up the structure of a GraphQL where/filter input type\n\nRequired arguments:\n• typeName (String) - The name of the where input type to look up (e.g., "OrderWhereInput")',
      inputSchema: {
        type: 'object',
        properties: {
          typeName: {
            type: 'string',
            description: 'The name of the GraphQL where input type to inspect'
          }
        },
        required: ['typeName']
      }
    });

    tools.push({
      name: 'lookupEnumValues',
      description: 'Look up the available values for a GraphQL enum type\n\nRequired arguments:\n• enumName (String) - The name of the enum type to look up (e.g., "OrderStatusType")',
      inputSchema: {
        type: 'object',
        properties: {
          enumName: {
            type: 'string',
            description: 'The name of the GraphQL enum type to inspect'
          }
        },
        required: ['enumName']
      }
    });

    console.log(`🎉 Generated ${tools.length} tools from GraphQL schema (including ${tools.length - (tools.length - 3)} type discovery tools)`);
    return { tools };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      // Handle list all models tool
      if (name === 'listAllModels') {
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
        
        // Sort by name and group by kind for better readability
        allModels.sort((a, b) => a.typeName.localeCompare(b.typeName));
        
        const result = {
          totalModels: allModels.length,
          models: allModels,
          tip: "Use searchModels('term') to filter this list, or use the specific model operations directly"
        };
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          }],
        };
      }
      
      // Handle model search tool
      if (name === 'searchModels') {
        const searchTerm = args.searchTerm.toLowerCase();
        const results: any[] = [];
        
        // Search through all types in schema
        const typeMap = schema.getTypeMap();
        
        for (const [typeName, type] of Object.entries(typeMap)) {
          // Skip built-in GraphQL types
          if (typeName.startsWith('__')) continue;
          
          const nameMatch = typeName.toLowerCase().includes(searchTerm);
          const descMatch = type.description?.toLowerCase().includes(searchTerm) || false;
          
          if (nameMatch || descMatch) {
            // Find related operations for this type
            const relatedOps: string[] = [];
            
            // Check queries
            if (schema.getQueryType()) {
              const queryFields = schema.getQueryType()!.getFields();
              for (const [queryName] of Object.entries(queryFields)) {
                if (queryName.toLowerCase().includes(searchTerm) || 
                    queryName.toLowerCase().includes(typeName.toLowerCase().replace(/input$|type$/i, ''))) {
                  relatedOps.push(`Query: ${queryName}`);
                }
              }
            }
            
            // Check mutations  
            if (schema.getMutationType()) {
              const mutationFields = schema.getMutationType()!.getFields();
              for (const [mutationName] of Object.entries(mutationFields)) {
                if (mutationName.toLowerCase().includes(searchTerm) ||
                    mutationName.toLowerCase().includes(typeName.toLowerCase().replace(/input$|type$/i, ''))) {
                  relatedOps.push(`Mutation: ${mutationName}`);
                }
              }
            }
            
            results.push({
              typeName,
              description: type.description || `GraphQL type: ${typeName}`,
              kind: type.constructor.name,
              relatedOperations: relatedOps
            });
          }
        }
        
        const searchResults = {
          searchTerm: args.searchTerm,
          found: results.length,
          results: results.slice(0, 10) // Limit to top 10 results
        };
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(searchResults, null, 2),
          }],
        };
      }
      
      // Handle type discovery tools
      if (name === 'lookupInputType') {
        const typeName = args.typeName;
        const type = schema.getType(typeName);
        
        if (!type || !isInputObjectType(type)) {
          throw new Error(`Input type "${typeName}" not found`);
        }
        
        const fields = type.getFields();
        const result = {
          name: typeName,
          description: type.description || `Input type: ${typeName}`,
          fields: Object.entries(fields).map(([fieldName, fieldValue]) => ({
            name: fieldName,
            type: getSimpleTypeName(fieldValue.type),
            required: isNonNullType(fieldValue.type),
            description: fieldValue.description || `Field: ${fieldName}`
          }))
        };
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          }],
        };
      }
      
      if (name === 'lookupWhereInput') {
        const typeName = args.typeName;
        const type = schema.getType(typeName);
        
        if (!type || !isInputObjectType(type)) {
          throw new Error(`Where input type "${typeName}" not found`);
        }
        
        const fields = type.getFields();
        const result = {
          name: typeName,
          description: type.description || `Where input type: ${typeName}`,
          fields: Object.entries(fields).map(([fieldName, fieldValue]) => ({
            name: fieldName,
            type: getSimpleTypeName(fieldValue.type),
            required: isNonNullType(fieldValue.type),
            description: fieldValue.description || `Filter field: ${fieldName}`
          }))
        };
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          }],
        };
      }
      
      if (name === 'lookupEnumValues') {
        const enumName = args.enumName;
        const type = schema.getType(enumName);
        
        if (!type || !(type as any).getValues) {
          throw new Error(`Enum type "${enumName}" not found`);
        }
        
        const values = (type as any).getValues ? (type as any).getValues() : [];
        const result = {
          name: enumName,
          description: type.description || `Enum type: ${enumName}`,
          values: values.map((value: any) => ({
            name: value.name,
            value: value.value,
            description: value.description || `Enum value: ${value.name}`
          }))
        };
        
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      // Handle regular GraphQL operations
      let field: any = null;
      let operationType = '';
      let operationName = '';

      // Check if it's a query
      if (schema.getQueryType()) {
        const queryFields = schema.getQueryType()!.getFields();
        if (queryFields[name]) {
          field = queryFields[name];
          operationType = 'query';
          operationName = 'Query';
        }
      }

      // Check if it's a mutation
      if (!field && schema.getMutationType()) {
        const mutationFields = schema.getMutationType()!.getFields();
        if (mutationFields[name]) {
          field = mutationFields[name];
          operationType = 'mutation';
          operationName = 'Mutation';
        }
      }
      
      if (!field) {
        throw new Error(`Tool ${name} not found in queries, mutations, or discovery tools`);
      }

      // Get the return type and build selections
      let returnType = field.type;
      while (isNonNullType(returnType) || isListType(returnType)) {
        returnType = returnType.ofType;
      }
      
      let selectionString = '';
      
      if (isObjectType(returnType)) {
        const selections = buildNestedSelection(returnType, 3);
        selectionString = buildSelectionString(selections);
      }
      
      // Build the query/mutation
      const argDefs = (field.args || []).map(arg => {
        return `$${arg.name}: ${arg.type.toString()}`;
      }).join(', ');
      
      const argUses = (field.args || []).map(arg => 
        `${arg.name}: $${arg.name}`
      ).join(', ');
      
      const queryString = `
        ${operationType} ${name.charAt(0).toUpperCase() + name.slice(1)}${argDefs ? `(${argDefs})` : ''} {
          ${name}${argUses ? `(${argUses})` : ''}${selectionString ? ` {\n${selectionString}\n  }` : ''}
        }
      `.trim();
      
      console.log(`Executing ${operationType}:`, queryString);
      
      // Execute the query
      const result = await executeGraphQL(queryString, graphqlEndpoint, cookie, args);
      
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: `Error executing ${name}: ${error}`,
        }],
      };
    }
  });

  return server;
}

// Export the handler
export async function GET(request: Request, { params }: { params: { transport: string } }) {
  try {
    // Await params as required by Next.js
    const { transport } = await params;
    
    // Construct GraphQL endpoint
    const baseUrl = await getBaseUrl();
    const graphqlEndpoint = `${baseUrl}/api/graphql`;
    
    // Extract cookie from request
    const cookie = request.headers.get('cookie') || '';
    
    // Handle SSE transport
    if (transport === 'sse') {
      console.log('🔥 SSE REQUEST - Cookie received:', cookie ? 'YES' : 'NO');
      console.log('🔥 SSE REQUEST - Cookie value:', cookie);
      
      // Set SSE headers
      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      // Create a readable stream for SSE
      const stream = new ReadableStream({
        start(controller) {
          // Send initial connection event with cookie info
          const connectionData = {
            status: "connected",
            cookieReceived: !!cookie,
            cookieLength: cookie.length
          };
          controller.enqueue(new TextEncoder().encode(`event: connect\ndata: ${JSON.stringify(connectionData)}\n\n`));
          
          // Keep connection alive with periodic pings
          const pingInterval = setInterval(() => {
            try {
              controller.enqueue(new TextEncoder().encode('event: ping\ndata: {"timestamp":' + Date.now() + '}\n\n'));
            } catch (e) {
              clearInterval(pingInterval);
            }
          }, 30000);

          // Store cleanup function
          (controller as any).cleanup = () => {
            clearInterval(pingInterval);
          };
        },
        cancel() {
          // Cleanup when client disconnects
          if ((this as any).cleanup) {
            (this as any).cleanup();
          }
        }
      });

      return new Response(stream, { headers });
    }
    
    // For HTTP transport, return a simple response
    return new Response(JSON.stringify({ 
      message: 'GraphQL MCP Server is running',
      transport: transport,
      graphqlEndpoint
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to start MCP server',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request, { params }: { params: { transport: string } }) {
  try {
    // Await params as required by Next.js
    const { transport } = await params;
    
    // Construct GraphQL endpoint
    const baseUrl = await getBaseUrl();
    const graphqlEndpoint = `${baseUrl}/api/graphql`;
    
    // Extract cookie from request
    const cookie = request.headers.get('cookie') || '';
  
    // Get the GraphQL schema first
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
            tools: { listChanged: true },
            logging: {}
          },
          serverInfo: {
            name: 'graphql-mcp-server',
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
      // Get tools directly without server.request
      const tools: Tool[] = [];

      // Process Query fields
      if (schema.getQueryType()) {
        const queryFields = schema.getQueryType()!.getFields();
        
        for (const [queryName, field] of Object.entries(queryFields)) {
          if (queryName.startsWith('__')) continue;

          // Build argument schema
          const argsSchema: JsonSchema = { 
            type: 'object', 
            properties: {}, 
            required: [] 
          };
          
          // field.args is an array, we need to access the args differently
          if (field.args && field.args.length > 0) {
            for (const arg of field.args) {
              const argName = arg.name;
              const typeSchema = convertTypeToJsonSchema(arg.type, 3, 1);
              
              const isRequired = (typeSchema as any).required;
              if (isRequired) {
                delete (typeSchema as any).required;
                if (Array.isArray(argsSchema.required)) {
                  argsSchema.required.push(argName);
                }
              }
              
              if (!argsSchema.properties) {
                argsSchema.properties = {};
              }
              argsSchema.properties[argName] = typeSchema;
              argsSchema.properties[argName].description = arg.description || `Argument ${argName}`;
            }
          }

          tools.push({
            name: queryName,
            description: generateToolDescription(queryName, field, 'query'),
            inputSchema: argsSchema as any,
          });
        }
      }

      // Process Mutation fields
      if (schema.getMutationType()) {
        const mutationFields = schema.getMutationType()!.getFields();
        
        for (const [mutationName, field] of Object.entries(mutationFields)) {
          if (mutationName.startsWith('__')) continue;

          // Build argument schema
          const argsSchema: JsonSchema = { 
            type: 'object', 
            properties: {}, 
            required: [] 
          };
          
          // field.args is an array, we need to access the args differently
          if (field.args && field.args.length > 0) {
            for (const arg of field.args) {
              const argName = arg.name;
              const typeSchema = convertTypeToJsonSchema(arg.type, 3, 1);
              
              const isRequired = (typeSchema as any).required;
              if (isRequired) {
                delete (typeSchema as any).required;
                if (Array.isArray(argsSchema.required)) {
                  argsSchema.required.push(argName);
                }
              }
              
              if (!argsSchema.properties) {
                argsSchema.properties = {};
              }
              argsSchema.properties[argName] = typeSchema;
              // If typeSchema already has a description with lookup instructions, use that
              if (!typeSchema.description) {
                const baseDesc = arg.description || `${argName} argument`;
                const typeInfo = getSimpleTypeName(arg.type);
                const requiredInfo = isNonNullType(arg.type) ? ' (required)' : ' (optional)';
                argsSchema.properties[argName].description = `${baseDesc} - Type: ${typeInfo}${requiredInfo}`;
              }
            }
          }

          tools.push({
            name: mutationName,
            description: generateToolDescription(mutationName, field, 'mutation'),
            inputSchema: argsSchema as any,
          });
        }
      }

      // Add model discovery tool - helps AI find relevant models without loading all tools
      tools.push({
        name: 'searchModels',
        description: 'Search for GraphQL models/types by name or description. Use this FIRST to find the right model before using other operations.\n\nRequired arguments:\n• searchTerm (String) - Search term to find models (e.g., "user", "todo", "order", "task")',
        inputSchema: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string',
              description: 'Search term to find relevant models/types. Can be partial model names (e.g., "user" finds User, UserProfile, etc.)'
            }
          },
          required: ['searchTerm']
        }
      });

      // Add list all models tool - for when search fails and AI needs to see everything
      tools.push({
        name: 'listAllModels',
        description: 'List ALL available GraphQL models/types in the system. Use this when searchModels returns no results and you need to see all available models to find the right one (e.g., user says "person" but model is called "User").\n\nNo arguments required.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      });

      // Add type discovery tools
      tools.push({
        name: 'lookupInputType',
        description: 'Look up the structure of a GraphQL input type\n\nRequired arguments:\n• typeName (String) - The name of the input type to look up (e.g., "OrderCreateInput")',
        inputSchema: {
          type: 'object',
          properties: {
            typeName: {
              type: 'string',
              description: 'The name of the GraphQL input type to inspect'
            }
          },
          required: ['typeName']
        }
      });

      tools.push({
        name: 'lookupWhereInput',
        description: 'Look up the structure of a GraphQL where/filter input type\n\nRequired arguments:\n• typeName (String) - The name of the where input type to look up (e.g., "OrderWhereInput")',
        inputSchema: {
          type: 'object',
          properties: {
            typeName: {
              type: 'string',
              description: 'The name of the GraphQL where input type to inspect'
            }
          },
          required: ['typeName']
        }
      });

      tools.push({
        name: 'lookupEnumValues',
        description: 'Look up the available values for a GraphQL enum type\n\nRequired arguments:\n• enumName (String) - The name of the enum type to look up (e.g., "OrderStatusType")',
        inputSchema: {
          type: 'object',
          properties: {
            enumName: {
              type: 'string',
              description: 'The name of the GraphQL enum type to inspect'
            }
          },
          required: ['enumName']
        }
      });
      
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: body.id,
        result: { tools }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else if (body.method === 'tools/call') {
      // Handle tool call directly
      const { name, arguments: args } = body.params;

      try {
        // Handle list all models tool
        if (name === 'listAllModels') {
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
          
          // Sort by name and group by kind for better readability
          allModels.sort((a, b) => a.typeName.localeCompare(b.typeName));
          
          const result = {
            totalModels: allModels.length,
            models: allModels,
            tip: "Use searchModels('term') to filter this list, or use the specific model operations directly"
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
        
        // Handle model search tool
        if (name === 'searchModels') {
          const searchTerm = args.searchTerm.toLowerCase();
          const results: any[] = [];
          
          // Search through all types in schema
          const typeMap = schema.getTypeMap();
          
          for (const [typeName, type] of Object.entries(typeMap)) {
            // Skip built-in GraphQL types
            if (typeName.startsWith('__')) continue;
            
            const nameMatch = typeName.toLowerCase().includes(searchTerm);
            const descMatch = type.description?.toLowerCase().includes(searchTerm) || false;
            
            if (nameMatch || descMatch) {
              // Find related operations for this type
              const relatedOps: string[] = [];
              
              // Check queries
              if (schema.getQueryType()) {
                const queryFields = schema.getQueryType()!.getFields();
                for (const [queryName] of Object.entries(queryFields)) {
                  if (queryName.toLowerCase().includes(searchTerm) || 
                      queryName.toLowerCase().includes(typeName.toLowerCase().replace(/input$|type$/i, ''))) {
                    relatedOps.push(`Query: ${queryName}`);
                  }
                }
              }
              
              // Check mutations  
              if (schema.getMutationType()) {
                const mutationFields = schema.getMutationType()!.getFields();
                for (const [mutationName] of Object.entries(mutationFields)) {
                  if (mutationName.toLowerCase().includes(searchTerm) ||
                      mutationName.toLowerCase().includes(typeName.toLowerCase().replace(/input$|type$/i, ''))) {
                    relatedOps.push(`Mutation: ${mutationName}`);
                  }
                }
              }
              
              results.push({
                typeName,
                description: type.description || `GraphQL type: ${typeName}`,
                kind: type.constructor.name,
                relatedOperations: relatedOps
              });
            }
          }
          
          const searchResults = {
            searchTerm: args.searchTerm,
            found: results.length,
            results: results.slice(0, 10) // Limit to top 10 results
          };
          
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              content: [{
                type: 'text',
                text: JSON.stringify(searchResults, null, 2),
              }],
            }
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        
        // Handle type discovery tools
        if (name === 'lookupInputType') {
          const typeName = args.typeName;
          const type = schema.getType(typeName);
          
          if (!type || !isInputObjectType(type)) {
            throw new Error(`Input type "${typeName}" not found`);
          }
          
          const fields = type.getFields();
          const result = {
            name: typeName,
            description: type.description || `Input type: ${typeName}`,
            fields: Object.entries(fields).map(([fieldName, fieldValue]) => ({
              name: fieldName,
              type: getSimpleTypeName(fieldValue.type),
              required: isNonNullType(fieldValue.type),
              description: fieldValue.description || `Field: ${fieldName}`
            }))
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
        
        if (name === 'lookupWhereInput') {
          const typeName = args.typeName;
          const type = schema.getType(typeName);
          
          if (!type || !isInputObjectType(type)) {
            throw new Error(`Where input type "${typeName}" not found`);
          }
          
          const fields = type.getFields();
          const result = {
            name: typeName,
            description: type.description || `Where input type: ${typeName}`,
            fields: Object.entries(fields).map(([fieldName, fieldValue]) => ({
              name: fieldName,
              type: getSimpleTypeName(fieldValue.type),
              required: isNonNullType(fieldValue.type),
              description: fieldValue.description || `Filter field: ${fieldName}`
            }))
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
        
        if (name === 'lookupEnumValues') {
          const enumName = args.enumName;
          const type = schema.getType(enumName);
          
          if (!type || !(type as any).getValues) {
            throw new Error(`Enum type "${enumName}" not found`);
          }
          
          const values = (type as any).getValues ? (type as any).getValues() : [];
          const result = {
            name: enumName,
            description: type.description || `Enum type: ${enumName}`,
            values: values.map((value: any) => ({
              name: value.name,
              value: value.value,
              description: value.description || `Enum value: ${value.name}`
            }))
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

        // Handle regular GraphQL operations
        let field: any = null;
        let operationType = '';
        let operationName = '';

        // Check if it's a query
        if (schema.getQueryType()) {
          const queryFields = schema.getQueryType()!.getFields();
          if (queryFields[name]) {
            field = queryFields[name];
            operationType = 'query';
            operationName = 'Query';
          }
        }

        // Check if it's a mutation
        if (!field && schema.getMutationType()) {
          const mutationFields = schema.getMutationType()!.getFields();
          if (mutationFields[name]) {
            field = mutationFields[name];
            operationType = 'mutation';
            operationName = 'Mutation';
          }
        }
        
        if (!field) {
          throw new Error(`Tool ${name} not found in queries or mutations`);
        }

        // Get the return type and build selections
        let returnType = field.type;
        while (isNonNullType(returnType) || isListType(returnType)) {
          returnType = returnType.ofType;
        }
        
        let selectionString = '';
        
        if (isObjectType(returnType)) {
          const selections = buildNestedSelection(returnType, 3);
          selectionString = buildSelectionString(selections);
        }
        
        // Use args directly - no flattening to revert
        const variables = args;
        
        // Build the query/mutation
        const argDefs = (field.args || []).map(arg => {
          return `$${arg.name}: ${arg.type.toString()}`;
        }).join(', ');
        
        const argUses = (field.args || []).map(arg => 
          `${arg.name}: $${arg.name}`
        ).join(', ');
        
        const queryString = `
          ${operationType} ${name.charAt(0).toUpperCase() + name.slice(1)}${argDefs ? `(${argDefs})` : ''} {
            ${name}${argUses ? `(${argUses})` : ''}${selectionString ? ` {\n${selectionString}\n  }` : ''}
          }
        `.trim();
        
        console.log(`Executing ${operationType}:`, queryString);
        console.log(`Variables:`, JSON.stringify(variables, null, 2));
        
        // Execute the query
        const result = await executeGraphQL(queryString, graphqlEndpoint, cookie, variables);
        
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