"use client";
import React, { useEffect } from "react"

import Input from "@storefront/modules/common/components/input"

import AccountInfo from "../account-info"
import { updateCustomerPassword } from "@storefront/lib/data/user"
import { useFormState } from "react-dom"

const ProfileName = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const [state, formAction] = useFormState(updateCustomerPassword, {
    customer,
    success: false,
    error: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form action={formAction} onReset={() => clearState()} className="w-full">
      <AccountInfo
        label="Password"
        currentInfo={
          <span>The password is not shown for security reasons</span>
        }
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={clearState}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Old password" name="oldPassword" required type="password" />
          <Input label="New password" type="password" name="newPassword" required />
          <Input label="Confirm password" type="password" name="confirmPassword" required />
        </div>
      </AccountInfo>
    </form>
  );
}

export default ProfileName
