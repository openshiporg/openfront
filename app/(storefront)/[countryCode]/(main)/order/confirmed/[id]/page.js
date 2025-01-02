import { retrieveOrder } from "@storefront/lib/data/orders";
import OrderCompletedTemplate from "@storefront/modules/order/templates/order-completed-template"
import { notFound } from "next/navigation"

async function getOrder(id, secretKey) {
  const order = await retrieveOrder(id, secretKey)

  if (!order) {
    return notFound();
  }

  return order;
}

export const metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage({
  params,
  searchParams
}) {
  const { secretKey } = searchParams
  const order = await getOrder(params.id, secretKey)

  return <OrderCompletedTemplate order={order} />;
  // return <div>{params.id}{secretKey}</div>;
}
