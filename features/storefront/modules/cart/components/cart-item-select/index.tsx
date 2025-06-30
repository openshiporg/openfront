"use client"

import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  InputHTMLAttributes,
} from "react"

type CartItemSelectProps = {
  min?: number
  max?: number
  step?: number
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">

const CartItemSelect = forwardRef<HTMLInputElement, CartItemSelectProps>(
  ({ className, min = 1, max = 10, step = 1, value: controlledValue, onChange, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState<number | undefined>(
      typeof controlledValue === "number" ? controlledValue : Number(controlledValue)
    )

    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

    useEffect(() => {
      if (typeof controlledValue === "number") {
        setValue(controlledValue)
      } else if (controlledValue !== undefined) {
        const parsed = Number(controlledValue)
        if (!isNaN(parsed)) setValue(parsed)
      }
    }, [controlledValue])

    const notifyChange = useCallback((newValue: number) => {
      if (onChange) {
        const event = {
          target: { value: String(newValue) }
        } as unknown as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
    }, [onChange])

    const handleIncrement = useCallback(() => {
      const newValue = value === undefined ? step : Math.min((value ?? 0) + step, max)
      setValue(newValue)
      notifyChange(newValue)
    }, [value, step, max, notifyChange])

    const handleDecrement = useCallback(() => {
      const newValue = value === undefined ? step : Math.max((value ?? 0) - step, min)
      setValue(newValue)
      notifyChange(newValue)
    }, [value, step, min, notifyChange])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      if (!isNaN(newValue)) {
        setValue(newValue)
        if (onChange) {
          onChange(e)
        }
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === innerRef.current) {
        if (e.key === "ArrowUp") {
          e.preventDefault()
          handleIncrement()
        } else if (e.key === "ArrowDown") {
          e.preventDefault()
          handleDecrement()
        }
      }
    }

    useEffect(() => {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleIncrement, handleDecrement])

    return (
      <div className={cn("flex items-center", className)}>
        <input
          ref={innerRef}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value ?? ""}
          onChange={handleInputChange}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1 px-2 text-center outline-none focus:ring-2 focus:ring-ring border border-input rounded-l-md h-9"
          {...props}
        />
        <div className="flex flex-col h-9">
          <button
            type="button"
            aria-label="Increase quantity"
            className="flex-1 flex items-center justify-center px-2 border border-l-0 border-b-[0.5px] border-input rounded-tr-md hover:bg-accent disabled:opacity-50"
            onClick={handleIncrement}
            disabled={value !== undefined && value >= max}
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            aria-label="Decrease quantity"
            className="flex-1 flex items-center justify-center px-2 border border-l-0 border-t-[0.5px] border-input rounded-br-md hover:bg-accent disabled:opacity-50"
            onClick={handleDecrement}
            disabled={value !== undefined && value <= min}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    )
  }
)

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
