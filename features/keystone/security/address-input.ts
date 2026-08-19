const CUSTOMER_ADDRESS_FIELDS = new Set([
  "company",
  "firstName",
  "lastName",
  "address1",
  "address2",
  "city",
  "province",
  "postalCode",
  "phone",
  "isBilling",
  "metadata",
  "country",
]);

type AddressData = Record<string, unknown>;

/** Preserve Keystone defaults while constraining customer-controlled address data. */
export function resolveCustomerAddressData({
  inputData,
  resolvedData,
  userId,
}: {
  inputData?: AddressData;
  resolvedData: AddressData;
  userId: string;
}): AddressData {
  const restrictedData = { ...resolvedData };

  for (const key of Object.keys(inputData ?? {})) {
    if (!CUSTOMER_ADDRESS_FIELDS.has(key)) delete restrictedData[key];
  }

  restrictedData.user = { connect: { id: userId } };
  return restrictedData;
}
