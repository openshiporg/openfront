// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
import { ArrowClockwise, WarningCircle, type Icon } from "./icons";
import { Button } from "./action-button";
import { cn } from "./cn";

export type EmptyStateAction = {
  label: string;
  onClick: () => void;
  icon?: Icon;
  /** Line glyphs (plus, arrows) read better bold; shapes stay filled. */
  iconWeight?: "fill" | "bold";
};

export type EmptyStateProps = {
  /** Phosphor icon, filled. Defaults to a warning for `tone="error"`. */
  icon?: Icon;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Silver primary action. */
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  /** `error` tints the icon and, with `onRetry`, adds a Retry action. */
  tone?: "neutral" | "error";
  onRetry?: () => void;
  /** Tighter spacing and a row layout, for empty lists inside a panel. */
  compact?: boolean;
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  tone = "neutral",
  onRetry,
  compact = false,
  className,
}: EmptyStateProps) {
  const error = tone === "error";
  const IconComponent = icon ?? (error ? WarningCircle : undefined);
  const primary =
    action ??
    (error && onRetry
      ? {
          label: "Retry",
          onClick: onRetry,
          icon: ArrowClockwise,
          iconWeight: "bold" as const,
        }
      : undefined);

  return (
    <div
      role={error ? "alert" : undefined}
      className={cn(
        "flex",
        compact
          ? "items-center gap-3 px-3 py-3 text-left"
          : "flex-col items-center px-6 py-10 text-center",
        className,
      )}
    >
      {IconComponent && (
        <div
          aria-hidden="true"
          className={cn(
            "flex shrink-0 items-center justify-center",
            compact ? "size-9 rounded-xl" : "mb-4 size-12 rounded-2xl",
            error
              ? "bg-negative/12 text-negative"
              : "bg-foreground/[0.06] text-muted-foreground",
          )}
        >
          <IconComponent weight="fill" className={compact ? "size-4" : "size-5"} />
        </div>
      )}
      <div className={cn("min-w-0", compact && "flex-1")}>
        <p className={cn("font-medium", compact ? "text-sm" : "text-[0.9375rem]")}>
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "text-[0.8125rem] text-pretty text-muted-foreground",
              compact ? "mt-0.5" : "mx-auto mt-1 max-w-xs",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {(primary || secondaryAction) && (
        <div className={cn("flex shrink-0 items-center gap-2", !compact && "mt-5")}>
          {secondaryAction && (
            <Button
              variant="quiet"
              icon={secondaryAction.icon}
              iconWeight={secondaryAction.iconWeight}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primary && (
            <Button
              variant={error ? "secondary" : "primary"}
              icon={primary.icon}
              iconWeight={primary.iconWeight}
              onClick={primary.onClick}
            >
              {primary.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
