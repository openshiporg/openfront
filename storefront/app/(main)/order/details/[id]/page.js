import medusaRequest from "@lib/medusa-fetch"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"

async function getOrder(id) {
  const res = await medusaRequest("GET", `/orders/${id}`)

  if (!res.ok) {
    throw new Error(`Failed to fetch order: ${id}`)
  }

  return res.body
}

export async function generateMetadata(
  {
    params
  }
) {
  const { order } = await getOrder(params.id)

  return {
    title: `Order #${order.display_id}`,
    description: `View your order`,
  }
}

export default async function CollectionPage({
  params
}) {
  const { order } = await getOrder(params.id)

  return <OrderCompletedTemplate order={order} />;
}
