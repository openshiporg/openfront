"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Check, Archive, X, AlertTriangle } from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: RotateCcw,
    iconColor: "text-blue-500",
    color: "blue"
  },
  completed: {
    label: "Completed",
    icon: Check,
    iconColor: "text-emerald-500",
    color: "emerald"
  },
  archived: {
    label: "Archived",
    icon: Archive,
    iconColor: "text-zinc-500",
    color: "zinc"
  },
  canceled: {
    label: "Canceled",
    icon: X,
    iconColor: "text-red-500",
    color: "rose"
  },
  requires_action: {
    label: "Requires Action",
    icon: AlertTriangle,
    iconColor: "text-orange-500",
    color: "orange"
  },
} as const;

interface StatusTabsProps {
  statusCounts: {
    all: number;
    pending: number;
    requires_action: number;
    completed: number;
    archived: number;
    canceled: number;
  };
  statusConfig?: Record<string, { label: string; color: string }>;
  entityName?: string;
}

export function StatusTabs({ statusCounts, entityName = "Items" }: StatusTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [, updateScroll] = useState(0);

  const tabRefs = useRef<Array<HTMLDivElement | null>>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const statuses = [
    { value: "pending", label: "Pending", count: statusCounts.pending },
    {
      value: "requires_action",
      label: "Requires Action",
      count: statusCounts.requires_action,
    },
    {
      value: "completed",
      label: "Completed",
      count: statusCounts.completed,
    },
    {
      value: "archived",
      label: "Archived",
      count: statusCounts.archived,
    },
    {
      value: "canceled",
      label: "Canceled",
      count: statusCounts.canceled,
    },
  ] as const;

  // Get current status from URL
  const statusFilter = searchParams.get("!status_matches");
  let currentStatus = "all";

  if (statusFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(statusFilter));
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Handle both old object format and new string format
        currentStatus = typeof parsed[0] === "object" ? parsed[0].value : parsed[0];
      }
    } catch (e) {
      // Invalid JSON in URL, ignore
    }
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("!status_matches");
    } else {
      // Just use the status value directly, not an object
      params.set("!status_matches", JSON.stringify([status]));
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
        className="absolute bottom-[-1px] h-[2px] bg-blue-500 transition-all duration-300 ease-out ml-4 md:ml-6"
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
              All {entityName}
              <span className="rounded-sm bg-background border shadow-xs px-1.5 py-0 text-[10px] leading-[14px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 inline-flex items-center h-[18px]">
                {statusCounts.all}
              </span>
            </div>
          </div>
          {statuses.map((status, index) => {
            const StatusIcon = statusConfig[status.value as keyof typeof statusConfig].icon;
            const iconColor = statusConfig[status.value as keyof typeof statusConfig].iconColor;
            
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
                  <StatusIcon className={`h-4 w-4 ${iconColor}`} />
                  {status.label}
                  <span className="rounded-sm bg-background border shadow-xs px-1.5 py-0 text-[10px] leading-[14px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 inline-flex items-center h-[18px]">
                    {status.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}