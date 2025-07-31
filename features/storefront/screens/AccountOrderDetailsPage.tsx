import { retrieveOrder } from "@/features/storefront/lib/data/orders"
import OrderDetailsTemplate from "@/features/storefront/modules/order/templates/order-details-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import type { StoreOrder } from '@/features/storefront/types/storefront'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  // Fetch order using the updated retrieveOrder, passing null for secretKey
  const order: StoreOrder | null = await retrieveOrder(params.id, null).catch(() => null)

  if (!order) {
    notFound()
  }

  return {
    title: `Order #${order.displayId}`,
    description: `View your order`,
  }
}

export async function AccountOrderDetailsPage(props: Props) {
  const params = await props.params
  // Fetch order using the updated retrieveOrder, passing null for secretKey
  const order: StoreOrder | null = await retrieveOrder(params.id, null).catch(() => null)

  if (!order) {
    notFound()
  }

  return <OrderDetailsTemplate order={order} />
}