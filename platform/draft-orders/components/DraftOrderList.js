import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { formatDistance } from "date-fns";

export function DraftOrderList({ draftOrders, isLoading, error, onPageChange, total }) {
  if (error) {
    return <div>Error loading draft orders: {error.message}</div>;
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "open":
        return "secondary";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const formatTotal = (cart) => {
    if (!cart) return "N/A";
    return `$${cart.total / 100}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Draft</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            draftOrders.map((draft) => (
              <TableRow key={draft.id}>
                <TableCell className="font-medium">#{draft.displayId}</TableCell>
                <TableCell>
                  {formatDistance(new Date(draft.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {draft.cart?.email ? (
                    <div className="flex flex-col">
                      <span>{draft.cart.email}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-500">No customer</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(draft.status)}>
                    {draft.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {draft.cart?.items?.length || 0} items
                </TableCell>
                <TableCell className="font-medium">
                  {formatTotal(draft.cart)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      {draft.status === "open" && (
                        <DropdownMenuItem>Complete Order</DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 