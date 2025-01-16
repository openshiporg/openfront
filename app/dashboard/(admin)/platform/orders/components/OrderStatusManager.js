import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

export function OrderStatusManager({ order, onUpdateStatus }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Order Status</CardTitle>
          <Badge>{order.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            value={order.status}
            onValueChange={(value) => onUpdateStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="requires_action">Requires Action</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" className="w-full">Cancel Order</Button>
            <Button className="w-full">Update Status</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 