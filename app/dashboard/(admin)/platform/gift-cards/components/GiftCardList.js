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

export function GiftCardList({ giftCards, isLoading, error, onPageChange, total }) {
  if (error) {
    return <div>Error loading gift cards: {error.message}</div>;
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "used":
        return "default";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            giftCards.map((giftCard) => (
              <TableRow key={giftCard.id}>
                <TableCell className="font-medium">{giftCard.code}</TableCell>
                <TableCell>
                  {giftCard.recipient ? (
                    <div className="flex flex-col">
                      <span>{giftCard.recipient.name}</span>
                      <span className="text-sm text-zinc-500">
                        {giftCard.recipient.email}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-zinc-500">No recipient</span>
                  )}
                </TableCell>
                <TableCell>${giftCard.balance}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(giftCard.status)}>
                    {giftCard.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(giftCard.createdAt), new Date(), {
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
                      <DropdownMenuItem>Disable</DropdownMenuItem>
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