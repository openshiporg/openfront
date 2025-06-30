'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign,
  ShoppingCart,
  Users,
  BarChart3,
  CalendarIcon,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency, formatPercentage, formatNumber } from '../lib/analyticsHelpers';

interface AnalyticsDashboardProps {
  salesMetrics: any;
  customerMetrics: any;
  productMetrics: any;
  cartMetrics: any;
  categoryMetrics: any;
  timeSeriesData: any[];
  topProductsData: any[];
  categoryChartData: any[];
  selectedPeriod: string;
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

export function AnalyticsDashboard({ 
  salesMetrics, 
  customerMetrics, 
  productMetrics, 
  cartMetrics,
  categoryMetrics,
  timeSeriesData, 
  topProductsData, 
  categoryChartData,
  selectedPeriod 
}: AnalyticsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

  const handlePeriodChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', value);
    router.push(`?${params.toString()}`);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('startDate', range.from.toISOString());
      params.set('endDate', range.to.toISOString());
      params.delete('period'); // Remove period when custom range is selected
      router.push(`?${params.toString()}`);
    }
  };

  const getPeriodLabel = () => {
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');
    
    if (customStart && customEnd) {
      return `${format(new Date(customStart), 'MMM d, yyyy')} - ${format(new Date(customEnd), 'MMM d, yyyy')}`;
    }
    
    switch (selectedPeriod) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '12m': return 'Last 12 months';
      default: return 'Last 30 days';
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('revenue') || entry.name.includes('Revenue') 
                ? formatCurrency(entry.value * 100) 
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics Overview</h2>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Custom Range</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  if (range?.from && range?.to) {
                    handleDateRangeChange(range);
                  }
                }}
                disabled={(date) => date > new Date() || date < new Date('2024-01-01')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesMetrics ? formatCurrency(salesMetrics.totalRevenue) : <Skeleton className="h-8 w-24" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {getPeriodLabel()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesMetrics ? formatNumber(salesMetrics.totalOrders) : <Skeleton className="h-8 w-16" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics ? `${formatNumber(salesMetrics.totalQuantitySold)} items sold` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesMetrics ? formatCurrency(salesMetrics.averageOrderValue) : <Skeleton className="h-8 w-20" />}
            </div>
            <p className="text-xs text-muted-foreground">
              Per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cartMetrics ? formatPercentage(cartMetrics.conversionRate) : <Skeleton className="h-8 w-16" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {cartMetrics ? `${formatNumber(cartMetrics.completedCarts)} of ${formatNumber(cartMetrics.totalCarts)} carts` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily revenue over the selected period
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                  tickFormatter={(value) => {
                    // Revenue data is in cents, so convert to dollars for display
                    if (value === 0) return "$0";
                    const dollarValue = value / 100;
                    if (dollarValue < 1000) {
                      return `$${dollarValue.toFixed(0)}`;
                    }
                    return `$${(dollarValue / 1000).toFixed(0)}K`;
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Revenue</CardTitle>
            <p className="text-sm text-muted-foreground">
              Best performing products in the selected period
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value) => {
                      // Product revenue data is already in dollars (divided by 100 in topProductsData)
                      if (value === 0) return "$0";
                      if (value < 1000) {
                        return `$${value.toFixed(0)}`;
                      }
                      return `$${(value / 1000).toFixed(0)}K`;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Revenue by product category
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Customer Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {customerMetrics ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Customers</span>
                  <span className="text-sm font-medium">{formatNumber(customerMetrics.totalCustomers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Customers</span>
                  <span className="text-sm font-medium">{formatNumber(customerMetrics.newCustomers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Retention Rate</span>
                  <span className="text-sm font-medium">{formatPercentage(customerMetrics.retentionRate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Lifetime Value</span>
                  <span className="text-sm font-medium">{formatCurrency(customerMetrics.averageCustomerLifetimeValue)}</span>
                </div>
              </>
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cart Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cartMetrics ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Carts</span>
                  <span className="text-sm font-medium">{formatNumber(cartMetrics.totalCarts)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Abandoned Carts</span>
                  <span className="text-sm font-medium">{formatNumber(cartMetrics.abandonedCarts)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Abandonment Rate</span>
                  <span className="text-sm font-medium">{formatPercentage(cartMetrics.abandonmentRate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Cart Value</span>
                  <span className="text-sm font-medium">{formatCurrency(cartMetrics.averageCartValue)}</span>
                </div>
              </>
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryMetrics && categoryMetrics.length > 0 ? (
              categoryMetrics.slice(0, 4).map((category: any, index: number) => (
                <div key={category.id} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{category.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(category.totalRevenue)}</span>
                </div>
              ))
            ) : (
              <Skeleton className="h-20 w-full" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;