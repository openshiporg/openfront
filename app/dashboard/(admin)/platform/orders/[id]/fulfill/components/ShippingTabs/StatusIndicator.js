"use client";

import { cn } from "@keystone/utils/cn";

export function StatusIndicator({ provider, isPreset }) {
  if (isPreset && !provider?.isActive) {
    return (
      <span className="inline-block w-2.5 h-2.5 rounded-full border-2 bg-zinc-200 border-zinc-300" />
    );
  }

  return (
    <span
      className={cn(
        "inline-block w-2.5 h-2.5 rounded-full border-2",
        provider?.isActive
          ? "bg-green-500 border-green-300"
          : "bg-red-500 border-red-300"
      )}
    />
  );
} 