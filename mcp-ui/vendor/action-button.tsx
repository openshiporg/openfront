// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
import { CircleNotch, type Icon } from "./icons";
import { Tooltip } from "./tooltip-hint";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "sm" | "md";

const variants: Record<ButtonVariant, string> = {
  // The silver primary is the one place a hairline edge and a drop shadow are allowed.
  primary:
    "border border-(--button-edge) bg-(image:--button) bg-origin-border text-(--button-foreground) shadow-(--button-shadow) hover:bg-(image:--button-hover)",
  secondary:
    "bg-(image:--button-secondary) text-foreground hover:bg-(image:--button-secondary-hover)",
  quiet: "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground",
  danger: "bg-negative/15 text-negative hover:bg-negative/25",
};

const sizes: Record<ButtonSize, { base: string; icon: string; glyph: string }> = {
  sm: { base: "h-8 gap-1.5 px-3.5 text-[0.8125rem]", icon: "size-8", glyph: "size-3.5" },
  md: { base: "h-9 gap-2 px-4 text-sm", icon: "size-9", glyph: "size-4" },
};

const base =
  "inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,color,scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading Phosphor icon. Line glyphs (check, x, arrows) render bold, others filled. */
  icon?: Icon;
  iconWeight?: "fill" | "bold";
  /** Shows a spinner in place of the icon and disables the button. */
  loading?: boolean;
};

export function Button({
  variant = "secondary",
  size = "sm",
  icon: IconComponent,
  iconWeight = "fill",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const glyph = sizes[size].glyph;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, sizes[size].base, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <Spinner className={glyph} />
      ) : (
        IconComponent && (
          <IconComponent weight={iconWeight} className={glyph} aria-hidden="true" />
        )
      )}
      {children}
    </button>
  );
}

export type IconButtonProps = Omit<ButtonProps, "children" | "icon"> & {
  icon: Icon;
  /** Accessible name; icon buttons have no visible text. */
  label: string;
  /**
   * Show our Tooltip instead of the native `title`. `true` uses `label`; pass a
   * node for richer content (e.g. the label plus a key hint).
   */
  tooltip?: React.ReactNode;
  tooltipSide?: "top" | "bottom";
  tooltipAlign?: "start" | "center" | "end";
};

/**
 * Round, icon-only button. `label` becomes its aria-label, and its native title
 * unless a `tooltip` is given (never both, so hints don't double up).
 */
export function IconButton({
  variant = "quiet",
  size = "sm",
  icon: IconComponent,
  iconWeight = "fill",
  label,
  tooltip,
  tooltipSide = "top",
  tooltipAlign = "center",
  loading = false,
  disabled,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  const glyph = sizes[size].glyph;
  const button = (
    <button
      type={type}
      aria-label={label}
      title={tooltip ? undefined : label}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, sizes[size].icon, variants[variant], className)}
      {...props}
    >
      {loading ? (
        <Spinner className={glyph} />
      ) : (
        <IconComponent weight={iconWeight} className={glyph} aria-hidden="true" />
      )}
    </button>
  );
  if (!tooltip) return button;
  return (
    <Tooltip
      content={tooltip === true ? label : tooltip}
      side={tooltipSide}
      align={tooltipAlign}
    >
      {button}
    </Tooltip>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <CircleNotch
      weight="bold"
      aria-hidden="true"
      className={cn("animate-spin motion-reduce:animate-none", className)}
    />
  );
}
