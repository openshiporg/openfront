'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage, formatNumber, calculatePercentageChange } from '../lib/analyticsHelpers';
import { RevenueOrderChart } from './RevenueOrderChart';
import { ProductPerformanceBarList } from './ProductPerformanceBarList';
import { DonutChart } from './DonutChart';
import { CustomerInsights } from './CustomerInsights';
import { CartAnalytics } from './CartAnalytics';
import { FulfillmentAnalytics } from './FulfillmentAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsDashboardProps {
  salesMetrics: any;
  customerMetrics: any;
  productMetrics: any;
  cartMetrics: any;
  categoryMetrics: any;
  fulfillmentMetrics: any;
  timeSeriesData: any[];
  topProductsData: any[];
  categoryChartData: any[];
  selectedPeriod: string;
  currencySymbol?: string;
}

const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
];

export function ImprovedAnalyticsDashboard({ 
  salesMetrics, 
  customerMetrics, 
  productMetrics, 
  cartMetrics,
  categoryMetrics,
  fulfillmentMetrics,
  timeSeriesData, 
  topProductsData, 
  categoryChartData,
  selectedPeriod,
  currencySymbol = '$'
}: AnalyticsDashboardProps) {


  // Prepare time series data with both revenue and orders
  const enhancedTimeSeriesData = timeSeriesData.map(item => ({
    ...item,
    displayRevenue: item.revenue / 100, // Convert cents to dollars for display
  }));

  return (
    <div className="space-y-6">

      {/* Revenue & Orders Chart */}
      <RevenueOrderChart
        timeSeriesData={enhancedTimeSeriesData}
        totalRevenue={salesMetrics?.totalRevenue || 0}
        totalOrders={salesMetrics?.totalOrders || 0}
        currencySymbol={currencySymbol}
      />

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products Bar List */}
        <ProductPerformanceBarList
          data={topProductsData}
          title="Top Products"
          description="Best performing products by revenue and quantity sold"
          currencySymbol={currencySymbol}
        />

        {/* Category Performance Donut Chart */}
        <DonutChart
          data={categoryChartData.map((category, index) => ({
            name: category.name,
            value: category.revenue,
            color: CHART_COLORS[index % CHART_COLORS.length],
          }))}
          title="Category Performance"
          description="Revenue distribution by product category"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <FulfillmentAnalytics fulfillmentMetrics={fulfillmentMetrics} />

        <CartAnalytics cartMetrics={cartMetrics} />

        <CustomerInsights customerMetrics={customerMetrics} />
      </div>
    </div>
  );
}

export default ImprovedAnalyticsDashboard;