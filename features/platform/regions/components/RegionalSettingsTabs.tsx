"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, MapPin, DollarSign } from "lucide-react";
import { Region } from "../actions";
import { Country } from "../actions/country-actions";
import { Currency } from "../actions/currency-actions";

// Import the individual components for each tab
import { RegionList } from "./RegionList";
import { CountryList } from "./CountryList";
import { CurrencyList } from "./CurrencyList";

export type TabType = 'regions' | 'countries' | 'currencies';

interface RegionalSettingsTabsProps {
  initialTab?: TabType;
  regionData: {
    items: Region[];
    count: number;
  };
  countryData: {
    items: Country[];
    count: number;
  };
  currencyData: {
    items: Currency[];
    count: number;
  };
  statusCounts: {
    regions: Record<string, number>;
    countries: Record<string, number>;
    currencies: Record<string, number>;
  };
  list: any; // List configuration
}

export function RegionalSettingsTabs({
  initialTab = 'regions',
  regionData,
  countryData,
  currencyData,
  statusCounts,
  list
}: RegionalSettingsTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get active tab from URL or use initial
  const activeTab = (searchParams.get('tab') as TabType) || initialTab;
  
  // Handle tab change with URL manipulation
  const handleTabChange = (tab: TabType) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tab === 'regions') {
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
          <TabsTrigger value="regions" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Regions</span>
            <span className="inline sm:hidden">Regions</span>
            <span className="text-xs text-muted-foreground">
              ({regionData.count})
            </span>
          </TabsTrigger>
          
          <TabsTrigger value="countries" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Countries</span>
            <span className="inline sm:hidden">Countries</span>
            <span className="text-xs text-muted-foreground">
              ({countryData.count})
            </span>
          </TabsTrigger>
          
          <TabsTrigger value="currencies" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Currencies</span>
            <span className="inline sm:hidden">Currencies</span>
            <span className="text-xs text-muted-foreground">
              ({currencyData.count})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regions" className="mt-6">
          <RegionList 
            data={regionData}
            statusCounts={statusCounts.regions}
            list={list}
          />
        </TabsContent>

        <TabsContent value="countries" className="mt-6">
          <CountryList 
            data={countryData}
            statusCounts={statusCounts.countries}
            list={list}
          />
        </TabsContent>

        <TabsContent value="currencies" className="mt-6">
          <CurrencyList 
            data={currencyData}
            statusCounts={statusCounts.currencies}
            list={list}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}