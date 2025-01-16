import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Badge } from "@ui/badge";

const DELETE_LINE_ITEM_MUTATION = gql`
  mutation DeleteLineItem($where: LineItemWhereUniqueInput!) {
    deleteLineItem(where: $where) {
      id
    }
  }
`;

export function DraftOrderItems({ items }) {
  const [deleteLineItem] = useMutation(DELETE_LINE_ITEM_MUTATION);

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteLineItem({
        variables: {
          where: { id: itemId },
        },
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unitPrice;
    const adjustments = item.adjustments?.reduce((sum, adj) => sum + adj.amount, 0) || 0;
    return subtotal + adjustments;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Items</CardTitle>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Discounts</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-zinc-500">
                    No items added yet
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.variant?.product?.title}
                        </span>
                        <span className="text-sm text-zinc-500">
                          {item.variant?.title} ({item.variant?.sku})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        ${item.unitPrice / 100}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {item.adjustments?.map((adjustment) => (
                          <Badge key={adjustment.id} variant="outline">
                            {adjustment.description}: ${adjustment.amount / 100}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${calculateItemTotal(item) / 100}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 