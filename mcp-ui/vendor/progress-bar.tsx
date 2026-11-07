// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
import { cn } from "./cn";

export type BarTone = "brand" | "positive" | "negative" | "warning" | "neutral";

const fills: Record<BarTone, string> = {
  brand: "bg-brand",
  positive: "bg-positive",
  negative: "bg-negative",
  warning: "bg-warning",
  neutral: "bg-foreground/40",
};

const heights = { sm: "h-1.5", md: "h-2", lg: "h-3" } as const;

const STRIPES =
  "repeating-linear-gradient(-45deg, rgb(255 255 255 / 0.16) 0 3px, transparent 3px 7px)";
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

export type ProgressBarProps = Omit<React.ComponentProps<"div">, "role"> & {
  value: number;
  max?: number;
  tone?: BarTone;
  /** Any CSS color for the fill; overrides `tone`, e.g. a per-series chart color. */
  color?: string;
  size?: keyof typeof heights;
  /** Diagonal stripes on the fill. */
  striped?: boolean;
  /** `progress` for work toward done, `meter` for a level like quota or budget. */
  kind?: "progress" | "meter";
  /** Accessible name. */
  label: string;
  /** Spoken value, e.g. "3,280 of 4,000 requests left". Defaults to a percentage. */
  valueText?: string;
};

/**
 * Horizontal bar. The fill is revealed with clip-path instead of scaled, so
 * the stripe pattern never stretches while it animates.
 */
export function ProgressBar({
  value,
  max = 100,
  tone = "brand",
  color,
  size = "md",
  striped = false,
  kind = "progress",
  label,
  valueText,
  className,
  ...props
}: ProgressBarProps) {
  const ratio = Math.min(Math.max(value / max, 0), 1);
  return (
    <div
      role={kind === "meter" ? "meter" : "progressbar"}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText ?? `${Math.round(ratio * 100)}%`}
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-foreground/[0.07]",
        heights[size],
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-[clip-path,background-color] duration-500 motion-reduce:transition-none",
          !color && fills[tone],
        )}
        style={{
          backgroundColor: color,
          clipPath: `inset(0 ${(1 - ratio) * 100}% 0 0 round 9999px)`,
          transitionTimingFunction: EASE,
          backgroundImage: striped ? STRIPES : undefined,
        }}
      />
    </div>
  );
}

export type BarSegment = {
  id: string;
  value: number;
  label: string;
  /** Any CSS color. */
  color: string;
};

export type SegmentedBarProps = Omit<React.ComponentProps<"div">, "role"> & {
  segments: BarSegment[];
  max: number;
  size?: keyof typeof heights;
  striped?: boolean;
  label: string;
  valueText?: string;
};

/** Stacked segments with small gaps, e.g. context or budget split by source. */
export function SegmentedBar({
  segments,
  max,
  size = "md",
  striped = false,
  label,
  valueText,
  className,
  ...props
}: SegmentedBarProps) {
  const total = segments.reduce((n, s) => n + s.value, 0);
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={total}
      aria-valuetext={
        valueText ??
        segments.map((s) => `${s.label} ${s.value.toLocaleString("en-US")}`).join(", ")
      }
      className={cn("flex w-full gap-1", heights[size], className)}
      {...props}
    >
      {segments.map((s) => (
        <span
          key={s.id}
          title={`${s.label} · ${s.value.toLocaleString("en-US")}`}
          className="h-full min-w-1.5 shrink-0 rounded-full transition-[width] duration-500 motion-reduce:transition-none"
          style={{
            width: `${(s.value / max) * 100}%`,
            backgroundColor: s.color,
            backgroundImage: striped ? STRIPES : undefined,
            transitionTimingFunction: EASE,
          }}
        />
      ))}
      <span className="h-full min-w-0 flex-1 rounded-full bg-foreground/[0.07]" />
    </div>
  );
}
