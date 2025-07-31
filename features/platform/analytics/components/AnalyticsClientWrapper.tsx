"use client";

import { useState } from "react";
import { ImprovedAnalyticsDashboard } from "./ImprovedAnalyticsDashboard";

interface AnalyticsClientWrapperProps {
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
  currencySymbol: string;
  initialConvertTo?: string;
}

export function AnalyticsClientWrapper(props: AnalyticsClientWrapperProps) {
  return (
    <ImprovedAnalyticsDashboard {...props} />
  );
}