import { notFound } from "next/navigation";
import { getOrder } from "@/features/platform/orders/actions";
import { FulfillOrderClient } from "./FulfillOrderClient";
import { PageBreadcrumbs } from "@/features/dashboard/components/PageBreadcrumbs";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function FulfillOrderPage({ params }: PageProps) {
  const resolvedParams = await params;
  const response = await getOrder(resolvedParams.id);

  const order = response?.data?.order; // Extract order from data

  if (!order) {
    // Handle case where the request succeeded but the order wasn't found
    notFound();
  }

  return (
    <>
      <PageBreadcrumbs
        items={[
          { type: "link", label: "Dashboard", href: "/dashboard" },
          {
            type: "page",
            label: "Platform",
          },
          { type: "link", label: "Orders", href: "/dashboard/platform/orders" },
          {
            type: "link",
            label: `#${order.displayId}`,
            href: `/dashboard/platform/orders/${order.id}`,
          },
          { type: "page", label: "Fulfill" },
        ]}
      />
      <FulfillOrderClient order={order} />
    </>
  );
} 