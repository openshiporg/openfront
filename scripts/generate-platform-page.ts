#!/usr/bin/env tsx

/**
 * Platform Page Generator Script
 * 
 * Generates platform pages following the established pattern from products/orders
 * 
 * Usage:
 *   npx tsx scripts/generate-platform-page.ts <listPath> [options]
 *   
 * Example:
 *   npx tsx scripts/generate-platform-page.ts product-collections \
 *     --fields "id title handle createdAt updatedAt" \
 *     --status-config '{"active":{"label":"Active","color":"emerald"},"inactive":{"label":"Inactive","color":"zinc"}}' \
 *     --entity-singular "Collection" \
 *     --entity-plural "Collections"
 */

import fs from 'fs';
import path from 'path';

interface StatusConfig {
  label: string;
  color: string;
}

interface StatusConfigMap {
  [key: string]: StatusConfig;
}

// Parse command line arguments
const args = process.argv.slice(2);
const listPath = args[0];

if (!listPath) {
  console.error('Error: listPath is required');
  console.log('Usage: npx tsx scripts/generate-platform-page.ts <listPath> [options]');
  process.exit(1);
}

// Parse options
let graphqlFields = 'id\n    title\n    createdAt\n    updatedAt';
let statusConfig = '{"active":{"label":"Active","color":"emerald"},"inactive":{"label":"Inactive","color":"zinc"}}';
let entitySingular = '';
let entityPlural = '';
let customCamelCase = '';

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--fields' && args[i + 1]) {
    graphqlFields = args[i + 1];
    i++;
  } else if (args[i] === '--status-config' && args[i + 1]) {
    statusConfig = args[i + 1];
    i++;
  } else if (args[i] === '--entity-singular' && args[i + 1]) {
    entitySingular = args[i + 1];
    i++;
  } else if (args[i] === '--entity-plural' && args[i + 1]) {
    entityPlural = args[i + 1];
    i++;
  } else if (args[i] === '--camel-case' && args[i + 1]) {
    customCamelCase = args[i + 1];
    i++;
  }
}

// Auto-derive entity names if not provided
if (!entitySingular || !entityPlural) {
  // Convert kebab-case to PascalCase for singular
  const pascalCase = listPath
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  if (!entitySingular) {
    entitySingular = pascalCase.endsWith('s') ? pascalCase.slice(0, -1) : pascalCase;
  }
  
  if (!entityPlural) {
    entityPlural = pascalCase.endsWith('s') ? pascalCase : pascalCase + 's';
  }
}

// Parse GraphQL fields
const parsedFields = graphqlFields.trim().split('\n').map(line => line.trim()).join('\n    ');

// Parse status config
let parsedStatusConfig: StatusConfigMap;
try {
  parsedStatusConfig = JSON.parse(statusConfig);
} catch (e) {
  console.error('Error: Invalid JSON in status-config');
  process.exit(1);
}

// Convert camelCase to kebab-case for directory name
const directoryName = listPath;

// Convert to various naming conventions
const camelCase = customCamelCase || listPath.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
const pascalCase = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
const kebabCase = listPath;

console.log(`Generating platform page for: ${listPath}`);
console.log(`Directory: ${directoryName}`);
console.log(`Entity: ${entitySingular} / ${entityPlural}`);
console.log(`GraphQL ListKey: ${camelCase}`);

// Create directory structure
const platformDir = path.join(__dirname, '..', 'features', 'platform', directoryName);

if (fs.existsSync(platformDir)) {
  console.error(`Error: Directory ${platformDir} already exists`);
  process.exit(1);
}

fs.mkdirSync(platformDir, { recursive: true });
fs.mkdirSync(path.join(platformDir, 'actions'));
fs.mkdirSync(path.join(platformDir, 'components'));
fs.mkdirSync(path.join(platformDir, 'screens'));

console.log(`Created directory structure in ${platformDir}`);

