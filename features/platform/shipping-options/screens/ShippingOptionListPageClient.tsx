"use client";

import { PageContainer } from "../../../dashboard/components/PageContainer";
import { Pagination } from "../../../dashboard/components/Pagination";
import { PlatformFilterBar } from "../../components/PlatformFilterBar";
import { StatusTabs } from "../components/StatusTabs";
import { ShippingOptionDetailsComponent } from "../components/ShippingOptionDetailsComponent";
import { CreateItemDrawerClientWrapper } from "../../components/CreateItemDrawerClientWrapper";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ShippingOption {
  id: string;
  name: string;
  uniqueKey: string;
  priceType: 'flat_rate' | 'calculated' | 'free';
  amount?: number;
  isReturn: boolean;
  adminOnly: boolean;
  region?: {
    id: string;
    name: string;
    code: string;
    currency: {
      code: string;
      symbol: string;
    };
  };
  fulfillmentProvider?: {
    id: string;
    name: string;
    code: string;
  };
  shippingProfile?: {
    id: string;
    name: string;
  };
  calculatedAmount?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ShippingOptionListPageClientProps {
  list: any;
  initialData: {
    items: ShippingOption[];
    count: number;
  };
  initialError?: string | null;
  initialSearchParams: {
    page: number;
    pageSize: number;
    search: string;
  };
  regionCounts: {
    all: number;
    regions: Array<{
      id: string;
      name: string;
      count: number;
    }>;
  };
}

export function ShippingOptionListPageClient({
  list,
  initialData,
  initialError,
  initialSearchParams,
  regionCounts,
}: ShippingOptionListPageClientProps) {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  if (initialError) {
    return (
      <PageContainer
        header={
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Shipping Options</h1>
            <p className="text-sm text-muted-foreground">
              Configure customer-facing shipping methods and pricing
            </p>
          </>
        }
      >
        <div className="text-red-600">Error loading shipping options: {initialError}</div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer
        header={
          <>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Shipping Options</h1>
              <p className="text-sm text-muted-foreground">
                Configure customer-facing shipping methods and pricing
              </p>
            </div>
          </>
        }
      >
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="px-4 md:px-6">
            <PlatformFilterBar 
              list={list}
              customCreateButton={
                <Button 
                  onClick={() => setIsCreateDrawerOpen(true)}
                  size="icon"
                  className="lg:px-4 lg:py-2 lg:w-auto rounded-lg"
                >
                  <Plus className="size-4 lg:mr-2" />
                  <span className="sr-only lg:not-sr-only lg:whitespace-nowrap">
                    Create Shipping Option
                  </span>
                </Button>
              }
            />
          </div>

          {/* Status Tabs */}
          <div className="border-b">
            <StatusTabs regionCounts={regionCounts} />
          </div>

          {/* Shipping Options List */}
          <div className="space-y-4">
            {initialData.items.length > 0 ? (
              initialData.items.map((shippingOption) => (
                <ShippingOptionDetailsComponent
                  key={shippingOption.id}
                  shippingOption={shippingOption}
                  list={list}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="space-y-2">
                  <p>No shipping options found</p>
                  <p className="text-sm">Create your first shipping option to get started.</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {initialData.count > initialSearchParams.pageSize && (
            <div className="px-4 md:px-6">
              <Pagination
                currentPage={initialSearchParams.page}
                totalItems={initialData.count}
                pageSize={initialSearchParams.pageSize}
              />
            </div>
          )}
        </div>
      </PageContainer>

      {/* Create Shipping Option Drawer */}
      <CreateItemDrawerClientWrapper
        listKey="shipping-options"
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSave={() => {
          setIsCreateDrawerOpen(false);
          // Page will refresh automatically
        }}
      />
    </>
  );
}