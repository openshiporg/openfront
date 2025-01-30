import React from "react";
import { gql } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Badge } from "@ui/badge";
import { Switch } from "@ui/switch";

export function Currencies({ currencies, defaultCurrency }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Store Currencies</CardTitle>
          <Button>Save Changes</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {currencies.map((currency) => (
            <div key={currency.code} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{currency.code}</h3>
                  {currency.code === defaultCurrency && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                <Switch checked={currency.code === defaultCurrency} />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Symbol</Label>
                  <Input value={currency.symbol} />
                </div>
                <div className="space-y-2">
                  <Label>Exchange Rate</Label>
                  <Input 
                    type="number"
                    value={currency.rate}
                    step="0.0001"
                    disabled={currency.code === defaultCurrency}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 