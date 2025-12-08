import { Badge } from "@/components/ui/badge"
import { FlaskConical } from "lucide-react"

interface PaymentTestProps {
  className?: string
  provider?: "stripe" | "paypal" | "general"
}

const PaymentTest = ({ className, provider = "general" }: PaymentTestProps) => {
  const providerText = provider === "stripe"
    ? "Stripe Test Mode"
    : provider === "paypal"
    ? "PayPal Sandbox"
    : "Test Mode"

  return (
    <Badge
      variant="outline"
      className={`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 ${className}`}
    >
      <FlaskConical className="w-3 h-3 mr-1" />
      <span className="font-medium">{providerText}</span>
      <span className="ml-1 font-normal">– Do not enter real payment info</span>
    </Badge>
  )
}

export default PaymentTest
