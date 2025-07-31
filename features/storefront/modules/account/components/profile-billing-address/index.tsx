"use client"

import React, { useEffect, useMemo, useActionState } from "react"

import Input from "@/features/storefront/modules/common/components/input" 
import NativeSelect from "@/features/storefront/modules/common/components/native-select" 

import AccountInfo from "../account-info"
import {
  createCustomerAddress, 
  updateCustomerAddress,
} from "@/features/storefront/lib/data/user" 

type MyInformationProps = {
  customer: any
  regions: any[]
}

const ProfileBillingAddress: React.FC<MyInformationProps> = ({
  customer,
  regions,
}) => {
  const regionOptions = useMemo(() => {
    return (
      regions
        // Added explicit any types and updated property access
        ?.map((region: any) => {
          return region.countries?.map((country: any) => ({
            value: country.iso2, 
            label: country.name, 
          }))
        })
        .flat() || []
    )
  }, [regions])

  const [successState, setSuccessState] = React.useState(false)

  // const billingAddress = customer.addresses?.find(
  //   (addr: any) => addr.is_default_billing
  // )
  const billingAddress = customer?.billingAddress

  const initialState: Record<string, any> = {
    isDefaultBilling: true, // This will be sent via hidden input
    // isDefaultShipping: false, // Not needed for billing address actions
    error: false,
    success: false,
  }

  if (billingAddress) {
    initialState.addressId = billingAddress.id
  }

  const [state, formAction] = useActionState(
    
    billingAddress ? updateCustomerAddress : createCustomerAddress,
    initialState
  )

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  const currentInfo = useMemo(() => {
    if (!billingAddress) {
      return "No billing address"
    }

    const country =
      regionOptions?.find(
        (country) => country?.value === billingAddress.country?.iso2
      )?.label || billingAddress.country?.iso2?.toUpperCase()

    return (
      <div className="flex flex-col font-semibold" data-testid="current-info">
        <span>
          {/* Updated props */}
          {billingAddress.firstName} {billingAddress.lastName}
        </span>
        <span>{billingAddress.company}</span>
        <span>
          {/* Updated props */}
          {billingAddress.address1}
          {billingAddress.address2 ? `, ${billingAddress.address2}` : ""}
        </span>
        <span>
          {/* Updated props */}
          {billingAddress.postalCode}, {billingAddress.city}
        </span>
        <span>{country}</span>
      </div>
    )
  }, [billingAddress, regionOptions])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      {/* Add hidden input for is_billing */}
      <input type="hidden" name="is_billing" value="true" />
      <input type="hidden" name="addressId" value={billingAddress?.id} />
      <AccountInfo
        label="Billing address"
        currentInfo={currentInfo}
        isSuccess={successState}
        isError={!!state.error}
        clearState={clearState}
        data-testid="account-billing-address-editor"
      >
        <div className="grid grid-cols-1 gap-y-2">
          <div className="grid grid-cols-2 gap-x-2">
            <Input
              label="First name"
              name="first_name"
              defaultValue={billingAddress?.firstName || undefined} 
              required
              data-testid="billing-first-name-input"
            />
            <Input
              label="Last name"
              name="last_name"
              defaultValue={billingAddress?.lastName || undefined} 
              required
              data-testid="billing-last-name-input"
            />
          </div>
          <Input
            label="Company"
            name="company"
            defaultValue={billingAddress?.company || undefined}
            data-testid="billing-company-input"
          />
          <Input
            label="Address"
            name="address_1"
            defaultValue={billingAddress?.address1 || undefined} 
            required
            data-testid="billing-address-1-input"
          />
          <Input
            label="Apartment, suite, etc."
            name="address_2"
            defaultValue={billingAddress?.address2 || undefined} 
            data-testid="billing-address-2-input"
          />
          <div className="grid grid-cols-[144px_1fr] gap-x-2">
            <Input
              label="Postal code"
              name="postal_code"
              defaultValue={billingAddress?.postalCode || undefined} 
              required
              data-testid="billing-postcal-code-input"
            />
            <Input
              label="City"
              name="city"
              defaultValue={billingAddress?.city || undefined}
              required
              data-testid="billing-city-input"
            />
          </div>
          <Input
            label="Province"
            name="province"
            defaultValue={billingAddress?.province || undefined}
            data-testid="billing-province-input"
          />
          <NativeSelect
            name="country_code"
            defaultValue={billingAddress?.country?.iso2 || undefined} 
            required
            data-testid="billing-country-code-select"
          >
            <option value="">-</option>
            {regionOptions.map((option, i) => {
              return (
                <option key={i} value={option?.value}>
                  {option?.label}
                </option>
              )
            })}
          </NativeSelect>
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileBillingAddress
