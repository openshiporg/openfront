// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { MotionConfig, motion } from "framer-motion";
import { createContext, useContext, useId, useRef, useState } from "react";
import { spring } from "./motion-tokens";
import { cn } from "./cn";

type TabsContext = {
  value: string;
  select: (value: string, fromKeyboard: boolean) => void;
  instant: boolean;
  variant: "default" | "pills";
  activation: "automatic" | "manual";
  baseId: string;
  indicatorId: string;
  /** Values whose panel has been shown once, so lazy panels stay mounted. */
  visited: Set<string>;
};

const Ctx = createContext<TabsContext | null>(null);

function useTabs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Tab components must be used inside <Tabs>.");
  return ctx;
}

const slug = (value: string) => value.replace(/[^\w-]/g, "_");

export type TabsProps = {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  /** `default`: a short bar under the active tab. `pills`: a raised pill behind it. */
  variant?: "default" | "pills";
  /** `automatic` selects on arrow keys; `manual` only moves focus until Enter/Space. */
  activation?: "automatic" | "manual";
  className?: string;
  children: React.ReactNode;
};

export function Tabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  variant = "default",
  activation = "automatic",
  className,
  children,
}: TabsProps) {
  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  const [instant, setInstant] = useState(false);
  const [visited, setVisited] = useState(() => new Set([value]));
  const baseId = useId();
  const indicatorId = useId();

  if (!visited.has(value)) setVisited(new Set(visited).add(value));

  const select = (next: string, fromKeyboard: boolean) => {
    setInstant(fromKeyboard);
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  return (
    <MotionConfig reducedMotion="user">
      <Ctx.Provider
        value={{
          value,
          select,
          instant,
          variant,
          activation,
          baseId,
          indicatorId,
          visited,
        }}
      >
        <div className={cn("flex flex-col gap-3", className)}>{children}</div>
      </Ctx.Provider>
    </MotionConfig>
  );
}

export function TabList({
  label,
  className,
  children,
}: {
  /** Accessible name of the tab list. */
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { variant, activation, select } = useTabs();
  const ref = useRef<HTMLDivElement>(null);

  // Roving focus: arrows move between enabled tabs, Home/End jump to the ends.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const tabs = [
      ...(ref.current?.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not(:disabled)',
      ) ?? []),
    ];
    const at = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    const nextIndex =
      e.key === "ArrowRight"
        ? (at + 1) % tabs.length
        : e.key === "ArrowLeft"
          ? (at - 1 + tabs.length) % tabs.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? tabs.length - 1
              : -1;
    if (nextIndex < 0) return;
    e.preventDefault();
    const next = tabs[nextIndex];
    next.focus();
    if (activation === "automatic") select(next.dataset.value!, true);
  };

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        // Tabs wrap onto a second row instead of scrolling sideways when space runs out.
        "flex flex-wrap items-center",
        variant === "pills"
          ? // 1.125rem is a full pill at one row and still reads as a track at two.
            "w-fit max-w-full gap-0.5 rounded-[1.125rem] bg-foreground/[0.05] p-0.5"
          : "gap-1 pb-1.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Tab({
  value,
  count,
  disabled,
  className,
  children,
}: {
  value: string;
  /** Small number after the label, e.g. unread items. */
  count?: number;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active, select, instant, variant, baseId, indicatorId } = useTabs();
  const selected = value === active;
  const id = `${baseId}-tab-${slug(value)}`;

  return (
    <button
      type="button"
      role="tab"
      id={id}
      data-value={value}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${slug(value)}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={(e) => select(value, e.detail === 0)}
      className={cn(
        "relative flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium whitespace-nowrap transition-[color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-40",
        selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {selected && (
        <motion.span
          layoutId={indicatorId}
          aria-hidden="true"
          transition={instant ? { duration: 0 } : spring}
          className={
            variant === "pills"
              ? "absolute inset-0 rounded-full bg-surface-raised"
              : "absolute inset-x-3 -bottom-1 h-0.5 rounded-full bg-foreground"
          }
        />
      )}
      <span className="relative">{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            "relative rounded-full px-1.5 font-mono text-[0.75rem] leading-4 tabular-nums",
            selected ? "bg-foreground/[0.08]" : "bg-foreground/[0.05]",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function TabPanel({
  value,
  lazy = false,
  className,
  children,
}: {
  value: string;
  /** Mount the panel only once it has been selected; it then stays mounted. */
  lazy?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active, baseId, visited } = useTabs();
  const selected = value === active;
  if (lazy && !visited.has(value)) return null;

  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${slug(value)}`}
      aria-labelledby={`${baseId}-tab-${slug(value)}`}
      hidden={!selected}
      tabIndex={0}
      className={cn("rounded-2xl outline-none", className)}
    >
      {children}
    </div>
  );
}
