import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table";
import { Badge } from "@ui/badge";
import { formatDistance } from "date-fns";

export function CustomerOrders({ orders }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>
                  {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>${order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status) {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'canceled':
      return 'destructive';
    case 'archived':
      return 'secondary';
    case 'requires_action':
      return 'warning';
    default:
      return 'secondary';
  }
} 