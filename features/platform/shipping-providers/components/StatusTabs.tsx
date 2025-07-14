"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";


interface StatusTabsProps {
  regionCounts: {
    all: number;
    regions: Array<{
      id: string;
      name: string;
      count: number;
    }>;
  };
}

export function StatusTabs({ regionCounts }: StatusTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [, updateScroll] = useState(0);

  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const regions = regionCounts.regions.map(region => ({
    value: region.id,
    label: region.name,
    count: region.count,
  }));

  // Get current region from URL - region filter
  const regionFilter = searchParams.get("!regions_some");
  let currentRegion = "all";

  if (regionFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(regionFilter));
      if (typeof parsed === "object" && parsed.id) {
        currentRegion = parsed.id;
      }
    } catch (e) {
      // Invalid JSON in URL, ignore
    }
  }

  const handleRegionChange = (regionId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 when changing region
    params.set("page", "1");
    
    if (regionId === "all") {
      params.delete("!regions_some");
    } else {
      params.set("!regions_some", JSON.stringify({ id: regionId }));
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleScroll = () => {
    updateScroll(n => n + 1);
  };

  const activeIndex = currentRegion === "all" ? 0 : regions.findIndex((r) => r.value === currentRegion) + 1;
  const activeTabOffsetLeft = tabRefs.current[activeIndex]?.offsetLeft || 0;
  const activeTabWidth = tabRefs.current[activeIndex]?.offsetWidth || 0;
  const scrollOffset = scrollContainerRef.current ? scrollContainerRef.current.scrollLeft : 0;

  return (
    <div className="relative">
      <div
        className="absolute h-[28px] mt-1 transition-all duration-300 ease-out bg-muted/60 rounded-[6px] flex items-center ml-4 md:ml-6"
        style={{
          left: `${hoveredIndex !== null ? (tabRefs.current[hoveredIndex]?.offsetLeft || 0) - scrollOffset : 0}px`,
          width: `${hoveredIndex !== null ? tabRefs.current[hoveredIndex]?.offsetWidth || 0 : 0}px`,
          opacity: hoveredIndex !== null ? 1 : 0,
        }}
      />

      <div
        className="absolute bottom-[-1px] h-[2px] bg-foreground transition-all duration-300 ease-out ml-4 md:ml-6"
        style={{
          left: `${activeTabOffsetLeft - scrollOffset}px`,
          width: `${activeTabWidth}px`,
        }}
      />

      <div ref={scrollContainerRef} onScroll={handleScroll} className="w-full overflow-x-auto no-scrollbar px-4 md:px-6">
        <div className="relative flex space-x-[6px] items-center pb-1">
          <div
            ref={el => { tabRefs.current[0] = el }}
            className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
              currentRegion === "all"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleRegionChange("all")}
          >
            <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2">
              All Regions
              <span className="rounded-sm bg-background border shadow-xs px-1.5 py-0 text-[10px] leading-[14px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 inline-flex items-center h-[18px]">
                {regionCounts.all}
              </span>
            </div>
          </div>
          {regions.map((region, index) => {
            return (
              <div
                key={region.value}
                ref={el => { tabRefs.current[index + 1] = el }}
                className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
                  currentRegion === region.value
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                onMouseEnter={() => setHoveredIndex(index + 1)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleRegionChange(region.value)}
              >
                <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2">
                  {region.label}
                  <Badge color="blue" className="px-1.5 py-0 text-[10px] leading-[14px] rounded-sm shadow-xs inline-flex items-center h-[18px]">
                    {region.count}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}