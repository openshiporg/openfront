import { useState, useMemo } from "react";
import { Button } from "@ui/button";
import { Label } from "@ui/label";
import { Switch } from "@ui/switch";
import { Badge } from "@ui/badge";
import { cn } from "@keystone/utils/cn";
import { VariantCard } from "../../create/components/VariantCard";
import { Card, CardHeader, CardTitle } from "@ui/card";
import { getFilteredProps } from "@keystone/utils/getFilteredProps";
import { CustomFields } from "./CustomFields";

// Custom components for our fields
const VariantsComponent = ({ field, value, onChange }) => {
  const variants = value?.productVariants || [];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {variants.map((variant, index) => (
          <div key={variant.id || index} className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              {variant.title}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newVariants = [...variants];
                newVariants.splice(index, 1);
                onChange({ ...value, productVariants: newVariants });
              }}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const OptionsComponent = ({ field, value, onChange }) => {
  const options = value?.productOptions || [];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div key={option.id || index} className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm py-1.5 px-3">
              {option.name}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newOptions = [...options];
                newOptions.splice(index, 1);
                onChange({ ...value, productOptions: newOptions });
              }}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export function UpdateVariantsTab({ value, onChange, fields, fieldModes, groups, forceValidation, invalidFields }) {
  const hasVariants = value?.productVariants?.length > 1;
  const productOptions = value?.productOptions || [];
  const variants = value?.productVariants || [];

  const filteredProps = useMemo(() => {
    const modifications = [
      { key: "productVariants" },
      { key: "productOptions" },
    ];
    return getFilteredProps({ fields, fieldModes, groups }, modifications);
  }, [fields, fieldModes, groups]);

  // Define our custom components mapping
  const customComponents = {
    productVariants: VariantsComponent,
    productOptions: OptionsComponent,
  };

  return (
    <div className="space-y-6">
      <CustomFields 
        {...filteredProps}
        value={value}
        onChange={onChange}
        forceValidation={forceValidation}
        invalidFields={invalidFields}
        customComponents={customComponents}
      />
    </div>
  );
} 