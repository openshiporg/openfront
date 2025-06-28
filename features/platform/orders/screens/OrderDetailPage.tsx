import { PageBreadcrumbs } from '@/features/dashboard/components/PageBreadcrumbs';
import { OrderPageClient } from './OrderPageClient';
import { getOrder } from '@/features/platform/orders/actions';

interface OrderPageParams {
  params: Promise<{
    id: string;
  }>;
}

export async function OrderDetailPage({ params }: OrderPageParams) {
  const resolvedParams = await params;
  const itemId = resolvedParams.id;

  const response = await getOrder(itemId);

  if (!response.success) {
    // Handle error case - Log and re-throw
    console.error('Error fetching order:', response.error);
    throw new Error(`Failed to fetch order ${itemId}: ${response.error}`);
  }

  const order = response.data?.order; // Extract order from data

  if (!order) {
    // Handle case where request succeeded but order wasn't found
    // Using notFound() is generally preferred in Next.js pages
    // You might need to import it: import { notFound } from "next/navigation";
    // notFound();
    // Or throw an error as before:
    throw new Error(`Order not found: ${itemId}`);
  }

  // Extract UI configuration
  const uiConfig = {
    hideDelete: false,
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          { type: 'link', label: 'Dashboard', href: '/dashboard' },
          { type: 'page', label: 'Platform' },
          { type: 'link', label: 'Orders', href: '/dashboard/platform/orders' },
          { type: 'page', label: `#${order.displayId || order.id}` },
        ]}
      />
      <OrderPageClient
        order={order}
        id={itemId}
        listKey="Order"
        fieldModes={{}}
        fieldPositions={{}}
        uiConfig={uiConfig}
      />
    </>
  );
} 