// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { CaretLeft, CaretRight, MagnifyingGlass, Star } from "./icons";
import { MotionConfig, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button, IconButton } from "./action-button";
import { RollingNumber } from "./rolling-number";
import { Shell, ShellHeader } from "./surface";
import { EASE_OUT } from "./motion-tokens";
import { cn } from "./cn";

export type ResultItem = {
  id: string;
  title: string;
  /** One line under the title, e.g. "Lisbon · 1.2 km from center". */
  meta?: string;
  /** Right-aligned price or score, e.g. "$214 / night". */
  price?: string;
  rating?: number;
  /** Image URL. Without one, a soft gradient placeholder from `tint`. */
  image?: string;
  /** Any CSS color for the placeholder. */
  tint?: string;
  badge?: string;
  action?: string;
};

export type ResultCarouselProps = {
  data: ResultItem[];
  title: string;
  subtitle?: string;
  /** Smaller cards without images. */
  compact?: boolean;
  onAction?: (item: ResultItem) => void;
  onOpen?: (item: ResultItem) => void;
  className?: string;
};

export function ResultCarousel({
  data,
  title,
  subtitle,
  compact = false,
  onAction,
  onOpen,
  className,
}: ResultCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, data.length]);

  // Pages by one card; snapping lands it exactly on the next card's edge.
  const page = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * (card.offsetWidth + 6),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <Shell
        className={cn("max-w-2xl", className)}
        aria-roledescription="carousel"
        aria-label={title}
      >
        <ShellHeader
          icon={MagnifyingGlass}
          title={title}
          subtitle={
            subtitle ?? (
              <>
                <RollingNumber value={data.length} /> results
              </>
            )
          }
          aside={
            <>
              <IconButton
                icon={CaretLeft}
                iconWeight="bold"
                label="Previous results"
                size="sm"
                variant="secondary"
                disabled={edges.start}
                onClick={() => page(-1)}
              />
              <IconButton
                icon={CaretRight}
                iconWeight="bold"
                label="Next results"
                size="sm"
                variant="secondary"
                disabled={edges.end}
                onClick={() => page(1)}
              />
            </>
          }
        />
        <div
          ref={track}
          onScroll={measure}
          tabIndex={0}
          role="group"
          aria-label={`${title}, scroll horizontally`}
          className="flex snap-x snap-mandatory scroll-px-0 [scrollbar-width:none] gap-1.5 overflow-x-auto rounded-2xl outline-offset-2 [&::-webkit-scrollbar]:hidden"
        >
          {data.map((item, i) => (
            <motion.article
              key={item.id}
              data-card
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${data.length}: ${item.title}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.24,
                ease: EASE_OUT,
                delay: Math.min(i, 5) * 0.05,
              }}
              className={cn(
                "flex shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-surface-inset",
                compact ? "w-52" : "w-60",
              )}
            >
              {!compact && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => onOpen?.(item)}
                  className="relative m-1.5 mb-0 aspect-[4/3] overflow-hidden rounded-xl"
                  style={{
                    background: item.image
                      ? `center / cover url(${item.image})`
                      : `radial-gradient(120% 90% at 20% 10%, color-mix(in oklab, ${item.tint ?? "var(--brand)"} 55%, transparent), transparent 70%), linear-gradient(160deg, color-mix(in oklab, ${item.tint ?? "var(--brand)"} 30%, var(--surface)), var(--surface))`,
                  }}
                >
                  {item.badge && (
                    <span className="absolute top-2 left-2 text-xs font-medium text-white [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
                      {item.badge}
                    </span>
                  )}
                </button>
              )}
              <div className="flex flex-1 flex-col gap-1 p-3.5">
                <h4 className="truncate text-[0.875rem] font-medium">
                  {onOpen ? (
                    <button
                      type="button"
                      onClick={() => onOpen(item)}
                      className="max-w-full truncate text-left hover:underline"
                    >
                      {item.title}
                    </button>
                  ) : (
                    item.title
                  )}
                </h4>
                {item.meta && (
                  <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                )}
                <div className="mt-auto flex items-center gap-2 pt-2.5">
                  {item.rating !== undefined && (
                    <span className="flex items-center gap-1 text-xs tabular-nums">
                      <Star
                        weight="fill"
                        className="size-3.5 text-[#ff9f0a]"
                        aria-hidden="true"
                      />
                      {item.rating.toFixed(1)}
                      <span className="sr-only">out of 5</span>
                    </span>
                  )}
                  {item.price && (
                    <span className="ml-auto text-[0.8125rem] font-medium tabular-nums">
                      {item.price}
                    </span>
                  )}
                </div>
                {onAction && (
                  <Button
                    size="sm"
                    variant={i === 0 ? "primary" : "secondary"}
                    className="mt-2.5 w-full justify-center"
                    onClick={() => onAction(item)}
                  >
                    {item.action ?? "Select"}
                  </Button>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </Shell>
    </MotionConfig>
  );
}
