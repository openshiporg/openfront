import { cn } from "@/lib/utils";

const statusConfig = {
  active: {
    label: "Active",
    dotClass: "bg-green-500 dark:bg-green-400 outline-3 -outline-offset-1 outline-green-100 dark:outline-green-900/50"
  },
  inactive: {
    label: "Inactive",
    dotClass: "bg-zinc-500 dark:bg-zinc-400 outline-3 -outline-offset-1 outline-zinc-100 dark:outline-zinc-900/50"
  },
} as const;

interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  const status = isActive ? 'active' : 'inactive';
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