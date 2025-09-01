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
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    monthlyOrderVolume: "",
    requestedCreditLimit: "",
    businessDescription: ""
  })

  // Server action with useActionState
  const [state, action, loading] = useActionState(submitBusinessAccountRequest, { success: false })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const form = new FormData()
    form.append('customerId', customer.id)
    form.append('businessName', formData.businessName)
    form.append('businessType', formData.businessType)
    form.append('monthlyOrderVolume', formData.monthlyOrderVolume)
    form.append('requestedCreditLimit', formData.requestedCreditLimit)
    form.append('businessDescription', formData.businessDescription)
    
    action(form)
  }

  // Handle server action results
  if (state.success) {
    toast({
      title: "Request Submitted!",
      description: state.message || "Your business account request has been submitted for review.",
    })
    setIsOpen(false)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="lg">
        <TicketCheck className="h-4 w-4 mr-2 opacity-60" />
        Request Invoicing Access
      </Button>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Request Invoicing Access</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="Your Company Name"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessEmail">Business Email *</Label>
            <Input
              id="businessEmail"
              type="email"
              placeholder="business@company.com"
              value={formData.businessEmail}
              onChange={(e) => handleInputChange('businessEmail', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessPhone">Business Phone</Label>
            <Input
              id="businessPhone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.businessPhone}
              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Textarea
              id="businessAddress"
              placeholder="123 Business St, City, State, ZIP"
              rows={3}
              value={formData.businessAddress}
              onChange={(e) => handleInputChange('businessAddress', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / EIN</Label>
            <Input
              id="taxId"
              placeholder="12-3456789"
              value={formData.taxId}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit Invoicing Request"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default BusinessAccountRequestForm