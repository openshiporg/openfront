export interface StorefrontBaseProductRef {
  id: string;
  title?: string | null;
  handle?: string | null;
  thumbnail?: string | null;
}

export interface StorefrontBaseVariantRef {
  id: string;
  title?: string | null;
  product?: StorefrontBaseProductRef | null;
}

export interface StorefrontCountryRef {
  id: string;
  name: string;
  iso2: string;
}

export interface StorefrontBaseAddressRef {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  country?: StorefrontCountryRef | null;
  phone?: string | null;
}
export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  company?: string;
  postalCode: string;
  city: string;
  province?: string;
  phone?: string;
  countryCode: string;
  user?: { connect: { id: string } } | { create: { email: string, hasAccount: boolean, name: string } };
}

export interface ProductWhereClause {
  productCollections?: {
    some: { id: { equals: any } }
  },
  isGiftcard: { equals: any },
  productVariants: {
    some: {
      prices: {
        some: {
          region: {
            countries: { some: { iso2: { equals: string } } }
          }
        }
      }
    }
  },
  id?: { in: any }
}

export interface CreateCustomerData {
  email?: FormDataEntryValue | null;
  password?: FormDataEntryValue | null;
  firstName?: FormDataEntryValue | null;
  lastName?: FormDataEntryValue | null;
  phone?: FormDataEntryValue | null;
}

export interface UpdateCustomerData {
  email?: FormDataEntryValue | null;
  password?: FormDataEntryValue | null;
  firstName?: FormDataEntryValue | null;
  lastName?: FormDataEntryValue | null;
  phone?: FormDataEntryValue | null;
}

export interface AddShippingAddressData {
  firstName?: FormDataEntryValue | null;
  lastName?: FormDataEntryValue | null;
  company?: FormDataEntryValue | null;
  address1?: FormDataEntryValue | null;
  address2?: FormDataEntryValue | null;
  city?: FormDataEntryValue | null;
  province?: FormDataEntryValue | null;
  postalCode?: FormDataEntryValue | null;
  countryCode?: FormDataEntryValue | null;
  phone?: FormDataEntryValue | null;
}

export interface UpdateShippingAddressData {
  firstName?: FormDataEntryValue | null;
  lastName?: FormDataEntryValue | null;
  company?: FormDataEntryValue | null;
  address1?: FormDataEntryValue | null;
  address2?: FormDataEntryValue | null;
  city?: FormDataEntryValue | null;
  province?: FormDataEntryValue | null;
  postalCode?: FormDataEntryValue | null;
  countryCode?: FormDataEntryValue | null;
  phone?: FormDataEntryValue | null;
}

export interface StorefrontBaseRegionRef {
  id: string;
  name: string;
  currency?: { code: string; noDivisionCurrency?: boolean | null } | null;
  countries?: StorefrontCountryRef[] | null;
}

interface StorefrontCartLineItemCheckout {
  id: string;
  quantity: number;
  title?: string | null;
  thumbnail?: string | null;
  unitPrice?: string | null;
  originalPrice?: string | null;
  total?: string | null;
  percentageOff?: number | null;
  productVariant: StorefrontBaseVariantRef & {
    title?: string | null;
    product: StorefrontBaseProductRef & { handle?: string | null };
  };
}

interface StorefrontCartDiscountRef {
  id: string;
  code: string;
  isDynamic?: boolean | null;
  isDisabled?: boolean | null;
  discountRule?: {
    id?: string | null;
    type?: string | null;
    value?: number | null;
    allocation?: string | null;
  } | null;
}

interface StorefrontCartShippingMethodRef {
  id: string;
  price?: number | null;
  shippingOption?: {
    id: string;
    name?: string | null;
  } | null;
}

interface StorefrontCartPaymentSessionRef {
  id: string;
  isSelected?: boolean | null;
  paymentProvider?: {
    id: string;
    code?: string | null;
    isInstalled?: boolean | null;
  } | null;
  data?: Record<string, any> | null;
}

interface StorefrontCartPaymentCollectionRef {
  id: string;
  paymentSessions?: StorefrontCartPaymentSessionRef[] | null;
}

