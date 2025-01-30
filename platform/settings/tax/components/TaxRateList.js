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
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";

const UPDATE_TAX_RATE = gql`
  mutation UpdateTaxRate($where: TaxRateWhereUniqueInput!, $data: TaxRateUpdateInput!) {
    updateTaxRate(where: $where, data: $data) {
      id
      isDefault
    }
  }
`;

export function TaxRateList({ taxRates, isLoading, error, onPageChange, total }) {
  const [updateTaxRate] = useMutation(UPDATE_TAX_RATE);

  if (error) {
    return <div>Error loading tax rates: {error.message}</div>;
  }

  const handleSetDefault = async (id) => {
    await updateTaxRate({
      variables: {
        where: { id },
        data: { isDefault: true },
      },
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Product Types</TableHead>
            <TableHead>Shipping Options</TableHead>
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
          ) : taxRates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-zinc-500">
                No tax rates found
              </TableCell>
            </TableRow>
          ) : (
            taxRates.map((taxRate) => (
              <TableRow key={taxRate.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{taxRate.name}</span>
                    {taxRate.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{taxRate.code}</span>
                </TableCell>
                <TableCell>{taxRate.rate}%</TableCell>
                <TableCell>
                  {taxRate.region ? (
                    <Badge variant="outline">{taxRate.region.name}</Badge>
                  ) : (
                    <span className="text-sm text-zinc-500">No Region</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {taxRate.products.length} products
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {taxRate.productTypes.length} types
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {taxRate.shippingOptions.length} options
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Tax Rate</DropdownMenuItem>
                      {!taxRate.isDefault && (
                        <DropdownMenuItem onClick={() => handleSetDefault(taxRate.id)}>
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>View Products</DropdownMenuItem>
                      <DropdownMenuItem>View Product Types</DropdownMenuItem>
                      <DropdownMenuItem>View Shipping Options</DropdownMenuItem>
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