"use client";

import { useState } from "react";
import { StatusTabs } from "../../components/StatusTabs";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { DiscountDetailsComponent } from "./DiscountDetailsComponent";
import { CreateDiscountDrawer } from "./drawers/CreateDiscountDrawer";
import { Discount } from "../actions/discount-actions";

interface DiscountListProps {
  data: {
    items: Discount[];
    count: number;
  };
  statusCounts: Record<string, number>;
  list: any;
}

const statusConfig = {
  active: { label: "Active", color: "emerald" },
  disabled: { label: "Disabled", color: "zinc" },
  expired: { label: "Expired", color: "red" },
} as const;

export function DiscountList({ data, statusCounts, list }: DiscountListProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <PlatformFilterBar 
        list={list}
        createMode="dropdown"
        onCreateClick={() => setIsCreateDrawerOpen(true)}
        createLabel="Create Discount"
      />

      {/* Status Tabs */}
      <StatusTabs
        statusCounts={statusCounts}
        statusConfig={statusConfig}
        entityName="Discounts"
      />

      {/* Discount Cards */}
      <div className="grid grid-cols-1 divide-y">
        {data.items.map((discount) => (
          <DiscountDetailsComponent
            key={discount.id}
            discount={discount}
            list={list}
          />
        ))}
      </div>

      {/* Create Drawer */}
      <CreateDiscountDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </div>
  );
}