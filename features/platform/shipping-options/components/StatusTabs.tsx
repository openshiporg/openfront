"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  active: {
    label: "Active",
    color: "emerald"
  },
  inactive: {
    label: "Admin Only",
    color: "zinc"
  },
  return: {
    label: "Return Options",
    color: "blue"
  },
} as const;

interface StatusTabsProps {
  statusCounts: {
    all: number;
    active: number;
    inactive: number;
    return: number;
  };
}

export function StatusTabs({ statusCounts }: StatusTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [, updateScroll] = useState(0);

  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const statuses = [
    { value: "active", label: "Active", count: statusCounts.active },
    { value: "inactive", label: "Admin Only", count: statusCounts.inactive },
    { value: "return", label: "Return Options", count: statusCounts.return },
  ] as const;

  // Get current status from URL - handle multiple possible filters
  const adminOnlyFilter = searchParams.get("!adminOnly_is");
  const isReturnFilter = searchParams.get("!isReturn_is");
  let currentStatus = "all";

  if (isReturnFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(isReturnFilter));
      if (parsed === true) {
        currentStatus = "return";
      }
    } catch (e) {
      // Invalid JSON in URL, ignore
    }
  } else if (adminOnlyFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(adminOnlyFilter));
      if (parsed === true) {
        currentStatus = "inactive";
      } else if (parsed === false) {
        currentStatus = "active";
      }
    } catch (e) {
      // Invalid JSON in URL, ignore
    }
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 when changing status
    params.set("page", "1");
    
    // Clear all status filters first
    params.delete("!adminOnly_is");
    params.delete("!isReturn_is");
    
    if (status === "all") {
      // No filters needed for "all"
    } else if (status === "active") {
      params.set("!adminOnly_is", JSON.stringify(false));
    } else if (status === "inactive") {
      params.set("!adminOnly_is", JSON.stringify(true));
    } else if (status === "return") {
      params.set("!isReturn_is", JSON.stringify(true));
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleScroll = () => {
    updateScroll(n => n + 1);
  };

  const activeIndex = currentStatus === "all" ? 0 : statuses.findIndex((s) => s.value === currentStatus) + 1;
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
              currentStatus === "all"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleStatusChange("all")}
          >
            <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2">
              All Shipping Options
              <span className="rounded-sm bg-background border shadow-xs px-1.5 py-0 text-[10px] leading-[14px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 inline-flex items-center h-[18px]">
                {statusCounts.all}
              </span>
            </div>
          </div>
          {statuses.map((status, index) => {
            return (
              <div
                key={status.value}
                ref={el => { tabRefs.current[index + 1] = el }}
                className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
                  currentStatus === status.value
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                onMouseEnter={() => setHoveredIndex(index + 1)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleStatusChange(status.value)}
              >
                <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2">
                  {status.label}
                  <Badge color={statusConfig[status.value as keyof typeof statusConfig].color} className="px-1.5 py-0 text-[10px] leading-[14px] rounded-sm shadow-xs inline-flex items-center h-[18px]">
                    {status.count}
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