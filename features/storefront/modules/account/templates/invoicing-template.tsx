"use client"

import { useState, useEffect } from "react"
import { User } from "@/types"
import InvoicingTab from "../components/invoicing-tab"

type InvoicingTemplateProps = {
  customer: User
}

const InvoicingTemplate = ({ customer }: InvoicingTemplateProps) => {
  return (
    <div className="w-full" data-testid="invoicing-page-wrapper">
      <InvoicingTab customer={customer} />
    </div>
  )
}

export default InvoicingTemplate