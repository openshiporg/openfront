import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Input } from "@ui/input";
import { PlusIcon, XIcon } from "lucide-react";

export function ConditionBuilder({ conditions = [], onChange }) {
  const addCondition = () => {
    onChange([...conditions, { type: 'minimum_amount', value: '' }]);
  };

  const removeCondition = (index) => {
    const newConditions = [...conditions];
    newConditions.splice(index, 1);
    onChange(newConditions);
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    onChange(newConditions);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Conditions</CardTitle>
          <Button variant="outline" size="sm" onClick={addCondition}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Condition
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-4">
              <Select
                value={condition.type}
                onValueChange={(value) => updateCondition(index, 'type', value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimum_amount">Minimum Amount</SelectItem>
                  <SelectItem value="minimum_quantity">Minimum Quantity</SelectItem>
                  <SelectItem value="product_type">Product Type</SelectItem>
                  <SelectItem value="customer_group">Customer Group</SelectItem>
                </SelectContent>
              </Select>

              <Input
                value={condition.value}
                onChange={(e) => updateCondition(index, 'value', e.target.value)}
                placeholder="Enter value"
                className="flex-1"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(index)}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {conditions.length === 0 && (
            <p className="text-sm text-zinc-500">
              No conditions set. This discount will apply to all orders.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 