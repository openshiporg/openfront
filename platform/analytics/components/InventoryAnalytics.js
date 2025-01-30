'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { Badge } from "@ui/badge";

export function InventoryAnalytics({ data }) {
  if (!data) return null;

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Inventory Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium">Total Products</p>
              <p className="text-2xl font-bold">{data.total || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Out of Stock</p>
              <p className="text-2xl font-bold">{data.outOfStock || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Low Stock</p>
              <p className="text-2xl font-bold">{data.lowStock || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold">${data.totalValue || 0}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Top Products</h3>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Order Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topProducts?.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={product.status === 'published' ? 'success' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.revenue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.orderCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.averageOrderValue}
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