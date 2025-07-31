'use client';

import { StatusTabs as SharedStatusTabs } from '../../components/StatusTabs';

interface InventoryStatusTabsProps {
  statusCounts: {
    all: number;
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
    backordered: number;
  };
}

const statusConfig = {
  in_stock: { label: "In Stock", color: "emerald" },
  low_stock: { label: "Low Stock", color: "yellow" },
  out_of_stock: { label: "Out of Stock", color: "red" },
  backordered: { label: "Backordered", color: "purple" }
};

export function StatusTabs({ statusCounts }: InventoryStatusTabsProps) {
  return (
    <SharedStatusTabs
      statusCounts={statusCounts}
      statusConfig={statusConfig}
      entityName="Items"
    />
  );
}