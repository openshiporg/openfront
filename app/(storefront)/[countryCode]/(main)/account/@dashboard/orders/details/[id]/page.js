import { notFound } from "next/navigation"

import { retrieveOrder } from "@storefront/lib/data"
import OrderDetailsTemplate from "@storefront/modules/order/templates/order-details-template"

export async function generateMetadata(
  {
    params
  }
) {
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return {
    title: `Order #${order.display_id}`,
    description: `View your order`,
  }
}

export default async function OrderDetailPage({
  params
}) {
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return <OrderDetailsTemplate order={order} />;
}
