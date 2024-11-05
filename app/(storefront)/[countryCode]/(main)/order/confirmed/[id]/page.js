import { retrieveOrder } from "@storefront/lib/data"
import OrderCompletedTemplate from "@storefront/modules/order/templates/order-completed-template"
import { notFound } from "next/navigation"

async function getOrder(id) {
  const order = await retrieveOrder(id)

  if (!order) {
    return notFound();
  }


  return {
    order: {
      ...order,
      // items: enrichedItems
    },
  };
}

export const metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage({
  params
}) {
  const { order } = await getOrder(params.id)

  return <OrderCompletedTemplate order={order} />;
}
