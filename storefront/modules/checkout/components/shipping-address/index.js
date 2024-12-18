import React, { useState, useEffect, useMemo } from "react"
import Checkbox from "@storefront/modules/common/components/checkbox"
import Input from "@storefront/modules/common/components/input"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"
import { Container } from "@medusajs/ui"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
  countryCode
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [formData, setFormData] = useState({
    "shippingAddress.firstName": cart?.shippingAddress?.firstName || "",
    "shippingAddress.lastName": cart?.shippingAddress?.lastName || "",
    "shippingAddress.address1": cart?.shippingAddress?.address1 || "",
    "shippingAddress.company": cart?.shippingAddress?.company || "",
    "shippingAddress.postalCode": cart?.shippingAddress?.postalCode || "",
    "shippingAddress.city": cart?.shippingAddress?.city || "",
    "shippingAddress.countryCode": cart?.shippingAddress?.countryCode || countryCode || "",
    "shippingAddress.province": cart?.shippingAddress?.province || "",
    email: cart?.email || customer?.email || "",
    "shippingAddress.phone": cart?.shippingAddress?.phone || customer?.phone || "",
  });

  const [hasModifiedFields, setHasModifiedFields] = useState(false);

  const countriesInRegion = useMemo(() => cart?.region?.countries?.map((c) => c.iso2), [cart?.region]);

  const addressesInRegion = useMemo(() =>
    customer?.addresses?.filter((a) => a.countryCode && countriesInRegion?.includes(a.countryCode)), 
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
      "shippingAddress.countryCode": cart?.shippingAddress?.countryCode || countryCode || "",
      "shippingAddress.province": cart?.shippingAddress?.province || "",
      email: cart?.email || customer?.email || "",
      "shippingAddress.phone": cart?.shippingAddress?.phone || customer?.phone || "",
    });
  }, [cart?.shippingAddress, cart?.email, countryCode, customer]);

  const handleChange = (e) => {
    setHasModifiedFields(true);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressSelect = (address) => {
    if (!address) return;
    
    setSelectedAddressId(address.id);
    setHasModifiedFields(false);
    setFormData(prev => ({
      ...prev,
      "shippingAddress.firstName": address.firstName || "",
      "shippingAddress.lastName": address.lastName || "",
      "shippingAddress.address1": address.address1 || "",
      "shippingAddress.company": address.company || "",
      "shippingAddress.postalCode": address.postalCode || "",
      "shippingAddress.city": address.city || "",
      "shippingAddress.countryCode": address.countryCode || countryCode || "",
      "shippingAddress.province": address.province || "",
      "shippingAddress.phone": address.phone || prev["shippingAddress.phone"],
    }));
  };

  return <>
    {customer && (addressesInRegion?.length || 0) > 0 && (
      <Container className="mb-6 flex flex-col gap-y-4 p-5">
        <p className="text-small-regular">
          {`Hi ${customer.firstName || ''}, do you want to use one of your saved addresses?`}
        </p>
        <AddressSelect 
          addresses={customer.addresses} 
          cart={cart}
          onSelect={handleAddressSelect}
        />
      </Container>
    )}
    <input type="hidden" name="selectedAddressId" value={selectedAddressId || ""} />
    <input type="hidden" name="hasModifiedFields" value={hasModifiedFields.toString()} />
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="First name"
        name="shippingAddress.firstName"
        autoComplete="given-name"
        value={formData["shippingAddress.firstName"]}
        onChange={handleChange}
        required />
      <Input
        label="Last name"
        name="shippingAddress.lastName"
        autoComplete="family-name"
        value={formData["shippingAddress.lastName"]}
        onChange={handleChange}
        required />
      <Input
        label="Address"
        name="shippingAddress.address1"
        autoComplete="address-line1"
        value={formData["shippingAddress.address1"]}
        onChange={handleChange}
        required />
      <Input
        label="Company"
        name="shippingAddress.company"
        value={formData["shippingAddress.company"]}
        onChange={handleChange}
        autoComplete="organization" />
      <Input
        label="Postal code"
        name="shippingAddress.postalCode"
        autoComplete="postal-code"
        value={formData["shippingAddress.postalCode"]}
        onChange={handleChange}
        required />
      <Input
        label="City"
        name="shippingAddress.city"
        autoComplete="address-level2"
        value={formData["shippingAddress.city"]}
        onChange={handleChange}
        required />
      <CountrySelect
        name="shippingAddress.countryCode"
        autoComplete="country"
        region={cart?.region}
        value={formData["shippingAddress.countryCode"]}
        onChange={handleChange}
        required />
      <Input
        label="State / Province"
        name="shippingAddress.province"
        autoComplete="address-level1"
        value={formData["shippingAddress.province"]}
        onChange={handleChange} />
    </div>
    <div className="my-8">
      <Checkbox
        label="Billing address same as shipping address"
        name="same_as_billing"
        checked={checked}
        onChange={onChange} />
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <Input
        label="Email"
        name="email"
        type="email"
        title="Enter a valid email address."
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
        required />
      <Input
        label="Phone"
        name="shippingAddress.phone"
        autoComplete="tel"
        value={formData["shippingAddress.phone"]}
        onChange={handleChange} />
    </div>
  </>;
}

export default ShippingAddress
