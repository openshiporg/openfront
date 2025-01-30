"use client";
import React, { useMemo } from "react";
import { Button } from "@medusajs/ui";
import LocalizedClientLink from "@storefront/modules/common/components/localized-client-link";

const ProfileBillingAddress = ({ customer, regions }) => {
  const billingAddress = useMemo(() => {
    if (!customer.addresses) return null;
    return customer.addresses.find(address => address.isBilling);
  }, [customer.addresses]);

  const regionOptions = useMemo(() => {
    return regions
      ?.map((region) => {
        return region.countries.map((country) => ({
          value: country.iso2,
          label: country.name,
        }));
      })
      .flat() || [];
  }, [regions]);

  const currentInfo = useMemo(() => {
    if (!billingAddress) {
      return "No billing address";
    }

    const country =
      regionOptions?.find((country) => country.value === billingAddress.country?.iso2)?.label || 
      billingAddress.country?.iso2;

    return (
      <div className="flex flex-col font-semibold">
        <span>
          {billingAddress.firstName} {billingAddress.lastName}
        </span>
        <span>{billingAddress.company}</span>
        <span>
          {billingAddress.address1}
          {billingAddress.address2 ? `, ${billingAddress.address2}` : ""}
        </span>
        <span>
          {billingAddress.postalCode}, {billingAddress.city}
        </span>
        <span>{country}</span>
      </div>
    );
  }, [billingAddress, regionOptions]);

  return (
    <div className="text-small-regular">
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="uppercase text-ui-fg-base">Billing address</span>
          <div className="flex items-center flex-1 basis-0 justify-end gap-x-4">
            {typeof currentInfo === "string" ? (
              <span className="font-semibold">{currentInfo}</span>
            ) : (
              currentInfo
            )}
          </div>
        </div>
        <div>
          <LocalizedClientLink href="/account/addresses">
            <Button
              variant="secondary"
              className="w-[100px] min-h-[25px] py-1"
              type="button"
            >
              {billingAddress ? "Edit" : "Add"}
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  );
};

export default ProfileBillingAddress;
