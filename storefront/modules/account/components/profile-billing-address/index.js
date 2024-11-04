"use client";
import React, { useEffect, useMemo } from "react"

import Input from "@storefront/modules/common/components/input"
import NativeSelect from "@storefront/modules/common/components/native-select"

import AccountInfo from "../account-info"
import { useFormState } from "react-dom"
import { updateCustomerBillingAddress } from "@storefront/modules/account/actions"

const ProfileBillingAddress = ({
  customer,
  regions,
}) => {
  const regionOptions = useMemo(() => {
    return regions
      ?.map((region) => {
        return region.countries.map((country) => ({
          value: country.iso2,
          label: country.name,
        }));
      })
      .flat() || [];
  }, [regions])

  const [successState, setSuccessState] = React.useState(false)

  const [state, formAction] = useFormState(updateCustomerBillingAddress, {
    error: false,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  const currentInfo = useMemo(() => {
    if (!customer.billingAddress) {
      return "No billing address"
    }

    const country =
      regionOptions?.find((country) => country.value === customer.billingAddress.countryCode)?.label || customer.billingAddress.countryCode?.toUpperCase()

    return (
      <div className="flex flex-col font-semibold">
        <span>
          {customer.billingAddress.firstName}{" "}
          {customer.billingAddress.lastName}
        </span>
        <span>{customer.billingAddress.company}</span>
        <span>
          {customer.billingAddress.address1}
          {customer.billingAddress.address2
            ? `, ${customer.billingAddress.address2}`
            : ""}
        </span>
        <span>
          {customer.billingAddress.postalCode},{" "}
          {customer.billingAddress.city}
        </span>
        <span>{country}</span>
      </div>
    );
  }, [customer, regionOptions])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <AccountInfo
        label="Billing address"
        currentInfo={currentInfo}
        isSuccess={successState}
        isError={!!state.error}
        clearState={clearState}>
        <div className="grid grid-cols-1 gap-y-2">
          <div className="grid grid-cols-2 gap-x-2">
            <Input
              label="First name"
              name="billingAddress.firstName"
              defaultValue={customer.billingAddress?.firstName || undefined}
              required />
            <Input
              label="Last name"
              name="billingAddress.lastName"
              defaultValue={customer.billingAddress?.lastName || undefined}
              required />
          </div>
          <Input
            label="Company"
            name="billingAddress.company"
            defaultValue={customer.billingAddress?.company || undefined} />
          <Input
            label="Address"
            name="billingAddress.address1"
            defaultValue={customer.billingAddress?.address1 || undefined}
            required />
          <Input
            label="Apartment, suite, etc."
            name="billingAddress.address2"
            defaultValue={customer.billingAddress?.address2 || undefined} />
          <div className="grid grid-cols-[144px_1fr] gap-x-2">
            <Input
              label="Postal code"
              name="billingAddress.postalCode"
              defaultValue={customer.billingAddress?.postalCode || undefined}
              required />
            <Input
              label="City"
              name="billingAddress.city"
              defaultValue={customer.billingAddress?.city || undefined}
              required />
          </div>
          <Input
            label="Province"
            name="billingAddress.province"
            defaultValue={customer.billingAddress?.province || undefined} />
          <NativeSelect
            name="billingAddress.countryCode"
            defaultValue={customer.billingAddress?.countryCode || undefined}
            required>
            <option value="">-</option>
            {regionOptions.map((option, i) => {
              return (
                <option key={i} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </NativeSelect>
        </div>
      </AccountInfo>
    </form>
  );
}

const mapBillingAddressToFormData = ({
  customer
}) => {
  return {
    billingAddress: {
      firstName: customer.billingAddress?.firstName || undefined,
      lastName: customer.billingAddress?.lastName || undefined,
      company: customer.billingAddress?.company || undefined,
      address1: customer.billingAddress?.address1 || undefined,
      address2: customer.billingAddress?.address2 || undefined,
      city: customer.billingAddress?.city || undefined,
      province: customer.billingAddress?.province || undefined,
      postalCode: customer.billingAddress?.postalCode || undefined,
      countryCode: customer.billingAddress?.countryCode || undefined,
    },
  }
}

export default ProfileBillingAddress
