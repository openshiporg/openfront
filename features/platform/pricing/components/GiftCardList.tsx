"use client";

import { useState } from "react";
import { StatusTabs } from "../../components/StatusTabs";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { GiftCardDetailsComponent } from "./GiftCardDetailsComponent";
import { CreateGiftCardDrawer } from "./drawers/CreateGiftCardDrawer";
import { GiftCard } from "../actions/gift-card-actions";

interface GiftCardListProps {
  data: {
    items: GiftCard[];
    count: number;
  };
  statusCounts: Record<string, number>;
  list: any;
}

const statusConfig = {
  active: { label: "Active", color: "emerald" },
  depleted: { label: "Depleted", color: "yellow" },
  disabled: { label: "Disabled", color: "zinc" },
} as const;

export function GiftCardList({ data, statusCounts, list }: GiftCardListProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <PlatformFilterBar 
        list={list}
        createMode="dropdown"
        onCreateClick={() => setIsCreateDrawerOpen(true)}
        createLabel="Create Gift Card"
      />

      {/* Status Tabs */}
      <StatusTabs
        statusCounts={statusCounts}
        statusConfig={statusConfig}
        entityName="Gift Cards"
      />

      {/* Gift Card Cards */}
      <div className="grid grid-cols-1 divide-y">
        {data.items.map((giftCard) => (
          <GiftCardDetailsComponent
            key={giftCard.id}
            giftCard={giftCard}
            list={list}
          />
        ))}
      </div>

      {/* Create Drawer */}
      <CreateGiftCardDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />
    </div>
  );
}