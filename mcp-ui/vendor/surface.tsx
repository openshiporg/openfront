// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
import type { Icon } from "./icons";
import { cn } from "./cn";

/*
 * Depth without borders: a `Shell` holds `Panel`s, a panel holds `Inset`
 * blocks. Layers separate only by background, so these four are all a
 * component needs for its frame.
 */

type DivProps = React.ComponentProps<"div">;

/** Outer frame. Headers and footers sit in its padding, content in panels. */
export function Shell({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("@container w-full rounded-[1.375rem] bg-surface p-1.5", className)}
      {...props}
    />
  );
}

/** Main content area inside a shell. */
export function Panel({ className, ...props }: DivProps) {
  return <div className={cn("rounded-2xl bg-surface-inset", className)} {...props} />;
}

/** One level deeper: code, payloads, details inside a panel. */
export function Inset({ className, ...props }: DivProps) {
  return <div className={cn("rounded-xl bg-foreground/[0.04]", className)} {...props} />;
}

/** Icon in a tinted square. Pass a Phosphor icon, or children for anything else. */
export function IconTile({
  icon: IconComponent,
  className,
  children,
  ...props
}: DivProps & { icon?: Icon }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.06] text-muted-foreground",
        className,
      )}
      {...props}
    >
      {IconComponent ? <IconComponent weight="fill" className="size-4" /> : children}
    </div>
  );
}

export type ShellHeaderProps = Omit<DivProps, "title"> & {
  icon?: Icon;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right side: a stat, a pill or actions. Vertically centered with the title. */
  aside?: React.ReactNode;
  /** Heading level for the title. */
  as?: "h2" | "h3" | "h4";
};

/**
 * Header row for a shell. The icon tile sits 12px from the shell edge, in line
 * with panel content below it, and everything is vertically centered.
 */
export function ShellHeader({
  icon,
  title,
  subtitle,
  aside,
  as: Heading = "h3",
  className,
  ...props
}: ShellHeaderProps) {
  return (
    <div
      className={cn("flex items-center gap-3 pt-1.5 pr-3.5 pb-3 pl-1.5", className)}
      {...props}
    >
      {icon && <IconTile icon={icon} />}
      <div className={cn("min-w-0 flex-1", !icon && "pl-2")}>
        <Heading className="truncate text-[0.9375rem] font-medium">{title}</Heading>
        {subtitle && (
          <p className="truncate text-[0.8125rem] text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
    </div>
  );
}
