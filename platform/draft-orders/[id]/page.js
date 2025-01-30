import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { DraftOrderForm } from "../components/DraftOrderForm";
import { DraftOrderItems } from "../components/DraftOrderItems";
import { DraftOrderSummary } from "../components/DraftOrderSummary";
import { Badge } from "@ui/badge";

const DRAFT_ORDER_QUERY = gql`
  query DraftOrder($where: DraftOrderWhereUniqueInput!) {
    draftOrder(where: $where) {
      id
      status
      displayId
      cart {
        id
        email
        type
        items {
          id
          title
          description
          quantity
          unitPrice
          variant {
            id
            title
            sku
            product {
              title
              thumbnail
            }
          }
          adjustments {
            id
            amount
            description
            discount {
              id
              code
            }
          }
        }
        region {
          id
          name
          currency {
            code
            symbol
          }
          taxRate
        }
        shippingAddress {
          address1
          address2
          city
          country
          postalCode
          province
        }
        billingAddress {
          address1
          address2
          city
          country
          postalCode
          province
        }
        discounts {
          id
          code
          rule {
            type
            value
            allocation
          }
        }
        shippingMethods {
          id
          name
          price
          data
        }
      }
      order {
        id
        status
      }
      noNotificationOrder
      metadata
      idempotencyKey
      createdAt
      updatedAt
    }
  }
`;

export default function DraftOrderPage({ params }) {
  const { data, loading } = useQuery(DRAFT_ORDER_QUERY, {
    variables: { id: params.id }
  });

  if (loading) return <div>Loading...</div>;
  if (!data?.draftOrder) return <div>Draft order not found</div>;

  const draftOrder = data.draftOrder;

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Draft Order #{draftOrder.displayId}</h1>
          <p className="text-sm text-zinc-500">
            Created {new Date(draftOrder.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant={draftOrder.status === "completed" ? "success" : "secondary"}>
          {draftOrder.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <DraftOrderForm draftOrder={draftOrder} />
          <DraftOrderItems items={draftOrder.cart?.items || []} />
        </div>
        
        <div className="space-y-4">
          <DraftOrderSummary 
            cart={draftOrder.cart}
            status={draftOrder.status}
            noNotification={draftOrder.noNotificationOrder}
          />
        </div>
      </div>
    </div>
  );
} 