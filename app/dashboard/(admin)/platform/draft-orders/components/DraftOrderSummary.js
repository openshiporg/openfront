import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Separator } from "@ui/separator";

const COMPLETE_DRAFT_ORDER_MUTATION = gql`
  mutation CompleteDraftOrder($where: DraftOrderWhereUniqueInput!, $data: DraftOrderUpdateInput!) {
    updateDraftOrder(where: $where, data: $data) {
      id
      status
      order {
        id
        status
      }
    }
  }
`;

export function DraftOrderSummary({ cart, status, noNotification }) {
  const [completeDraftOrder] = useMutation(COMPLETE_DRAFT_ORDER_MUTATION);

  const handleComplete = async () => {
    try {
      await completeDraftOrder({
        variables: {
          where: { id: cart.id },
          data: {
            status: "completed",
            completedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error("Failed to complete draft order:", error);
    }
  };

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  const calculateDiscounts = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      return sum + (item.adjustments?.reduce((adjSum, adj) => adjSum + adj.amount, 0) || 0);
    }, 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = cart?.region?.taxRate || 0;
    return Math.round(subtotal * (taxRate / 100));
  };

  const calculateShipping = () => {
    if (!cart?.shippingMethods) return 0;
    return cart.shippingMethods.reduce((sum, method) => sum + method.price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discounts = calculateDiscounts();
    const tax = calculateTax();
    const shipping = calculateShipping();
    return subtotal + discounts + tax + shipping;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-sm">Subtotal</span>
            <span className="font-medium">${calculateSubtotal() / 100}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span className="text-sm">Discounts</span>
            <span>${calculateDiscounts() / 100}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span className="text-sm">Shipping</span>
            <span>${calculateShipping() / 100}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span className="text-sm">Tax</span>
            <span>${calculateTax() / 100}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${calculateTotal() / 100}</span>
          </div>
        </div>

        <div className="space-y-2">
          {status === "open" && (
            <Button
              className="w-full"
              onClick={handleComplete}
            >
              Complete Order
            </Button>
          )}
          <Button variant="outline" className="w-full">
            Cancel Order
          </Button>
        </div>

        {noNotification && (
          <p className="text-sm text-zinc-500">
            No notification will be sent to the customer when this order is completed.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 