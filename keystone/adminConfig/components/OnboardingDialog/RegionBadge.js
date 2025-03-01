import SelectableBadge from "./SelectableBadge";
import { CornerDownRight } from "lucide-react";

const RegionBadge = ({
  region,
  checked,
  onCheckedChange,
  countryStates,
  onCountryChange,
  disabled,
}) => {
  const countryCount = region.countries.length;
  const selectedCount = region.countries.filter(
    (country) => countryStates[country.data.iso2]
  ).length;
  const isIndeterminate = selectedCount > 0 && selectedCount < countryCount;
  const isAllSelected = selectedCount === countryCount;

  const handleRegionChange = (checked) => {
    onCheckedChange(checked);
    region.countries.forEach((country) => {
      onCountryChange(country, checked);
    });
  };

  const handleCountryChange = (country, checked) => {
    onCountryChange(country, checked);
    // Don't update region state here - it will be handled by the parent component
  };

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center gap-2">
        <SelectableBadge
          title={`${region.title}`}
          checked={isAllSelected}
          onCheckedChange={handleRegionChange}
          disabled={disabled}
          indeterminate={isIndeterminate}
          className="text-sm"
        />
      </div>
      <div className="flex items-center ml-2">
        <CornerDownRight className="h-4 w-4 text-muted-foreground" />
        <div className="ml-2 flex flex-wrap gap-2">
          {region.countries.map((country) => (
            <SelectableBadge
              key={country.data.iso2}
              title={country.title}
              checked={countryStates[country.data.iso2]}
              onCheckedChange={(checked) =>
                handleCountryChange(country, checked)
              }
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RegionBadge; 