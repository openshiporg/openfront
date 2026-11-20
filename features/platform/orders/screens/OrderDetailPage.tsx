import { notFound } from 'next/navigation';
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

  // A missing or unreadable order is a 404, never a 500.
  const order = response.success ? response.data?.order : null;
  if (!order) {
    notFound();
  }

  // Extract UI configuration
  const uiConfig = {
    hideDelete: false,
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          { type: 'link', label: 'Dashboard', href: '' },
          { type: 'page', label: 'Platform' },
          { type: 'link', label: 'Orders', href: '/platform/orders' },
          { type: 'page', label: `#${order.displayId || order.id}` },
        ]}
      />
      <OrderPageClient
        order={order}
        id={itemId}
        listKey="orders"
        fieldModes={{}}
        fieldPositions={{}}
        uiConfig={uiConfig}
      />
    </>
  );
} 