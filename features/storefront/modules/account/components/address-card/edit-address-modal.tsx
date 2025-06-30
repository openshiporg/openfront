"use client"

import React, { useEffect, useState, useActionState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox" // Added Checkbox
import { Label } from "@/components/ui/label" // Added Label
import { RiLoader2Fill } from "@remixicon/react"

import useToggleState from "@/features/storefront/lib/hooks/use-toggle-state"
import CountrySelect from "@/features/storefront/modules/checkout/components/country-select"
import Input from "@/features/storefront/modules/common/components/input"
import Modal from "@/features/storefront/modules/common/components/modal"
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button"
import {
  deleteCustomerShippingAddress,
  updateCustomerAddress,
} from "@/features/storefront/lib/data/user"
import { cn } from "@/lib/utils"
import { StorefrontAddress, StorefrontRegion } from "@/features/storefront/types"

type EditAddressProps = {
  region: StorefrontRegion
  address: StorefrontAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerShippingAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={cn(
          "border rounded-lg p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
          {
            "border-gray-900": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          <h3
            className="text-left text-sm leading-6 font-semibold"
            data-testid="address-name"
          >
            {address.firstName} {address.lastName}
          </h3>
          {address.company && (
            <p
              className="text-[0.8125rem] leading-5 font-normal text-foreground"
              data-testid="address-company"
            >
              {address.company}
            </p>
          )}
          <div className="flex flex-col text-left text-sm leading-6 font-normal mt-2">
            <span data-testid="address-address">
              {address.address1}
              {address.address2 && <span>, {address.address2}</span>}
            </span>
            <span data-testid="address-city-province">
              {address.city}{address.province && `, ${address.province}`}
            </span>
            <span data-testid="address-postal-country">
              {address.postalCode} {address.country?.iso2?.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <Button
            onClick={open}
            variant="outline"
            data-testid="address-edit-button"
            size="sm"
          >
            <Pencil />
            Edit
          </Button>
          <Button
            onClick={removeAddress}
            variant="destructive"
            data-testid="address-delete-button"
            size="sm"
          >
            {removing ? <RiLoader2Fill className="animate-spin" /> : <Trash2 />}
            Remove
          </Button>
        </div>
      </div>

      <Modal isOpen={state} close={close} data-testid="edit-address-modal">
        <Modal.Title>
          Edit address
        </Modal.Title>
        <form action={formAction}>
          <input type="hidden" name="addressId" value={address.id} />
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.firstName || undefined}
                  data-testid="first-name-input"
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.lastName || undefined}
                  data-testid="last-name-input"
                />
              </div>
              <Input
                label="Company"
                name="company"
                autoComplete="organization"
                defaultValue={address.company || undefined}
                data-testid="company-input"
              />
              <Input
                label="Address"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address1 || undefined}
                data-testid="address-1-input"
              />
              <Input
                label="Apartment, suite, etc."
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address2 || undefined}
                data-testid="address-2-input"
              />
              <Input
                label="City"
                name="city"
                required
                autoComplete="locality"
                defaultValue={address.city || undefined}
                data-testid="city-input"
              />
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="State / Province"
                  name="province"
                  autoComplete="address-level1"
                  defaultValue={address.province || undefined}
                  data-testid="state-input"
                />
                <Input
                  label="ZIP / Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  defaultValue={address.postalCode || undefined}
                  data-testid="postal-code-input"
                />
              </div>
              <CountrySelect
                name="country_code"
                region={region}
                required
                autoComplete="country"
                defaultValue={address.country?.iso2 || undefined}
                data-testid="country-select"
              />
              <div className="flex items-center gap-x-2 mt-2">
                <Checkbox
                  id="is_billing"
                  name="is_billing"
                  value="true"
                  defaultChecked={!!address.isBilling}
                  data-testid="billing-checkbox"
                />
                <Label
                  htmlFor="is_billing"
                  className="!text-[0.8125rem] leading-5 font-normal text-foreground"
                  data-testid="billing-label"
                >
                  Set as default billing address
                </Label>
              </div>
              <Input
                label="Phone"
                name="phone"
                autoComplete="phone"
                defaultValue={address.phone || undefined}
                data-testid="phone-input"
              />
            </div>
            {formState.error && (
              <div className="text-rose-500 text-xs leading-5 font-normal py-2">
                {formState.error}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <SubmitButton data-testid="save-button">Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  )
}

export default EditAddress
