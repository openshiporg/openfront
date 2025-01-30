import React from "react";
import { gql, useMutation } from "@keystone-6/core/admin-ui/apollo";
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
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { formatDistance } from "date-fns";

export function ReturnList({ returns, isLoading, error, onPageChange, total }) {
  if (error) {
    return <div>Error loading returns: {error.message}</div>;
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "requested":
        return "warning";
      case "received":
        return "secondary";
      case "pending":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const getRefundStatus = (refund) => {
    if (!refund) return null;
    return (
      <Badge variant="outline">
        Refunded ${refund.amount / 100}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Return</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Refund</TableHead>
            <TableHead>Shipping</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : returns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-zinc-500">
                No returns found
              </TableCell>
            </TableRow>
          ) : (
            returns.map((returnItem) => (
              <TableRow key={returnItem.id}>
                <TableCell className="font-medium">
                  #{returnItem.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    #{returnItem.order?.displayId || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {returnItem.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-sm">{item.item.title}</span>
                        <Badge variant="secondary">
                          {item.receivedQuantity || item.requestedQuantity}/{item.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(returnItem.status)}>
                    {returnItem.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getRefundStatus(returnItem.refund)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {returnItem.shippingMethod?.name || "Not specified"}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(returnItem.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      {returnItem.status === "requested" && (
                        <>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Receive Items
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Return
                          </DropdownMenuItem>
                        </>
                      )}
                      {returnItem.status === "received" && (
                        <DropdownMenuItem>
                          Process Refund
                        </DropdownMenuItem>
                      )}
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