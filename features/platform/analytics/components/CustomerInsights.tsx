import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage, formatNumber } from '../lib/analyticsHelpers';
import { TrendingUp, TrendingDown, Users, UserPlus, RefreshCw, DollarSign } from 'lucide-react';

interface CustomerInsightsProps {
  customerMetrics?: {
    totalCustomers: number;
    newCustomers: number;
    retentionRate: number;
    averageCustomerLifetimeValue: number;
    repeatCustomerRate?: number;
    churnRate?: number;
  };
}

export function CustomerInsights({ customerMetrics }: CustomerInsightsProps) {
  if (!customerMetrics) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Customer Insights</CardTitle>
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
      icon: Users,
      label: "Total Customers",
      value: formatNumber(customerMetrics.totalCustomers),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: UserPlus,
      label: "New Customers",
      value: formatNumber(customerMetrics.newCustomers),
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      icon: RefreshCw,
      label: "Retention Rate",
      value: formatPercentage(customerMetrics.retentionRate),
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      icon: DollarSign,
      label: "Avg. Lifetime Value",
      value: formatCurrency(customerMetrics.averageCustomerLifetimeValue),
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Customer Insights</CardTitle>
        <p className="text-sm text-muted-foreground">
          Key customer metrics and behavior patterns
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