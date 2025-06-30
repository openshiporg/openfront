import React from "react"

import { IconProps } from "@/features/storefront/types/icon"

const Openfront: React.FC<IconProps> = ({
  size = "20",
  color = "#9CA3AF",
  ...attributes
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...attributes}
    >
      <path
        d="M9 0C4.03 0 0 4.03 0 9C0 13.97 4.03 18 9 18C13.97 18 18 13.97 18 9C18 4.03 13.97 0 9 0ZM9 16.2C5.031 16.2 1.8 12.969 1.8 9C1.8 5.031 5.031 1.8 9 1.8C12.969 1.8 16.2 5.031 16.2 9C16.2 12.969 12.969 16.2 9 16.2ZM13.5 9C13.5 11.485 11.485 13.5 9 13.5C6.515 13.5 4.5 11.485 4.5 9C4.5 6.515 6.515 4.5 9 4.5C11.485 4.5 13.5 6.515 13.5 9Z"
        fill={color}
      />
    </svg>
  )
}

export default Openfront