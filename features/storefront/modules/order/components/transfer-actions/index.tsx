"use client"

import { acceptTransferRequest, declineTransferRequest } from "@/features/storefront/lib/data/orders"
import { Button } from "@/components/ui/button" // Use Shadcn Button
// Removed Text import
import { useState } from "react"

type TransferStatus = "pending" | "success" | "error"

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<{
    accept: TransferStatus | null
    decline: TransferStatus | null
  } | null>({
    accept: null,
    decline: null,
  })

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null })
    setErrorMessage(null)

    const { success, error } = await acceptTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: success ? "success" : "error", decline: null })
  }

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" })
    setErrorMessage(null)

    const { success, error } = await declineTransferRequest(id, token)

    if (error) setErrorMessage(error)
    setStatus({ accept: null, decline: success ? "success" : "error" })
  }

  return (
    <div className="flex flex-col gap-y-4">
      {status?.accept === "success" && (
        <p className="text-emerald-500">
          Order transferred successfully!
        </p>
      )}
      {status?.decline === "success" && (
        <p className="text-emerald-500">
          Order transfer declined successfully!
        </p>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex gap-x-4">
          <Button
            size="lg" // Use Shadcn size 'lg'
            onClick={acceptTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            {status?.accept === "pending" ? "Accepting..." : "Accept transfer"}
          </Button>
          <Button
            size="lg" // Use Shadcn size 'lg'
            variant="outline" // Use Shadcn outline variant
            onClick={declineTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            {status?.decline === "pending" ? "Declining..." : "Decline transfer"}
          </Button>
        </div>
      )}
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  )
}

export default TransferActions
