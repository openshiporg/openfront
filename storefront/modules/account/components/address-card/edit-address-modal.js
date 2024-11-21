"use client";
import React, { useEffect, useState } from "react";
import { PencilSquare as Edit, Trash } from "@medusajs/icons";
import {
  Button,
  Heading,
  Text,
  clx,
  Badge,
  Checkbox,
  Label,
  StatusBadge,
} from "@medusajs/ui";

import useToggleState from "@storefront/lib/hooks/use-toggle-state";
import CountrySelect from "@storefront/modules/checkout/components/country-select";
import Input from "@storefront/modules/common/components/input";
import Modal from "@storefront/modules/common/components/modal";
import {
  deleteCustomerShippingAddress,
  updateCustomerAddress,
} from "@storefront/modules/account/actions";
import Spinner from "@storefront/modules/common/icons/spinner";
import { useFormState } from "react-dom";
import { SubmitButton } from "@storefront/modules/checkout/components/submit-button";

const EditAddress = ({ region, address, isActive = false }) => {
  const [removing, setRemoving] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const { state, open, close: closeModal } = useToggleState(false);

  const [formState, formAction] = useFormState(updateCustomerAddress, {
    success: false,
    error: null,
    addressId: address.id,
  });

  const close = () => {
    setSuccessState(false);
    closeModal();
  };

  useEffect(() => {
    if (successState) {
      close();
    }
  }, [successState]);

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true);
    }
  }, [formState]);

  const removeAddress = async () => {
    setRemoving(true);
    await deleteCustomerShippingAddress(address.id);
    setRemoving(false);
  };

  return (
    <>
      <div
        className={clx(
          "border rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
          {
            "border-gray-900": isActive,
          }
        )}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <Heading className="text-left text-base-semi">
              {address.firstName} {address.lastName}
            </Heading>
            {address.isBilling && (
              <StatusBadge color="blue">Billing Address</StatusBadge>
            )}
          </div>
          {address.company && (
            <Text className="txt-compact-small text-ui-fg-base">
              {address.company}
            </Text>
          )}
          <Text className="flex flex-col text-left text-base-regular mt-2">
            <span>
              {address.address1}
              {address.address2 && <span>, {address.address2}</span>}
            </span>
            <span>
              {address.postalCode}, {address.city}
            </span>
            <span>
              {address.province && `${address.province}, `}
              {address.countryCode?.toUpperCase()}
            </span>
            <span>
              {address.phone}
            </span>
          </Text>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={open}
          >
            <Edit />
            Edit
          </button>
          <button
            className="text-small-regular text-ui-fg-base flex items-center gap-x-2"
            onClick={removeAddress}
          >
            {removing ? <Spinner /> : <Trash />}
            Remove
          </button>
        </div>
      </div>

      <Modal isOpen={state} close={close}>
        <Modal.Title>
          <Heading className="mb-2">Edit address</Heading>
        </Modal.Title>
        <form action={formAction}>
          <Modal.Body>
            <div className="grid grid-cols-1 gap-y-2 w-full pt-2">
              <div className="grid grid-cols-2 gap-x-2">
                <Input
                  label="First name"
                  name="first_name"
                  required
                  autoComplete="given-name"
                  defaultValue={address.firstName}
                />
                <Input
                  label="Last name"
                  name="last_name"
                  required
                  autoComplete="family-name"
                  defaultValue={address.lastName}
                />
              </div>
              <Input
                label="Company"
                name="company"
                autoComplete="organization"
                defaultValue={address.company}
              />
              <Input
                label="Address"
                name="address_1"
                required
                autoComplete="address-line1"
                defaultValue={address.address1}
              />
              <Input
                label="Apartment, suite, etc."
                name="address_2"
                autoComplete="address-line2"
                defaultValue={address.address2}
              />
              <div className="grid grid-cols-[144px_1fr] gap-x-2">
                <Input
                  label="Postal code"
                  name="postal_code"
                  required
                  autoComplete="postal-code"
                  defaultValue={address.postalCode}
                />
                <Input
                  label="City"
                  name="city"
                  required
                  autoComplete="locality"
                  defaultValue={address.city}
                />
              </div>
              <Input
                label="Province / State"
                name="province"
                autoComplete="address-level1"
                defaultValue={address.province}
              />
              <CountrySelect
                name="country_code"
                region={region}
                required
                autoComplete="country"
                defaultValue={address.countryCode}
              />
              <Input
                label="Phone"
                name="phone"
                autoComplete="phone"
                defaultValue={address.phone}
              />
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="is_billing"
                  name="is_billing"
                  defaultChecked={address.isBilling}
                  value="true"
                />
                <text htmlFor="is_billing" className="text-sm">
                  Use as billing address
                </text>
              </div>
              {formState.error && (
                <div className="text-rose-500 text-small-regular py-2">
                  {formState.error}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex gap-3 mt-6">
              <Button
                type="reset"
                variant="secondary"
                onClick={close}
                className="h-10"
              >
                Cancel
              </Button>
              <SubmitButton>Save</SubmitButton>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};

export default EditAddress;