export interface StorefrontCartCheckout {
  id: string;
  email?: string | null;
  type?: 'default' | 'swap' | 'draft_order' | 'payment_link' | 'claim' | null;
  checkoutStep?: 'cart' | 'address' | 'delivery' | 'payment' | 'review' | null;
  region?: StorefrontBaseRegionRef | null;
  lineItems?: StorefrontCartLineItemCheckout[] | null;
  subtotal?: string | null;
  total?: string | null;
  rawTotal?: number | null;
  discount?: string | null;
  giftCardTotal?: string | null;
  tax?: string | null;
  shipping?: string | null;
  giftCards?: { id: string; code: string; balance?: number | null }[] | null;
  discounts?: StorefrontCartDiscountRef[] | null;
  discountsById?: Record<string, string> | null;
  shippingMethods?: StorefrontCartShippingMethodRef[] | null;
  paymentCollection?: StorefrontCartPaymentCollectionRef | null;
  shippingAddress?: StorefrontBaseAddressRef | null;
  billingAddress?: StorefrontBaseAddressRef | null;
}

export interface StorefrontCustomerCheckout {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  addresses?: StorefrontBaseAddressRef[] | null;
}

// Define StorefrontRegion based on getRegion return
export interface StorefrontRegion extends StorefrontBaseRegionRef {
  taxRate?: number | null;
  // Add other fields from getRegion query if needed by AddressBook
}

export interface StorefrontAccountCustomer {
  id:string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  addresses?: StorefrontAddress[] | null
  billingAddress?: StorefrontAddress | null
}

export interface StorefrontAddress {
  id: string
  firstName?: string | null
  lastName?: string | null
  company?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  province?: string | null
  postalCode?: string | null
  country?: StorefrontCountry | null
  phone?: string | null
  isBilling?: boolean | null
}

export interface StorefrontCountry {
  id: string
  iso2?: string | null
  iso3?: string | null
  numCode?: number | null
  name?: string | null
  displayName?: string | null
}

interface StorefrontOrderDetailsLineItem {
  id: string;
  title?: string | null; // From OrderLineItem model
  quantity: number;
  thumbnail?: string | null; // Virtual
  variantTitle?: string | null; // From OrderLineItem model
  formattedUnitPrice?: string | null; // Virtual
  formattedTotal?: string | null; // Virtual
  // Include variant if needed by LineItemOptions used in Items component
  variant?: { id: string; title?: string | null; sku?: string | null } | null;
}

interface StorefrontOrderDetailsShippingMethod {
  id: string;
  price?: number | null; // Raw price
  shippingOption?: { name?: string | null } | null;
}

interface StorefrontOrderDetailsPaymentDetails { // From virtual field
  id: string;
  amount: number;
  formattedAmount?: string;
  status?: string | null;
  createdAt?: string | null; // or Date
  provider?: string | null; // Based on virtual field logic
  cardLast4?: string | null; // Based on virtual field logic
}

interface StorefrontOrderDetailsFulfillmentStatus { // From virtual field
  status?: 'not_fulfilled' | 'partially_fulfilled' | 'fulfilled' | 'canceled' | 'requires_action' | null;
  shippingStatus?: 'not_shipped' | 'partially_shipped' | 'shipped' | null;
}

export interface StorefrontOrderDetails {
  id: string;
  displayId?: number | null;
  status?: 'pending' | 'completed' | 'archived' | 'canceled' | 'requires_action' | null;
  fulfillmentStatus?: StorefrontOrderDetailsFulfillmentStatus | null; // Virtual field result
  paymentDetails?: StorefrontOrderDetailsPaymentDetails[] | null; // Virtual field result
  total?: string | null; // Virtual field (formatted)
  subtotal?: string | null; // Virtual field (formatted)
  shipping?: string | null; // Virtual field (formatted)
  discount?: string | null; // Virtual field (formatted)
  tax?: string | null; // Virtual field (formatted)
  // Raw amounts might be needed by OrderSummary
  rawTotal?: number | null;
  rawSubtotal?: number | null;
  rawShipping?: number | null;
  rawDiscount?: number | null;
  rawTax?: number | null;
  rawGiftCardTotal?: number | null;
  createdAt?: string | null; // Type from schema (DateTime -> string)
  email?: string | null;
  shippingAddress?: StorefrontBaseAddressRef | null;
  billingAddress?: StorefrontBaseAddressRef | null;
  shippingMethods?: StorefrontOrderDetailsShippingMethod[] | null;
  lineItems?: StorefrontOrderDetailsLineItem[] | null;
  currency?: { code?: string | null }; // Structure based on query
}

interface StorefrontOrderOverviewLineItem {
  id: string;
  title?: string | null; // From query
  quantity: number;
  thumbnail?: string | null; // From query
  // Add variant if needed by OrderCard -> Thumbnail/LineItemOptions
  variant?: {
    id: string;
    title?: string | null;
    product?: { images?: { url?: string }[] | null } | null; // For Thumbnail
  } | null;
}

