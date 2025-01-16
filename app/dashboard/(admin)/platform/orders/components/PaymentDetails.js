import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";

export function PaymentDetails({ payment }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500">Status</span>
            <Badge variant={payment.status === 'captured' ? 'success' : 'warning'}>
              {payment.status}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500">Amount</span>
            <span className="font-medium">${payment.amount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-500">Payment Method</span>
            <span>{payment.provider}</span>
          </div>
          {payment.cardLast4 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Card</span>
              <span>•••• {payment.cardLast4}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 