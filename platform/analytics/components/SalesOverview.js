'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SalesOverview({ data, detailed = false }) {
  if (!data) return null;

  return (
    <Card className={detailed ? 'col-span-2' : ''}>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">${data.total || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Average Order Value</p>
              <p className="text-2xl font-bold">${data.averageOrderValue || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Orders</p>
              <p className="text-2xl font-bold">{data.count || 0}</p>
            </div>
          </div>

          {detailed && (
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium">Subtotal</p>
                <p className="text-xl font-bold">${data.subtotal || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Shipping</p>
                <p className="text-xl font-bold">${data.shipping || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tax</p>
                <p className="text-xl font-bold">${data.tax || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Discounts</p>
                <p className="text-xl font-bold">${data.discount || 0}</p>
              </div>
            </div>
          )}

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#8884d8" name="Revenue" />
                {detailed && (
                  <>
                    <Bar dataKey="subtotal" fill="#82ca9d" name="Subtotal" />
                    <Bar dataKey="shipping" fill="#ffc658" name="Shipping" />
                    <Bar dataKey="tax" fill="#ff8042" name="Tax" />
                    <Bar dataKey="discount" fill="#ff7300" name="Discounts" />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 