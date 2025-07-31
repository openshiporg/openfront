import { getInventory, getInventoryStatusCounts } from '../actions';
import { buildOrderByClause } from '../../../dashboard/lib/buildOrderByClause';
import { buildWhereClause } from '../../../dashboard/lib/buildWhereClause';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const list = {
  key: 'InventoryItem',
  path: 'inventory',
  singular: 'Inventory Item',
  plural: 'Inventory Items',
  fields: {
    sku: { label: 'SKU', type: 'text' },
    location: { label: 'Location', type: 'text' },
    quantity: { label: 'Quantity', type: 'integer' },
    status: { label: 'Status', type: 'select' },
  },
  pageSize: 10,
  hideCreate: false,
};

export default async function InventoryListPage({ searchParams }: PageProps) {
  // Import and use the client component
  const { InventoryListPageClient } = await import('./InventoryListPageClient');
  
  const resolvedSearchParams = await searchParams;
  const searchParamsObj = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value : value?.toString(),
    ])
  );

  // Parse search params
  const currentPage = parseInt(searchParamsObj.page?.toString() || '1', 10) || 1;
  const pageSize = parseInt(searchParamsObj.pageSize?.toString() || list.pageSize?.toString() || '50', 10);
  const searchString = searchParamsObj.search?.toString() || '';

  // Build dynamic orderBy clause using Keystone's defaults
  const orderBy = buildOrderByClause(list, searchParamsObj);

  // Build filters from URL params using Keystone's approach
  const filterWhere = buildWhereClause(list, searchParamsObj);

  // Build search where clause
  const searchParameters = searchString ? { search: searchString } : {};
  const searchWhere = buildWhereClause(list, searchParameters);

  // Combine search and filters - following Keystone's pattern
  const whereConditions = [];
  if (Object.keys(searchWhere).length > 0) {
    whereConditions.push(searchWhere);
  }
  if (Object.keys(filterWhere).length > 0) {
    whereConditions.push(filterWhere);
  }

  const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

  // Fetch data
  const [dataResult, statusCounts] = await Promise.all([
    getInventory(where, pageSize, (currentPage - 1) * pageSize, orderBy),
    getInventoryStatusCounts()
  ]);

  const initialData = dataResult.success ? dataResult.data : { items: [], count: 0 };
  const initialError = dataResult.success ? null : dataResult.error;

  return (
    <InventoryListPageClient
      list={list}
      initialData={initialData}
      initialError={initialError}
      initialSearchParams={{ page: currentPage, pageSize, search: searchString }}
      statusCounts={statusCounts}
    />
  );
}