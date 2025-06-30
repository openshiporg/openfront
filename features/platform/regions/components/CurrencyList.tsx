"use client";

import { useState } from "react";
import { StatusTabs } from "../../components/StatusTabs";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { CurrencyDetailsComponent } from "./CurrencyDetailsComponent";
import { CreateCurrencyDrawer } from "./drawers/CreateCurrencyDrawer";
import { Currency } from "../actions/currency-actions";

interface CurrencyListProps {
  data: {
    items: Currency[];
    count: number;
  };
  statusCounts: Record<string, number>;
  list: any;
}

const statusConfig = {
  active: { label: "Active", color: "emerald" },
  unused: { label: "Unused", color: "zinc" },
} as const;

export function CurrencyList({ data, statusCounts, list }: CurrencyListProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <PlatformFilterBar 
        list={list}
        createMode="dropdown"
        onCreateClick={() => setIsCreateDrawerOpen(true)}
        createLabel="Add Currency"
      />

      {/* Status Tabs */}
      <StatusTabs
        statusCounts={statusCounts}
        statusConfig={statusConfig}
        entityName="Currencies"
      />

      {/* Currency Cards */}
      <div className="grid grid-cols-1 divide-y">
        {data.items.map((currency) => (
          <CurrencyDetailsComponent
            key={currency.id}
            currency={currency}
            list={list}
          />
        ))}
      </div>

      {/* Create Drawer */}
      <CreateCurrencyDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </div>
  );
}