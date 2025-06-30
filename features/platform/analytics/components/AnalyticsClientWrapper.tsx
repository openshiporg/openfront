"use client";

import { useState } from "react";
import { ImprovedAnalyticsDashboard } from "./ImprovedAnalyticsDashboard";
import { ConvertToTabs } from "./ConvertToTabs";

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
  const [convertTo, setConvertTo] = useState(props.initialConvertTo || "usd");

  return (
    <>
      {/* Convert To Tabs */}
      <div className="px-6 pb-4">
        <ConvertToTabs 
          convertTo={convertTo}
          onConvertToChange={setConvertTo}
        />
      </div>

      <div className="p-6 space-y-6">
        <ImprovedAnalyticsDashboard {...props} />
      </div>
    </>
  );
}