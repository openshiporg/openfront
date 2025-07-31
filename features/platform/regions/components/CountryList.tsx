"use client";

import { useState } from "react";
import { StatusTabs } from "../../components/StatusTabs";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { CountryDetailsComponent } from "./CountryDetailsComponent";
import { CreateCountryDrawer } from "./drawers/CreateCountryDrawer";
import { Country } from "../actions/country-actions";

interface CountryListProps {
  data: {
    items: Country[];
    count: number;
  };
  statusCounts: Record<string, number>;
  list: any;
}

const statusConfig = {
  assigned: { label: "Assigned", color: "emerald" },
  unassigned: { label: "Unassigned", color: "zinc" },
} as const;

export function CountryList({ data, statusCounts, list }: CountryListProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <PlatformFilterBar 
        list={list}
        createMode="dropdown"
        onCreateClick={() => setIsCreateDrawerOpen(true)}
        createLabel="Add Country"
      />

      {/* Status Tabs */}
      <StatusTabs
        statusCounts={statusCounts}
        statusConfig={statusConfig}
        entityName="Countries"
      />

      {/* Country Cards */}
      <div className="grid grid-cols-1 divide-y">
        {data.items.map((country) => (
          <CountryDetailsComponent
            key={country.id}
            country={country}
            list={list}
          />
        ))}
      </div>

      {/* Create Drawer */}
      <CreateCountryDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </div>
  );
}