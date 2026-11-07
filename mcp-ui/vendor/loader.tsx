// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { CircleNotch } from "./icons";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { EASE_OUT } from "./motion-tokens";
import { cn } from "./cn";

const spinnerSizes = { sm: "size-3.5", md: "size-4", lg: "size-6" } as const;

export type SpinnerProps = {
  size?: keyof typeof spinnerSizes;
  /** Spoken label; also shown as text next to the icon when `showLabel` is set. */
  label?: string;
  showLabel?: boolean;
  className?: string;
};

/** A spinning ring. With reduced motion it holds still and the label carries the state. */
export function Spinner({
  size = "md",
  label = "Loading",
  showLabel = false,
  className,
}: SpinnerProps) {
  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}
    >
      <CircleNotch
        weight="bold"
        aria-hidden="true"
        className={cn(
          "shrink-0 animate-spin [animation-duration:700ms] motion-reduce:animate-none",
          spinnerSizes[size],
        )}
      />
      {showLabel ? (
        <span className="text-[0.8125rem]">{label}</span>
      ) : (
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}

const dotSizes = {
  sm: { dot: "size-1", gap: "gap-1", text: "text-xs" },
  md: { dot: "size-1.5", gap: "gap-1", text: "text-[0.8125rem]" },
  lg: { dot: "size-2", gap: "gap-1.5", text: "text-sm" },
} as const;

export type ThinkingProps = {
  size?: keyof typeof dotSizes;
  /**
   * Words to cycle through next to the dots, e.g. ["Thinking", "Searching", "Writing"].
   * One word stays put; none shows the dots alone.
   */
  words?: string[];
  /** How long each word stays, in ms. */
  interval?: number;
  className?: string;
};

/** Three dots in a wave, optionally with a rolling verb that says what the agent is doing. */
export function Thinking({
  size = "md",
  words = [],
  interval = 1800,
  className,
}: ThinkingProps) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const s = dotSizes[size];
  const word = words.length ? words[index % words.length] : undefined;

  useEffect(() => {
    if (words.length < 2) return;
    const timer = setInterval(() => setIndex((i) => i + 1), interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <MotionConfig reducedMotion="user">
      <span
        role="status"
        className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}
      >
        <span aria-hidden="true" className={cn("flex items-center", s.gap)}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className={cn("rounded-full bg-current", s.dot)}
              animate={
                reduce ? { opacity: 0.6 } : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }
              }
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }
              }
            />
          ))}
        </span>
        {word ? (
          <span className={cn("relative inline-flex h-[1lh] overflow-hidden", s.text)}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={word}
                initial={{ y: "100%", opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: { duration: 0.24, ease: EASE_OUT },
                }}
                exit={{
                  y: "-100%",
                  opacity: 0,
                  transition: { duration: 0.15, ease: EASE_OUT },
                }}
                className="whitespace-nowrap"
              >
                {word}…
              </motion.span>
            </AnimatePresence>
          </span>
        ) : (
          <span className="sr-only">Thinking</span>
        )}
      </span>
    </MotionConfig>
  );
}
