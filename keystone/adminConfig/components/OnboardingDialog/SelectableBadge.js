import { Checkbox } from "@keystone/themes/Tailwind/orion/primitives/default/ui/checkbox";
import { Check, Info } from "lucide-react";
import { cn } from "@keystone/utils/cn";

const SelectableBadge = ({
  title,
  checked,
  onCheckedChange,
  disabled,
  description,
  indeterminate,
  className,
  tooltip,
}) => (
  <label
    className={cn(
      "inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
      "cursor-pointer transition-colors",
      checked
        ? "bg-zinc-100 text-zinc-900 ring-zinc-500/30 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/20"
        : "bg-zinc-50/50 text-zinc-500 ring-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:ring-zinc-700/50",
      "hover:bg-zinc-100 dark:hover:bg-zinc-800",
      "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring/70",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    <div className="flex items-center gap-1">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="peer sr-only after:absolute after:inset-0"
        data-state={
          indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"
        }
      />
      <Check
        size={12}
        strokeWidth={2}
        className="hidden peer-data-[state=checked]:block"
        aria-hidden="true"
      />
      {indeterminate && (
        <svg
          width="9"
          height="9"
          viewBox="0 0 9 9"
          fill="currentcolor"
          xmlns="http://www.w3.org/2000/svg"
          className="peer-data-[state=indeterminate]:block hidden"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.75 4.5C0.75 4.08579 1.08579 3.75 1.5 3.75H7.5C7.91421 3.75 8.25 4.08579 8.25 4.5C8.25 4.91421 7.91421 5.25 7.5 5.25H1.5C1.08579 5.25 0.75 4.91421 0.75 4.5Z"
          />
        </svg>
      )}
      <span className="select-none">{title}</span>
      {tooltip && (
        <div className="relative group">
          <Info className="inline-block h-3 w-3 text-muted-foreground" />
          <div className="absolute left-0 top-full mt-1 hidden group-hover:block z-50">
            <div className="rounded-md shadow-lg p-2 text-xs max-w-xs">
              <p className="text-muted-foreground">{tooltip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  </label>
);

export default SelectableBadge; 