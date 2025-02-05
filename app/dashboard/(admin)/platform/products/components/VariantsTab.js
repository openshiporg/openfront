import { useState, useEffect, useCallback } from "react";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Plus, Trash2 } from "lucide-react";
import { MeasurementInput } from "./MeasurementInput";
import { PriceInput } from "./PriceInput";
import { Switch } from "@ui/switch";

// Move the function outside component
const generateVariantCombinations = (options, variants) => {
  if (options.length === 0) return variants;

  const combinations = options.reduce((acc, option) => {
    if (acc.length === 0) {
      return option.values.map(value => ([{ optionId: option.id, value }]));
    }
    return acc.flatMap(combination => 
      option.values.map(value => [...combination, { optionId: option.id, value }])
    );
  }, []);

  return combinations.map(combination => {
    // Try to find existing variant with this combination
    const existingVariant = variants.find(variant => 
      combination.every(({ optionId, value }) => 
        variant.productOptionValues?.some(v => 
          v.productOption?.id === optionId && v.value === value
        )
      )
    );

    if (existingVariant) {
      return existingVariant;
    }

    // Create new variant
    return {
      title: combination.map(c => c.value).join(" / "),
      sku: "",
      barcode: "",
      prices: [],
      measurements: [],
      productOptionValues: combination.map(({ optionId, value }) => ({
        productOption: { id: optionId },
        value
      }))
    };
  });
};

