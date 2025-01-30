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

export function PriceListTable({ priceLists, isLoading, error, onPageChange, total }) {
  if (error) {
    return <div>Error loading price lists: {error.message}</div>;
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "secondary";
      case "expired":
        return "destructive";
      default:
        return "default";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "sale":
        return "Sale";
      case "override":
        return "Override";
      default:
        return type;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Groups</TableHead>
            <TableHead>Created</TableHead>
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
            priceLists.map((priceList) => (
              <TableRow key={priceList.id}>
                <TableCell className="font-medium">{priceList.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {priceList.description}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(priceList.status)}>
                    {priceList.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getTypeLabel(priceList.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {priceList.customerGroups.map((group) => (
                      <Badge key={group.id} variant="secondary">
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(priceList.createdAt), new Date(), {
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
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