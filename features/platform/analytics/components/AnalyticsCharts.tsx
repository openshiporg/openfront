'use client';

import React from 'react';
import {
  Card,
  Title,
  Subtitle,
  AreaChart,
  BarChart,
  DonutChart,
  Grid,
} from '@tremor/react';
import { formatCurrency } from '../lib/analyticsHelpers';

interface AnalyticsChartsProps {
  timeSeriesData: any[];
  topProductsData: any[];
  categoryChartData: any[];
}

export function AnalyticsCharts({ 
  timeSeriesData, 
  topProductsData, 
  categoryChartData 
}: AnalyticsChartsProps) {
  const valueFormatter = (number: number) => formatCurrency(number * 100);

  return (
    <>
      {/* Revenue Trend Chart */}
      <Card>
        <Title>Revenue Trend</Title>
        <Subtitle>Daily revenue over the selected period</Subtitle>
        <AreaChart
          className="h-80 mt-6"
          data={timeSeriesData}
          index="date"
          categories={["revenue"]}
          colors={["blue"]}
          valueFormatter={valueFormatter}
          showLegend={false}
          showGridLines={true}
        />
      </Card>

      {/* Charts Grid */}
      <Grid numItemsLg={2} className="gap-6">
        {/* Top Products */}
        <Card>
          <Title>Top Products by Revenue</Title>
          <Subtitle>Best performing products in the selected period</Subtitle>
          <BarChart
            className="h-80 mt-6"
            data={topProductsData}
            index="name"
            categories={["revenue"]}
            colors={["emerald"]}
            valueFormatter={valueFormatter}
            showLegend={false}
            layout="vertical"
            yAxisWidth={120}
          />
        </Card>

        {/* Category Performance */}
        <Card>
          <Title>Category Performance</Title>
          <Subtitle>Revenue by product category</Subtitle>
          <DonutChart
            className="h-80 mt-6"
            data={categoryChartData}
            category="revenue"
            index="name"
            valueFormatter={valueFormatter}
            colors={["blue", "emerald", "violet", "amber", "rose", "cyan", "indigo", "pink"]}
          />
        </Card>
      </Grid>
    </>
  );
} 