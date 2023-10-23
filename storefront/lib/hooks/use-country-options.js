import { useRegions } from "medusa-react"
import { useMemo } from "react"

const useCountryOptions = () => {
  const { regions } = useRegions()

  const options = useMemo(() => {
    return regions
      ?.map((r) => {
        return r.countries.map((c) => ({
          country: c.iso_2,
          region: r.id,
          label: c.display_name,
        }));
      })
      .flat();
  }, [regions])

  return options
}

export default useCountryOptions
