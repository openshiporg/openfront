'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CustomerMetrics({ data }) {
  if (!data) return null;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Customer Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-bold">{data.total || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">New Customers</p>
              <p className="text-2xl font-bold">{data.new || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Customers</p>
              <p className="text-2xl font-bold">{data.active || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Avg. Lifetime Value</p>
              <p className="text-2xl font-bold">${data.averageLifetimeValue || 0}</p>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newUsers" stroke="#8884d8" name="New Customers" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Customer Growth</h3>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Customers
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
                        {day.newUsers}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 