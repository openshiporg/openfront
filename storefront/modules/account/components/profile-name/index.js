import { useAccount } from "@lib/context/account-context"
import Input from "@modules/common/components/input"
import { useUpdateMe } from "medusa-react"
import React, { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import AccountInfo from "../account-info"

const ProfileName = ({ customer }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: customer.first_name,
      last_name: customer.last_name,
    },
  })

  const { refetchCustomer } = useAccount()

  const {
    mutate: update,
    isLoading,
    isSuccess,
    isError,
    reset: clearState,
  } = useUpdateMe()

  useEffect(() => {
    reset({
      first_name: customer.first_name,
      last_name: customer.last_name,
    })
  }, [customer, reset])

  const firstName = useWatch({
    control,
    name: "first_name",
  })
  const lastName = useWatch({
    control,
    name: "last_name",
  })

  const updateName = (data) => {
    return update({
      id: customer.id,
      ...data,
    }, {
      onSuccess: () => {
        refetchCustomer()
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(updateName)} className="w-full">
      <AccountInfo
        label="Name"
        currentInfo={`${customer.first_name} ${customer.last_name}`}
        isLoading={isLoading}
        isSuccess={isSuccess}
        isError={isError}
        clearState={clearState}>
        <div className="grid grid-cols-2 gap-x-4">
          <Input
            label="First name"
            {...register("first_name", {
              required: true,
            })}
            defaultValue={firstName}
            errors={errors} />
          <Input
            label="Last name"
            {...register("last_name", { required: true })}
            defaultValue={lastName}
            errors={errors} />
        </div>
      </AccountInfo>
    </form>
  );
}

export default ProfileName
