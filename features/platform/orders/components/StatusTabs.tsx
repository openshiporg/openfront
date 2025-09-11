"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "Pending",
    dotClass: "bg-blue-500 dark:bg-blue-400 outline-3 -outline-offset-1 outline-blue-100 dark:outline-blue-900/50"
  },
  completed: {
    label: "Completed",
    dotClass: "bg-green-500 dark:bg-green-400 outline-3 -outline-offset-1 outline-green-100 dark:outline-green-900/50"
  },
  archived: {
    label: "Archived",
    dotClass: "bg-zinc-500 dark:bg-zinc-400 outline-3 -outline-offset-1 outline-zinc-100 dark:outline-zinc-900/50"
  },
  canceled: {
    label: "Canceled",
    dotClass: "bg-red-500 dark:bg-red-400 outline-3 -outline-offset-1 outline-red-100 dark:outline-red-900/50"
  },
  requires_action: {
    label: "Requires Action",
    dotClass: "bg-orange-500 dark:bg-orange-400 outline-3 -outline-offset-1 outline-orange-100 dark:outline-orange-900/50"
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
              All Orders
              <span className="rounded-sm bg-background border shadow-xs px-1.5 py-0 text-[10px] leading-[14px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 inline-flex items-center h-[18px]">
                {statusCounts.all}
              </span>
            </div>
          </div>
          {statuses.map((status, index) => {
            const dotClass = statusConfig[status.value as keyof typeof statusConfig].dotClass;
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
                  <span className={cn(
                    "inline-block size-2 shrink-0 rounded-full outline",
                    dotClass
                  )} />
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