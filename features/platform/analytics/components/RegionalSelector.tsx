'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Region, getRegionFlag } from '../lib/analyticsHelpers';

interface RegionalSelectorProps {
  regions: Region[];
  selectedRegion?: string;
  className?: string;
}

export function RegionalSelector({ regions, selectedRegion, className }: RegionalSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRegionChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === 'all') {
      params.delete('region');
    } else {
      params.set('region', value);
    }
    
    // Reset to first page when region changes
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const getDisplayValue = () => {
    if (!selectedRegion || selectedRegion === 'all') {
      return 'All Regions (Converted to USD)';
    }
    
    const region = regions.find(r => r.code === selectedRegion);
    if (region) {
      return `${getRegionFlag(region.code)} ${region.name} (${region.currency.symbol}${region.currency.code.toUpperCase()})`;
    }
    
    return 'Select Region';
  };

  return (
    <Select value={selectedRegion || 'all'} onValueChange={handleRegionChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="All Regions">
          {getDisplayValue()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <div className="flex items-center gap-2">
            <span>🌍</span>
            <span>All Regions (Converted to USD)</span>
          </div>
        </SelectItem>
        {regions.map((region) => (
          <SelectItem key={region.id} value={region.code}>
            <div className="flex items-center gap-2">
              <span>{getRegionFlag(region.code)}</span>
              <span>{region.name}</span>
              <span className="text-muted-foreground">
                ({region.currency.symbol}{region.currency.code.toUpperCase()})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}