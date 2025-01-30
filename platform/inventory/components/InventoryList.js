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
import { Input } from "@ui/input";
import { MoreHorizontal, Plus, Minus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { useToast } from "@ui/use-toast";
import { useRouter } from "next/navigation";

const UPDATE_INVENTORY_MUTATION = gql`
  mutation UpdateInventory($where: ProductVariantWhereUniqueInput!, $data: ProductVariantUpdateInput!) {
    updateProductVariant(where: $where, data: $data) {
      id
      inventory_quantity
    }
  }
`;

const CREATE_STOCK_MOVEMENT = gql`
  mutation CreateStockMovement($data: StockMovementCreateInput!) {
    createStockMovement(data: $data) {
      id
      type
      quantity
      variant {
        id
        inventory_quantity
      }
    }
  }
`;

export function InventoryList({ inventory, isLoading, error, onPageChange, total }) {
  const { toast } = useToast();
  const router = useRouter();
  const [updateInventory] = useMutation(UPDATE_INVENTORY_MUTATION);
  const [createStockMovement] = useMutation(CREATE_STOCK_MOVEMENT);
  const [adjustQuantity, setAdjustQuantity] = React.useState({});
  const [isUpdating, setIsUpdating] = React.useState({});

  if (error) {
    return <div>Error loading inventory: {error.message}</div>;
  }

  const getStockStatus = (quantity) => {
    if (quantity === 0) return "out_of_stock";
    if (quantity <= 10) return "low_stock";
    return "in_stock";
  };

  const getStockStatusBadge = (status) => {
    switch (status) {
      case "in_stock":
        return <Badge variant="success">In Stock</Badge>;
      case "low_stock":
        return <Badge variant="warning">Low Stock</Badge>;
      case "out_of_stock":
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  const handleAdjustQuantity = async (variantId, adjustment) => {
    const currentQuantity = adjustQuantity[variantId] || 0;
    if (currentQuantity + adjustment < 0) {
      toast({
        title: "Invalid adjustment",
        description: "Stock quantity cannot be negative",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(prev => ({ ...prev, [variantId]: true }));

    try {
      const newQuantity = currentQuantity + adjustment;
      
      // Create stock movement record
      await createStockMovement({
        variables: {
          data: {
            type: adjustment > 0 ? "RECEIVE" : "REMOVE",
            quantity: Math.abs(adjustment),
            variant: { connect: { id: variantId } },
            note: `Manual adjustment: ${adjustment > 0 ? "Added" : "Removed"} ${Math.abs(adjustment)} units`,
          },
        },
      });

      // Update inventory quantity
      await updateInventory({
        variables: {
          where: { id: variantId },
          data: {
            inventory_quantity: newQuantity,
          },
        },
      });

      setAdjustQuantity(prev => ({
        ...prev,
        [variantId]: newQuantity,
      }));

      toast({
        title: "Stock updated",
        description: `Successfully ${adjustment > 0 ? "added" : "removed"} ${Math.abs(adjustment)} units`,
      });
    } catch (error) {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [variantId]: false }));
    }
  };

  const handleViewDetails = (variantId) => {
    router.push(`/platform/inventory/${variantId}`);
  };

  const handleEditStock = (variantId) => {
    router.push(`/platform/inventory/${variantId}?tab=adjust`);
  };

  const handleChangeLocation = (variantId) => {
    router.push(`/platform/inventory/${variantId}?tab=location`);
  };

  const handleViewHistory = (variantId) => {
    router.push(`/platform/inventory/${variantId}?tab=history`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Variant</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
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
          ) : inventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-zinc-500">
                No inventory items found
              </TableCell>
            </TableRow>
          ) : (
            inventory.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {variant.product.thumbnail && (
                      <img
                        src={variant.product.thumbnail}
                        alt={variant.title}
                        className="h-8 w-8 rounded-md object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{variant.product.title}</p>
                      <p className="text-sm text-zinc-500">{variant.title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{variant.sku || "N/A"}</TableCell>
                <TableCell>{variant.barcode || "N/A"}</TableCell>
                <TableCell>
                  {variant.location ? variant.location.name : "Default"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdjustQuantity(variant.id, -1)}
                      disabled={isUpdating[variant.id]}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={adjustQuantity[variant.id] || variant.inventory_quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (value >= 0) {
                          setAdjustQuantity(prev => ({
                            ...prev,
                            [variant.id]: value,
                          }));
                        }
                      }}
                      className="w-20 text-center"
                      disabled={isUpdating[variant.id]}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdjustQuantity(variant.id, 1)}
                      disabled={isUpdating[variant.id]}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {getStockStatusBadge(getStockStatus(variant.inventory_quantity))}
                  {variant.allow_backorder && (
                    <Badge variant="outline" className="ml-2">
                      Backorder
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(variant.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditStock(variant.id)}>
                        Edit Stock
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeLocation(variant.id)}>
                        Change Location
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewHistory(variant.id)}>
                        View History
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