import { retrieveOrder } from "@/features/storefront/lib/data/orders"
import OrderCompletedTemplate from "@/features/storefront/modules/order/templates/order-completed-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import type { StoreOrder } from "@/features/storefront/types/storefront"
import SkeletonOrderConfirmed from "@/features/storefront/modules/skeletons/templates/skeleton-order-confirmed"

// Add searchParams to Props
type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

// Update function signature to accept searchParams
export async function OrderConfirmedPage({ params: paramsPromise, searchParams: searchParamsPromise }: Props) {
  const params = await paramsPromise
  const searchParams = await searchParamsPromise

  // Extract secretKey (assuming it's passed as 'key')
  const secretKey = typeof searchParams?.secretKey === 'string' ? searchParams.secretKey : null

  // Call retrieveOrder with id and secretKey
  const order: StoreOrder | null = await retrieveOrder(params.id, secretKey).catch(() => null)

  if (!order) {
    return notFound()
  }

  return <OrderCompletedTemplate order={order} />
}

export function OrderConfirmedLoading() {
  return <SkeletonOrderConfirmed />
}
