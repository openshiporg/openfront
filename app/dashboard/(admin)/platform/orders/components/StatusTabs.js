"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { Badge } from "@ui/badge";
import { RotateCcw, Check, Archive, X, AlertTriangle } from "lucide-react";

const STATUS_COUNTS_QUERY = gql`
  query GetOrderStatusCounts {
    pendingCount: ordersCount(where: { status: { equals: pending } })
    archivedCount: ordersCount(where: { status: { equals: archived } })
    completedCount: ordersCount(where: { status: { equals: completed } })
    canceledCount: ordersCount(where: { status: { equals: canceled } })
    requiresActionCount: ordersCount(
      where: { status: { equals: requires_action } }
    )
  }
`;

const statusConfig = {
  pending: {
    label: "Pending",
    icon: RotateCcw,
    color: "amber"
  },
  completed: {
    label: "Completed",
    icon: Check,
    color: "emerald"
  },
  archived: {
    label: "Archived",
    icon: Archive,
    color: "zinc"
  },
  canceled: {
    label: "Canceled",
    icon: X,
    color: "red"
  },
  requires_action: {
    label: "Requires Action",
    icon: AlertTriangle,
    color: "blue"
  },
};

export function StatusTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [, updateScroll] = useState(0);

  const tabRefs = useRef([]);
  const scrollContainerRef = useRef(null);

  const { data: statusCounts, loading } = useQuery(STATUS_COUNTS_QUERY);

  const statuses = [
    { value: "pending", label: "Pending", count: statusCounts?.pendingCount },
    {
      value: "requires_action",
      label: "Requires Action",
      count: statusCounts?.requiresActionCount,
    },
    {
      value: "completed",
      label: "Completed",
      count: statusCounts?.completedCount,
    },
    {
      value: "archived",
      label: "Archived",
      count: statusCounts?.archivedCount,
    },
    {
      value: "canceled",
      label: "Canceled",
      count: statusCounts?.canceledCount,
    },
  ];

  // Get current status from URL
  const statusFilter = searchParams.get("!status_matches");
  let currentStatus = "all";

  if (statusFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(statusFilter));
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentStatus = parsed[0].value;
      }
    } catch (e) {
      // Invalid JSON in URL, ignore
    }
  }

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("!status_matches");
    } else {
      const filterValue = [
        {
          label: statusConfig[status].label,
          value: status,
        },
      ];
      params.set("!status_matches", JSON.stringify(filterValue));
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
      {/* Hover Highlight */}
      <div
        className="absolute h-[28px] mt-1 transition-all duration-300 ease-out bg-muted/60 rounded-[6px] flex items-center ml-4"
        style={{
          left: `${hoveredIndex !== null ? tabRefs.current[hoveredIndex]?.offsetLeft - scrollOffset : 0}px`,
          width: `${hoveredIndex !== null ? tabRefs.current[hoveredIndex]?.offsetWidth : 0}px`,
          opacity: hoveredIndex !== null ? 1 : 0,
        }}
      />

      {/* Active Indicator */}
      <div
        className="absolute bottom-[-1px] h-[2px] bg-foreground transition-all duration-300 ease-out ml-4"
        style={{
          left: `${activeTabOffsetLeft - scrollOffset}px`,
          width: `${activeTabWidth}px`,
        }}
      />

      {/* Tabs - re-enabled scroll area with onScroll handler */}
      <div ref={scrollContainerRef} onScroll={handleScroll} className="w-full overflow-x-auto no-scrollbar px-4">
        <div className="relative flex space-x-[6px] items-center pb-1">
          <div
            ref={(el) => (tabRefs.current[0] = el)}
            className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
              currentStatus === "all"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleStatusChange("all")}
          >
            <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
              All Orders
              <span className="ml-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {loading
                  ? "-"
                  : (statusCounts?.pendingCount || 0) +
                    (statusCounts?.requiresActionCount || 0) +
                    (statusCounts?.completedCount || 0) +
                    (statusCounts?.archivedCount || 0) +
                    (statusCounts?.canceledCount || 0)}
              </span>
            </div>
          </div>
          {statuses.map((status, index) => {
            const StatusIcon = statusConfig[status.value].icon;
            return (
              <div
                key={status.value}
                ref={(el) => (tabRefs.current[index + 1] = el)}
                className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
                  currentStatus === status.value
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                onMouseEnter={() => setHoveredIndex(index + 1)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => handleStatusChange(status.value)}
              >
                <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
                  <Badge color={statusConfig[status.value].color} className="mr-2 rounded-full border-2 w-3 h-3 p-0" />
                  {status.label}
                  <span className="ml-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {loading ? "-" : status.count || 0}
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
