// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { MagnifyingGlass, X } from "./icons";
import { useId } from "react";
import { cn } from "./cn";

const control =
  "w-full bg-foreground/[0.06] text-sm text-foreground outline-none transition-[background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] placeholder:text-muted-foreground hover:bg-foreground/[0.08] focus-visible:bg-foreground/[0.1] disabled:opacity-40 aria-invalid:bg-negative/10";

type FieldProps = {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Error text; marks the control invalid and is announced with it. */
  error?: React.ReactNode;
  className?: string;
};

/** Shared label / description / error wiring for every field. */
function Field({
  label,
  description,
  error,
  className,
  children,
}: FieldProps & {
  children: (ids: Record<string, string | undefined>) => React.ReactNode;
}) {
  const id = useId();
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="px-1 text-[0.8125rem] font-medium">
          {label}
        </label>
      )}
      {children({
        id,
        "aria-describedby":
          [descriptionId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? "true" : undefined,
      })}
      {description && !error && (
        <p id={descriptionId} className="px-1 text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} className="px-1 text-xs text-negative">
          {error}
        </p>
      )}
    </div>
  );
}

export type TextFieldProps = FieldProps &
  Omit<React.ComponentProps<"input">, "className">;

export function TextField({
  label,
  description,
  error,
  className,
  ...props
}: TextFieldProps) {
  return (
    <Field label={label} description={description} error={error} className={className}>
      {(ids) => (
        <input {...ids} {...props} className={cn(control, "h-9 rounded-full px-3.5")} />
      )}
    </Field>
  );
}

export type SearchFieldProps = Omit<TextFieldProps, "type"> & {
  /** Shows a clear button while there is text. */
  onClear?: () => void;
};

export function SearchField({
  label,
  description,
  error,
  className,
  onClear,
  value,
  placeholder = "Search",
  ...props
}: SearchFieldProps) {
  return (
    <Field label={label} description={description} error={error} className={className}>
      {(ids) => (
        <div className="relative">
          <MagnifyingGlass
            weight="fill"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            {...ids}
            type="search"
            value={value}
            placeholder={placeholder}
            aria-label={label ? undefined : placeholder}
            {...props}
            className={cn(
              control,
              "h-9 rounded-full pr-9 pl-8 [&::-webkit-search-cancel-button]:hidden",
            )}
          />
          {onClear && value !== undefined && value !== "" && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={onClear}
              className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,scale] duration-150 hover:bg-foreground/[0.08] hover:text-foreground active:scale-[0.92]"
            >
              <X weight="bold" className="size-3" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </Field>
  );
}

export type TextAreaProps = FieldProps &
  Omit<React.ComponentProps<"textarea">, "className">;

export function TextArea({
  label,
  description,
  error,
  className,
  rows = 3,
  ...props
}: TextAreaProps) {
  return (
    <Field label={label} description={description} error={error} className={className}>
      {(ids) => (
        <textarea
          {...ids}
          rows={rows}
          {...props}
          className={cn(control, "resize-none rounded-xl px-3.5 py-2.5 leading-relaxed")}
        />
      )}
    </Field>
  );
}
