import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Switch } from "@ui/switch";
import { Label } from "@ui/label";
import { Input } from "@ui/input";

export function DiscountRules({ rules, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rules & Limitations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Usage Limit</Label>
              <p className="text-sm text-zinc-500">
                Limit how many times this discount can be used
              </p>
            </div>
            <Input
              type="number"
              value={rules.usageLimit}
              onChange={(e) => onChange({ ...rules, usageLimit: e.target.value })}
              className="w-[100px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>One Per Customer</Label>
              <p className="text-sm text-zinc-500">
                Customer can only use this discount once
              </p>
            </div>
            <Switch
              checked={rules.onePerCustomer}
              onCheckedChange={(checked) => 
                onChange({ ...rules, onePerCustomer: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Combine With Other Discounts</Label>
              <p className="text-sm text-zinc-500">
                Allow this discount to be used with other discounts
              </p>
            </div>
            <Switch
              checked={rules.canCombine}
              onCheckedChange={(checked) => 
                onChange({ ...rules, canCombine: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 