"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    iconColor: "text-yellow-500",
    color: "zinc"
  },
  approved: {
    label: "Approved", 
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    color: "emerald"
  },
  not_approved: {
    label: "Not Approved",
    icon: XCircle,
    iconColor: "text-red-500",
    color: "red"
  },
  requires_info: {
    label: "Requires Info",
    icon: AlertCircle,
    iconColor: "text-orange-500",
    color: "orange"
  },
} as const;

interface StatusTabsProps {
  statusCounts: {
    all: number;
    pending: number;
    approved: number;
    not_approved: number;
    requires_info: number;
  };
}

export function StatusTabs({ statusCounts }: StatusTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [hoverStyle, setHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const tabElements = useRef(new Map()).current;

  const statuses = [
    { value: "pending", label: "Pending", count: statusCounts.pending },
    { value: "approved", label: "Approved", count: statusCounts.approved },
    { value: "not_approved", label: "Not Approved", count: statusCounts.not_approved },
    { value: "requires_info", label: "Requires Info", count: statusCounts.requires_info },
  ] as const;

  // Get current status from URL
  const statusFilter = searchParams.get("!status_matches");
  let currentStatus = "all";

  if (statusFilter) {
    // Parse the matches format: ["approved"] -> approved
    try {
      const parsed = JSON.parse(statusFilter);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentStatus = parsed[0];
      }
    } catch {
      // Fallback to the string value if JSON parsing fails
      currentStatus = statusFilter;
    }
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 when changing status
    params.set("page", "1");
    
    if (status === "all") {
      params.delete("!status_matches");
    } else {
      // Use array format like other pages: ["approved"]
      params.set("!status_matches", JSON.stringify([status]));
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  // Update indicator position
  const updateIndicatorPosition = (element: HTMLDivElement) => {
    setIndicatorStyle({
      left: element.offsetLeft,
      width: element.offsetWidth,
    });
  };

  // Update hover position
  const updateHoverPosition = (element: HTMLDivElement | null) => {
    if (element) {
      setHoverStyle({
        left: element.offsetLeft,
        width: element.offsetWidth,
        opacity: 1,
      });
    } else {
      setHoverStyle(prev => ({ ...prev, opacity: 0 }));
    }
  };

  // Handle tab change
  const handleTabChange = (status: string, element: HTMLDivElement) => {
    updateIndicatorPosition(element);
    handleStatusChange(status);
  };

  // Ref callback for tabs to store references and set initial position
  const tabRef = (status: string, isActive: boolean) => (element: HTMLDivElement | null) => {
    if (element) {
      tabElements.set(status, element);
      // If this is the active tab on first render, position the indicator
      if (isActive && indicatorStyle.width === 0) {
        updateIndicatorPosition(element);
      }
    }
  };

  return (
    <div className="relative">
      {/* Hover background */}
      <div
        className="absolute h-[28px] mt-1 transition-all duration-300 ease-out bg-muted/60 rounded-[6px] flex items-center ml-4 md:ml-6"
        style={{
          left: `${hoverStyle.left}px`,
          width: `${hoverStyle.width}px`,
          opacity: hoverStyle.opacity,
        }}
      />

      {/* Active indicator line */}
      <div
        className="absolute h-[2px] bg-blue-500 transition-all duration-300 ease-out ml-4 md:ml-6"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          bottom: '-1.5px',
        }}
      />

      <div className="w-full overflow-x-auto no-scrollbar px-4 md:px-6">
        <div className="relative flex space-x-[6px] items-center pb-1">
          <div
            ref={tabRef("all", currentStatus === "all")}
            className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
              currentStatus === "all"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
            onMouseEnter={(e) => updateHoverPosition(e.currentTarget)}
            onMouseLeave={() => updateHoverPosition(null)}
            onClick={(e) => handleTabChange("all", e.currentTarget)}
          >
            <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2">
              All Account Requests
              <span className="rounded-sm bg-background border shadow-xs px-1.5 py-0 text-[10px] leading-[14px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 inline-flex items-center h-[18px]">
                {statusCounts.all}
              </span>
            </div>
          </div>
          {statuses.map((status, index) => {
            const StatusIcon = statusConfig[status.value as keyof typeof statusConfig].icon;
            const iconColor = statusConfig[status.value as keyof typeof statusConfig].iconColor;
            const isActive = currentStatus === status.value;
            
            return (
              <div
                key={status.value}
                ref={tabRef(status.value, isActive)}
                className={`px-3 py-2 cursor-pointer transition-colors duration-300 ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
                onMouseEnter={(e) => updateHoverPosition(e.currentTarget)}
                onMouseLeave={() => updateHoverPosition(null)}
                onClick={(e) => handleTabChange(status.value, e.currentTarget)}
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