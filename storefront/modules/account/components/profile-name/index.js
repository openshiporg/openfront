"use client";
import React, { useEffect } from "react"
import { useFormState } from "react-dom"

import Input from "@storefront/modules/common/components/input"
import { updateCustomerName } from "@storefront/modules/account/actions"

import AccountInfo from "../account-info"

const ProfileName = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const [state, formAction] = useFormState(updateCustomerName, {
    error: false,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} className="w-full overflow-visible">
      <AccountInfo
        label="Name"
        currentInfo={`${customer.firstName} ${customer.lastName}`}
        isSuccess={successState}
        isError={!!state?.error}
        clearState={clearState}>
        <div className="grid grid-cols-2 gap-x-4">
          <Input
            label="First name"
            name="firstName"
            required
            defaultValue={customer.firstName} />
          <Input
            label="Last name"
            name="lastName"
            required
            defaultValue={customer.lastName} />
        </div>
      </AccountInfo>
    </form>
  );
}

export default ProfileName