// Generate actions/index.ts
const actionsContent = `'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for ${entitySingular.toLowerCase()} data (exported for potential use in other files)
export interface ${entitySingular} {
  id: string;
  title: string;
  [key: string]: unknown;
}

/**
 * Get list of ${entityPlural.toLowerCase()}
 */
export async function get${entityPlural}(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = \`
    ${parsedFields}
  \`
) {
  const query = \`
    query Get${entityPlural}($where: ${entitySingular}WhereInput, $take: Int!, $skip: Int!, $orderBy: [${entitySingular}OrderByInput!]) {
      items: ${camelCase}(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        \${selectedFields}
      }
      count: ${camelCase}Count(where: $where)
    }
  \`;

  const response = await keystoneClient(query, {
    where,
    take,
    skip,
    orderBy,
  });

  if (response.success) {
    return {
      success: true,
      data: {
        items: response.data.items || [],
        count: response.data.count || 0,
      },
    };
  } else {
    console.error('Error fetching ${entityPlural.toLowerCase()}:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch ${entityPlural.toLowerCase()}',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered ${entityPlural.toLowerCase()} with search and pagination
 */
export async function getFiltered${entityPlural}(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering
  if (status && status !== 'all') {
    where.status = { equals: status };
  }
  
  // Search filtering (adjust fields as needed)
  if (search?.trim()) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      // Add more searchable fields as needed
    ];
  }

  // Build orderBy clause
  let orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }];
  if (sort) {
    if (sort.startsWith('-')) {
      const field = sort.substring(1);
      orderBy = [{ [field]: 'desc' }];
    } else {
      orderBy = [{ [sort]: 'asc' }];
    }
  }

  // Calculate pagination
  const skip = (page - 1) * pageSize;

  try {
    const result = await get${entityPlural}(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFiltered${entityPlural}:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered ${entityPlural.toLowerCase()}',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single ${entitySingular.toLowerCase()} by ID
 */
export async function get${entitySingular}(id: string) {
  const query = \`
    query Get${entitySingular}($id: ID!) {
      ${entitySingular.toLowerCase()}(where: { id: $id }) {
        ${parsedFields}
      }
    }
  \`;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.${entitySingular.toLowerCase()}) {
      return {
        success: false,
        error: '${entitySingular} not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.${entitySingular.toLowerCase()},
    };
  } else {
    console.error('Error fetching ${entitySingular.toLowerCase()}:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch ${entitySingular.toLowerCase()}',
      data: null,
    };
  }
}

/**
 * Get ${entitySingular.toLowerCase()} status counts for StatusTabs
 */
export async function get${entitySingular}StatusCounts() {
  const statusKeys = ${JSON.stringify(Object.keys(parsedStatusConfig))};
  
  const statusQueries = statusKeys.map(status => 
    \`\${status}: ${camelCase}Count(where: { status: { equals: "\${status}" } })\`
  ).join('\\n      ');
  
  const query = \`
    query Get${entitySingular}StatusCounts {
      \${statusQueries}
      all: ${camelCase}Count
    }
  \`;

  const response = await keystoneClient(query);

  if (response.success) {
    const counts: Record<string, number> = {
      all: response.data.all || 0,
    };
    
    statusKeys.forEach(status => {
      counts[status] = response.data[status] || 0;
    });
    
    return {
      success: true,
      data: counts,
    };
  } else {
    console.error('Error fetching ${entitySingular.toLowerCase()} status counts:', response.error);
    const emptyCounts: Record<string, number> = {
      all: 0,
    };
    
    statusKeys.forEach(status => {
      emptyCounts[status] = 0;
    });
    
    return {
      success: false,
      error: response.error || 'Failed to fetch ${entitySingular.toLowerCase()} status counts',
      data: emptyCounts,
    };
  }
}

/**
 * Update ${entitySingular.toLowerCase()} status
 */
export async function update${entitySingular}Status(id: string, status: string) {
  const mutation = \`
    mutation Update${entitySingular}Status($id: ID!, $data: ${entitySingular}UpdateInput!) {
      update${entitySingular}(where: { id: $id }, data: $data) {
        id
        status
      }
    }
  \`;

  const response = await keystoneClient(mutation, {
    id,
    data: { status },
  });

  if (response.success) {
    // Revalidate the ${entitySingular.toLowerCase()} page to reflect the status change
    revalidatePath(\`/dashboard/platform/${kebabCase}/\${id}\`);
    revalidatePath('/dashboard/platform/${kebabCase}');

    return {
      success: true,
      data: response.data.update${entitySingular},
    };
  } else {
    console.error('Error updating ${entitySingular.toLowerCase()} status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update ${entitySingular.toLowerCase()} status',
      data: null,
    };
  }
}
`;

fs.writeFileSync(path.join(platformDir, 'actions', 'index.ts'), actionsContent);

