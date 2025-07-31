import React from "react";
import {
  getSalesOverview,
  getCustomerAnalytics,
  getProductPerformance,
  getCartAnalytics,
  getRevenueTrends,
  getCategoryPerformance,
  getFulfillmentAnalytics,
  getRegionsAndCurrencies,
} from "../actions";
import {
  getDateRange,
  getPreviousPeriodRange,
  calculateSalesMetrics,
  calculateCustomerMetrics,
  calculateProductMetrics,
  calculateCartMetrics,
  calculateCategoryMetrics,
  calculateFulfillmentMetrics,
  generateTimeSeriesData,
  calculatePercentageChange,
  formatCurrency,
  formatPercentage,
  formatNumber,
  convertCurrency,
  Region,
} from "../lib/analyticsHelpers";
import { PageBreadcrumbs } from "@/features/dashboard/components/PageBreadcrumbs";
import { StatsCards } from "../components/StatsCards";
import { DateRangePickerWrapper } from "../components/DateRangePickerWrapper";
import { RegionalTabs } from "../components/RegionalTabs";
import { ConvertToTabs } from "../components/ConvertToTabs";
import { AnalyticsClientWrapper } from "../components/AnalyticsClientWrapper";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function AnalyticsListPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedPeriod = (resolvedSearchParams.period as string) || "30d";
  const selectedRegion = resolvedSearchParams.region as string;
  const conversionCurrency = (resolvedSearchParams.currency as string) || 'usd';

  // Check for custom date range
  const customStartDate = resolvedSearchParams.startDate as string;
  const customEndDate = resolvedSearchParams.endDate as string;

  let startDate: string;
  let endDate: string;

  if (customStartDate && customEndDate) {
    startDate = customStartDate;
    endDate = customEndDate;
  } else {
    const range = getDateRange(selectedPeriod);
    startDate = range.startDate;
    endDate = range.endDate;
  }

  // Get previous period range for comparison
  const previousRange = getPreviousPeriodRange(
    selectedPeriod,
    customStartDate,
    customEndDate
  );
  const previousStartDate = previousRange.startDate;
  const previousEndDate = previousRange.endDate;

  try {
    // Fetch all analytics data in parallel
    const [
      salesResponse,
      customerResponse,
      productResponse,
      cartResponse,
      revenueResponse,
      categoryResponse,
      fulfillmentResponse,
      regionsResponse,
    ] = await Promise.all([
      getSalesOverview(startDate, endDate, previousStartDate, previousEndDate, selectedRegion),
      getCustomerAnalytics(startDate, endDate, selectedRegion),
      getProductPerformance(startDate, endDate, selectedRegion),
      getCartAnalytics(startDate, endDate, previousStartDate, previousEndDate, selectedRegion),
      getRevenueTrends(startDate, endDate, selectedRegion),
      getCategoryPerformance(startDate, endDate, selectedRegion),
      getFulfillmentAnalytics(startDate, endDate, selectedRegion),
      getRegionsAndCurrencies(),
    ]);

    // Check for errors
    if (!salesResponse.success) {
      console.error("Sales data error:", salesResponse.error);
    }
    if (!customerResponse.success) {
      console.error("Customer data error:", customerResponse.error);
    }
    if (!productResponse.success) {
      console.error("Product data error:", productResponse.error);
    }
    if (!cartResponse.success) {
      console.error("Cart data error:", cartResponse.error);
    }
    if (!revenueResponse.success) {
      console.error("Revenue data error:", revenueResponse.error);
    }
    if (!categoryResponse.success) {
      console.error("Category data error:", categoryResponse.error);
    }
    if (!fulfillmentResponse.success) {
      console.error("Fulfillment data error:", fulfillmentResponse.error);
    }
    if (!regionsResponse.success) {
      console.error("Regions data error:", regionsResponse.error);
    }

    // Extract data or use fallbacks
    const salesData = salesResponse.success ? salesResponse.data : null;
    const customerData = customerResponse.success
      ? customerResponse.data
      : null;
    const productData = productResponse.success ? productResponse.data : null;
    const cartData = cartResponse.success ? cartResponse.data : null;
    const revenueData = revenueResponse.success ? revenueResponse.data : null;
    const categoryData = categoryResponse.success
      ? categoryResponse.data
      : null;
    const fulfillmentData = fulfillmentResponse.success
      ? fulfillmentResponse.data
      : null;
    const regionsData = regionsResponse.success ? regionsResponse.data : null;

    // Calculate metrics with previous period data
    let salesMetrics = salesData
      ? calculateSalesMetrics(salesData.orders, salesData.previousOrders)
      : null;

    // Convert metrics if in "All Regions" mode and not using USD
    if (salesMetrics && !selectedRegion && conversionCurrency !== 'usd') {
      const convertMetrics = (metrics: any) => {
        if (!metrics) return metrics;
        return {
          ...metrics,
          totalRevenue: convertCurrency(metrics.totalRevenue, 'usd', conversionCurrency),
          previousRevenue: metrics.previousRevenue !== undefined 
            ? convertCurrency(metrics.previousRevenue, 'usd', conversionCurrency)
            : undefined,
          averageOrderValue: convertCurrency(metrics.averageOrderValue, 'usd', conversionCurrency),
          previousAOV: metrics.previousAOV !== undefined
            ? convertCurrency(metrics.previousAOV, 'usd', conversionCurrency)
            : undefined,
        };
      };
      
      salesMetrics = convertMetrics(salesMetrics);
    }
    const customerMetrics =
      customerData && salesData
        ? calculateCustomerMetrics(customerData.users, salesData.orders)
        : null;
    const productMetrics = productData
      ? calculateProductMetrics(productData.orderLineItems)
      : null;
    const cartMetrics = cartData
      ? calculateCartMetrics(
          cartData.carts || [],
          cartData.completedOrders || 0,
          cartData.previousCarts || [],
          cartData.previousCompletedOrders || 0
        )
      : null;
    const categoryMetrics = categoryData
      ? calculateCategoryMetrics(categoryData.orderLineItems)
      : null;
    const fulfillmentMetrics = fulfillmentData
      ? calculateFulfillmentMetrics(
          fulfillmentData.fulfillments || [],
          fulfillmentData.shippedFulfillments || 0,
          fulfillmentData.canceledFulfillments || 0,
          fulfillmentData.activeShippingLabels || 0,
          fulfillmentData.returns || [],
          fulfillmentData.totalOrders || 0
        )
      : null;

    // Time series data for charts
    let timeSeriesData = revenueData
      ? generateTimeSeriesData(
          revenueData.orders,
          new Date(startDate),
          new Date(endDate),
          selectedPeriod === "12m" ? "month" : "day"
        )
      : [];

    // Convert time series data if in "All Regions" mode
    if (timeSeriesData.length > 0 && !selectedRegion && conversionCurrency !== 'usd') {
      timeSeriesData = timeSeriesData.map(item => ({
        ...item,
        revenue: convertCurrency(item.revenue, 'usd', conversionCurrency),
        displayRevenue: convertCurrency(item.displayRevenue, 'usd', conversionCurrency)
      }));
    }

    // Top products for chart
    let topProductsData = productMetrics
      ? productMetrics.slice(0, 10).map((product) => ({
          name:
            product.title.length > 20
              ? product.title.substring(0, 20) + "..."
              : product.title,
          revenue: product.totalRevenue / 100, // Convert from cents
          quantity: product.totalQuantitySold,
        }))
      : [];

    // Category performance data
    let categoryChartData = categoryMetrics
      ? categoryMetrics.slice(0, 8).map((category) => ({
          name: category.name,
          revenue: category.totalRevenue / 100,
          products: category.productCount,
        }))
      : [];

    // Convert product and category data if in "All Regions" mode
    if (!selectedRegion && conversionCurrency !== 'usd') {
      topProductsData = topProductsData.map(product => ({
        ...product,
        revenue: convertCurrency(product.revenue * 100, 'usd', conversionCurrency) / 100
      }));

      categoryChartData = categoryChartData.map(category => ({
        ...category,
        revenue: convertCurrency(category.revenue * 100, 'usd', conversionCurrency) / 100
      }));
    }

    // Extract regions for the selector
    const regions: Region[] = regionsData?.regions || [];

    // Extract currency symbol - handle "All Regions" with conversion currency
    const firstOrder = salesData?.orders?.[0];
    const selectedRegionData = selectedRegion 
      ? regions.find(r => r.code === selectedRegion)
      : null;
    
    // For "All Regions" (no selectedRegion), use the conversion currency
    let currencySymbol = '$'; // default
    if (!selectedRegion) {
      // All Regions mode - use conversion currency
      const conversionCurrencyMap: Record<string, string> = {
        'usd': '$',
        'eur': '€', 
        'gbp': '£'
      };
      currencySymbol = conversionCurrencyMap[conversionCurrency] || '$';
    } else {
      // Specific region selected
      currencySymbol = firstOrder?.currency?.symbol || 
                      selectedRegionData?.currency?.symbol || 
                      '$';
    }

    // Prepare stats data for the StatsCards component
    const statsData = [
      {
        name: "Total Revenue",
        value: salesMetrics
          ? `${currencySymbol}${(salesMetrics.totalRevenue / 100).toFixed(2)}`
          : `${currencySymbol}0.00`,
        previous:
          salesMetrics && salesMetrics.previousRevenue !== undefined
            ? `${currencySymbol}${(salesMetrics.previousRevenue / 100).toFixed(2)}`
            : `${currencySymbol}0.00`,
        change:
          salesMetrics && salesMetrics.previousRevenue !== undefined
            ? (() => {
                const change = calculatePercentageChange(
                  salesMetrics.totalRevenue,
                  salesMetrics.previousRevenue
                );
                return `${change.value.toFixed(1)}%`;
              })()
            : "0.0%",
        changeType:
          salesMetrics && salesMetrics.previousRevenue !== undefined
            ? ((calculatePercentageChange(
                salesMetrics.totalRevenue,
                salesMetrics.previousRevenue
              ).isPositive
                ? "positive"
                : "negative") as "positive" | "negative")
            : ("positive" as "positive" | "negative"),
      },
      {
        name: "Total Orders",
        value: salesMetrics ? formatNumber(salesMetrics.totalOrders) : "0",
        previous:
          salesMetrics && salesMetrics.previousOrders !== undefined
            ? formatNumber(salesMetrics.previousOrders)
            : "0",
        change:
          salesMetrics && salesMetrics.previousOrders !== undefined
            ? (() => {
                const change = calculatePercentageChange(
                  salesMetrics.totalOrders,
                  salesMetrics.previousOrders
                );
                return `${change.value.toFixed(1)}%`;
              })()
            : "0.0%",
        changeType:
          salesMetrics && salesMetrics.previousOrders !== undefined
            ? ((calculatePercentageChange(
                salesMetrics.totalOrders,
                salesMetrics.previousOrders
              ).isPositive
                ? "positive"
                : "negative") as "positive" | "negative")
            : ("positive" as "positive" | "negative"),
      },
      {
        name: "Average Order Value",
        value: salesMetrics
          ? `${currencySymbol}${(salesMetrics.averageOrderValue / 100).toFixed(2)}`
          : `${currencySymbol}0.00`,
        previous:
          salesMetrics && salesMetrics.previousAOV !== undefined
            ? `${currencySymbol}${(salesMetrics.previousAOV / 100).toFixed(2)}`
            : `${currencySymbol}0.00`,
        change:
          salesMetrics && salesMetrics.previousAOV !== undefined
            ? (() => {
                const change = calculatePercentageChange(
                  salesMetrics.averageOrderValue,
                  salesMetrics.previousAOV
                );
                return `${change.value.toFixed(1)}%`;
              })()
            : "0.0%",
        changeType:
          salesMetrics && salesMetrics.previousAOV !== undefined
            ? ((calculatePercentageChange(
                salesMetrics.averageOrderValue,
                salesMetrics.previousAOV
              ).isPositive
                ? "positive"
                : "negative") as "positive" | "negative")
            : ("positive" as "positive" | "negative"),
      },
      {
        name: "Conversion Rate",
        value: cartMetrics
          ? formatPercentage(cartMetrics.conversionRate)
          : "0.0%",
        previous:
          cartMetrics && cartMetrics.previousConversionRate !== undefined
            ? formatPercentage(cartMetrics.previousConversionRate)
            : "0.0%",
        change:
          cartMetrics && cartMetrics.previousConversionRate !== undefined
            ? (() => {
                const change = calculatePercentageChange(
                  cartMetrics.conversionRate,
                  cartMetrics.previousConversionRate
                );
                return `${change.value.toFixed(1)}%`;
              })()
            : "0.0%",
        changeType:
          cartMetrics && cartMetrics.previousConversionRate !== undefined
            ? ((calculatePercentageChange(
                cartMetrics.conversionRate,
                cartMetrics.previousConversionRate
              ).isPositive
                ? "positive"
                : "negative") as "positive" | "negative")
            : ("positive" as "positive" | "negative"),
      },
    ];

    const dashboardData = {
      salesMetrics,
      customerMetrics,
      productMetrics,
      cartMetrics,
      categoryMetrics,
      timeSeriesData,
      topProductsData,
      categoryChartData,
      selectedPeriod,
    };

    return (
      <section
        aria-label="Analytics overview"
        className="overflow-hidden flex flex-col"
      >
        <PageBreadcrumbs
          items={[
            {
              type: "link",
              label: "Dashboard",
              href: "/",
            },
            {
              type: "page",
              label: "Platform",
            },
            {
              type: "page",
              label: "Analytics",
            },
          ]}
        />

        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-4 md:px-6 pt-4 md:pt-6 pb-4 flex items-center justify-between border-gray-200 dark:border-gray-800">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                Analytics
              </h1>
              <p className="text-muted-foreground">
                Track your e-commerce performance and key metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <DateRangePickerWrapper />
            </div>
          </div>

          {/* Regional Tabs */}
          <div className="px-6 pb-4">
            {regions.length > 0 && (
              <RegionalTabs 
                regions={regions} 
                selectedRegion={selectedRegion}
              />
            )}
          </div>

          {/* Convert To Tabs */}
          <div className="px-6 pb-4">
            <ConvertToTabs />
          </div>

          {/* Stats Cards */}
          <div className="px-6">
            <StatsCards
              data={statsData}
              loading={!salesMetrics && !cartMetrics}
            />
          </div>

          <div className="p-6 space-y-6">
            <AnalyticsClientWrapper
              salesMetrics={salesMetrics}
              customerMetrics={customerMetrics}
              productMetrics={productMetrics}
              cartMetrics={cartMetrics}
              categoryMetrics={categoryMetrics}
              fulfillmentMetrics={fulfillmentMetrics}
              timeSeriesData={timeSeriesData}
              topProductsData={topProductsData}
              categoryChartData={categoryChartData}
              selectedPeriod={selectedPeriod}
              currencySymbol={currencySymbol}
              initialConvertTo={conversionCurrency}
            />
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error loading analytics:", error);
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-red-600">
          Analytics Error
        </h1>
        <p className="mt-2 text-gray-600">
          Failed to load analytics data. Please try again later.
        </p>
      </div>
    );
  }
}