export interface StorefrontOrderOverviewItem {
  id: string;
  displayId?: number | null; // From query
  status?: string | null; // From query
  fulfillmentStatus?: string | null; // From query
  total?: number | null; // Raw total from query for formatAmount
  createdAt?: string | null; // From query (or Date)
  shippingAddress?: { country?: { iso2?: string | null } | null } | null; // From query
  lineItems?: StorefrontOrderOverviewLineItem[] | null; // From query
  currency?: { code?: string | null }; // From query
  // region needed for formatAmount used in OrderCard
  region?: { currency?: { code?: string | null } | null } | null;
}

export interface StorefrontCustomerProfile {
  id: string;
  firstName?: string | null; // Virtual
  lastName?: string | null; // Virtual
  name?: string | null; // Base field if needed
  email?: string | null;
  phone?: string | null;
  addresses?: StorefrontAddress[] | null
  billingAddress?: StorefrontAddress | null // Virtual
}

export interface StorefrontRegionBasic {
  id: string;
  name: string;
  currency?: { code?: string | null } | null; // Needed by ProfileBillingAddress -> CountrySelect
  countries?: { id: string; name: string; iso2: string }[] | null;
}

export interface StorefrontCustomerLayout {
  id: string;
  firstName?: string | null; // Used in AccountNav mobile view for greeting
}

export interface StorefrontCustomerBasic {
  id: string; // Only needed for type safety and existence check
}

// Forward declare for recursive types
interface StorefrontProductCategoryBase {
  id: string;
  title?: string | null; // Query uses 'title'
  handle?: string | null;
  description?: string | null; // Used in CategoryTemplate
  products?: any[] | null; // Define StorefrontProductTeaser if needed by CategoryTemplate/PaginatedProducts
}

export interface StorefrontProductCategory extends StorefrontProductCategoryBase {
  parent_category?: StorefrontProductCategory | null; // Recursive
  category_children?: StorefrontProductCategory[] | null; // Recursive
}

export interface StorefrontCollection {
  id: string;
  title?: string | null;
  handle?: string | null;
  products?: any[] | null; // Define StorefrontProductTeaser if needed by CollectionTemplate/PaginatedProducts
}

// Type for free shipping price calculation
export interface StoreFreeShippingPrice {
  current_amount: number;
  target_amount: number;
  target_reached: boolean;
  target_remaining: number;
  remaining_percentage: number;
}

export interface StoreCollection {
  id: string;
  title: string;
  handle: string;
  products?: any[];
}

export interface StoreRegion {
  id: string;
  name: string;
  currency_code: string;
  currency: {
    code: string;
  };
  countries: {
    id: string;
    name: string;
    iso2: string;
  }[];
  locale?: string;
}

export interface StoreOrder {
  id: string;
  status: string;
  displayId: number;
  email: string;
  shippingAddress: StorefrontAddress;
  billingAddress: StorefrontAddress;
  lineItems: CartLineItem[];
  region: StoreRegion;
  total: number;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  discount_total: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  fulfillment_status?: string;
  payment_status?: string;
  currency_code: string;
  discount: number;
  giftCard: number;
  shipping: number;
  tax: number;
  payments?: {
    id: string;
    amount: number;
    currencyCode: string;
    paymentCollection?: {
      paymentSessions?: {
        id: string;
        isSelected?: boolean;
        paymentProvider?: {
          id: string;
          code?: string;
        };
      }[];
    };
    data: {
      cardLast4?: string;
    };
    createdAt: string;
  }[];
}

export interface MoneyAmount {
  amount: number;
  currency: {
    code: string;
  };
  calculatedPrice: {
    calculatedAmount: number;
    originalAmount: number;
    currencyCode: string;
  };
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  inventoryQuantity?: number;
  allowBackorder?: boolean;
  metadata?: Record<string, any>;
  productOptionValues?: {
    id: string;
    value: string;
    productOption: {
      id: string;
    };
  }[];
  prices?: MoneyAmount[];
}

export interface StoreProduct {
  id: string;
  title: string;
  handle: string;
  description?: {
    document: any;
  };
  thumbnail?: string;
  productImages?: {
    id: string;
    image: {
      url: string;
    };
    imagePath: string;
  }[];
  productOptions?: {
    id: string;
    title: string;
    metadata?: Record<string, any>;
    productOptionValues?: {
      id: string;
      value: string;
    }[];
  }[];
  productVariants?: ProductVariant[];
  status?: string;
  metadata?: Record<string, any>;
}

export interface CartLineItem {
  id: string;
  quantity: number;
  title: string;
  sku?: string;
  thumbnail?: string;
  total?: string;
  variant?: {
    id: string;
    title: string;
    sku?: string;
    prices?: {
      amount: number;
    }[];
  };
}