// Generate screens/EntityListPage.tsx
const listPageContent = `/**
 * ${entitySingular}ListPage - Server Component
 * Uses dedicated ${entityPlural} actions for consistent data fetching
 */

import { getListByPath } from '../../../dashboard/actions/getListByPath'
import { getAdminMetaAction } from '../../../dashboard/actions'
import { notFound } from 'next/navigation'
import { ${entitySingular}ListPageClient } from './${entitySingular}ListPageClient'
import { getFiltered${entityPlural}, get${entitySingular}StatusCounts } from '../actions'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function ${entitySingular}ListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Hardcode the list key for ${entityPlural.toLowerCase()}
  const listKeyPath = '${kebabCase}';

  // Get the list by path using our cached function
  const list = await getListByPath(listKeyPath);

  if (!list) {
    notFound()
  }

  // Parse search params
  const currentPage = parseInt(searchParamsObj.page?.toString() || '1', 10) || 1
  const pageSize = parseInt(searchParamsObj.pageSize?.toString() || list.pageSize?.toString() || '50', 10)
  const searchString = searchParamsObj.search?.toString() || ''
  
  // Extract status filter from URL params
  const statusFilter = searchParamsObj['!status_matches']
  let status = 'all'
  if (statusFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(statusFilter.toString()))
      if (Array.isArray(parsed) && parsed.length > 0) {
        status = typeof parsed[0] === 'string' ? parsed[0] : parsed[0].value
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
  }

  // Extract sort parameter
  const sortBy = searchParamsObj.sortBy?.toString()

  // Use dedicated ${entityPlural} actions
  const response = await getFiltered${entityPlural}(
    status === 'all' ? undefined : status,
    searchString || undefined,
    currentPage,
    pageSize,
    sortBy
  )

  let fetchedData: { items: any[], count: number } = { items: [], count: 0 }
  let error: string | null = null

  if (response.success) {
    fetchedData = response.data
  } else {
    console.error('Error fetching ${entityPlural.toLowerCase()}:', response.error)
    error = response.error
  }

  // Get adminMeta for the list structure
  const adminMetaResponse = await getAdminMetaAction(list.key)
  
  // Extract the list with proper field metadata if successful
  const adminMetaList = adminMetaResponse.success ? adminMetaResponse.data.list : null
  
  // Create enhanced list with validation data
  const enhancedList = adminMetaList || list

  // Get status counts using dedicated action
  const statusCountsResponse = await get${entitySingular}StatusCounts()
  
  let statusCounts = ${JSON.stringify(Object.keys(parsedStatusConfig).reduce((acc: Record<string, number>, key) => ({ ...acc, [key]: 0, all: 0 }), {}))}

  if (statusCountsResponse.success) {
    statusCounts = statusCountsResponse.data
  }

  return (
    <${entitySingular}ListPageClient
      list={enhancedList}
      initialData={fetchedData}
      initialError={error}
      initialSearchParams={{
        page: currentPage,
        pageSize,
        search: searchString
      }}
      statusCounts={statusCounts}
    />
  )
}

export default ${entitySingular}ListPage
`;

fs.writeFileSync(path.join(platformDir, 'screens', `${entitySingular}ListPage.tsx`), listPageContent);

// Generate screens/EntityListPageClient.tsx
const statusCountsType = Object.keys(parsedStatusConfig).reduce((acc: Record<string, string>, key) => ({ ...acc, [key]: 'number', all: 'number' }), {});
const statusCountsTypeString = `{
    ${Object.entries(statusCountsType).map(([key, type]) => `${key}: ${type}`).join('\n    ')}
  }`;

