"use client"

import React, { useEffect, useActionState } from "react"
import Input from "@/features/storefront/modules/common/components/input" 
import AccountInfo from "../account-info"
import { updateCustomerPassword } from "@/features/storefront/lib/data/user" // Added import

type MyInformationProps = {
  customer: any
}

const ProfilePassword: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  // Removed placeholder function

  // Added useActionState
  const [state, formAction] = useActionState(updateCustomerPassword, {
    error: null,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  // Added useEffect to sync success state
  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  return (
    <form
      action={formAction}
      onReset={() => clearState()}
      className="w-full"
    >
      <AccountInfo
        label="Password"
        currentInfo={
          <span>The password is not shown for security reasons</span>
        }
        isSuccess={successState}
        isError={!!state.error} 
        errorMessage={state.error}
        clearState={clearState}
        data-testid="account-password-editor"
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Old password"
            name="oldPassword" 
            required
            type="password"
            data-testid="old-password-input"
          />
          <Input
            label="New password"
            type="password"
            name="newPassword" 
            required
            data-testid="new-password-input"
          />
          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword" 
            required
            data-testid="confirm-password-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePassword
