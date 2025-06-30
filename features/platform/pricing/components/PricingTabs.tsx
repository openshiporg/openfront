"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, BadgeDollarSign, Gift } from "lucide-react";
import { Discount } from "../actions/discount-actions";
import { GiftCard } from "../actions/gift-card-actions";
import { PriceList } from "../actions/price-list-actions";

// Import the individual components for each tab
import { DiscountList } from "./DiscountList";
import { GiftCardList } from "./GiftCardList";
import { PriceListList } from "./PriceListList";

export type TabType = 'discounts' | 'gift-cards' | 'price-lists';

interface PricingTabsProps {
  initialTab?: TabType;
  discountData: {
    items: Discount[];
    count: number;
  };
  giftCardData: {
    items: GiftCard[];
    count: number;
  };
  priceListData: {
    items: PriceList[];
    count: number;
  };
  statusCounts: {
    discounts: Record<string, number>;
    giftCards: Record<string, number>;
    priceLists: Record<string, number>;
  };
  list: any; // List configuration
}

export function PricingTabs({
  initialTab = 'discounts',
  discountData,
  giftCardData,
  priceListData,
  statusCounts,
  list
}: PricingTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get active tab from URL or use initial
  const activeTab = (searchParams.get('tab') as TabType) || initialTab;
  
  // Handle tab change with URL manipulation
  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tab === 'discounts') {
      // Remove tab param for default tab
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    
    // Keep other params like search, page, etc.
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline">Discounts</span>
            <span className="inline sm:hidden">Discounts</span>
            <span className="text-xs text-muted-foreground">
              ({discountData.count})
            </span>
          </TabsTrigger>
          
          <TabsTrigger value="price-lists" className="flex items-center gap-2">
            <BadgeDollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Price Lists</span>
            <span className="inline sm:hidden">Price Lists</span>
            <span className="text-xs text-muted-foreground">
              ({priceListData.count})
            </span>
          </TabsTrigger>
          
          <TabsTrigger value="gift-cards" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">Gift Cards</span>
            <span className="inline sm:hidden">Gift Cards</span>
            <span className="text-xs text-muted-foreground">
              ({giftCardData.count})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discounts" className="mt-6">
          <DiscountList 
            data={discountData}
            statusCounts={statusCounts.discounts}
            list={list}
          />
        </TabsContent>

        <TabsContent value="price-lists" className="mt-6">
          <PriceListList 
            data={priceListData}
            statusCounts={statusCounts.priceLists}
            list={list}
          />
        </TabsContent>

        <TabsContent value="gift-cards" className="mt-6">
          <GiftCardList 
            data={giftCardData}
            statusCounts={statusCounts.giftCards}
            list={list}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}