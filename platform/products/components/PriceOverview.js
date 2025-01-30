import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";
import { Button } from "@ui/button";
import { PlusIcon, Trash2Icon } from "lucide-react";

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  // Add more currencies as needed
];

export function PriceOverview({ value, onChange }) {
  const variants = value.productVariants || [];
  const prices = value.prices || [];

  const formatPrice = (amount) => {
    return (amount / 100).toFixed(2);
  };

  const handlePriceChange = (variantId, currencyCode, newValue) => {
    const numericValue = newValue.replace(/[^0-9.]/g, "");
    if (numericValue === "") return;
    
    const amount = Math.round(parseFloat(numericValue) * 100);
    if (isNaN(amount)) return;

    const existingPriceIndex = prices.findIndex(
      p => p.variantId === variantId && p.currencyCode === currencyCode
    );

    const newPrices = [...prices];
    if (existingPriceIndex >= 0) {
      newPrices[existingPriceIndex] = {
        ...newPrices[existingPriceIndex],
        amount,
      };
    } else {
      newPrices.push({
        id: `temp_${Date.now()}`,
        variantId,
        currencyCode,
        amount,
      });
    }

    onChange({
      ...value,
      prices: newPrices,
    });
  };

  const addCurrency = (variantId) => {
    const existingCurrencies = new Set(
      prices
        .filter(p => p.variantId === variantId)
        .map(p => p.currencyCode)
    );

    const availableCurrency = CURRENCIES.find(c => !existingCurrencies.has(c.code));
    if (!availableCurrency) return;

    const newPrices = [
      ...prices,
      {
        id: `temp_${Date.now()}`,
        variantId,
        currencyCode: availableCurrency.code,
        amount: 0,
      },
    ];

    onChange({
      ...value,
      prices: newPrices,
    });
  };

  const removePrice = (priceId) => {
    onChange({
      ...value,
      prices: prices.filter(p => p.id !== priceId),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {variants.map(variant => (
            <div key={variant.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  {variant.title || "Untitled Variant"}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCurrency(variant.id)}
                  disabled={prices.filter(p => p.variantId === variant.id).length >= CURRENCIES.length}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Currency
                </Button>
              </div>
              <div className="grid gap-4">
                {prices
                  .filter(price => price.variantId === variant.id)
                  .map(price => (
                    <div key={price.id} className="flex items-end gap-4">
                      <div className="w-32">
                        <Label className="mb-2">Currency</Label>
                        <Select
                          value={price.currencyCode}
                          onValueChange={(currency) => handlePriceChange(variant.id, currency, formatPrice(price.amount))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.code} ({currency.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label className="mb-2">Amount</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            {CURRENCIES.find(c => c.code === price.currencyCode)?.symbol}
                          </span>
                          <Input
                            type="text"
                            value={formatPrice(price.amount)}
                            onChange={(e) => handlePriceChange(variant.id, price.currencyCode, e.target.value)}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePrice(price.id)}
                      >
                        <Trash2Icon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          {variants.length === 0 && (
            <div className="text-center text-muted-foreground">
              Add product variants to manage prices
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}