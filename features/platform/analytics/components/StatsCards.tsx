import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

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
      <div className="grid grid-cols-1 divide-y bg-border divide-border overflow-hidden rounded-lg md:grid-cols-4 md:divide-x md:divide-y-0">
        {[...Array(4)].map((_, index) => (
          <Card
            key={index}
            className="rounded-none border-0 shadow-sm py-0"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
              <div className="h-8 w-full bg-muted animate-pulse rounded mb-2" />
              <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 divide-y bg-border divide-border overflow-hidden rounded-lg md:grid-cols-4 md:divide-x md:divide-y-0">
      {data.map((stat) => (
        <Card
          key={stat.name}
          className="rounded-none border-0 shadow-sm py-0"
        >
          <CardContent className="p-4 sm:p-6">
            <CardTitle className="text-base font-normal">
              {stat.name}
            </CardTitle>
            <div className="mt-1 flex items-baseline gap-2 md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-primary">
                {stat.value}
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                  from {stat.previous}
                </span>
              </div>

              <Badge
                variant="outline"
                className={cn(
                  "inline-flex items-center px-1.5 ps-2.5 py-0.5 text-xs font-medium md:mt-2 lg:mt-0",
                  stat.changeType === "positive"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {stat.changeType === "positive" ? (
                  <TrendingUp className="mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-green-500" />
                ) : (
                  <TrendingDown className="mr-0.5 -ml-1 h-5 w-5 shrink-0 self-center text-red-500" />
                )}

                <span className="sr-only">
                  {" "}
                  {stat.changeType === "positive" ? "Increased" : "Decreased"} by{" "}
                </span>
                {stat.change}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}