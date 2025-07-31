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
    label: "Inactive",
    color: "zinc"
  },
} as const;

interface RegionStatusTabsProps {
  statusCounts: {
    all: number;
    active: number;
    inactive: number;
  };
}

export function RegionStatusTabs({ statusCounts }: RegionStatusTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [, updateScroll] = useState(0);

  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const statuses = [
    { value: "active", label: "Active", count: statusCounts.active },
    { value: "inactive", label: "Inactive", count: statusCounts.inactive },
  ] as const;

  // Get current status from URL - regions don't have a status field, so let's not use filtering
  let currentStatus = "all";

  const handleStatusChange = (status: string) => {
    // For now, don't actually filter since regions don't have a proper status field
    // Just keep the current page - status tabs are for display only
    console.log('Status changed to:', status);
  };

  const scrollToTab = (index: number) => {
    if (scrollContainerRef.current && tabRefs.current[index]) {
      const container = scrollContainerRef.current;
      const tab = tabRefs.current[index];
      if (tab) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = tab.getBoundingClientRect();
        const scrollLeft = container.scrollLeft;
        const targetScroll = scrollLeft + tabRect.left - containerRect.left - 20;
        
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleTabClick = (status: string, index: number) => {
    handleStatusChange(status);
    scrollToTab(index);
    updateScroll(prev => prev + 1);
  };

  const getStatusColor = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.color || "zinc";
  };

  const getStatusLabel = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig]?.label || status;
  };

  const baseTabStyles = "flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer";
  const activeTabStyles = "text-blue-600 border-blue-600 bg-blue-50/50 dark:text-blue-400 dark:border-blue-400 dark:bg-blue-900/20";
  const inactiveTabStyles = "text-muted-foreground border-transparent hover:text-foreground hover:border-gray-300 dark:hover:border-gray-600";

  return (
    <div className="px-4 md:px-6 border-b">
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All tab */}
        <div
          ref={el => tabRefs.current[0] = el}
          onClick={() => handleTabClick("all", 0)}
          onMouseEnter={() => setHoveredIndex(0)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`${baseTabStyles} ${
            currentStatus === "all" ? activeTabStyles : inactiveTabStyles
          }`}
        >
          <span>All</span>
          <Badge 
            variant="secondary" 
            className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            {statusCounts.all}
          </Badge>
        </div>

        {/* Status tabs */}
        {statuses.map((status, index) => (
          <div
            key={status.value}
            ref={el => tabRefs.current[index + 1] = el}
            onClick={() => handleTabClick(status.value, index + 1)}
            onMouseEnter={() => setHoveredIndex(index + 1)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`${baseTabStyles} ${
              currentStatus === status.value ? activeTabStyles : inactiveTabStyles
            }`}
          >
            <span>{getStatusLabel(status.value)}</span>
            <Badge 
              color={getStatusColor(status.value)}
              variant="secondary"
            >
              {status.count}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}