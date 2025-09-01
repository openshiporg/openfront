import { User } from "@/types"
import InvoicingTab from "../components/invoicing-tab"

type InvoicingTemplateProps = {
  customer: User
  businessAccount: any
  businessAccountRequest: any
  orders: any[]
  unpaidLineItems: any
}

const InvoicingTemplate = ({ customer, businessAccount, businessAccountRequest, orders, unpaidLineItems }: InvoicingTemplateProps) => {
  return (
    <div className="w-full" data-testid="invoicing-page-wrapper">
      <InvoicingTab 
        customer={customer} 
        businessAccount={businessAccount}
        businessAccountRequest={businessAccountRequest}
        orders={orders}
        unpaidLineItems={unpaidLineItems}
      />
    </div>
  )
}

export default InvoicingTemplate