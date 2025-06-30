import { Checkbox } from "@/components/ui/checkbox" // Shadcn Checkbox
import { Label } from "@/components/ui/label" // Shadcn Label
import React from "react"

type CheckboxProps = {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  'data-testid'?: string
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  checked = true,
  onChange,
  label,
  name,
  'data-testid': dataTestId
}) => {
  return (
    <div className="flex items-center space-x-2 ">
      <Checkbox // Use Shadcn Checkbox
        // className removed as it contained custom class
        id="checkbox"
        // role="checkbox" // Not needed for Shadcn Checkbox
        // type="button" // Not needed for Shadcn Checkbox
        checked={checked}
        // aria-checked={checked} // Handled by Shadcn Checkbox
        onCheckedChange={onChange} // Use onCheckedChange
        name={name}
        data-testid={dataTestId}
      />
      <Label
        htmlFor="checkbox"
        // className and size removed, Shadcn Label handles styling
      >
        {label}
      </Label>
    </div>
  )
}

export default CheckboxWithLabel
