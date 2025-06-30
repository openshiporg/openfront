"use client"

import { useActionState } from "react"
import { createTransferRequest } from "@/features/storefront/lib/data/orders";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button";
import { CheckCircle, XCircle } from "lucide-react"; 
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex flex-col gap-y-1">
          <h3 className="text-lg text-foreground font-semibold">
            Order transfers
          </h3>
          <p className="text-sm font-normal text-muted-foreground">
            Can&apos;t find the order you are looking for?
            <br /> Connect an order to your account.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex flex-col gap-y-2 w-full">
            <Input className="w-full" name="order_id" placeholder="Order ID" />
            <SubmitButton
              variant="secondary"
              className="w-fit whitespace-nowrap self-end"
            >
              Request transfer
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <p className="text-sm font-normal text-destructive text-right">
          {state.error}
        </p>
      )}
      {showSuccess && (
        <div className="flex justify-between p-4 bg-muted shadow-sm w-full self-stretch items-center rounded-md border">
          <div className="flex gap-x-2 items-center">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col gap-y-1">
              <p className="text-sm font-medium text-foreground">
                Transfer for order {state.order?.id} requested
              </p>
              <p className="text-sm font-normal text-muted-foreground">
                Transfer request email sent to {state.order?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-fit text-muted-foreground hover:bg-transparent"
            onClick={() => setShowSuccess(false)}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
