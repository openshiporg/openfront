"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { User } from "@/types"

type BusinessAccountRequestFormProps = {
  customer: User
  onSubmit: () => void
}

const BusinessAccountRequestForm = ({ customer, onSubmit }: BusinessAccountRequestFormProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    monthlyOrderVolume: "",
    requestedCreditLimit: "",
    businessDescription: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation CreateBusinessAccountRequest($data: BusinessAccountRequestCreateInput!) {
              createBusinessAccountRequest(data: $data) {
                id
                status
                businessName
                submittedAt
              }
            }
          `,
          variables: {
            data: {
              businessName: formData.businessName,
              businessType: formData.businessType,
              monthlyOrderVolume: formData.monthlyOrderVolume,
              requestedCreditLimit: parseInt(formData.requestedCreditLimit) * 100, // Convert to cents
              businessDescription: formData.businessDescription,
              user: { connect: { id: customer.id } }
            }
          }
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }
      
      toast({
        title: "Request Submitted!",
        description: "Your invoicing access request has been submitted for review.",
      })
      
      setIsOpen(false)
      onSubmit()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="lg">
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
            <Label htmlFor="businessType">Business Type *</Label>
            <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your business model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wholesale">Wholesale Partner</SelectItem>
                <SelectItem value="distribution">Distribution Channel</SelectItem>
                <SelectItem value="reseller">Authorized Reseller</SelectItem>
                <SelectItem value="b2b_platform">B2B Platform</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyOrderVolume">Expected Monthly Order Volume *</Label>
            <Select value={formData.monthlyOrderVolume} onValueChange={(value) => handleInputChange('monthlyOrderVolume', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select order volume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">1-50 orders per month</SelectItem>
                <SelectItem value="medium">51-200 orders per month</SelectItem>
                <SelectItem value="high">201-1000 orders per month</SelectItem>
                <SelectItem value="enterprise">1000+ orders per month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestedCreditLimit">Requested Credit Limit (USD) *</Label>
            <Input
              id="requestedCreditLimit"
              type="number"
              placeholder="1000"
              min="100"
              step="50"
              value={formData.requestedCreditLimit}
              onChange={(e) => handleInputChange('requestedCreditLimit', e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Minimum $100, we'll review and approve appropriate limit
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description *</Label>
            <Textarea
              id="businessDescription"
              placeholder="Tell us about your business and how you plan to use programmatic ordering..."
              rows={4}
              value={formData.businessDescription}
              onChange={(e) => handleInputChange('businessDescription', e.target.value)}
              required
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