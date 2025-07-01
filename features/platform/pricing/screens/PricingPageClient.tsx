"use client";

import { PageContainer } from "../../../dashboard/components/PageContainer";
import { PricingTabs, TabType } from "../components/PricingTabs";
import { Discount } from "../actions/discount-actions";
import { PriceList } from "../actions/price-list-actions";
import { GiftCard } from "../actions/gift-card-actions";

interface PricingPageClientProps {
  list: any;
  initialTab: TabType;
  discountData: {
    items: Discount[];
    count: number;
  };
  priceListData: {
    items: PriceList[];
    count: number;
  };
  giftCardData: {
    items: GiftCard[];
    count: number;
  };
  statusCounts: {
    discounts: Record<string, number>;
    priceLists: Record<string, number>;
    giftCards: Record<string, number>;
  };
  initialSearchParams: {
    page: number;
    pageSize: number;
    search: string;
  };
  initialErrors?: string[] | null;
}

export function PricingPageClient({
  list,
  initialTab,
  discountData,
  priceListData,
  giftCardData,
  statusCounts,
  initialSearchParams,
  initialErrors,
}: PricingPageClientProps) {
  
  if (initialErrors && initialErrors.length > 0) {
    console.error('Pricing & Promotions errors:', initialErrors);
  }

  return (
    <PageContainer
      header={
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Pricing & Promotions</h1>
          <p className="text-sm text-muted-foreground">
            Manage discounts, price lists, and gift cards for your store
          </p>
        </>
      }
    >
      <PricingTabs
        initialTab={initialTab}
        discountData={discountData}
        priceListData={priceListData}
        giftCardData={giftCardData}
        statusCounts={statusCounts}
        list={list}
      />
    </PageContainer>
  );
}