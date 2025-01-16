import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";

const ORDER_QUERY = gql`
  query Order($id: ID!) {
    order(where: { id: $id }) {
      id
      status
      total
      customer {
        firstName
        lastName
        email
      }
      shippingAddress {
        address1
        city
        country
      }
      payments {
        status
        amount
      }
      lineItems {
        id
        title
        quantity
        unitPrice
      }
    }
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = gql`
  mutation UpdateOrder($where: OrderWhereUniqueInput!, $data: OrderUpdateInput!) {
    updateOrder(where: $where, data: $data) {
      id
      status
      fulfillmentStatus
      paymentStatus
      metadata
    }
  }
`;



export function OrderDetails({ order }) {
  const {
    status,
    fulfillmentStatus,
    paymentStatus,
    lineItems,
    total,
    taxRate
  } = order;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Order Details</span>
          <div className="flex gap-2">
            <Badge 
              color={
                status === 'PENDING' ? 'amber' :
                status === 'COMPLETED' ? 'green' :
                status === 'CANCELLED' ? 'red' :
                'blue'
              }
            >
              {status}
            </Badge>
            <Badge 
              color={
                fulfillmentStatus === 'NOT_FULFILLED' ? 'zinc' :
                fulfillmentStatus === 'FULFILLED' ? 'green' :
                fulfillmentStatus === 'PARTIALLY_FULFILLED' ? 'amber' :
                'blue'
              }
            >
              {fulfillmentStatus}
            </Badge>
            <Badge 
              color={
                paymentStatus === 'AWAITING' ? 'amber' :
                paymentStatus === 'CAPTURED' ? 'green' :
                paymentStatus === 'REFUNDED' ? 'red' :
                'blue'
              }
            >
              {paymentStatus}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="divide-y">
            {lineItems.map((item) => (
              <div key={item.id} className="py-3 flex justify-between">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div>${(item.unitPrice * item.quantity).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    ${item.unitPrice} each
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({(taxRate * 100).toFixed(1)}%)</span>
              <span>${(total * taxRate).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${(total * (1 + taxRate)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 