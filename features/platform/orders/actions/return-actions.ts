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
    // First, calculate refund amount if not provided
    let { refundAmount } = data
    
    if (!refundAmount) {
      // Query order line items to calculate refund amount
      const orderQuery = `
        query GetOrderLineItems($orderId: ID!) {
          order(where: { id: $orderId }) {
            id
            lineItems {
              id
              title
              quantity
              sku
              thumbnail
              variantTitle
              formattedUnitPrice
              formattedTotal
              variantData
              moneyAmount {
                amount
                originalAmount
                currency {
                  code
                }
              }
            }
          }
        }
      `
      
      const orderResponse = await keystoneClient(orderQuery, { orderId: data.orderId })
      
      if (!orderResponse.success || !orderResponse.data?.order) {
        return {
          success: false,
          error: 'Failed to fetch order data for refund calculation',
          data: null
        }
      }
      
      // Calculate refund based on return items
      refundAmount = 0
      for (const returnItem of data.returnItems) {
        const lineItem = orderResponse.data.order.lineItems.find(
          (li: any) => li.id === returnItem.lineItemId
        )
        if (lineItem && lineItem.moneyAmount) {
          const unitPrice = lineItem.moneyAmount.amount || 0
          refundAmount += unitPrice * returnItem.quantity
        }
      }
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
      metadata: data.metadata,
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

    // Create return items
    const createReturnItemMutation = `
      mutation CreateReturnItem($data: ReturnItemCreateInput!) {
        returnItem: createReturnItem(data: $data) {
          id
          quantity
          note
        }
      }
    `

    const returnItemPromises = data.returnItems.map(async (item) => {
      const returnItemData = {
        quantity: item.quantity,
        isRequested: true,
        requestedQuantity: item.quantity,
        note: item.note,
        return: { connect: { id: returnId } },
        orderLineItem: { connect: { id: item.lineItemId } },
        ...(item.returnReasonId && {
          returnReason: { connect: { id: item.returnReasonId } }
        })
      }

      return keystoneClient(createReturnItemMutation, { data: returnItemData })
    })

    const returnItemResults = await Promise.all(returnItemPromises)
    
    // Check if any return item creation failed
    const failedItems = returnItemResults.filter(result => !result.success)
    if (failedItems.length > 0) {
      return {
        success: false,
        error: `Failed to create ${failedItems.length} return items`,
        data: null
      }
    }

    // Revalidate cache
    revalidatePath(`/dashboard/platform/orders/${data.orderId}`)
    revalidatePath('/dashboard/platform/orders')

    return {
      success: true,
      data: {
        return: returnResponse.data.return,
        returnItems: returnItemResults.map(r => r.data?.returnItem).filter(Boolean)
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