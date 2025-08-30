"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Banknote, Clock } from "lucide-react";

const statusConfig = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    iconColor: "text-emerald-500"
  },
  suspended: {
    label: "Suspended", 
    icon: AlertCircle,
    iconColor: "text-orange-500"
  },
  not_approved: {
    label: "Not Approved",
    icon: XCircle,
    iconColor: "text-red-500"
  },
  paid: {
    label: "Paid",
    icon: Banknote,
    iconColor: "text-green-500"
  },
  overdue: {
    label: "Overdue",
    icon: Clock,
    iconColor: "text-red-500"
  },
} as const;

interface StatusTabsProps {
  statusCounts: {
    all: number;
    active: number;
    suspended: number;
    not_approved: number;
    paid: number;
    overdue: number;
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
    { value: "active", label: "Active", count: statusCounts.active },
    { value: "suspended", label: "Suspended", count: statusCounts.suspended },
    { value: "not_approved", label: "Not Approved", count: statusCounts.not_approved },
    { value: "paid", label: "Paid", count: statusCounts.paid },
    { value: "overdue", label: "Overdue", count: statusCounts.overdue },
  ] as const;

  // Get current status from URL
  const statusFilter = searchParams.get("!status_equals");
  let currentStatus = "all";

  if (statusFilter) {
    currentStatus = statusFilter;
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 when changing status
    params.set("page", "1");
    
    if (status === "all") {
      params.delete("!status_equals");
    } else {
      params.set("!status_equals", status);
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
              All Invoices
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