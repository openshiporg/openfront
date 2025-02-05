import { useState } from "react";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/select";

const UNITS = {
  weight: [
    { value: "g", label: "Grams (g)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "oz", label: "Ounces (oz)" },
    { value: "lb", label: "Pounds (lb)" },
  ],
  dimensions: [
    { value: "cm", label: "Centimeters (cm)" },
    { value: "m", label: "Meters (m)" },
    { value: "in", label: "Inches (in)" },
    { value: "ft", label: "Feet (ft)" },
  ],
};

const convertToBaseUnit = (value, fromUnit) => {
  // Convert everything to g for weight and cm for dimensions
  const conversions = {
    g: 1,
    kg: 1000,
    oz: 28.3495,
    lb: 453.592,
    cm: 1,
    m: 100,
    in: 2.54,
    ft: 30.48,
  };
  
  return value * conversions[fromUnit];
};

const convertFromBaseUnit = (value, toUnit) => {
  // Convert from g/cm to target unit
  const conversions = {
    g: 1,
    kg: 0.001,
    oz: 0.035274,
    lb: 0.00220462,
    cm: 1,
    m: 0.01,
    in: 0.393701,
    ft: 0.0328084,
  };
  
  return value * conversions[toUnit];
};

export function MeasurementInput({
  label,
  type = "weight", // "weight" or "dimensions"
  value,
  onChange,
  className,
}) {
  const [unit, setUnit] = useState(value?.unit || (type === "weight" ? "g" : "cm"));
  const units = UNITS[type];

  const handleValueChange = (newValue) => {
    const numericValue = parseFloat(newValue) || 0;
    const baseValue = convertToBaseUnit(numericValue, unit);
    
    onChange({
      value: Math.round(baseValue), // Store in base unit (g/cm)
      unit: "g", // Always store in base unit
      type,
    });
  };

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (value?.value) {
      const convertedValue = convertFromBaseUnit(value.value, newUnit);
      onChange({
        value: Math.round(convertToBaseUnit(convertedValue, newUnit)), // Store in base unit
        unit: "g", // Always store in base unit
        type,
      });
    }
  };

  const displayValue = value?.value 
    ? convertFromBaseUnit(value.value, unit).toFixed(2)
    : "";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          value={displayValue}
          onChange={(e) => handleValueChange(e.target.value)}
          className="flex-1"
          min={0}
          step="0.01"
        />
        <Select value={unit} onValueChange={handleUnitChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 