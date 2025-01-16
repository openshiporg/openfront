import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { Mail } from "lucide-react";

export function CustomerInfo({ customer }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Customer</CardTitle>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{customer.firstName} {customer.lastName}</h3>
            <p className="text-sm text-zinc-500">{customer.email}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Order History</h4>
            <div className="text-sm">
              <p>Total Orders: {customer.orders?.length || 0}</p>
              <p>Total Spent: ${customer.totalSpent || 0}</p>
            </div>
          </div>

          {customer.phone && (
            <div>
              <h4 className="text-sm font-medium">Contact</h4>
              <p className="text-sm">{customer.phone}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 