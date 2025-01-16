import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Switch } from "@ui/switch";

export function InventoryManager({ inventory, onUpdateInventory }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Track Inventory</Label>
            <Switch 
              checked={inventory.tracked}
              onCheckedChange={(checked) => onUpdateInventory({ tracked: checked })}
            />
          </div>

          {inventory.tracked && (
            <>
              <div className="grid gap-2">
                <Label>Available Quantity</Label>
                <Input 
                  type="number"
                  value={inventory.quantity}
                  onChange={(e) => onUpdateInventory({ quantity: parseInt(e.target.value) })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Low Stock Threshold</Label>
                <Input 
                  type="number"
                  value={inventory.threshold}
                  onChange={(e) => onUpdateInventory({ threshold: parseInt(e.target.value) })}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 