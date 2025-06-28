'use client';

import { Button } from '@/components/ui/button';
import { useDebounce } from '@/features/platform/hooks/useDebounce';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';


interface WeightInputProps {
  weight: any;
  setWeight: (weight: any) => void;
  readOnly?: boolean;
}

export function WeightInput({ weight, setWeight }: WeightInputProps) {
  const [localWeight, setLocalWeight] = useState<any>(weight);
  const debouncedWeight = useDebounce(localWeight, 300);

  // Update parent state when debounced value changes
  useEffect(() => {
    setWeight(debouncedWeight);
  }, [debouncedWeight, setWeight]);

  const handleValueChange = useCallback((value: string) => {
    setLocalWeight((prev) => ({ ...prev, value }));
  }, []);

  const handleUnitChange = useCallback((unit: any['unit']) => {
    setLocalWeight((prev) => ({ ...prev, unit }));
  }, []);

  const incrementValue = useCallback(() => {
    const currentValue = parseFloat(localWeight.value) || 0;
    setLocalWeight((prev) => ({
      ...prev,
      value: (currentValue + 1).toString(),
    }));
  }, [localWeight]);

  const decrementValue = useCallback(() => {
    const currentValue = parseFloat(localWeight.value) || 0;
    if (currentValue > 0) {
      setLocalWeight((prev) => ({
        ...prev,
        value: (currentValue - 1).toString(),
      }));
    }
  }, [localWeight]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="inline-flex -space-x-px rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
          <Button
            variant="outline"
            className={`h-6 px-1.5 text-xs rounded-none shadow-none first:rounded-s-lg focus-visible:z-10 ${
              localWeight.unit === 'oz' ? 'bg-accent' : ''
            }`}
            onClick={() => handleUnitChange('oz')}
          >
            oz
          </Button>
          <Button
            variant="outline"
            className={`h-6 px-1.5 text-xs rounded-none shadow-none focus-visible:z-10 ${
              localWeight.unit === 'lb' ? 'bg-accent' : ''
            }`}
            onClick={() => handleUnitChange('lb')}
          >
            lb
          </Button>
          <Button
            variant="outline"
            className={`h-6 px-1.5 text-xs rounded-none shadow-none last:rounded-e-lg focus-visible:z-10 ${
              localWeight.unit === 'kg' ? 'bg-accent' : ''
            }`}
            onClick={() => handleUnitChange('kg')}
          >
            kg
          </Button>
        </div>
      </div>
      <div>
        <div className="relative inline-flex h-7 items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5">
          <input
            type="number"
            value={localWeight.value}
            onChange={(e) => handleValueChange(e.target.value)}
            className="w-14 bg-background px-1 py-2 text-center tabular-nums text-foreground focus:outline-none border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="pr-2 text-muted-foreground">{localWeight.unit}</span>

          <div className="flex h-[calc(100%+2px)] flex-col">
            <Button
              size="icon"
              variant="ghost"
              className="[&_svg]:size-3 -me-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
              onClick={incrementValue}
            >
              <ChevronUp strokeWidth={2} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="[&_svg]:size-3 -me-px -mt-px flex h-1/2 w-6 flex-1 items-center justify-center border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none"
              onClick={decrementValue}
            >
              <ChevronDown strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
