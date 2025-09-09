import { User } from "@/types"
import InvoicesTab from "../components/invoices-tab"

type InvoicesTemplateProps = {
  customer: User
  invoices: any[]
}

const InvoicesTemplate = ({ customer, invoices }: InvoicesTemplateProps) => {
  return (
    <div className="w-full" data-testid="invoices-page-wrapper">
      <InvoicesTab 
        customer={customer} 
        invoices={invoices}
      />
    </div>
  )
}

export default InvoicesTemplate