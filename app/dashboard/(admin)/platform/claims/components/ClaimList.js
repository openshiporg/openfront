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
import { MoreHorizontal, CheckCircle, XCircle, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { formatDistance } from "date-fns";

export function ClaimList({ claims, isLoading, error, onPageChange, total }) {
  if (error) {
    return <div>Error loading claims: {error.message}</div>;
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "fulfilled":
        return "success";
      case "created":
        return "warning";
      case "received":
        return "secondary";
      case "shipped":
        return "info";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const getClaimType = (type) => {
    switch (type) {
      case "refund":
        return "Refund";
      case "replace":
        return "Replacement";
      default:
        return type;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
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
          ) : claims.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-zinc-500">
                No claims found
              </TableCell>
            </TableRow>
          ) : (
            claims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell className="font-medium">
                  #{claim.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    #{claim.order?.displayId || "N/A"}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getClaimType(claim.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {claim.claimItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-sm">{item.item.title}</span>
                        <Badge variant="secondary">
                          {item.quantity}
                        </Badge>
                      </div>
                    ))}
                    {claim.additionalItems?.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">+ {item.title}</span>
                        <Badge variant="outline">
                          {item.quantity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(claim.status)}>
                    {claim.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {claim.shippingMethod?.name || "Not specified"}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(claim.createdAt), new Date(), {
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
                      {claim.status === "created" && (
                        <>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Receive Items
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Claim
                          </DropdownMenuItem>
                        </>
                      )}
                      {claim.status === "received" && (
                        <DropdownMenuItem>
                          <Package className="mr-2 h-4 w-4" />
                          Fulfill Claim
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