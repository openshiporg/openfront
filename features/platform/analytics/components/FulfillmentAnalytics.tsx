import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatPercentage } from '../lib/analyticsHelpers';
import { Package, Truck, Clock, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface FulfillmentAnalyticsProps {
  fulfillmentMetrics?: {
    totalFulfillments: number;
    shippedFulfillments: number;
    pendingFulfillments: number;
    canceledFulfillments: number;
    averageFulfillmentTime: number; // in hours
    onTimeDeliveryRate: number; // percentage
    returnsRate: number; // percentage
    activeShippingLabels: number;
  };
}

export function FulfillmentAnalytics({ fulfillmentMetrics }: FulfillmentAnalyticsProps) {
  if (!fulfillmentMetrics) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fulfillment & Shipping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insights = [
    {
      icon: Package,
      label: "Total Orders Fulfilled",
      value: formatNumber(fulfillmentMetrics.totalFulfillments),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: Truck,
      label: "Shipped Orders",
      value: formatNumber(fulfillmentMetrics.shippedFulfillments),
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      icon: Clock,
      label: "Avg. Fulfillment Time",
      value: `${fulfillmentMetrics.averageFulfillmentTime.toFixed(1)}h`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      icon: CheckCircle,
      label: "On-Time Delivery Rate",
      value: formatPercentage(fulfillmentMetrics.onTimeDeliveryRate),
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Fulfillment & Shipping</CardTitle>
        <p className="text-sm text-muted-foreground">
          Order processing and delivery performance metrics
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          return (
            <div key={insight.label} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">{insight.label}</div>
                <div className="text-lg font-semibold">{insight.value}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}