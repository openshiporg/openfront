"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface PricingTier {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
}

interface PricingSectionProps {
  tiers?: PricingTier[]
}

const defaultTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$99",
    description: "Perfect for small businesses getting started",
    features: [
      "Complete commerce platform",
      "Basic inventory management", 
      "Standard analytics",
      "Email support",
      "Up to 1,000 products"
    ],
    cta: "Get Started"
  },
  {
    name: "Professional", 
    price: "$299",
    description: "Advanced features for growing businesses",
    features: [
      "Complete commerce platform",
      "Advanced inventory management",
      "Multi-regional commerce",
      "Analytics dashboard", 
      "Priority support",
      "Unlimited products",
      "Custom integrations"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Full-scale solution for large organizations", 
    features: [
      "Complete commerce platform",
      "Enterprise inventory management",
      "Multi-regional commerce",
      "Advanced analytics dashboard",
      "Dedicated support",
      "Custom development",
      "SLA guarantee"
    ],
    cta: "Contact Sales"
  }
]

const PricingSection = ({ tiers = defaultTiers }: PricingSectionProps) => {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. All plans include our core commerce features.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {tiers.map((tier, index) => (
          <div 
            key={index}
            className="relative"
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <div className="p-8 h-full flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== "Custom" && (
                    <span className="text-gray-600 ml-2">/month</span>
                  )}
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>

              {/* Features */}
              <div className="flex-1 mb-8">
                <div className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="inline-block mr-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-50 font-normal"
                      >
                        <div className="w-1.5 h-1.5 bg-black rounded-full mr-2" />
                        {feature}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button 
                className={`w-full ${
                  tier.popular 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
                size="lg"
              >
                {tier.cta}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PricingSection