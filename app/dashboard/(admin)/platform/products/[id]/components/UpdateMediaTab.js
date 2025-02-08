import { useList } from "@keystone/keystoneProvider";
import { Fields } from "@keystone/themes/Tailwind/orion/components/Fields";
import { getFilteredProps } from "@keystone/utils/getFilteredProps";
import { useMemo } from "react";

export function UpdateMediaTab({ value, onChange, fields, fieldModes, groups, forceValidation, invalidFields }) {
  const filteredProps = useMemo(() => {
    const modifications = [
      { key: "productImages" },
    ];
    return getFilteredProps({ fields, fieldModes, groups }, modifications);
  }, [fields, fieldModes, groups]);

  return (
    <div className="space-y-6">
      <Fields 
        {...filteredProps}
        value={value}
        onChange={onChange}
        forceValidation={forceValidation}
        invalidFields={invalidFields}
      />
    </div>
  );
} 