import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";
import { formatDistance } from "date-fns";

export function UsageStats({ stats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Total Uses</p>
            <p className="text-2xl font-bold">{stats.totalUses}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Total Revenue</p>
            <p className="text-2xl font-bold">${stats.totalRevenue}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-zinc-500">Average Order Value</p>
            <p className="text-2xl font-bold">${stats.averageOrderValue}</p>
          </div>

          <div className="col-span-3">
            <h4 className="mb-2 font-medium">Recent Usage</h4>
            <div className="space-y-2">
              {stats.recentUses.map((use) => (
                <div key={use.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{use.orderId}</p>
                    <p className="text-sm text-zinc-500">
                      {formatDistance(new Date(use.usedAt), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge>${use.discountAmount}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 