import { useState } from "react";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Button } from "@ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

export function PriceInput({
  label,
  prices = [],
  currencies = [],
  onChange,
  className,
}) {
  const handlePriceChange = (currencyCode, newValue) => {
    const numericValue = newValue.replace(/[^0-9.]/g, "");
    if (numericValue === "") return;
    
    const amount = Math.round(parseFloat(numericValue) * 100); // Store in cents
    if (isNaN(amount)) return;

    const existingPriceIndex = prices.findIndex(p => p.currency?.code === currencyCode);
    const newPrices = [...prices];

    if (existingPriceIndex >= 0) {
      newPrices[existingPriceIndex] = {
        ...newPrices[existingPriceIndex],
        amount,
      };
    } else {
      const currency = currencies.find(c => c.code === currencyCode);
      newPrices.push({
        amount,
        currency: {
          id: currency.id,
          code: currency.code,
          symbol: currency.symbol
        }
      });
    }

    onChange(newPrices);
  };

  const addCurrency = () => {
    const existingCurrencies = new Set(prices.map(p => p.currency?.code));
    const availableCurrency = currencies.find(c => !existingCurrencies.has(c.code));
    
    if (!availableCurrency) return;

    const newPrices = [
      ...prices,
      {
        amount: 0,
        currency: {
          id: availableCurrency.id,
          code: availableCurrency.code,
          symbol: availableCurrency.symbol
        }
      },
    ];

    onChange(newPrices);
  };

  const removePrice = (currencyCode) => {
    onChange(prices.filter(p => p.currency?.code !== currencyCode));
  };

  const formatPrice = (amount) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={addCurrency}
          disabled={prices.length >= currencies.length}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Currency
        </Button>
      </div>
      <div className="space-y-2">
        {prices.map((price) => {
          const currency = currencies.find(c => c.code === price.currency?.code);
          return (
            <div key={price.currency?.code} className="flex items-end gap-2">
              <div className="w-32">
                <Label className="mb-2">Currency</Label>
                <Select
                  value={price.currency?.code}
                  onValueChange={(currencyCode) => {
                    const oldCurrencyCode = price.currency?.code;
                    const newCurrency = currencies.find(c => c.code === currencyCode);
                    const newPrices = prices.map(p => 
                      p.currency?.code === oldCurrencyCode 
                        ? { 
                            ...p, 
                            currency: {
                              id: newCurrency.id,
                              code: newCurrency.code,
                              symbol: newCurrency.symbol
                            }
                          }
                        : p
                    );
                    onChange(newPrices);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code.toUpperCase()} ({currency.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="mb-2">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    {currency?.symbol}
                  </span>
                  <Input
                    type="text"
                    value={formatPrice(price.amount)}
                    onChange={(e) => handlePriceChange(price.currency?.code, e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removePrice(price.currency?.code)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        })}
        {prices.length === 0 && (
          <div className="text-center text-muted-foreground py-4">
            Add a currency to set prices
          </div>
        )}
      </div>
    </div>
  );
} 