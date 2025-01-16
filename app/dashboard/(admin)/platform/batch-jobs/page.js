'use client';

import React from 'react';
import { Card, CardContent } from "@ui/card";
import { Button } from "@ui/button";
import { CircleIcon, SquareIcon, TriangleIcon } from "lucide-react";

export default function BatchJobsPage() {
  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold">Batch Jobs</h1>
        <p className="text-sm text-zinc-500">
          Manage long-running operations and bulk updates
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex items-center gap-4 text-zinc-800">
            <CircleIcon className="h-10 w-10 animate-pulse" />
            <SquareIcon className="h-10 w-10 animate-pulse delay-150" />
            <TriangleIcon className="h-10 w-10 animate-pulse delay-300" />
          </div>
          <div className="mt-6 max-w-md">
            <h3 className="text-lg font-semibold">Batch Jobs Coming Soon</h3>
            <p className="mt-2 text-sm text-zinc-500">
              We're working on adding support for batch operations. In the meantime, 
              please use our GraphQL API for your operations.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.open('/api/graphql', '_blank')}
            >
              Open GraphQL API
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 