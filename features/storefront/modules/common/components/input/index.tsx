import { Label } from "@/components/ui/label"
import { Input as BaseInput } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import React, { useEffect, useImperativeHandle, useState } from "react"

import Eye from "@/features/storefront/modules/common/icons/eye"
import EyeOff from "@/features/storefront/modules/common/icons/eye-off"

type InputProps = Omit<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
  "placeholder"
> & {
  label: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
  name: string
  topLabel?: string
  placeholder?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ type, name, label, touched, required, topLabel, placeholder, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [inputType, setInputType] = useState(type)

    useEffect(() => {
      if (type === "password" && showPassword) {
        setInputType("text")
      }

      if (type === "password" && !showPassword) {
        setInputType("password")
      }
    }, [type, showPassword])

    useImperativeHandle(ref, () => inputRef.current!)

    return (
      <div className="flex flex-col w-full">
        {topLabel && (
          <Label className="mb-2 text-xs font-medium leading-5">{topLabel}</Label>
        )}
        <div className="flex relative z-0 w-full text-sm font-normal leading-5"> 
          <BaseInput
            type={inputType}
            name={name}
            placeholder={placeholder || label}
            required={required}
            className="block w-full h-auto appearance-none rounded-md border border-border bg-background px-4 py-3 focus:outline-none focus:ring-0 hover:bg-accent"
            {...props}
            ref={inputRef}
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground px-4 focus:outline-none transition-all duration-150 outline-none focus:text-foreground absolute right-0 top-3"
            >
              {showPassword ? <Eye /> : <EyeOff />}
            </button>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export default Input
