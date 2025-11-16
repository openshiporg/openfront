import { Circle } from "lucide-react"
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
            className={cn("flex gap-x-2 items-center", {
              "ml-[-1.4375rem]": i.value === value,
            })}
          >
            {i.value === value && <Circle className="h-2 w-2 fill-current" />}
            <RadioGroupItem
              id={i.value}
              value={i.value}
              className="h-3 w-3"
            />
            <Label
              htmlFor={i.value}
              className={cn(
                "text-xs leading-5 !transform-none text-muted-foreground hover:cursor-pointer",
                {
                  "text-foreground": i.value === value,
                }
              )}
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
