import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { gql, useQuery } from "@keystone-6/core/admin-ui/apollo";
import { Badge } from "@ui/badge";
import { ScrollArea, ScrollBar } from "@ui/scroll-area";

const STATUS_COUNTS_QUERY = gql`
  query GetProductStatusCounts {
    draftCount: productsCount(where: { status: { equals: draft } })
    proposedCount: productsCount(where: { status: { equals: proposed } })
    publishedCount: productsCount(where: { status: { equals: published } })
    rejectedCount: productsCount(where: { status: { equals: rejected } })
  }
`;

export function StatusTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const tabRefs = useRef([]);
  const { data: statusCounts, loading } = useQuery(STATUS_COUNTS_QUERY);

  const statuses = [
    { value: "draft", label: "Draft", count: statusCounts?.draftCount },
    {
      value: "proposed",
      label: "Proposed",
      count: statusCounts?.proposedCount,
    },
    {
      value: "published",
      label: "Published",
      count: statusCounts?.publishedCount,
    },
    {
      value: "rejected",
      label: "Rejected",
      count: statusCounts?.rejectedCount,
    },
  ];

  // Get current status from URL
  const statusFilter = searchParams.get("!status_matches");
  let currentStatus = "all";

  if (statusFilter) {
    try {
      const parsed = JSON.parse(decodeURIComponent(statusFilter));
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentStatus = parsed[0].value?.toLowerCase();
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
          label: status.charAt(0).toUpperCase() + status.slice(1),
          value: status,
        },
      ];
      params.set("!status_matches", JSON.stringify(filterValue));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative">
      {/* Hover Highlight */}
      <div
        className="absolute h-[28px] mt-1 transition-all duration-300 ease-out bg-muted/60 rounded-[6px] flex items-center"
        style={{
          left: `${hoveredIndex !== null ? tabRefs.current[hoveredIndex]?.offsetLeft : 0}px`,
          width: `${hoveredIndex !== null ? tabRefs.current[hoveredIndex]?.offsetWidth : 0}px`,
          opacity: hoveredIndex !== null ? 1 : 0,
        }}
      />

      {/* Active Indicator */}
      <div
        className="absolute bottom-[-1px] h-[2px] bg-foreground transition-all duration-300 ease-out"
        style={{
          left: `${tabRefs.current[currentStatus === "all" ? 0 : statuses.findIndex((s) => s.value === currentStatus) + 1]?.offsetLeft || 0}px`,
          width: `${tabRefs.current[currentStatus === "all" ? 0 : statuses.findIndex((s) => s.value === currentStatus) + 1]?.offsetWidth || 0}px`,
        }}
      />

      {/* Tabs */}
      <ScrollArea className="w-full" orientation="horizontal">
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
              All
              <span className="ml-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {loading
                  ? "-"
                  : (statusCounts?.draftCount || 0) +
                    (statusCounts?.proposedCount || 0) +
                    (statusCounts?.publishedCount || 0) +
                    (statusCounts?.rejectedCount || 0)}
              </span>
            </div>
          </div>
          {statuses.map((status, index) => (
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
                {status.label}
                <span className="ml-2 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {loading ? "-" : status.count || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
