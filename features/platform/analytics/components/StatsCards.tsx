"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatData {
  name: string;
  value: string;
  previous: string;
  change: string;
  changeType: "positive" | "negative";
}

interface StatsCardsProps {
  data: StatData[];
  loading?: boolean;
}

export function StatsCards({ data, loading = false }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="group/card rounded-xl transition-all duration-200 bg-card hover:bg-card/80 text-foreground shadow-inner hover:scale-110 hover:shadow-slate-6"
            >
              <div className="p-4 md:p-6">
                <div className="flex flex-col items-center gap-1 md:gap-2">
                  <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
        {data.map((item) => (
          <div
            key={item.name}
            className="group/card rounded-xl transition-all duration-200 bg-card hover:bg-card/80 text-foreground shadow-inner hover:scale-110 hover:shadow-slate-6"
          >
            <div className="p-4 md:p-6">
              <div className="flex flex-col items-center gap-1 md:gap-2">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl md:text-4xl font-bold text-foreground">
                    {item.value}
                  </p>
                  <span
                    className={cn(
                      item.changeType === "positive"
                        ? "text-green-800 dark:text-green-400"
                        : "text-red-800 dark:text-red-400",
                      "text-sm font-medium"
                    )}
                  >
                    {item.change}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground text-center">
                  {item.name}
                </p>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}