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

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <div className={cn(
      "inline-flex w-max items-center gap-2 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
      "rounded-full bg-muted border shadow-xs"
    )}>
      <span className={cn(
        "inline-block size-2 shrink-0 rounded-full outline",
        config.dotClass
      )} />
      {config.label}
    </div>
  );
}