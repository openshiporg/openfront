"use client";

import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ConvertToTabsProps {
  convertTo: string;
  onConvertToChange: (currency: string) => void;
}

export function ConvertToTabs({ convertTo, onConvertToChange }: ConvertToTabsProps) {
  const id = useId();

  return (
    <div className="flex flex-col items-start gap-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wise font-medium">Convert to</span>
      <div className="bg-black/5 dark:bg-white/10 inline-flex h-6 rounded-md p-0.5 shrink-0">
        <RadioGroup
          value={convertTo}
          onValueChange={onConvertToChange}
          className="group text-xs after:border after:border-border after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr_1fr] items-center gap-0 font-medium after:absolute after:inset-y-0 after:w-1/3 after:rounded-sm after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] data-[state=usd]:after:translate-x-0 data-[state=eur]:after:translate-x-full data-[state=gbp]:after:translate-x-[200%]"
          data-state={convertTo}
        >
          <label className="group-data-[state=eur]:text-muted-foreground/50 group-data-[state=gbp]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-6 cursor-pointer items-center justify-center px-1.5 whitespace-nowrap transition-colors select-none">
            USD
            <RadioGroupItem
              id={`${id}-usd`}
              value="usd"
              className="sr-only"
            />
          </label>
          <label className="group-data-[state=usd]:text-muted-foreground/50 group-data-[state=gbp]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-6 cursor-pointer items-center justify-center px-1.5 whitespace-nowrap transition-colors select-none">
            EUR
            <RadioGroupItem 
              id={`${id}-eur`} 
              value="eur" 
              className="sr-only" 
            />
          </label>
          <label className="group-data-[state=usd]:text-muted-foreground/50 group-data-[state=eur]:text-muted-foreground/50 relative z-10 inline-flex h-full min-w-6 cursor-pointer items-center justify-center px-1.5 whitespace-nowrap transition-colors select-none">
            GBP
            <RadioGroupItem 
              id={`${id}-gbp`} 
              value="gbp" 
              className="sr-only" 
            />
          </label>
        </RadioGroup>
      </div>
    </div>
  );
}