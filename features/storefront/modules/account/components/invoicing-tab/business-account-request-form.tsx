"use client"

import { useState, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { TicketCheck } from "lucide-react"
import { User } from "@/types"
import { submitBusinessAccountRequest } from "@/features/storefront/lib/data/business-accounts"

type BusinessAccountRequestFormProps = {
  customer: User
}

const BusinessAccountRequestForm = ({ customer }: BusinessAccountRequestFormProps) => {
  // Server action with useActionState
  const [state, action, loading] = useActionState(submitBusinessAccountRequest, { success: false })

  const handleSubmit = () => {
    const form = new FormData()
    form.append('customerId', customer.id)
    form.append('businessName', customer.name || 'Business Account')
    form.append('businessType', 'other')
    form.append('monthlyOrderVolume', 'medium')
    form.append('requestedCreditLimit', '100000')
    form.append('businessDescription', 'Business account request')
    
    action(form)
  }

  // Handle server action results
  if (state.success) {
    toast({
      title: "Request Submitted!",
      description: state.message || "Your business account request has been submitted for review.",
    })
    // Refresh the page to show the new state
    window.location.reload()
  }

  if (state.error) {
    toast({
      title: "Error",
      description: state.error,
      variant: "destructive",
    })
  }

  return (
    <Button onClick={handleSubmit} disabled={loading} size="lg">
      <TicketCheck className="h-4 w-4 mr-2 opacity-60" />
      {loading ? "Requesting..." : "Request Invoicing Access"}
    </Button>
  )
}

export default BusinessAccountRequestForm