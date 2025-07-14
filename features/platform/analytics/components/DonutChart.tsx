"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "../lib/analyticsHelpers";

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  title?: string;
  description?: string;
  total?: number;
  className?: string;
  onValueChange?: (data: DonutChartData | null) => void;
}

export type DonutChartEventProps = {
  name: string;
  value: number;
  color: string;
} | null;

export function DonutChart({
  data,
  title = "Category Performance",
  description = "Revenue distribution by product category",
  total,
  className = "",
  onValueChange,
}: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Calculate total if not provided
  const calculatedTotal = total || data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: (item.value / calculatedTotal) * 100,
  }));

  const handleMouseEnter = (_: any, index: number) => {
    setActiveIndex(index);
    if (onValueChange) {
      onValueChange(data[index]);
    }
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
    if (onValueChange) {
      onValueChange(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Donut Chart */}
          <div className="relative mx-auto lg:mx-0">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={dataWithPercentages}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {dataWithPercentages.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      strokeWidth={activeIndex === index ? 2 : 0}
                      stroke="var(--background)"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-semibold">
                  {formatCurrency(calculatedTotal * 100)}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3 lg:ml-6">
            {dataWithPercentages.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div 
                    className="w-4 h-4 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-50 truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-50 whitespace-nowrap">
                    {formatCurrency(item.value * 100)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}