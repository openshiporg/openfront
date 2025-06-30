"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useEffect, useState, useActionState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

import useToggleState from "@/features/storefront/lib/hooks/use-toggle-state"
import CountrySelect from "@/features/storefront/modules/checkout/components/country-select"
import { SubmitButton } from "@/features/storefront/modules/checkout/components/submit-button"
import { createCustomerAddress } from "@/features/storefront/lib/data/user"
import { Input } from "@/components/ui/input"

const AddAddress = ({
  region,
}: {
  region: any
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(createCustomerAddress, { // Updated function name
    // isDefaultShipping: addresses.length === 0, // Removed, handled by is_billing form field
    success: false,
    error: null,
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

  return (
    <Dialog open={state} onOpenChange={(isOpen) => isOpen ? open() : close()}>
      <DialogTrigger asChild>
        <button
          className="border rounded-lg p-5 min-h-[220px] h-full w-full flex flex-col justify-between bg-muted/40"
          onClick={open}
          data-testid="add-address-button"
        >
          <span className="text-sm leading-6 font-semibold">New address</span>
          <Plus />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl" data-testid="add-address-modal">
        <DialogHeader>
          <DialogTitle>Add address</DialogTitle>
        </DialogHeader>

        <form action={formAction}>
          <div className="flex flex-col gap-y-2">
            <div className="grid grid-cols-2 gap-x-2">
              <Input
                placeholder="First name"
                name="first_name"
                required
                autoComplete="given-name"
                data-testid="first-name-input"
              />
              <Input
                placeholder="Last name"
                name="last_name"
                required
                autoComplete="family-name"
                data-testid="last-name-input"
              />
            </div>
            <Input
              placeholder="Company"
              name="company"
              autoComplete="organization"
              data-testid="company-input"
            />
            <Input
              placeholder="Address"
              name="address_1"
              required
              autoComplete="address-line1"
              data-testid="address-1-input"
            />
            <Input
              placeholder="Apartment, suite, etc."
              name="address_2"
              autoComplete="address-line2"
              data-testid="address-2-input"
            />
            <Input
              placeholder="City"
              name="city"
              required
              autoComplete="locality"
              data-testid="city-input"
            />
            <div className="grid grid-cols-2 gap-x-2">
              <Input
                placeholder="State / Province"
                name="province"
                autoComplete="address-level1"
                data-testid="state-input"
              />
              <Input
                placeholder="ZIP / Postal code"
                name="postal_code"
                required
                autoComplete="postal-code"
                data-testid="postal-code-input"
              />
            </div>
            <CountrySelect
              region={region}
              name="country_code"
              required
              autoComplete="country"
              data-testid="country-select"
            />
            <div className="flex items-center gap-x-2 mt-2">
              <Checkbox
                id="is_billing"
                name="is_billing"
                value="true"
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
              placeholder="Phone"
              name="phone"
              autoComplete="phone"
              data-testid="phone-input"
            />
          </div>
          {formState.error && (
            <div
              className="text-rose-500 text-xs leading-5 font-normal py-2"
              data-testid="address-error"
            >
              {formState.error}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="reset"
              variant="outline"
              onClick={close}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <SubmitButton data-testid="save-button">Save</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddress
