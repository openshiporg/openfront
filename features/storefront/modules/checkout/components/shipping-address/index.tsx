import React, { useState, useEffect, useMemo } from "react";
import Checkbox from "@/features/storefront/modules/common/components/checkbox";
import AddressSelect from "../address-select";
import CountrySelect from "../country-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
  countryCode,
}: {
  customer: any | null;
  cart: any | null;
  checked: boolean;
  onChange: () => void;
  countryCode: string | null;
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    "shippingAddress.firstName": cart?.shippingAddress?.firstName || "",
    "shippingAddress.lastName": cart?.shippingAddress?.lastName || "",
    "shippingAddress.address1": cart?.shippingAddress?.address1 || "",
    "shippingAddress.company": cart?.shippingAddress?.company || "",
    "shippingAddress.postalCode": cart?.shippingAddress?.postalCode || "",
    "shippingAddress.city": cart?.shippingAddress?.city || "",
    "shippingAddress.countryCode":
      cart?.shippingAddress?.country?.iso2 || countryCode || "",
    "shippingAddress.province": cart?.shippingAddress?.province || "",
    email: cart?.email || customer?.email || "",
    "shippingAddress.phone":
      cart?.shippingAddress?.phone || customer?.phone || "",
  });

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c: any) => c.iso2),
    [cart?.region]
  );

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses?.filter(
        (a: any) => a.country?.iso2 && countriesInRegion?.includes(a.country.iso2)
      ),
    [customer?.addresses, countriesInRegion]
  );

  useEffect(() => {
    setFormData({
      "shippingAddress.firstName": cart?.shippingAddress?.firstName || "",
      "shippingAddress.lastName": cart?.shippingAddress?.lastName || "",
      "shippingAddress.address1": cart?.shippingAddress?.address1 || "",
      "shippingAddress.company": cart?.shippingAddress?.company || "",
      "shippingAddress.postalCode": cart?.shippingAddress?.postalCode || "",
      "shippingAddress.city": cart?.shippingAddress?.city || "",
      "shippingAddress.countryCode":
        cart?.shippingAddress?.country?.iso2 ||
        countryCode ||
        cart?.region?.countries?.[0]?.iso2 ||
        "",
      "shippingAddress.province": cart?.shippingAddress?.province || "",
      email: cart?.email || customer?.email || "",
      "shippingAddress.phone":
        cart?.shippingAddress?.phone || customer?.phone || "",
    });
  }, [cart, countryCode, customer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressSelect = (address: any) => {
    if (!address) return;

    setSelectedAddressId(address.id);
    setFormData((prev) => ({
      ...prev,
      "shippingAddress.firstName": address.firstName || "",
      "shippingAddress.lastName": address.lastName || "",
      "shippingAddress.address1": address.address1 || "",
      "shippingAddress.company": address.company || "",
      "shippingAddress.postalCode": address.postalCode || "",
      "shippingAddress.city": address.city || "",
      "shippingAddress.countryCode": address.country?.iso2 || countryCode || "",
      "shippingAddress.province": address.province || "",
      "shippingAddress.phone": address.phone || prev["shippingAddress.phone"],
    }));
  };

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <div className="mb-4 flex flex-col gap-y-2">
          <p className="text-sm text-muted-foreground">
            {`Hi ${customer.firstName || ""}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={addressesInRegion}
            cart={cart}
            onSelect={handleAddressSelect}
          />
        </div>
      )}
      <input
        type="hidden"
        name="selectedAddressId"
        value={selectedAddressId || ""}
      />
      <input
        type="hidden"
        name="hasModifiedFields"
        value={""}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="First name"
          name="shippingAddress.firstName"
          autoComplete="given-name"
          value={formData["shippingAddress.firstName"]}
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Last name"
          name="shippingAddress.lastName"
          autoComplete="family-name"
          value={formData["shippingAddress.lastName"]}
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Address"
          name="shippingAddress.address1"
          autoComplete="address-line1"
          value={formData["shippingAddress.address1"]}
          onChange={handleChange}
          required
        />
        <Input
          placeholder="Company"
          name="shippingAddress.company"
          value={formData["shippingAddress.company"]}
          onChange={handleChange}
          autoComplete="organization"
        />
        <Input
          placeholder="City"
          name="shippingAddress.city"
          autoComplete="address-level2"
          value={formData["shippingAddress.city"]}
          onChange={handleChange}
          required
        />
        <div className="grid grid-cols-2 gap-x-2">
          <Input
            placeholder="State / Province"
            name="shippingAddress.province"
            autoComplete="address-level1"
            value={formData["shippingAddress.province"]}
            onChange={handleChange}
          />
          <Input
            placeholder="ZIP / Postal code"
            name="shippingAddress.postalCode"
            autoComplete="postal-code"
            value={formData["shippingAddress.postalCode"]}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <CountrySelect
            id="country"
            name="shippingAddress.countryCode"
            region={cart?.region}
            value={formData["shippingAddress.countryCode"]}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="my-8">
        <Checkbox
          label="Billing address same as shipping address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="shippingAddress.phone"
            autoComplete="tel"
            value={formData["shippingAddress.phone"]}
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  );
};

export default ShippingAddress;
