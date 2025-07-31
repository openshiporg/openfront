'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Region } from '../lib/analyticsHelpers';

interface RegionalTabsProps {
  regions: Region[];
  selectedRegion?: string;
  className?: string;
}

export function RegionalTabs({ regions, selectedRegion, className }: RegionalTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get the current conversion currency for "All Regions"
  const conversionCurrency = searchParams.get('currency') || 'usd';

  const handleRegionChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === 'all') {
      params.delete('region');
      // Keep the currency conversion setting
      if (!params.has('currency')) {
        params.set('currency', 'usd');
      }
    } else {
      params.set('region', value);
      // Remove currency conversion when selecting specific region
      params.delete('currency');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCurrencyChange = (currency: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('currency', currency);
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentTab = selectedRegion || 'all';

  // Available currencies for conversion
  const currencies = [
    { code: 'usd', symbol: '$', name: 'USD' },
    { code: 'eur', symbol: '€', name: 'EUR' },
    { code: 'gbp', symbol: '£', name: 'GBP' },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Tabs value={currentTab} onValueChange={handleRegionChange}>
        <TabsList className="grid grid-cols-4 w-auto h-auto p-1">
          <TabsTrigger 
            value="all" 
            className="px-6 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All Regions
          </TabsTrigger>
          {regions.map((region) => (
            <TabsTrigger 
              key={region.code} 
              value={region.code}
              className="px-6 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {region.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Currency conversion toggle - only show when "All Regions" is selected */}
      {/* {currentTab === 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Convert to:</span>
          <ToggleGroup 
            type="single" 
            value={conversionCurrency} 
            onValueChange={handleCurrencyChange}
            className="border rounded-md"
          >
            {currencies.map((currency) => (
              <ToggleGroupItem 
                key={currency.code} 
                value={currency.code}
                className="px-3 py-1 text-xs font-medium data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {currency.symbol} {currency.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )} */}
    </div>
  );
}