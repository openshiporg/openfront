"use client"

import { useId } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag";
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@/features/storefront/lib/data/cart"

type CountryOption = {
  country: string
  region: string
  label: string
  continent?: string
}

type CountrySelectProps = {
  regions: any[]
}

const CountrySelect = ({ regions }: CountrySelectProps) => {
  const id = useId()
  const [current, setCurrent] = useState<
    | { country: string | undefined; region: string; label: string | undefined; continent?: string }
    | undefined
  >(undefined)

  const params = useParams() as Record<string, string>
  const countryCode = params['countryCode']
  const pathname = usePathname() ?? ''
  const currentPath = pathname.split(`/${countryCode}`)[1] ?? ''

  // Group countries by continent
  const groupedOptions = useMemo(() => {
    const allOptions = regions
      ?.map((r) => {
        return r.countries?.map((c: any) => ({
          country: c.iso2,
          region: r.id,
          label: c.name,
          continent: c.continent || "Other"
        }))
      })
      .flat()
      .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))

    // Group by continent
    const grouped: Record<string, CountryOption[]> = {}
    allOptions?.forEach(option => {
      const continent = option.continent || "Other"
      if (!grouped[continent]) {
        grouped[continent] = []
      }
      grouped[continent].push(option)
    })

    return grouped
  }, [regions])

  const options = useMemo(() => {
    return Object.values(groupedOptions).flat()
  }, [groupedOptions])

  useEffect(() => {
    if (countryCode) {
      const option = options?.find((o) => o?.country === countryCode)
      setCurrent(option)
    }
  }, [options, countryCode])

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
  }

  return (
    <div className="w-full">
      <Select
        value={current?.country}
        onValueChange={(value) => {
          const option = options?.find((o) => o.country === value)
          if (option) handleChange(option)
        }}
      >
        <SelectTrigger
          id={id}
          className="w-full py-1 [&>span_svg]:text-muted-foreground/80 [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
        >
          <SelectValue placeholder="Select country">
            {current && (
              <span className="flex items-center gap-2">
                <span className="text-lg leading-none">
                  <ReactCountryFlag svg style={{ width: "16px", height: "16px" }} countryCode={current.country || ""} />
                </span>
                <span className="truncate">{current.label}</span>
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
                <SelectItem key={option.country} value={option.country}>
                  <span className="text-lg leading-none">
                    <ReactCountryFlag svg style={{ width: "16px", height: "16px" }} countryCode={option.country} />
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
}

export default CountrySelect