export function VariantsTab({ variants = [], productOptions = [], currencies = [], onChange }) {
  // Track if we're using multiple variants
  const [useMultipleVariants, setUseMultipleVariants] = useState(() => {
    // If we have existing variants with options, or multiple variants, default to multiple variants mode
    return productOptions.length > 0 || variants.length > 1;
  });

  // Initialize selectedOptions from existing product options if any
  const [selectedOptions, setSelectedOptions] = useState(() => {
    // For existing products with options
    if (productOptions.length > 0) {
      return productOptions.map(option => {
        const values = Array.from(new Set(
          variants
            .flatMap(variant => variant.productOptionValues || [])
            .filter(value => value.productOption?.id === option.id)
            .map(value => value.value)
        ));

        return {
          id: option.id,
          title: option.title,
          values: values
        };
      });
    }
    // For new products or products without options
    return [];
  });

  // Wrap the function call in useCallback
  const generateVariants = useCallback((options) => {
    return generateVariantCombinations(options, variants);
  }, [variants]);

  // Handle switching between single and multiple variants
  const handleVariantTypeChange = (checked) => {
    setUseMultipleVariants(checked);
    if (!checked) {
      // If switching to single variant, keep only the first variant or create one
      const singleVariant = variants[0] || {
        title: "Default Variant",
        sku: "",
        barcode: "",
        prices: [],
        measurements: [],
        productOptionValues: []
      };
      onChange([singleVariant]);
      setSelectedOptions([]);
    } else if (variants.length === 0) {
      // If switching to multiple variants and no variants exist, create a default one
      onChange([{
        title: "Default Variant",
        sku: "",
        barcode: "",
        prices: [],
        measurements: [],
        productOptionValues: []
      }]);
    }
  };

  // Update variants when options change
  useEffect(() => {
    if (selectedOptions.length > 0) {
      const combinations = generateVariants(selectedOptions);
      onChange(combinations);
    }
  }, [selectedOptions, generateVariants, onChange]);

  const addOption = () => {
    setSelectedOptions([
      ...selectedOptions,
      { id: Date.now().toString(), title: "", values: [] }
    ]);
  };

  const removeOption = (index) => {
    const newOptions = [...selectedOptions];
    newOptions.splice(index, 1);
    setSelectedOptions(newOptions);
    onChange(generateVariants(newOptions));
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...selectedOptions];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setSelectedOptions(newOptions);
    onChange(generateVariants(newOptions));
  };

  const updateOptionValues = (optionIndex, values) => {
    const newOptions = [...selectedOptions];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      values: values.split(",").map(v => v.trim()).filter(Boolean)
    };
    setSelectedOptions(newOptions);
    onChange(generateVariants(newOptions));
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };
    onChange(newVariants);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 pb-4 border-b">
        <Switch
          id="variant-type"
          checked={useMultipleVariants}
          onCheckedChange={handleVariantTypeChange}
        />
        <div className="space-y-1">
          <Label htmlFor="variant-type" className="text-sm font-medium">
            {useMultipleVariants ? "Multiple Variants" : "Single Variant"}
          </Label>
          <p className="text-sm text-muted-foreground">
            {useMultipleVariants 
              ? "This product has multiple variants with different options" 
              : "This product has a single variant with no options"}
          </p>
        </div>
      </div>

      {useMultipleVariants ? (
        <>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Product Options</h3>
              <Button onClick={addOption} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>

            {selectedOptions.map((option, index) => (
              <div
                key={option.id}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                      <Label>Option Name</Label>
                      <Input
                        value={option.title}
                        onChange={(e) => updateOption(index, "title", e.target.value)}
                        placeholder="e.g. Size, Color"
                      />
                    </div>
                    <div>
                      <Label>Values</Label>
                      <Input
                        value={option.values.join(", ")}
                        onChange={(e) => updateOptionValues(index, e.target.value)}
                        placeholder="e.g. Small, Medium, Large"
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Product Variants</h3>
            {variants.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Add product options above to generate variants
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Default Variant</h3>
          {variants.length > 0 && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={variants[0].sku}
                    onChange={(e) => updateVariant(0, "sku", e.target.value)}
                    placeholder="Enter SKU"
                  />
                </div>
                <div>
                  <Label>Barcode</Label>
                  <Input
                    value={variants[0].barcode}
                    onChange={(e) => updateVariant(0, "barcode", e.target.value)}
                    placeholder="Enter barcode"
                  />
                </div>
              </div>

              <PriceInput
                label="Prices"
                prices={variants[0].prices}
                currencies={currencies}
                onChange={(prices) => updateVariant(0, "prices", prices)}
              />

              <div className="space-y-4">
                <Label>Measurements</Label>
                <div className="grid grid-cols-2 gap-4">
                  <MeasurementInput
                    label="Weight"
                    type="weight"
                    value={variants[0].measurements?.find(m => m.type === "weight")}
                    onChange={(measurement) => {
                      const measurements = variants[0].measurements?.filter(m => m.type !== "weight") || [];
                      if (measurement) {
                        measurements.push(measurement);
                      }
                      updateVariant(0, "measurements", measurements);
                    }}
                  />
                  <MeasurementInput
                    label="Length"
                    type="length"
                    value={variants[0].measurements?.find(m => m.type === "length")}
                    onChange={(measurement) => {
                      const measurements = variants[0].measurements?.filter(m => m.type !== "length") || [];
                      if (measurement) {
                        measurements.push(measurement);
                      }
                      updateVariant(0, "measurements", measurements);
                    }}
                  />
                  <MeasurementInput
                    label="Width"
                    type="width"
                    value={variants[0].measurements?.find(m => m.type === "width")}
                    onChange={(measurement) => {
                      const measurements = variants[0].measurements?.filter(m => m.type !== "width") || [];
                      if (measurement) {
                        measurements.push(measurement);
                      }
                      updateVariant(0, "measurements", measurements);
                    }}
                  />
                  <MeasurementInput
                    label="Height"
                    type="height"
                    value={variants[0].measurements?.find(m => m.type === "height")}
                    onChange={(measurement) => {
                      const measurements = variants[0].measurements?.filter(m => m.type !== "height") || [];
                      if (measurement) {
                        measurements.push(measurement);
                      }
                      updateVariant(0, "measurements", measurements);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {useMultipleVariants && variants.map((variant, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 space-y-4"
        >
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium">
              {variant.title || variant.productOptionValues?.map(v => v.value).join(" / ")}
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SKU</Label>
              <Input
                value={variant.sku}
                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                placeholder="Enter SKU"
              />
            </div>
            <div>
              <Label>Barcode</Label>
              <Input
                value={variant.barcode}
                onChange={(e) => updateVariant(index, "barcode", e.target.value)}
                placeholder="Enter barcode"
              />
            </div>
          </div>

          <PriceInput
            label="Prices"
            prices={variant.prices}
            currencies={currencies}
            onChange={(prices) => updateVariant(index, "prices", prices)}
          />

          <div className="space-y-4">
            <Label>Measurements</Label>
            <div className="grid grid-cols-2 gap-4">
              <MeasurementInput
                label="Weight"
                type="weight"
                value={variant.measurements?.find(m => m.type === "weight")}
                onChange={(measurement) => {
                  const measurements = variant.measurements?.filter(m => m.type !== "weight") || [];
                  if (measurement) {
                    measurements.push(measurement);
                  }
                  updateVariant(index, "measurements", measurements);
                }}
              />
              <MeasurementInput
                label="Length"
                type="length"
                value={variant.measurements?.find(m => m.type === "length")}
                onChange={(measurement) => {
                  const measurements = variant.measurements?.filter(m => m.type !== "length") || [];
                  if (measurement) {
                    measurements.push(measurement);
                  }
                  updateVariant(index, "measurements", measurements);
                }}
              />
              <MeasurementInput
                label="Width"
                type="width"
                value={variant.measurements?.find(m => m.type === "width")}
                onChange={(measurement) => {
                  const measurements = variant.measurements?.filter(m => m.type !== "width") || [];
                  if (measurement) {
                    measurements.push(measurement);
                  }
                  updateVariant(index, "measurements", measurements);
                }}
              />
              <MeasurementInput
                label="Height"
                type="height"
                value={variant.measurements?.find(m => m.type === "height")}
                onChange={(measurement) => {
                  const measurements = variant.measurements?.filter(m => m.type !== "height") || [];
                  if (measurement) {
                    measurements.push(measurement);
                  }
                  updateVariant(index, "measurements", measurements);
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 