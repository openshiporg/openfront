"use client";

import { Button } from "@ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

export function WeightInput({ weight, setWeight }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
          <Button
            variant="outline"
            className={`h-6 px-1.5 text-xs rounded-none shadow-none first:rounded-s-lg focus-visible:z-10 ${
              weight.unit === "oz" ? "bg-accent" : ""
            }`}
            onClick={() => setWeight((prev) => ({ ...prev, unit: "oz" }))}
          >
            oz
          </Button>
          <Button
            variant="outline"
            className={`h-6 px-1.5 text-xs rounded-none shadow-none focus-visible:z-10 ${
              weight.unit === "lb" ? "bg-accent" : ""
            }`}
            onClick={() => setWeight((prev) => ({ ...prev, unit: "lb" }))}
          >
            lb
          </Button>
          <Button
            variant="outline"
            className={`h-6 px-1.5 text-xs rounded-none shadow-none last:rounded-e-lg focus-visible:z-10 ${
              weight.unit === "kg" ? "bg-accent" : ""
            }`}
            onClick={() => setWeight((prev) => ({ ...prev, unit: "kg" }))}
          >
            kg
          </Button>
        </div>
      </div>
      <div className="relative inline-flex h-7 items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5">
        <input
          type="number"
          value={weight.value}
          onChange={(e) =>
            setWeight((prev) => ({ ...prev, value: e.target.value }))
          }
          className="w-11 grow bg-background px-1 py-2 text-center tabular-nums text-foreground focus:outline-none border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="pr-2 text-muted-foreground">{weight.unit}</span>

        <div className="flex h-[calc(100%+2px)] flex-col">
          <Button
            size="icon"
            variant="ghost"
            className="[&_svg]:size-3 -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
            onClick={() => {
              const currentValue = parseFloat(weight.value) || 0;
              setWeight((prev) => ({
                ...prev,
                value: (currentValue + 1).toString(),
              }));
            }}
          >
            <ChevronUp strokeWidth={2} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="[&_svg]:size-3 -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
            onClick={() => {
              const currentValue = parseFloat(weight.value) || 0;
              if (currentValue > 0) {
                setWeight((prev) => ({
                  ...prev,
                  value: (currentValue - 1).toString(),
                }));
              }
            }}
          >
            <ChevronDown strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  );
} 