"use client";

import { Button } from "@ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useCallback, useState, useEffect } from "react";

export function DimensionsInput({ dimensions, setDimensions }) {
  const [localDimensions, setLocalDimensions] = useState(dimensions);

  // Update local state when props change
  useEffect(() => {
    setLocalDimensions(dimensions);
  }, [dimensions]);

  // Debounced update to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      setDimensions(localDimensions);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localDimensions, setDimensions]);

  const handleInputChange = useCallback((dimension, value) => {
    setLocalDimensions(prev => ({
      ...prev,
      [dimension]: value,
    }));
  }, []);

  const handleUnitChange = useCallback((unit) => {
    setDimensions(prev => ({ ...prev, unit }));
  }, [setDimensions]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
          <Button
            variant="outline"
            className={`h-6 px-1.5 text-xs rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 ${
              localDimensions.unit === "in" ? "bg-accent" : ""
            }`}
            onClick={() => handleUnitChange("in")}
          >
            in
          </Button>
          <Button
            variant="outline"
            className={`h-6 px-1.5 text-xs rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 ${
              localDimensions.unit === "cm" ? "bg-accent" : ""
            }`}
            onClick={() => handleUnitChange("cm")}
          >
            cm
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {["length", "width", "height"].map((dimension) => (
          <div
            key={dimension}
            className="relative inline-flex h-7 items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5"
          >
            <input
              type="number"
              value={localDimensions[dimension]}
              onChange={(e) => handleInputChange(dimension, e.target.value)}
              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-11 grow bg-background px-1 py-2 text-center tabular-nums text-foreground focus:outline-none border-0"
            />
            <span className="pr-2 text-muted-foreground">{localDimensions.unit}</span>
            <div className="flex h-[calc(100%+2px)] flex-col">
              <Button
                size="icon"
                variant="ghost"
                className="[&_svg]:size-3 -me-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
                onClick={() => {
                  const currentValue = parseFloat(localDimensions[dimension]) || 0;
                  handleInputChange(dimension, (currentValue + 1).toString());
                }}
              >
                <ChevronUp strokeWidth={2} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="[&_svg]:size-3 -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
                onClick={() => {
                  const currentValue = parseFloat(localDimensions[dimension]) || 0;
                  if (currentValue > 0) {
                    handleInputChange(dimension, (currentValue - 1).toString());
                  }
                }}
              >
                <ChevronDown strokeWidth={2} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 