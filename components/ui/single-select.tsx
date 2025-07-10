"use client"

import { Fragment, useId, useState } from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

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

export interface SingleSelectOption {
  value: string
  label: string
  flag?: string
  disable?: boolean
  [key: string]: any
}

interface SingleSelectProps {
  value?: string
  options?: SingleSelectOption[]
  onChange?: (value: string) => void
  placeholder?: string
  emptyIndicator?: React.ReactNode
  disabled?: boolean
  className?: string
  label?: string
  searchPlaceholder?: string
  groupedOptions?: Array<{
    continent: string
    items: SingleSelectOption[]
  }>
}

export default function SingleSelect({
  value,
  onChange,
  placeholder = "Select option",
  emptyIndicator,
  disabled,
  className,
  label,
  searchPlaceholder = "Search options...",
  options = [],
  groupedOptions,
}: SingleSelectProps) {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)

  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue)
    setOpen(false)
  }

  const getSelectedOption = () => {
    const allOptions = groupedOptions 
      ? groupedOptions.flatMap(group => group.items)
      : options

    return allOptions.find(opt => opt.value === value)
  }

  const selectedOption = getSelectedOption()

  return (
    <div className="*:not-first:mt-2">
      {label && <Label htmlFor={id}>{label}</Label>}
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
            {selectedOption ? (
              <span className="flex min-w-0 items-center gap-2">
                {selectedOption.flag && (
                  <span className="text-lg leading-none">{selectedOption.flag}</span>
                )}
                <span className="truncate">{selectedOption.label}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
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
                          {value === option.value && (
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
                      {value === option.value && (
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
    </div>
  )
}