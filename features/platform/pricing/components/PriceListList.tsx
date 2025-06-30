"use client";

import { useState } from "react";
import { StatusTabs } from "../../components/StatusTabs";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { PriceListDetailsComponent } from "./PriceListDetailsComponent";
import { CreatePriceListDrawer } from "./drawers/CreatePriceListDrawer";
import { PriceList } from "../actions/price-list-actions";

interface PriceListListProps {
  data: {
    items: PriceList[];
    count: number;
  };
  statusCounts: Record<string, number>;
  list: any;
}

const statusConfig = {
  active: { label: "Active", color: "emerald" },
  draft: { label: "Draft", color: "zinc" },
  scheduled: { label: "Scheduled", color: "blue" },
  expired: { label: "Expired", color: "red" },
} as const;

export function PriceListList({ data, statusCounts, list }: PriceListListProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <PlatformFilterBar 
        list={list}
        createMode="dropdown"
        onCreateClick={() => setIsCreateDrawerOpen(true)}
        createLabel="Create Price List"
      />

      {/* Status Tabs */}
      <StatusTabs
        statusCounts={statusCounts}
        statusConfig={statusConfig}
        entityName="Price Lists"
      />

      {/* Price List Cards */}
      <div className="grid grid-cols-1 divide-y">
        {data.items.map((priceList) => (
          <PriceListDetailsComponent
            key={priceList.id}
            priceList={priceList}
            list={list}
          />
        ))}
      </div>

      {/* Create Drawer */}
      <CreatePriceListDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </div>
  );
}