import { isEqual, omit } from "lodash"

/**
 * Compares two addresses by omitting certain fields
 * @param address1 - First address to compare
 * @param address2 - Second address to compare
 * @returns boolean indicating if addresses are equal
 */
export default function compareAddresses(address1: any, address2: any): boolean {
  return isEqual(omit(address1, [
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "metadata",
    "customer_id",
  ]), omit(address2, [
    "id",
    "created_at",
    "updated_at",
    "deleted_at",
    "metadata",
    "customer_id",
  ]));
}