const listPageClientContent = `/**
 * ${entitySingular}ListPageClient - Client Component  
 * Based on dashboard ListPageClient but hardcoded for ${entityPlural.toLowerCase()}
 */

'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SearchX,
  Table as TableIcon 
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageContainer } from '../../../dashboard/components/PageContainer'
import { PlatformFilterBar } from '../../components/PlatformFilterBar'
import { StatusTabs } from '../../components/StatusTabs'
import { ${entitySingular}DetailsComponent } from '../components/${entitySingular}DetailsComponent'
import { Pagination } from '../../../dashboard/components/Pagination'
import { FilterList } from '../../../dashboard/components/FilterList'
import { useDashboard } from '../../../dashboard/context/DashboardProvider'
import { useSelectedFields } from '../../../dashboard/hooks/useSelectedFields'
import { useSort } from '../../../dashboard/hooks/useSort'

interface ${entitySingular}ListPageClientProps {
  list: any
  initialData: { items: any[], count: number }
  initialError: string | null
  initialSearchParams: {
    page: number
    pageSize: number  
    search: string
  }
  statusCounts: ${statusCountsTypeString} | null
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {isFiltered ? (
        <>
          <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground">
            No items found. Try adjusting your search or filters.
          </p>
        </>
      ) : (
        <>
          <TableIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items yet</h3>
          <p className="text-muted-foreground">
            Add the first item to see it here.
          </p>
        </>
      )}
    </div>
  )
}

export function ${entitySingular}ListPageClient({ 
  list, 
  initialData, 
  initialError, 
  initialSearchParams,
  statusCounts
}: ${entitySingular}ListPageClientProps) {
  const router = useRouter()
  const { basePath } = useDashboard()
  // Hooks for sorting and field selection
  const selectedFields = useSelectedFields(list)
  const sort = useSort(list)

  // Extract data from props
  const data = initialData
  const error = initialError
  const currentPage = initialSearchParams.page
  const pageSize = initialSearchParams.pageSize
  const searchString = initialSearchParams.search

  // Handle page change - simplified since FilterBar handles search/filters
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(window.location.search)
    
    if (newPage && newPage > 1) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }
    
    const newUrl = params.toString() ? \`?\${params.toString()}\` : ''
    router.push(newUrl)
  }, [router])

  if (!list) {
    return (
      <PageContainer title="List not found">
        <Alert variant="destructive">
          <AlertDescription>
            The requested list was not found.
          </AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  const breadcrumbs = [
    { type: 'link' as const, label: 'Dashboard', href: basePath },
    { type: 'page' as const, label: 'Platform' },
    { type: 'page' as const, label: '${entityPlural}' }
  ]

  const header = (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
        ${entityPlural}
      </h1>
      <p className="text-muted-foreground">
        Create and manage ${entityPlural.toLowerCase()}
      </p>
    </div>
  )

  // Check if we have any active filters (search or actual filters)
  const hasFilters = !!searchString
  const isFiltered = hasFilters
  const isEmpty = data?.count === 0 && !isFiltered

  return (
    <PageContainer title="${entityPlural}" header={header} breadcrumbs={breadcrumbs}>
      {/* Filter Bar - includes search, filters, sorting, and create button */}
      <div className="px-4 md:px-6">
        <PlatformFilterBar list={list} />
      </div>

      {/* Status Tabs */}
      {statusCounts && (
        <div className="border-b">
          <StatusTabs 
            statusCounts={statusCounts}
            statusConfig={${JSON.stringify(parsedStatusConfig, null, 12).replace(/\n/g, '\n            ')}}
            entityName="${entityPlural}"
          />
        </div>
      )}

      {/* Active Filters */}
      <div className="px-4 md:px-6 border-b">
        <FilterList list={list} />
      </div>

      {/* ${entityPlural} list */}
      {error ? (
        <div className="px-4 md:px-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load items: {error}
            </AlertDescription>
          </Alert>
        </div>
      ) : isEmpty ? (
        <div className="px-4 md:px-6">
          <EmptyState isFiltered={false} />
        </div>
      ) : data?.count === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyState isFiltered={isFiltered} />
        </div>
      ) : (
        <>
          {/* Data grid - full width */}
          <div className="grid grid-cols-1 divide-y">
            {data?.items?.map((${entitySingular.toLowerCase()}: any) => (
              <${entitySingular}DetailsComponent key={${entitySingular.toLowerCase()}.id} ${entitySingular.toLowerCase()}={${entitySingular.toLowerCase()}} list={list} />
            ))}
          </div>
          
          {/* Pagination */}
          {data && data.count > pageSize && (
            <div className="px-4 md:px-6 py-4">
              <Pagination
                currentPage={currentPage}
                total={data.count}
                pageSize={pageSize}
                list={{ singular: '${entitySingular.toLowerCase()}', plural: '${entityPlural.toLowerCase()}' }}
              />
            </div>
          )}
        </>
      )}
    </PageContainer>
  )
}
`;

fs.writeFileSync(path.join(platformDir, 'screens', `${entitySingular}ListPageClient.tsx`), listPageClientContent);

