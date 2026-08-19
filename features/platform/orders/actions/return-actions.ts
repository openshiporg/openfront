'use server'

import { revalidatePath } from 'next/cache'
import { keystoneClient } from '../../../dashboard/lib/keystoneClient'

export interface CreateReturnData {
  orderId: string
  returnItems: {
    lineItemId: string
    quantity: number
    returnReasonId?: string
    note?: string
  }[]
  refundAmount?: number
  shippingData?: any
  metadata?: any
  noNotification?: boolean
}

export async function createReturnAction(data: CreateReturnData) {
  try {
    const orderQuery = `
      query GetOrderLineItems($orderId: ID!) {
        order(where: { id: $orderId }) {
          id
          lineItems {
            id
            quantity
            moneyAmount { amount currency { code } }
          }
        }
      }
    `
    const orderResponse = await keystoneClient(orderQuery, { orderId: data.orderId })
    if (!orderResponse.success || !orderResponse.data?.order) {
      return { success: false, error: 'Failed to fetch order data for refund calculation', data: null }
    }

    let maximumRefund = 0
    for (const returnItem of data.returnItems) {
      const lineItem = orderResponse.data.order.lineItems.find(
        (li: any) => li.id === returnItem.lineItemId
      )
      if (
        !lineItem ||
        !Number.isInteger(returnItem.quantity) ||
        returnItem.quantity <= 0 ||
        returnItem.quantity > lineItem.quantity
      ) {
        return { success: false, error: 'Invalid return quantity or order line item', data: null }
      }
      maximumRefund += (lineItem.moneyAmount?.amount || 0) * returnItem.quantity
    }

    const refundAmount = data.refundAmount ?? maximumRefund
    if (!Number.isInteger(refundAmount) || refundAmount < 0 || refundAmount > maximumRefund) {
      return { success: false, error: 'Refund amount exceeds the selected order lines', data: null }
    }

    // Create the return
    const createReturnMutation = `
      mutation CreateReturn($data: ReturnCreateInput!) {
        return: createReturn(data: $data) {
          id
          status
          refundAmount
          createdAt
          order {
            id
            displayId
          }
        }
      }
    `

    const returnData = {
      status: 'requested',
      refundAmount,
      shippingData: data.shippingData,
      metadata: {
        ...(data.metadata || {}),
        orderLineItems: data.returnItems.map((item) => ({
          orderLineItemId: item.lineItemId,
          quantity: item.quantity,
          returnReasonId: item.returnReasonId || null,
          note: item.note || null,
        })),
      },
      noNotification: data.noNotification || false,
      order: { connect: { id: data.orderId } }
    }

    const returnResponse = await keystoneClient(createReturnMutation, { data: returnData })
    
    if (!returnResponse.success) {
      return {
        success: false,
        error: returnResponse.error || 'Failed to create return',
        data: null
      }
    }

    const returnId = returnResponse.data?.return?.id
    if (!returnId) {
      return {
        success: false,
        error: 'Return created but ID not returned',
        data: null
      }
    }

    // Accepted order-line identities are preserved in Return.metadata until the
    // legacy ReturnItem -> LineItem relation is migrated to OrderLineItem at a
    // serialized schema gate.

    // Revalidate cache
    revalidatePath(`/dashboard/platform/orders/${data.orderId}`)
    revalidatePath('/dashboard/platform/orders')

    return {
      success: true,
      data: {
        return: returnResponse.data.return,
        returnItems: data.returnItems
      },
      error: null
    }

  } catch (error) {
    console.error('Create return error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create return',
      data: null
    }
  }
}

export async function processReturnRefundAction({
  returnId,
  paymentId,
  idempotencyKey,
}: {
  returnId: string
  paymentId: string
  idempotencyKey: string
}) {
  const mutation = `
    mutation ProcessReturnRefund($returnId: ID!, $paymentId: ID!, $idempotencyKey: String!) {
      refund: processReturnRefund(
        returnId: $returnId
        paymentId: $paymentId
        idempotencyKey: $idempotencyKey
      ) {
        id amount reason idempotencyKey
        payment { id amount amountRefunded }
      }
    }
  `
  const response = await keystoneClient(mutation, { returnId, paymentId, idempotencyKey })
  if (response.success) {
    revalidatePath('/dashboard/platform/orders')
    revalidatePath('/dashboard/platform/claims')
  }
  return response
}

export async function getReturnReasonsAction() {
  try {
    const query = `
      query GetReturnReasons {
        returnReasons {
          id
          value
          label
          description
          parentReturnReason {
            id
            label
          }
        }
      }
    `

    const response = await keystoneClient(query, {})
    
    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Failed to fetch return reasons',
        data: []
      }
    }

    return {
      success: true,
      data: response.data?.returnReasons || [],
      error: null
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch return reasons',
      data: []
    }
  }
}

export async function updateReturnStatusAction(returnId: string, status: string) {
  try {
    const mutation = `
      mutation UpdateReturnStatus($id: ID!, $data: ReturnUpdateInput!) {
        return: updateReturn(where: { id: $id }, data: $data) {
          id
          status
          updatedAt
        }
      }
    `

    const response = await keystoneClient(mutation, {
      id: returnId,
      data: { status }
    })

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Failed to update return status',
        data: null
      }
    }

    // Revalidate cache
    revalidatePath('/dashboard/platform/orders')

    return {
      success: true,
      data: response.data?.return,
      error: null
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update return status',
      data: null
    }
  }
}