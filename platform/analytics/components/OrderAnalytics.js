'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@ui/badge";

const statusVariants = {
  pending: 'warning',
  completed: 'success',
  canceled: 'destructive',
  requires_action: 'secondary',
};

const fulfillmentStatusVariants = {
  not_fulfilled: 'warning',
  partially_fulfilled: 'secondary',
  fulfilled: 'success',
  shipped: 'success',
  partially_shipped: 'secondary',
  partially_returned: 'warning',
  returned: 'destructive',
  canceled: 'destructive',
  requires_action: 'warning',
};

const paymentStatusVariants = {
  not_paid: 'warning',
  awaiting: 'secondary',
  captured: 'success',
  partially_refunded: 'warning',
  refunded: 'destructive',
  canceled: 'destructive',
  requires_action: 'warning',
};

export function OrderAnalytics({ data, detailed = false }) {
  if (!data) return null;

  return (
    <Card className={detailed ? 'col-span-2' : ''}>
      <CardHeader>
        <CardTitle>Order Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold">{data.total || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Pending Orders</p>
              <p className="text-2xl font-bold">{data.byStatus?.pending || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Completed Orders</p>
              <p className="text-2xl font-bold">{data.byStatus?.completed || 0}</p>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Orders" />
                {detailed && (
                  <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Revenue" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {detailed && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-2">Order Status Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Order Status</h4>
                    <div className="space-y-2">
                      {Object.entries(data.byStatus || {}).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <Badge variant={statusVariants[status] || 'secondary'}>
                            {status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Fulfillment Status</h4>
                    <div className="space-y-2">
                      {Object.entries(data.byFulfillmentStatus || {}).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <Badge variant={fulfillmentStatusVariants[status] || 'secondary'}>
                            {status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Payment Status</h4>
                    <div className="space-y-2">
                      {Object.entries(data.byPaymentStatus || {}).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <Badge variant={paymentStatusVariants[status] || 'secondary'}>
                            {status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Order Timeline</h3>
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.timeline?.map((day) => (
                        <tr key={day.date}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {day.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${day.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 