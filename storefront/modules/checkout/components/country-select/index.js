import { forwardRef, useImperativeHandle, useMemo, useRef } from "react"

import NativeSelect from "@storefront/modules/common/components/native-select";

const CountrySelect = forwardRef(({ placeholder = "Country", region, defaultValue, ...props }, ref) => {
  const innerRef = useRef(null)

  useImperativeHandle(ref, () => innerRef.current)

  const countryOptions = useMemo(() => {
    if (!region) {
      return []
    }

    return region.countries.map((country) => ({
      value: country.iso2,
      label: country.name,
    }));
  }, [region])

  return (
    <NativeSelect
      ref={innerRef}
      placeholder={placeholder}
      defaultValue={defaultValue}
      {...props}>
      {countryOptions.map(({ value, label }, index) => (
        <option key={index} value={value}>
          {label}
        </option>
      ))}
    </NativeSelect>
  );
})

CountrySelect.displayName = "CountrySelect"

export default CountrySelect
