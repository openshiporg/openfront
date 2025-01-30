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

const DELETE_PRICE_MUTATION = gql`
  mutation DeletePrice($where: PriceWhereUniqueInput!) {
    deletePrice(where: $where) {
      id
    }
  }
`;

export function PriceListPrices({ prices }) {
  const [deletePrice] = useMutation(DELETE_PRICE_MUTATION);

  const handleDeletePrice = async (priceId) => {
    try {
      await deletePrice({
        variables: {
          where: { id: priceId },
        },
      });
    } catch (error) {
      console.error("Failed to delete price:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Prices</CardTitle>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Prices
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Variant</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Min. Quantity</TableHead>
                <TableHead>Max. Quantity</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-zinc-500">
                    No prices added yet
                  </TableCell>
                </TableRow>
              ) : (
                prices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {price.variant.product.title}
                        </span>
                        <span className="text-sm text-zinc-500">
                          {price.variant.title} ({price.variant.sku})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {price.currencyCode} {price.amount}
                      </Badge>
                    </TableCell>
                    <TableCell>{price.currencyCode}</TableCell>
                    <TableCell>
                      {price.minQuantity || <span className="text-zinc-500">-</span>}
                    </TableCell>
                    <TableCell>
                      {price.maxQuantity || <span className="text-zinc-500">-</span>}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePrice(price.id)}
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