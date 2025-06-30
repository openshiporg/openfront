import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage, formatNumber } from '../lib/analyticsHelpers';
import { ShoppingCart, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';

interface CartAnalyticsProps {
  cartMetrics?: {
    totalCarts: number;
    abandonedCarts: number;
    abandonmentRate: number;
    averageCartValue: number;
    conversionRate?: number;
    completedOrders?: number;
  };
}

export function CartAnalytics({ cartMetrics }: CartAnalyticsProps) {
  if (!cartMetrics) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cart Analytics</CardTitle>
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
      icon: ShoppingCart,
      label: "Total Carts",
      value: formatNumber(cartMetrics.totalCarts),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: AlertTriangle,
      label: "Abandoned Carts",
      value: formatNumber(cartMetrics.abandonedCarts),
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      icon: TrendingUp,
      label: "Conversion Rate",
      value: formatPercentage(cartMetrics.conversionRate || (cartMetrics.completedOrders || 0) / cartMetrics.totalCarts * 100),
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      icon: ShoppingBag,
      label: "Avg. Cart Value",
      value: formatCurrency(cartMetrics.averageCartValue),
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Cart Analytics</CardTitle>
        <p className="text-sm text-muted-foreground">
          Shopping cart behavior and conversion metrics
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