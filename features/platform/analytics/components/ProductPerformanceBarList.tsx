"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BarList } from "./BarList";
import { formatCurrency, formatNumber } from "../lib/analyticsHelpers";

interface ProductData {
  name: string;
  revenue: number;
  quantity: number;
}

interface ProductPerformanceBarListProps {
  data: ProductData[];
  title?: string;
  description?: string;
  currencySymbol?: string;
}

export function ProductPerformanceBarList({
  data,
  title = "Top Products",
  description = "Best performing products by revenue and quantity sold",
  currencySymbol = '$',
}: ProductPerformanceBarListProps) {
  const [metricView, setMetricView] = useState("revenue");

  // Transform data based on selected metric
  const barListData = data.map((product) => ({
    name: product.name,
    value: metricView === "revenue" ? product.revenue : product.quantity,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="bg-black/5 dark:bg-white/10 inline-flex h-7 rounded-lg p-0.5 shrink-0">
            <RadioGroup
              value={metricView}
              onValueChange={setMetricView}
              className="group text-xs after:border after:border-border after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=revenue]:after:translate-x-0 data-[state=quantity]:after:translate-x-full"
              data-state={metricView}
            >
              <label className="group-data-[state=quantity]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none">
                Revenue
                <RadioGroupItem
                  value="revenue"
                  className="sr-only"
                />
              </label>
              <label className="group-data-[state=revenue]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none">
                Quantity
                <RadioGroupItem 
                  value="quantity" 
                  className="sr-only" 
                />
              </label>
            </RadioGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BarList
          data={barListData}
          valueFormatter={(value) => 
            metricView === "revenue" 
              ? `${currencySymbol}${value.toFixed(2)}` // Value is already in dollars
              : formatNumber(value)
          }
          showAnimation={true}
        />
      </CardContent>
    </Card>
  );
}