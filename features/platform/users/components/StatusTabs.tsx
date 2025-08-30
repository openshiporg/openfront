"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

const statusConfig = {
  withAccount: {
    label: "With Account",
    color: "emerald"
  },
  withoutAccount: {
    label: "Without Account",
    color: "zinc"
  },
} as const;

interface StatusTabsProps {
  statusCounts: {
    all: number;
    withAccount: number;
    withoutAccount: number;
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
    { value: "withAccount", label: "With Account", count: statusCounts.withAccount },
    { value: "withoutAccount", label: "Without Account", count: statusCounts.withoutAccount },
  ] as const;

  // Get current status from URL
  const hasAccountFilter = searchParams.get("!hasAccount_is");
  let currentStatus = "all";

  if (hasAccountFilter === "true") {
    currentStatus = "withAccount";
  } else if (hasAccountFilter === "false") {
    currentStatus = "withoutAccount";
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 when changing status
    params.set("page", "1");
    
    if (status === "all") {
      params.delete("!hasAccount_is");
    } else if (status === "withAccount") {
      params.set("!hasAccount_is", "true");
    } else if (status === "withoutAccount") {
      params.set("!hasAccount_is", "false");
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
              All Users
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