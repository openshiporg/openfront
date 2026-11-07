import { cn } from "./cn";
export type StatusTone = "neutral" | "brand" | "positive" | "negative" | "warning";
const dot: Record<StatusTone, string> = { neutral: "bg-muted-foreground", brand: "bg-brand", positive: "bg-positive", negative: "bg-negative", warning: "bg-warning" };
export type StatusPillProps = React.ComponentProps<"span"> & { tone?: StatusTone; size?: "sm" | "md"; icon?: unknown; iconWeight?: "fill" | "bold" };
/** House rule: no pills. A status is a dot plus text; the tone only colours the dot. */
export function StatusPill({ tone = "neutral", size = "md", icon: _icon, iconWeight: _weight, className, children, ...props }: StatusPillProps) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-xs font-medium whitespace-nowrap", tone === "neutral" ? "text-muted-foreground" : "text-foreground", className)} {...props}>
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", dot[tone])} />
      {children}
    </span>
  );
}
/** Plain mono text for identifiers (transports, models, branches). */
export function Tag({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("shrink-0 font-mono text-xs text-muted-foreground", className)} {...props} />;
}
