// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { MotionConfig, motion } from "framer-motion";
import { useId, useRef, useState } from "react";
import { spring } from "./motion-tokens";
import { cn } from "./cn";

export type SegmentedOption<T extends string = string> = {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
};

export type SegmentedProps<T extends string = string> = {
  options: SegmentedOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  size?: "sm" | "md";
  className?: string;
};

/**
 * Segmented control with a sliding active pill. Pointer changes slide the pill;
 * arrow-key changes jump instantly, since keyboard actions should never wait.
 */
export function Segmented<T extends string = string>({
  options,
  value: valueProp,
  defaultValue,
  onValueChange,
  label,
  size = "sm",
  className,
}: SegmentedProps<T>) {
  const [inner, setInner] = useState<T>(defaultValue ?? options[0]?.value);
  const value = valueProp ?? inner;
  const [instant, setInstant] = useState(false);
  const pillId = useId();
  const ref = useRef<HTMLDivElement>(null);

  const select = (next: T, fromKeyboard: boolean) => {
    setInstant(fromKeyboard);
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const enabled = options.filter((o) => !o.disabled);
    const at = enabled.findIndex((o) => o.value === value);
    const next = enabled[(at + step + enabled.length) % enabled.length];
    if (!next) return;
    select(next.value, true);
    ref.current
      ?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)
      ?.focus();
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn(
          "inline-flex items-center rounded-full bg-foreground/[0.05] p-0.5",
          size === "sm" ? "h-8" : "h-9",
          className,
        )}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              data-value={option.value}
              tabIndex={active ? 0 : -1}
              disabled={option.disabled}
              onClick={(e) => select(option.value, e.detail === 0)}
              className={cn(
                "relative h-full rounded-full font-medium transition-[color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] disabled:opacity-40",
                size === "sm" ? "px-3 text-[0.8125rem]" : "px-4 text-sm",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId={pillId}
                  transition={instant ? { duration: 0 } : spring}
                  className="absolute inset-0 rounded-full bg-surface-raised"
                />
              )}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>
    </MotionConfig>
  );
}
