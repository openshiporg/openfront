import React, { useState } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@ui/dialog";
import { Label } from "@ui/label";
import { Switch } from "@ui/switch";
import { PlusIcon, Trash2Icon, PencilIcon } from "lucide-react";
import { useToast } from "@ui/use-toast";

export function ProductVariants({ value, onChange }) {
  const { toast } = useToast();
  const [editingVariant, setEditingVariant] = useState(null);
  const variants = value.productVariants || [];

  const formatPrice = (price) => {
    return (price / 100).toFixed(2);
  };

  const handlePriceChange = (variantId, value) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    if (numericValue === "") return updateVariant(variantId, { price: 0 });
    
    const price = parseFloat(numericValue);
    if (isNaN(price)) return;

    const priceInCents = Math.round(price * 100);
    updateVariant(variantId, { price: priceInCents });
  };

  const handleInventoryChange = (variantId, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 0) {
      toast({
        title: "Invalid quantity",
        description: "Inventory quantity must be a positive number",
        variant: "destructive",
      });
      return;
    }
    updateVariant(variantId, { inventoryQuantity: quantity });
  };

  const validateSKU = (sku) => {
    return /^[A-Za-z0-9-_]+$/.test(sku);
  };

  const handleSKUChange = (variantId, value) => {
    if (!validateSKU(value)) {
      toast({
        title: "Invalid SKU",
        description: "SKU can only contain letters, numbers, hyphens, and underscores",
        variant: "destructive",
      });
      return;
    }
    updateVariant(variantId, { sku: value });
  };

  const addVariant = () => {
    const newVariant = {
      id: `temp_${Date.now()}`,
      title: "",
      sku: "",
      barcode: "",
      ean: "",
      upc: "",
      inventoryQuantity: 0,
      allowBackorder: false,
      manageInventory: true,
      weight: null,
      length: null,
      height: null,
      width: null,
      metadata: {},
      variantRank: variants.length,
    };

    onChange({
      ...value,
      productVariants: [...variants, newVariant],
    });
  };

  const updateVariant = (variantId, updates) => {
    onChange({
      ...value,
      productVariants: variants.map(v => 
        v.id === variantId ? { ...v, ...updates } : v
      ),
    });
  };

  const deleteVariant = (variantId) => {
    onChange({
      ...value,
      productVariants: variants.filter(v => v.id !== variantId),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Variants</CardTitle>
        <Button onClick={addVariant} size="sm">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>
                  <div className="font-medium">{variant.title || "Untitled Variant"}</div>
                  {variant.barcode && (
                    <div className="text-sm text-muted-foreground">
                      Barcode: {variant.barcode}
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono">
                  {variant.sku || "No SKU"}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {variant.manageInventory ? (
                      <>
                        {variant.inventoryQuantity} in stock
                        {variant.allowBackorder && " (Backorder allowed)"}
                      </>
                    ) : (
                      "Not tracked"
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {variant.width && variant.height && variant.length ? (
                      `${variant.width}×${variant.height}×${variant.length} cm`
                    ) : (
                      "No dimensions"
                    )}
                    {variant.weight && ` (${variant.weight}g)`}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingVariant(variant)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Variant</DialogTitle>
                          <DialogDescription>
                            Update the details for this product variant.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={editingVariant?.title || ""}
                                onChange={(e) => setEditingVariant({
                                  ...editingVariant,
                                  title: e.target.value,
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="sku">SKU</Label>
                              <Input
                                id="sku"
                                value={editingVariant?.sku || ""}
                                onChange={(e) => handleSKUChange(editingVariant.id, e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="barcode">Barcode</Label>
                              <Input
                                id="barcode"
                                value={editingVariant?.barcode || ""}
                                onChange={(e) => setEditingVariant({
                                  ...editingVariant,
                                  barcode: e.target.value,
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="ean">EAN</Label>
                              <Input
                                id="ean"
                                value={editingVariant?.ean || ""}
                                onChange={(e) => setEditingVariant({
                                  ...editingVariant,
                                  ean: e.target.value,
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="upc">UPC</Label>
                              <Input
                                id="upc"
                                value={editingVariant?.upc || ""}
                                onChange={(e) => setEditingVariant({
                                  ...editingVariant,
                                  upc: e.target.value,
                                })}
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="manageInventory">Manage Inventory</Label>
                              <Switch
                                id="manageInventory"
                                checked={editingVariant?.manageInventory}
                                onCheckedChange={(checked) => setEditingVariant({
                                  ...editingVariant,
                                  manageInventory: checked,
                                })}
                              />
                            </div>
                            {editingVariant?.manageInventory && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="inventoryQuantity">Inventory Quantity</Label>
                                  <Input
                                    id="inventoryQuantity"
                                    type="number"
                                    value={editingVariant?.inventoryQuantity || 0}
                                    onChange={(e) => handleInventoryChange(editingVariant.id, e.target.value)}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="allowBackorder">Allow Backorder</Label>
                                  <Switch
                                    id="allowBackorder"
                                    checked={editingVariant?.allowBackorder}
                                    onCheckedChange={(checked) => setEditingVariant({
                                      ...editingVariant,
                                      allowBackorder: checked,
                                    })}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="weight">Weight (g)</Label>
                              <Input
                                id="weight"
                                type="number"
                                value={editingVariant?.weight || ""}
                                onChange={(e) => setEditingVariant({
                                  ...editingVariant,
                                  weight: parseInt(e.target.value) || null,
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="length">Length (cm)</Label>
                              <Input
                                id="length"
                                type="number"
                                value={editingVariant?.length || ""}
                                onChange={(e) => setEditingVariant({
                                  ...editingVariant,
                                  length: parseInt(e.target.value) || null,
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="width">Width (cm)</Label>
                              <Input
                                id="width"
                                type="number"
                                value={editingVariant?.width || ""}
                                onChange={(e) => setEditingVariant({
                                  ...editingVariant,
                                  width: parseInt(e.target.value) || null,
                                })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="height">Height (cm)</Label>
                              <Input
                                id="height"
                                type="number"
                                value={editingVariant?.height || ""}
                                onChange={(e) => setEditingVariant({
                                  ...editingVariant,
                                  height: parseInt(e.target.value) || null,
                                })}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setEditingVariant(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              updateVariant(editingVariant.id, editingVariant);
                              setEditingVariant(null);
                            }}
                          >
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVariant(variant.id)}
                    >
                      <Trash2Icon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {variants.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No variants added yet. Click "Add Variant" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 