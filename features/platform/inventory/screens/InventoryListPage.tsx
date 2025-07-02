import { getFilteredInventory, getInventoryStatusCounts } from '../actions';

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
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
  
  // Parse search params
  const page = parseInt(searchParams.page as string || '1');
  const pageSize = parseInt(searchParams.pageSize as string || String(list.pageSize));
  const search = searchParams.search as string || '';

  // Fetch data
  const [dataResult, statusCounts] = await Promise.all([
    getFilteredInventory(searchParams, pageSize),
    getInventoryStatusCounts()
  ]);

  const initialData = dataResult.success ? dataResult.data : { items: [], count: 0 };
  const initialError = dataResult.success ? null : dataResult.error;

  return (
    <InventoryListPageClient
      list={list}
      initialData={initialData}
      initialError={initialError}
      initialSearchParams={{ page, pageSize, search }}
      statusCounts={statusCounts}
    />
  );
}