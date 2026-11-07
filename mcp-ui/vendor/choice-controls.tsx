// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { Check, Minus } from "./icons";
import { createContext, useContext, useRef, useState } from "react";
import { cn } from "./cn";

// Controls sit slightly recessed: a soft inner shadow on the track, the box and the dot.
const inset =
  "shadow-[inset_0_1px_2px_rgb(0_0_0/0.14)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5)]";

/** Controlled when `value` is set, otherwise keeps its own state. */
function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [inner, setInner] = useState(initial);
  const current = value === undefined ? inner : value;
  const set = (next: T) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };
  return [current, set] as const;
}

const ease = "ease-[cubic-bezier(0.23,1,0.32,1)]";

type Labelled = {
  /** Visible label next to the control; clicking it toggles the control. */
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
};

function Field({
  label,
  description,
  className,
  children,
}: Labelled & { children: React.ReactNode }) {
  if (!label) return <>{children}</>;
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 select-none", className)}>
      <span className="flex min-h-5 items-center">{children}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm">{label}</span>
        {description && (
          <span className="block text-[0.8125rem] text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export type SwitchProps = Labelled &
  Omit<React.ComponentProps<"button">, "onChange" | "value" | "defaultChecked"> & {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
  };

/** Switch with I / O glyphs so the state never relies on color alone. */
export function Switch({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  className,
  disabled,
  ...props
}: SwitchProps) {
  const [checked, setChecked] = useControllable(
    checkedProp,
    defaultChecked,
    onCheckedChange,
  );
  // Keyboard toggles skip the slide; pointer toggles get it.
  const [instant, setInstant] = useState(false);

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-instant={instant || undefined}
      onClick={(e) => {
        setInstant(e.detail === 0);
        setChecked(!checked);
      }}
      className={cn(
        "group relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-40 data-instant:transition-none",
        ease,
        // Switch green, brighter than the text-safe --positive.
        inset,
        checked ? "bg-[#34c759] dark:bg-[#30d158]" : "bg-foreground/[0.12]",
        !label && className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-[11px] h-2.5 w-[2px] -translate-y-1/2 rounded-full bg-white/80 transition-opacity duration-150",
          !checked && "opacity-0",
        )}
      />
      <svg
        aria-hidden="true"
        viewBox="0 0 10 10"
        className={cn(
          "absolute top-1/2 right-[8px] size-2.5 -translate-y-1/2 text-foreground/40 transition-opacity duration-150",
          checked && "opacity-0",
        )}
      >
        <circle
          cx="5"
          cy="5"
          r="3.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-[linear-gradient(180deg,#ffffff,#e2e2e2)] shadow-[0_2px_3px_rgba(0,0,0,0.18)] transition-[translate,width] duration-250 group-enabled:group-active:w-7 group-data-instant:transition-none motion-reduce:transition-none",
          ease,
          checked
            ? "translate-x-5 group-enabled:group-active:translate-x-4"
            : "dark:bg-[linear-gradient(180deg,#a8a8a8,#7a7a7a)]",
        )}
      />
    </button>
  );

  return (
    <Field label={label} description={description} className={className}>
      {control}
    </Field>
  );
}

export type CheckboxProps = Labelled &
  Omit<React.ComponentProps<"button">, "onChange" | "value" | "defaultChecked"> & {
    checked?: boolean | "mixed";
    defaultChecked?: boolean | "mixed";
    onCheckedChange?: (checked: boolean) => void;
  };

/** Borderless checkbox: a tinted square that fills with a bold check. */
export function Checkbox({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  const [checked, setChecked] = useControllable<boolean | "mixed">(
    checkedProp,
    defaultChecked,
    (v) => onCheckedChange?.(v === true),
  );
  const on = checked !== false;

  return (
    <Field label={label} description={description} className={className}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => setChecked(checked !== true)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-[6px] transition-[background-color,scale] duration-150 active:scale-[0.92] disabled:opacity-40",
          ease,
          inset,
          on ? "bg-brand text-white" : "bg-foreground/[0.12] hover:bg-foreground/[0.18]",
          !label && className,
        )}
        {...props}
      >
        {checked === "mixed" ? (
          <Minus weight="bold" className="size-3" aria-hidden="true" />
        ) : (
          checked && <Check weight="bold" className="size-3" aria-hidden="true" />
        )}
      </button>
    </Field>
  );
}

type RadioContext = {
  value: string | undefined;
  select: (value: string) => void;
  name: string;
};
const RadioCtx = createContext<RadioContext | null>(null);

export type RadioGroupProps = Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the group. */
  label: string;
};

/** Radio group with roving focus: arrow keys move and select, like native radios. */
export function RadioGroup({
  value: valueProp,
  defaultValue,
  onValueChange,
  label,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [value, setValue] = useControllable(valueProp, defaultValue, (v) => {
    if (v !== undefined) onValueChange?.(v);
  });
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const radios = [
      ...(ref.current?.querySelectorAll<HTMLButtonElement>(
        '[role="radio"]:not(:disabled)',
      ) ?? []),
    ];
    const at = radios.findIndex((r) => r === document.activeElement);
    const next = radios[(at + step + radios.length) % radios.length];
    next?.focus();
    next?.click();
  };

  return (
    <RadioCtx.Provider value={{ value, select: setValue, name: label }}>
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn("flex flex-col gap-2.5", className)}
        {...props}
      >
        {children}
      </div>
    </RadioCtx.Provider>
  );
}

export type RadioProps = Labelled &
  Omit<React.ComponentProps<"button">, "value"> & { value: string };

export function Radio({
  value,
  label,
  description,
  className,
  disabled,
  ...props
}: RadioProps) {
  const group = useContext(RadioCtx);
  if (!group) throw new Error("<Radio> must be used inside <RadioGroup>");
  const checked = group.value === value;
  // The checked radio is the group's tab stop; with none checked, every radio is.
  const tabStop = checked || group.value === undefined;

  return (
    <Field label={label} description={description} className={className}>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        tabIndex={tabStop ? 0 : -1}
        disabled={disabled}
        onClick={() => group.select(value)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full transition-[background-color,scale] duration-150 active:scale-[0.92] disabled:opacity-40",
          ease,
          inset,
          checked ? "bg-brand" : "bg-foreground/[0.12] hover:bg-foreground/[0.18]",
          !label && className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-full bg-white transition-[scale,opacity] duration-150",
            ease,
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      </button>
    </Field>
  );
}