// Generate components/EntityDetailsComponent.tsx (basic template)
const detailsComponentContent = `"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import Link from "next/link";
import { EditItemDrawer } from "../../components/EditItemDrawer";

const statusColors = ${JSON.stringify(Object.keys(parsedStatusConfig).reduce((acc: Record<string, string>, key) => ({ ...acc, [key]: parsedStatusConfig[key].color }), {}), null, 2)} as const;

interface ${entitySingular} {
  id: string;
  title: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  // Add more fields as needed based on your GraphQL schema
}

interface ${entitySingular}DetailsComponentProps {
  ${entitySingular.toLowerCase()}: ${entitySingular};
  list: any;
}

export function ${entitySingular}DetailsComponent({
  ${entitySingular.toLowerCase()},
  list,
}: ${entitySingular}DetailsComponentProps) {
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  return (
    <>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={${entitySingular.toLowerCase()}.id} className="border-0">
          <div className="px-4 md:px-6 py-3 md:py-4 flex justify-between w-full border-b relative min-h-[80px]">
            <div className="flex items-start gap-4">
              {/* ${entitySingular} Info */}
              <div className="flex flex-col items-start text-left gap-2 sm:gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={\`/dashboard/platform/${kebabCase}/\${${entitySingular.toLowerCase()}.id}\`}
                    className="font-medium text-base hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {${entitySingular.toLowerCase()}.title}
                  </Link>
                  <span>‧</span>
                  <span className="text-sm font-medium">
                    <span className="text-muted-foreground/75">
                      {new Date(${entitySingular.toLowerCase()}.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                </div>
                
                {/* Add more fields display here as needed */}
              </div>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                {${entitySingular.toLowerCase()}.status && (
                  <Badge
                    color={
                      statusColors[${entitySingular.toLowerCase()}.status as keyof typeof statusColors] ||
                      "zinc"
                    }
                    className="text-[.6rem] sm:text-[.7rem] py-0 px-2 sm:px-3 tracking-wide font-medium rounded-md border h-6"
                  >
                    {${entitySingular.toLowerCase()}.status.toUpperCase()}
                  </Badge>
                )}
                
                {/* Action buttons */}
                <div className="absolute bottom-3 right-5 sm:static flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    onClick={() => setIsEditDrawerOpen(true)}
                  >
                    <MoreVertical className="stroke-muted-foreground" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="border [&_svg]:size-3 h-6 w-6"
                    asChild
                  >
                    <AccordionTrigger className="py-0" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <AccordionContent className="pb-0">
            <div className="divide-y">
              {/* Expanded content - customize based on your entity fields */}
              <div className="px-4 md:px-6 py-4">
                <h4 className="text-sm font-medium mb-3">Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">ID:</span>
                    <span className="ml-2 font-medium">{${entitySingular.toLowerCase()}.id}</span>
                  </div>
                  {${entitySingular.toLowerCase()}.updatedAt && (
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(${entitySingular.toLowerCase()}.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <EditItemDrawer
        list={list}
        item={${entitySingular.toLowerCase()}}
        itemId={${entitySingular.toLowerCase()}.id}
        open={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
      />
    </>
  );
}
`;

fs.writeFileSync(path.join(platformDir, 'components', `${entitySingular}DetailsComponent.tsx`), detailsComponentContent);

// Generate app router page (app/dashboard/(admin)/platform/{entity}/page.tsx)
const appRouterPageContent = `import { ${entitySingular}ListPage } from "@/features/platform/${directoryName}/screens/${entitySingular}ListPage";

export default ${entitySingular}ListPage;
`;

// Create app router directory
const appRouterDir = path.join(__dirname, '..', 'app', 'dashboard', '(admin)', 'platform', directoryName);

if (fs.existsSync(appRouterDir)) {
  console.warn(`Warning: App router directory ${appRouterDir} already exists, skipping creation`);
} else {
  fs.mkdirSync(appRouterDir, { recursive: true });
  fs.writeFileSync(path.join(appRouterDir, 'page.tsx'), appRouterPageContent);
  console.log(`Created app router page: app/dashboard/(admin)/platform/${directoryName}/page.tsx`);
}

console.log('✅ Platform page generated successfully!');
console.log('');
console.log('Generated files:');
console.log(`  📁 features/platform/${directoryName}/`);
console.log(`  ├── 📄 actions/index.ts`);
console.log(`  ├── 📄 components/${entitySingular}DetailsComponent.tsx`);
console.log(`  └── 📄 screens/`);
console.log(`      ├── 📄 ${entitySingular}ListPage.tsx`);
console.log(`      └── 📄 ${entitySingular}ListPageClient.tsx`);
console.log('');
console.log(`  📁 app/dashboard/(admin)/platform/${directoryName}/`);
console.log(`  └── 📄 page.tsx`);
console.log('');
console.log('Next steps:');
console.log('1. Review and customize the DetailsComponent based on your entity fields');
console.log('2. Update GraphQL fields in actions/index.ts if needed');
console.log('3. Test the generated pages at /dashboard/platform/' + directoryName);
console.log('');
console.log(`Entity info:`);
console.log(`  - Directory: ${directoryName}`);
console.log(`  - GraphQL ListKey: ${camelCase}`);
console.log(`  - Entity: ${entitySingular} / ${entityPlural}`);
console.log(`  - Status Config: ${JSON.stringify(parsedStatusConfig)}`);