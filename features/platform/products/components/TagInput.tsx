import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Value {
  id?: string;
  value: string;
  label: string;
}

interface TagInputProps {
  placeholder?: string;
  value: Value[];
  onChange?: (values: Value[]) => void;
  readOnly?: boolean;
  className?: string;
}

export function TagInput({
  placeholder = "Add values...",
  value = [],
  onChange,
  readOnly = false,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() && !readOnly) {
      e.preventDefault();
      const newValue: Value = {
        value: inputValue.trim(),
        label: inputValue.trim(),
      };
      onChange?.([...value, newValue]);
      setInputValue("");
    }
  };

  const handleRemove = (index: number) => {
    if (!readOnly) {
      const newValues = value.filter((_, i) => i !== index);
      onChange?.(newValues);
    }
  };

  return (
    <div className={cn("min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2", className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((item, index) => (
          <div
            key={item.id || index}
            className="inline-flex items-center gap-1 rounded-md bg-background border border-border px-2 py-1 text-sm"
          >
            <span>{item.label || item.value}</span>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
          />
        )}
      </div>
      {value.length === 0 && readOnly && (
        <p className="text-sm text-muted-foreground">No values added yet.</p>
      )}
    </div>
  );
}