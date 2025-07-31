"use client";

import { useId, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency, formatNumber } from "../lib/analyticsHelpers";

interface RevenueOrderChartProps {
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    orders: number;
    displayRevenue: number;
  }>;
  totalRevenue: number;
  totalOrders: number;
  currencySymbol?: string;
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  orders: {
    label: "Orders",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

// Custom Tooltip Component
interface CustomTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  metricView: string;
  currencySymbol?: string;
}

function CustomTooltipContent({
  active,
  payload,
  label,
  metricView,
  currencySymbol = '$',
}: CustomTooltipContentProps) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const entry = payload[0];
  const value = entry.value as number;

  return (
    <div className="bg-popover text-popover-foreground grid min-w-32 items-start gap-1.5 rounded-lg border px-3 py-1.5 text-xs">
      <div className="font-medium">{label}</div>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div 
              className="size-2 rounded-xs" 
              style={{ backgroundColor: metricView === 'revenue' ? "var(--chart-1)" : "var(--chart-3)" }} 
            />
            <span className="text-muted-foreground">
              {metricView === 'revenue' ? 'Revenue' : 'Orders'}
            </span>
          </div>
          <span className="text-foreground font-mono font-medium tabular-nums">
            {metricView === 'revenue' ? `${currencySymbol}${value.toFixed(2)}` : formatNumber(value)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RevenueOrderChart({
  timeSeriesData,
  totalRevenue,
  totalOrders,
  currencySymbol = '$',
}: RevenueOrderChartProps) {
  const id = useId();
  const [metricView, setMetricView] = useState("revenue");

  const firstDate = timeSeriesData[0]?.date as string;
  const lastDate = timeSeriesData[timeSeriesData.length - 1]?.date as string;

  return (
    <Card className="gap-4">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle>Sales Overview</CardTitle>
            <div className="font-semibold text-2xl">
              {metricView === "revenue" ? `${currencySymbol}${(totalRevenue / 100).toFixed(2)}` : formatNumber(totalOrders)}
            </div>
          </div>
          <div className="bg-black/5 dark:bg-white/10 inline-flex h-6 rounded-md p-0.5 shrink-0">
            <RadioGroup
              value={metricView}
              onValueChange={setMetricView}
              className="group text-xs after:border after:border-border after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-sm after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=revenue]:after:translate-x-0 data-[state=orders]:after:translate-x-full"
              data-state={metricView}
            >
              <label className="group-data-[state=orders]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-6 cursor-pointer items-center justify-center px-1.5 whitespace-nowrap transition-colors select-none">
                Revenue
                <RadioGroupItem
                  id={`${id}-revenue`}
                  value="revenue"
                  className="sr-only"
                />
              </label>
              <label className="group-data-[state=revenue]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-6 cursor-pointer items-center justify-center px-1.5 whitespace-nowrap transition-colors select-none">
                Orders
                <RadioGroupItem 
                  id={`${id}-orders`} 
                  value="orders" 
                  className="sr-only" 
                />
              </label>
            </RadioGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full"
        >
          <AreaChart
            accessibilityLayer
            data={timeSeriesData}
            margin={{ left: -12, right: 12, top: 12 }}
          >
            <defs>
              <linearGradient id={`${id}-fillRevenue`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="55%" stopColor="var(--chart-1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id={`${id}-fillOrders`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                <stop offset="55%" stopColor="var(--chart-3)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="2 2"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={12}
              stroke="var(--border)"
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (metricView === 'revenue') {
                  if (value === 0) return `${currencySymbol}0`;
                  
                  // displayRevenue is already in dollars (converted from cents in ImprovedAnalyticsDashboard)
                  if (value < 1000) {
                    return `${currencySymbol}${value.toFixed(0)}`;
                  }
                  
                  // If $1000 or more, show as K
                  return `${currencySymbol}${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />
            <ChartTooltip
              content={
                <CustomTooltipContent metricView={metricView} currencySymbol={currencySymbol} />
              }
            />
            <Area
              strokeWidth={2}
              dataKey={metricView === 'revenue' ? "displayRevenue" : "orders"}
              type="stepBefore"
              fill={metricView === 'revenue' ? `url(#${id}-fillRevenue)` : `url(#${id}-fillOrders)`}
              fillOpacity={0.1}
              stroke={metricView === 'revenue' ? "var(--chart-1)" : "var(--chart-3)"}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}