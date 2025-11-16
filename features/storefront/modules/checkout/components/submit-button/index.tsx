"use client"

import { Button, buttonVariants } from "@/components/ui/button" // Shadcn Button
import React from "react"
import { useFormStatus } from "react-dom"
import { RiLoader2Fill } from "@remixicon/react"
import type { VariantProps } from "class-variance-authority" // For variant types

type ButtonVariant = "secondary" | "outline" | "destructive" | "link" | "default" | "ghost" | null;

export function SubmitButton({
  children,
  variant = "default",
  className,
  size,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: ButtonVariant // Use the Medusa variant type here
  className?: string
  size?: VariantProps<typeof buttonVariants>["size"]
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      type="submit"
      disabled={pending}
      data-testid={dataTestId}
    >
      {pending && <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
