// TUFFUI (https://tuffui.com) · MIT License · Copyright (c) 2026 TUFFUI contributors
// Free to use. If it helps you, you can support it: https://ko-fi.com/yurigokoryan
"use client";

import { CaretDown, Check, type Icon } from "./icons";
import { motion, useReducedMotion } from "framer-motion";
import { Popover as PopoverPrimitive, Select as SelectPrimitive } from "./radix";
import { useId, useMemo, useState } from "react";
import { EASE_OUT, instant } from "./motion-tokens";
import { cn } from "./cn";
import { Spinner } from "./loader";

// Radix's `asChild`, passed as a spread: the shadcn CLI rewrites a literal
// `asChild` attribute into Base UI's `render` prop for base-* styles, which
// would break these Radix parts after install.
const slot = { asChild: true } as const;

export type SelectOption = {
  value: string;
  label: string;
  icon?: Icon;
  description?: string;
  disabled?: boolean;
};

export type SelectGroup = { label?: string; options: SelectOption[] };

type FieldProps = {
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Error text; marks the control invalid and is announced with it. */
  error?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const control =
  "flex h-9 w-full items-center gap-2 rounded-full bg-foreground/[0.06] px-3.5 text-left text-sm text-foreground outline-none transition-[background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-foreground/[0.08] focus-visible:bg-foreground/[0.1] disabled:opacity-40 aria-invalid:bg-negative/10 data-[placeholder]:text-muted-foreground";
const surface =
  "z-50 rounded-2xl bg-surface-inset p-1 text-foreground shadow-[0_12px_32px_-12px_rgb(0_0_0/0.28)] outline-none dark:bg-surface-raised dark:shadow-[0_16px_40px_-12px_rgb(0_0_0/0.7)]";
const row =
  "relative flex cursor-default items-center gap-2.5 rounded-xl py-1.5 pr-8 pl-2.5 text-[0.8125rem] outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-foreground/[0.07] aria-selected:bg-foreground/[0.07]";

function Field({
  label,
  description,
  error,
  className,
  children,
}: Pick<FieldProps, "label" | "description" | "error" | "className"> & {
  children: (ids: {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: "true";
  }) => React.ReactNode;
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

function OptionBody({ option }: { option: SelectOption }) {
  return (
    <>
      {option.icon && (
        <option.icon
          weight="fill"
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{option.label}</span>
        {option.description && (
          <span className="block truncate text-xs text-muted-foreground">
            {option.description}
          </span>
        )}
      </span>
    </>
  );
}

/** Grows in from the trigger; nothing animates when it was opened from the keyboard. */
function useMenuMotion() {
  const reduce = useReducedMotion();
  const [viaKeyboard, setViaKeyboard] = useState(false);
  return {
    setViaKeyboard,
    motionProps: {
      initial: { opacity: 0, scale: reduce ? 1 : 0.97 },
      animate: { opacity: 1, scale: 1 },
      transition: viaKeyboard || reduce ? instant : { duration: 0.16, ease: EASE_OUT },
    },
  };
}

export type SelectProps = FieldProps & {
  /** Flat options, or groups with labels. */
  options: SelectOption[] | SelectGroup[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
};

const isGrouped = (options: SelectOption[] | SelectGroup[]): options is SelectGroup[] =>
  options.length > 0 && "options" in options[0];

/** Pick one option from a list. Type to jump to an option. */
export function Select({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  name,
  required,
  disabled,
  label,
  description,
  error,
  className,
}: SelectProps) {
  const groups = isGrouped(options) ? options : [{ options }];
  const { setViaKeyboard, motionProps } = useMenuMotion();

  return (
    <Field label={label} description={description} error={error} className={className}>
      {(ids) => (
        <SelectPrimitive.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          name={name}
          required={required}
          disabled={disabled}
        >
          <SelectPrimitive.Trigger
            {...ids}
            className={control}
            onPointerDown={() => setViaKeyboard(false)}
            onKeyDown={() => setViaKeyboard(true)}
          >
            <span className="min-w-0 flex-1 truncate">
              <SelectPrimitive.Value placeholder={placeholder} />
            </span>
            <SelectPrimitive.Icon>
              <CaretDown weight="bold" className="size-3.5 text-muted-foreground" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              collisionPadding={12}
              className="z-50 w-(--radix-select-trigger-width) min-w-48"
            >
              <motion.div
                {...motionProps}
                style={{
                  transformOrigin: "var(--radix-select-content-transform-origin)",
                }}
                className={surface}
              >
                <SelectPrimitive.Viewport className="max-h-72">
                  {groups.map((group, g) => (
                    <SelectPrimitive.Group key={g} className={cn(g > 0 && "mt-1 pt-1")}>
                      {group.label && (
                        <SelectPrimitive.Label className="px-2.5 pt-1 pb-0.5 text-[0.75rem] font-medium text-muted-foreground">
                          {group.label}
                        </SelectPrimitive.Label>
                      )}
                      {group.options.map((option) => (
                        <SelectPrimitive.Item
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                          className={row}
                        >
                          {option.icon && (
                            <option.icon
                              weight="fill"
                              className="size-4 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                          )}
                          <span className="min-w-0 flex-1">
                            <SelectPrimitive.ItemText>
                              {option.label}
                            </SelectPrimitive.ItemText>
                            {option.description && (
                              <span className="block truncate text-xs text-muted-foreground">
                                {option.description}
                              </span>
                            )}
                          </span>
                          <SelectPrimitive.ItemIndicator className="absolute right-2.5">
                            <Check weight="bold" className="size-3.5 text-brand" />
                          </SelectPrimitive.ItemIndicator>
                        </SelectPrimitive.Item>
                      ))}
                    </SelectPrimitive.Group>
                  ))}
                </SelectPrimitive.Viewport>
              </motion.div>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      )}
    </Field>
  );
}

export type ComboboxProps = FieldProps & {
  options: SelectOption[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  /**
   * Called as the user types. Pass it to filter on your side (e.g. a server
   * search) — then `options` are shown as given. Without it, options are
   * filtered by label.
   */
  onQueryChange?: (query: string) => void;
  loading?: boolean;
  emptyText?: string;
};

/** Type to search a list and pick one option. */
export function Combobox({
  options,
  value: valueProp,
  onValueChange,
  onQueryChange,
  loading = false,
  emptyText = "No matches",
  placeholder = "Search…",
  disabled,
  label,
  description,
  error,
  className,
}: ComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [valueState, setValueState] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const value = valueProp === undefined ? valueState : valueProp;
  const selected = options.find((o) => o.value === value);
  const { setViaKeyboard, motionProps } = useMenuMotion();

  const shown = useMemo(
    () =>
      onQueryChange || !query
        ? options
        : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query, onQueryChange],
  );

  const choose = (option: SelectOption) => {
    setValueState(option.value);
    onValueChange?.(option.value);
    setQuery("");
    setOpen(false);
  };

  return (
    <Field label={label} description={description} error={error} className={className}>
      {(ids) => (
        <PopoverPrimitive.Root open={open && !disabled} onOpenChange={setOpen}>
          <PopoverPrimitive.Anchor {...slot}>
            <div className="relative">
              <input
                {...ids}
                role="combobox"
                aria-expanded={open}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  open && shown[active] ? `${listId}-${active}` : undefined
                }
                disabled={disabled}
                placeholder={selected ? selected.label : placeholder}
                value={open ? query : (selected?.label ?? "")}
                onPointerDown={() => setViaKeyboard(false)}
                onFocus={() => setOpen(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                  setOpen(true);
                  onQueryChange?.(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    setViaKeyboard(true);
                    setOpen(true);
                    const step = event.key === "ArrowDown" ? 1 : -1;
                    setActive((i) =>
                      shown.length ? (i + step + shown.length) % shown.length : 0,
                    );
                  } else if (event.key === "Enter" && open && shown[active]) {
                    event.preventDefault();
                    if (!shown[active].disabled) choose(shown[active]);
                  } else if (event.key === "Escape") {
                    setOpen(false);
                  }
                }}
                className={cn(
                  control,
                  "pr-9 placeholder:text-muted-foreground",
                  selected && !open && "placeholder:text-foreground",
                )}
              />
              {loading ? (
                <Spinner
                  size="sm"
                  label="Searching"
                  className="absolute top-1/2 right-3.5 -translate-y-1/2"
                />
              ) : (
                <CaretDown
                  weight="bold"
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                />
              )}
            </div>
          </PopoverPrimitive.Anchor>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              sideOffset={6}
              collisionPadding={12}
              onOpenAutoFocus={(event) => event.preventDefault()}
              onInteractOutside={(event) => {
                // Clicks on the input itself shouldn't close and reopen the list.
                if ((event.target as HTMLElement).closest?.('[role="combobox"]'))
                  event.preventDefault();
              }}
              className="z-50 w-(--radix-popover-trigger-width) min-w-48 outline-none"
            >
              <motion.div
                {...motionProps}
                style={{
                  transformOrigin: "var(--radix-popover-content-transform-origin)",
                }}
                className={surface}
              >
                <ul id={listId} role="listbox" className="max-h-72 overflow-y-auto">
                  {shown.map((option, i) => (
                    <li
                      key={option.value}
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      aria-disabled={option.disabled || undefined}
                      data-disabled={option.disabled ? "" : undefined}
                      onPointerMove={() => setActive(i)}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => !option.disabled && choose(option)}
                      className={row}
                    >
                      <OptionBody option={option} />
                      {option.value === value && (
                        <Check
                          weight="bold"
                          className="absolute right-2.5 size-3.5 text-brand"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  ))}
                  {shown.length === 0 && (
                    <li
                      role="presentation"
                      className="px-2.5 py-2 text-[0.8125rem] text-muted-foreground"
                    >
                      {loading ? "Searching…" : emptyText}
                    </li>
                  )}
                </ul>
              </motion.div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      )}
    </Field>
  );
}
