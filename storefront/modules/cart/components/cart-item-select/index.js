"use client";
import { IconBadge, clx } from "@medusajs/ui"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import ChevronDown from "@storefront/modules/common/icons/chevron-down"

const CartItemSelect = forwardRef(({ placeholder = "Select...", className, children, ...props }, ref) => {
  const innerRef = useRef(null)
  const [isPlaceholder, setIsPlaceholder] = useState(false)

  useImperativeHandle(ref, () => innerRef.current)

  useEffect(() => {
    if (innerRef.current && innerRef.current.value === "") {
      setIsPlaceholder(true)
    } else {
      setIsPlaceholder(false)
    }
  }, [innerRef.current?.value])

  return (
    <div>
      <IconBadge
        onFocus={() => innerRef.current?.focus()}
        onBlur={() => innerRef.current?.blur()}
        className={clx(
          "relative flex items-center txt-compact-small border text-ui-fg-base group",
          className,
          {
            "text-ui-fg-subtle": isPlaceholder,
          }
        )}>
        <select
          ref={innerRef}
          {...props}
          className="appearance-none bg-transparent border-none px-4 transition-colors duration-150 focus:border-gray-700 outline-none w-16 h-16 items-center justify-center">
          <option disabled value="">
            {placeholder}
          </option>
          {children}
        </select>
        <span
          className="absolute flex pointer-events-none justify-end w-8 group-hover:animate-pulse">
          <ChevronDown />
        </span>
      </IconBadge>
    </div>
  );
})

CartItemSelect.displayName = "CartItemSelect"

export default CartItemSelect
