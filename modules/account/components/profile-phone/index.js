import { useAccount } from "@storefront/context/account-context"
import Input from "@modules/common/components/input"
import { useUpdateMe } from "medusa-react"
import React, { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import AccountInfo from "../account-info"

const ProfilePhone = ({ customer }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      phone: customer.phone
    }
  })

  const { refetchCustomer } = useAccount()

  const {
    mutate: update,
    isLoading,
    isSuccess,
    isError,
    reset: clearState
  } = useUpdateMe()

  useEffect(() => {
    reset({
      phone: customer.phone
    })
  }, [customer, reset])

  const phone = useWatch({
    control,
    name: "phone"
  })

  const updatePhone = data => {
    return update(
      {
        id: customer.id,
        ...data
      },
      {
        onSuccess: () => {
          refetchCustomer()
        }
      }
    )
  }

  return (
    <form onSubmit={handleSubmit(updatePhone)} className="w-full">
      <AccountInfo
        label="Phone"
        currentInfo={`${customer.phone}`}
        isLoading={isLoading}
        isSuccess={isSuccess}
        isError={isError}
        clearState={clearState}
      >
        <div className="grid grid-cols-1 gap-y-2">
          <Input
            label="Phone"
            {...register("phone", {
              required: true
            })}
            defaultValue={phone}
            errors={errors}
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfilePhone
