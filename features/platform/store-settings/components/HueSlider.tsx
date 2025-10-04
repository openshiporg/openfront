'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface HueSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  className?: string;
}

export function HueSlider({ value, onValueChange, className }: HueSliderProps) {
  return (
    <SliderPrimitive.Root
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      max={360}
      min={0}
      step={1}
      value={[value]}
      onValueChange={([val]) => onValueChange(val)}
    >
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-[#FF0000] via-[#FFFF00] via-[#00FF00] via-[#00FFFF] via-[#0000FF] via-[#FF00FF] to-[#FF0000]">
        <SliderPrimitive.Range className="absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
}
