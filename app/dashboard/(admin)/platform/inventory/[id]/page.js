import React from "react";
import { gql, useQuery, useMutation } from "@keystone-6/core/admin-ui/apollo";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Input } from "@ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { formatDistance } from "date-fns";

const INVENTORY_DETAIL_QUERY = gql`
  query InventoryDetail($where: ProductVariantWhereUniqueInput!) {
    productVariant(where: $where) {
      id
      title
      sku
      barcode
      inventory_quantity
      allow_backorder
      manage_inventory
      product {
        id
        title
        thumbnail
      }
      location {
        id
        name
      }
      stockMovements {
        id
        type
        quantity
        reason
        note
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_INVENTORY_MUTATION = gql`
  mutation UpdateInventory($where: ProductVariantWhereUniqueInput!, $data: ProductVariantUpdateInput!) {
    updateProductVariant(where: $where, data: $data) {
      id
      inventory_quantity
      allow_backorder
      manage_inventory
    }
  }
`;

const CREATE_STOCK_MOVEMENT = gql`
  mutation CreateStockMovement($data: StockMovementCreateInput!) {
    createStockMovement(data: $data) {
      id
      type
      quantity
    }
  }
`;

export default function InventoryDetailPage({ params }) {
  const { data, loading, error } = useQuery(INVENTORY_DETAIL_QUERY, {
    variables: { where: { id: params.id } },
  });

  const [updateInventory] = useMutation(UPDATE_INVENTORY_MUTATION);
  const [createStockMovement] = useMutation(CREATE_STOCK_MOVEMENT);

  const [quantity, setQuantity] = React.useState(0);
  const [note, setNote] = React.useState("");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const variant = data.productVariant;
  if (!variant) return <div>Inventory item not found</div>;

  const handleStockAdjustment = async (type) => {
    if (!quantity) return;

    await createStockMovement({
      variables: {
        data: {
          type,
          quantity: parseInt(quantity),
          note,
          variant: { connect: { id: variant.id } },
        },
      },
    });

    const newQuantity = type === "RECEIVE" 
      ? variant.inventory_quantity + parseInt(quantity)
      : variant.inventory_quantity - parseInt(quantity);

    await updateInventory({
      variables: {
        where: { id: variant.id },
        data: { inventory_quantity: newQuantity },
      },
    });

    setQuantity(0);
    setNote("");
  };

  const handleToggleBackorder = async () => {
    await updateInventory({
      variables: {
        where: { id: variant.id },
        data: { allow_backorder: !variant.allow_backorder },
      },
    });
  };

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Inventory Details</h1>
          <Badge variant={variant.inventory_quantity > 0 ? "success" : "destructive"}>
            {variant.inventory_quantity} in stock
          </Badge>
          {variant.allow_backorder && (
            <Badge variant="outline">Backorder Enabled</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleBackorder}>
            {variant.allow_backorder ? "Disable" : "Enable"} Backorder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {variant.product.thumbnail && (
                  <img
                    src={variant.product.thumbnail}
                    alt={variant.product.title}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{variant.product.title}</p>
                  <p className="text-sm text-zinc-500">{variant.title}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-zinc-500">SKU</p>
                <p className="font-mono">{variant.sku || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Barcode</p>
                <p className="font-mono">{variant.barcode || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Adjustment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-zinc-500">Quantity</label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-500">Note</label>
                <Input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Reason for adjustment"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleStockAdjustment("RECEIVE")}
                  disabled={!quantity}
                >
                  Receive Stock
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => handleStockAdjustment("REMOVE")}
                  disabled={!quantity || quantity > variant.inventory_quantity}
                >
                  Remove Stock
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-sm text-zinc-500">Current Location</p>
                <p className="font-medium">
                  {variant.location ? variant.location.name : "Default"}
                </p>
              </div>
              <Button variant="outline" className="mt-2">
                Change Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Movement History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {variant.stockMovements?.map((movement) => (
              <div
                key={movement.id}
                className="flex items-center justify-between border-b py-2 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {movement.type === "RECEIVE" ? "Received" : "Removed"}{" "}
                    {movement.quantity} units
                  </p>
                  {movement.note && (
                    <p className="text-sm text-zinc-500">{movement.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">
                    {formatDistance(new Date(movement.createdAt), new Date(), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 