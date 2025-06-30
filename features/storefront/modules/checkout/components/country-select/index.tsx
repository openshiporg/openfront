import { forwardRef, useImperativeHandle, useMemo, useRef, useId, useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import ReactCountryFlag from "react-country-flag"

// We're keeping the same interface but adapting to use shadcn UI
type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  placeholder?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
}

type CountryOption = {
  value: string
  label: string
  continent?: string
}

const CountrySelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps & {
    region?: any
  }
>(({ placeholder = "Country", region, defaultValue, value, onChange, ...props }, ref) => {
  const id = useId()
  const innerRef = useRef<HTMLSelectElement>(null)
  const [selectedValue, setSelectedValue] = useState<string | undefined>(value as string || defaultValue as string)

  useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
    ref,
    () => innerRef.current
  )

  // Group countries by continent if available
  const countryOptions = useMemo(() => {
    if (!region) {
      return []
    }

    return region.countries?.map((country: any) => ({
      value: country.iso2,
      label: country.name,
      continent: country.continent || "Other"
    })) || []
  }, [region])

  // Group by continent
  const groupedOptions = useMemo(() => {
    const grouped: Record<string, CountryOption[]> = {}

    countryOptions.forEach((option: CountryOption) => {
      const continent = option.continent || "Other"
      if (!grouped[continent]) {
        grouped[continent] = []
      }
      grouped[continent].push(option)
    })

    // Sort countries within each continent
    Object.keys(grouped).forEach(continent => {
      grouped[continent].sort((a, b) => a.label.localeCompare(b.label))
    })

    return grouped
  }, [countryOptions])

  // Update the internal state when the value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value as string)
    }
  }, [value])

  // Handle value change and propagate to the original onChange handler
  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)

    // Create a synthetic event to maintain compatibility with existing code
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: props.name,
          value: newValue
        }
      } as React.ChangeEvent<HTMLSelectElement>

      onChange(syntheticEvent)
    }
  }

  return (
    <div className="w-full">
      {/* Hidden select element to maintain ref compatibility */}
      <select
        ref={innerRef}
        name={props.name}
        value={selectedValue}
        onChange={onChange}
        className="hidden"
        {...props}
      >
        <option value="">{placeholder}</option>
        {countryOptions.map((option: CountryOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Shadcn UI Select component */}
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
        name={props.name}
      >
        <SelectTrigger
          id={id}
          className="w-full py-1 [&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
        >
          <SelectValue placeholder={placeholder}>
            {selectedValue && (
              <span className="flex items-center gap-2">
                <span className="text-lg leading-none">
                  <ReactCountryFlag svg style={{ width: "16px", height: "16px" }} countryCode={selectedValue} />
                </span>
                <span className="truncate">
                  {countryOptions.find((o: CountryOption) => o.value === selectedValue)?.label}
                </span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className="max-h-[442px] z-[900] [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0"
        >
          {Object.entries(groupedOptions).map(([continent, countries]) => (
            <SelectGroup key={continent}>
              <SelectLabel className="ps-2">{continent}</SelectLabel>
              {countries.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span className="text-lg leading-none">
                    <ReactCountryFlag svg style={{ width: "16px", height: "16px" }} countryCode={option.value} />
                  </span>{" "}
                  <span className="truncate">{option.label}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
})

CountrySelect.displayName = "CountrySelect"

export default CountrySelect
