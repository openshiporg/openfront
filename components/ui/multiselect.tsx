"use client"

import { Fragment, useId, useState } from "react"
import { CheckIcon, ChevronDownIcon, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
  flag?: string
  disable?: boolean
  [key: string]: any
}

interface MultipleSelectorProps {
  value?: Option[]
  options?: Option[]
  onChange?: (options: Option[]) => void
  placeholder?: string
  emptyIndicator?: React.ReactNode
  disabled?: boolean
  className?: string
  label?: string
  searchPlaceholder?: string
  groupedOptions?: Array<{
    continent: string
    items: Option[]
  }>
}

export default function MultipleSelector({
  value = [],
  onChange,
  placeholder = "Select options",
  emptyIndicator,
  disabled,
  className,
  label,
  searchPlaceholder = "Search options...",
  options = [],
  groupedOptions,
}: MultipleSelectorProps) {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)

  const handleSelect = (selectedValue: string) => {
    const allOptions = groupedOptions 
      ? groupedOptions.flatMap(group => group.items)
      : options

    const option = allOptions.find(opt => opt.value === selectedValue)
    if (!option) return

    const isSelected = value.some(v => v.value === selectedValue)
    const newValue = isSelected
      ? value.filter(v => v.value !== selectedValue)
      : [...value, option]

    onChange?.(newValue)
  }

  const handleRemove = (optionToRemove: Option) => {
    const newValue = value.filter(v => v.value !== optionToRemove.value)
    onChange?.(newValue)
  }

  const getSelectedDisplay = () => {
    if (value.length === 0) return placeholder
    if (value.length === 1) {
      const option = value[0]
      return (
        <span className="flex min-w-0 items-center gap-2">
          {option.flag && <span className="text-lg leading-none">{option.flag}</span>}
          <span className="truncate">{option.label}</span>
        </span>
      )
    }
    return `${value.length} selected`
  }

  return (
    <div className="*:not-first:mt-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
                disabled && "cursor-not-allowed opacity-50",
                className
              )}
            >
              <span className={cn(
                "truncate text-left",
                value.length === 0 && "text-muted-foreground"
              )}>
                {getSelectedDisplay()}
              </span>
              <ChevronDownIcon
                size={16}
                className="text-muted-foreground/80 shrink-0"
                aria-hidden="true"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList>
                <CommandEmpty>
                  {emptyIndicator || "No options found."}
                </CommandEmpty>
                
                {/* Handle grouped options */}
                {groupedOptions ? (
                  groupedOptions.map((group) => (
                    <Fragment key={group.continent}>
                      <CommandGroup heading={group.continent}>
                        {group.items.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disable}
                            onSelect={() => handleSelect(option.value)}
                          >
                            {option.flag && (
                              <span className="text-lg leading-none mr-2">
                                {option.flag}
                              </span>
                            )}
                            {option.label}
                            {value.some(v => v.value === option.value) && (
                              <CheckIcon size={16} className="ml-auto" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Fragment>
                  ))
                ) : (
                  /* Handle flat options */
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disable}
                        onSelect={() => handleSelect(option.value)}
                      >
                        {option.flag && (
                          <span className="text-lg leading-none mr-2">
                            {option.flag}
                          </span>
                        )}
                        {option.label}
                        {value.some(v => v.value === option.value) && (
                          <CheckIcon size={16} className="ml-auto" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Selected options pills */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {value.map((option) => (
              <div
                key={option.value}
                className="inline-flex items-center gap-1 rounded border bg-secondary px-2 py-1 text-xs font-medium"
              >
                {option.flag && (
                  <span className="text-sm leading-none">{option.flag}</span>
                )}
                <span>{option.label}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-sm hover:bg-secondary-foreground/20"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemove(option)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}