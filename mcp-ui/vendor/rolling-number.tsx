// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "./cn";

export type RollingNumberProps = {
  /** A number (formatted with `format` or en-US grouping) or a preformatted string like "87.2k". */
  value: number | string;
  format?: (value: number) => string;
  /** Delay between neighbouring digits, right to left, in ms. */
  stagger?: number;
  className?: string;
};

const DIGITS = "0123456789";
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";

/**
 * Odometer-style number: each digit rolls to its new value on its own wheel,
 * the rightmost first. Characters are keyed from the right, so units and
 * separators ("k", "%", "$") stay put while the digits change.
 */
export function RollingNumber({
  value,
  format,
  stagger = 24,
  className,
}: RollingNumberProps) {
  const reduce = useReducedMotion();
  const text =
    typeof value === "number"
      ? format
        ? format(value)
        : value.toLocaleString("en-US")
      : value;
  const chars = Array.from(text);

  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((char, i) => {
          const fromRight = chars.length - 1 - i;
          return DIGITS.includes(char) ? (
            <Digit
              key={fromRight}
              digit={Number(char)}
              delay={reduce ? 0 : fromRight * stagger}
              instant={!!reduce}
            />
          ) : (
            <span key={`${fromRight}${char}`} className="whitespace-pre">
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}

function Digit({
  digit,
  delay,
  instant,
}: {
  digit: number;
  delay: number;
  instant: boolean;
}) {
  return (
    <span className="relative inline-block h-[1lh] overflow-hidden [mask-image:linear-gradient(transparent,black_22%,black_78%,transparent)]">
      {/* Sizes the wheel to one digit; tabular figures keep every digit equally wide. */}
      <span className="invisible">0</span>
      <span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        style={{
          transform: `translateY(${-digit * 10}%)`,
          transitionProperty: "transform",
          transitionDuration: instant ? "0ms" : "600ms",
          transitionTimingFunction: EASE,
          transitionDelay: `${delay}ms`,
        }}
      >
        {Array.from(DIGITS, (d) => (
          <span key={d} className="h-[1lh]">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}
