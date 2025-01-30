import React from "react";
import { gql } from "@keystone-6/core/admin-ui/apollo";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { PlusIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";

export function ReturnReasons({ reasons }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Return Reasons</CardTitle>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Reason
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reasons.map((reason) => (
            <div
              key={reason.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex-1 space-y-1 pr-4">
                <Input
                  value={reason.label}
                  className="font-medium"
                  placeholder="Return reason"
                />
                <Textarea
                  value={reason.description}
                  className="text-sm text-zinc-500"
                  placeholder="Description"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 