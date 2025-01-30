'use client';

import React from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { SalesOverview } from "./components/SalesOverview";
import { InventoryAnalytics } from "./components/InventoryAnalytics";
import { CustomerMetrics } from "./components/CustomerMetrics";
import { OrderAnalytics } from "./components/OrderAnalytics";

const ANALYTICS_QUERY = gql`
  query GetAnalytics($timeframe: String!) {
    getAnalytics
  }
`;

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = React.useState("7d");
  const { data, loading } = useQuery(ANALYTICS_QUERY, {
    variables: { timeframe },
  });

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-zinc-500">
          Monitor your store's performance and metrics
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <div className="mt-4 grid grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data?.getAnalytics?.sales?.total || 0}
              </div>
              <p className="text-xs text-zinc-500">
                {data?.getAnalytics?.sales?.count || 0} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data?.getAnalytics?.inventory?.totalValue || 0}
              </div>
              <p className="text-xs text-zinc-500">
                {data?.getAnalytics?.inventory?.outOfStock || 0} out of stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.getAnalytics?.customers?.total || 0}
              </div>
              <p className="text-xs text-zinc-500">
                {data?.getAnalytics?.customers?.new || 0} new this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.getAnalytics?.orders?.total || 0}
              </div>
              <p className="text-xs text-zinc-500">
                {data?.getAnalytics?.orders?.byStatus?.pending || 0} pending
              </p>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SalesOverview data={data?.getAnalytics?.sales} />
            <OrderAnalytics data={data?.getAnalytics?.orders} />
          </div>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <SalesOverview data={data?.getAnalytics?.sales} detailed />
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <InventoryAnalytics data={data?.getAnalytics?.inventory} />
        </TabsContent>

        <TabsContent value="customers" className="mt-4">
          <CustomerMetrics data={data?.getAnalytics?.customers} />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <OrderAnalytics data={data?.getAnalytics?.orders} detailed />
        </TabsContent>
      </Tabs>
    </div>
  );
} 