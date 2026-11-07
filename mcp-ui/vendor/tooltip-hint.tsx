// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import { cn } from "./cn";

// Shared across every tooltip on the page: once one has been open, the next
// one opens instantly instead of waiting out the delay again.
let lastClosedAt = 0;
const WARM_MS = 400;

export type TooltipProps = {
  content: React.ReactNode;
  /** A single focusable element; it gets aria-describedby pointing at the tooltip. */
  children: React.ReactElement<{ "aria-describedby"?: string; title?: string }>;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  /** Hover delay for the first tooltip, in ms. Focus always opens instantly. */
  delay?: number;
  className?: string;
};

const placement = {
  top: {
    start: "bottom-full left-0 mb-1.5 origin-bottom-left",
    center: "bottom-full left-1/2 mb-1.5 -translate-x-1/2 origin-bottom",
    end: "bottom-full right-0 mb-1.5 origin-bottom-right",
  },
  bottom: {
    start: "top-full left-0 mt-1.5 origin-top-left",
    center: "top-full left-1/2 mt-1.5 -translate-x-1/2 origin-top",
    end: "top-full right-0 mt-1.5 origin-top-right",
  },
} as const;

/** Small hint anchored to its trigger, scaling in from the trigger's side. */
export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 300,
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  // Instant when warm (another tooltip just closed) or opened from the keyboard.
  const [instant, setInstant] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = (fromFocus: boolean) => {
    clearTimeout(timer.current);
    const warm = Date.now() - lastClosedAt < WARM_MS;
    if (fromFocus || warm) {
      setInstant(true);
      setOpen(true);
      return;
    }
    setInstant(false);
    timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    if (open) lastClosedAt = Date.now();
    setOpen(false);
  };

  const trigger = isValidElement(children)
    ? // Drop any native title (IconButton sets one) so the hint doesn't show twice.
      cloneElement(children, {
        "aria-describedby": open ? id : undefined,
        title: undefined,
      })
    : children;

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={(e) => e.pointerType === "mouse" && show(false)}
      onPointerLeave={hide}
      onFocus={(e) => e.target.matches(":focus-visible") && show(true)}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && hide()}
    >
      {trigger}
      <span
        id={id}
        role="tooltip"
        aria-hidden={!open}
        data-open={open || undefined}
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-64 rounded-xl bg-surface-raised px-2.5 py-1.5 text-xs text-foreground",
          "scale-[0.97] opacity-0 transition-[opacity,scale] duration-[125ms] ease-[cubic-bezier(0.23,1,0.32,1)] data-open:scale-100 data-open:opacity-100 motion-reduce:scale-100",
          instant && "duration-0",
          placement[side][align],
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
