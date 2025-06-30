import { Badge } from "@/components/ui/badge" // Shadcn Badge

const PaymentTest = ({ className }: { className?: string }) => {
  return (
    <Badge variant="default" className={className}>
      <span className="font-semibold">Attention:</span> For testing purposes
      only.
    </Badge>
  )
}

export default PaymentTest
