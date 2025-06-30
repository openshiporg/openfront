// Types related to customer accounts and orders

export type Address = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: {
    id: string;
    iso2: string;
    name: string;
  } | null;
  phone: string | null;
  isBilling?: boolean; // Optional based on query context
};

export type CustomerProfile = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  billingAddress: Address | null;
  addresses: Address[];
} | null;

export type OrderSummary = {
  id: string;
  createdAt: string;
  displayId: string;
  total: number;
  currency: {
    code: string;
  };
};

export type OrdersList = OrderSummary[] | null;