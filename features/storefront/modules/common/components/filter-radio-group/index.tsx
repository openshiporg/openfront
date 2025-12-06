import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

type FilterRadioGroupProps = {
  title: string
  items: {
    value: string
    label: string
  }[]
  value: any
  handleChange: (...args: any[]) => void
  "data-testid"?: string
}

const FilterRadioGroup = ({
  title,
  items,
  value,
  handleChange,
  "data-testid": dataTestId,
}: FilterRadioGroupProps) => {
  return (
    <div className="flex gap-x-3 flex-col gap-y-3">
      <p className="text-xs font-medium leading-5 text-muted-foreground">{title}</p>
      <RadioGroup data-testid={dataTestId} onValueChange={handleChange} value={value}>
        {items?.map((i) => (
          <div
            key={i.value}
            className={cn(
              "relative flex gap-2 rounded-md py-1.5 pr-3 text-sm transition cursor-pointer",
              i.value === value
                ? "pl-4 rounded bg-white text-blue-600 shadow ring-1 ring-gray-200 dark:bg-gray-900 dark:text-blue-500 dark:ring-gray-800"
                : "pl-4 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            )}
            onClick={() => handleChange(i.value)}
          >
            {i.value === value && (
              <div
                className="absolute left-1.5 top-1/2 h-5 w-px -translate-y-1/2 bg-blue-500 dark:bg-blue-500"
                aria-hidden="true"
              />
            )}
            <RadioGroupItem
              id={i.value}
              value={i.value}
              className="sr-only"
            />
            <Label
              htmlFor={i.value}
              className="text-sm leading-5 !transform-none hover:cursor-pointer"
              data-testid="radio-label"
              data-active={i.value === value}
            >
              {i.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default FilterRadioGroup
