/** Data contract between the server-side card builders (mcp-ui/server) and the browser runtime (mcp-ui/runtime). */
export type SlimVariant = {
  id: string;
  title: string;
  /** Price in dollars (major units), or undefined when the source has none. */
  price?: number;
  inStock: boolean;
  /** option id -> chosen value */
  optionValues: Record<string, string>;
};

export type SlimModifier = {
  id: string;
  name: string;
  group: string;
  /** Price adjustment in dollars. */
  price: number;
  defaultSelected: boolean;
};

export type SlimModifierGroup = {
  id: string;
  label: string;
  required: boolean;
  min: number;
  max: number;
  choices: SlimModifier[];
};

export type SlimProduct = {
  id: string;
  title: string;
  description?: string;
  images: string[];
  currency: string;
  options: { id: string; title: string; values: string[] }[];
  variants: SlimVariant[];
  restaurant?: {
    category?: string;
    cartAvailable: boolean;
    groups: SlimModifierGroup[];
    prepTime?: string;
    calories?: string;
    dietaryFlags: string[];
  };
};

export type DiscoverData = {
  title: string;
  subtitle?: string;
  stores: { storeId: string; name: string; platform?: string; countryCode: string; currency: string; products: SlimProduct[] }[];
};

export type StoresData = { stores: { storeId: string; name: string; platform?: string; address?: string; countryCode?: string }[] };
export type EmptyData = { title: string; message: string; query?: string };

export type ProductData = { storeId: string; countryCode: string; product: SlimProduct };

export type CartLine = { id: string; label: string; detail?: string; amount: number; quantity: number };
export type CartFee = { label: string; amount: number };
export type PaymentChoice = 'stripe' | 'paypal' | 'checkout';

export type CartData = {
  kind: 'retail' | 'restaurant';
  storeId: string;
  cartId: string;
  storeName: string;
  currency: string;
  items: CartLine[];
  fees: CartFee[];
  total: number;
  issues: string[];
  lockTarget: { tab: string; label: string };
  providers: PaymentChoice[];
  countryCode: string;
  retail?: {
    address: Record<string, string>;
    shippingOptions: { id: string; name: string; price: string }[];
    selectedShippingId?: string;
  };
  restaurant?: {
    orderType: 'pickup' | 'delivery';
    deliveryEnabled: boolean;
    deliveryFee: number;
    contact: Record<string, string>;
    delivery: Record<string, string>;
    pickupAddress?: string;
    estimatedPickup?: string;
    notes: string[];
    checkoutUrl: string;
    checkoutLabel: string;
  };
};

export type LoginData = { storeId: string; email: string; message: string; cartId?: string; addressData?: unknown };
export type ConflictData = {
  storeId: string; cartId: string; email: string; storeName: string; checkoutUrl: string;
  addressData: Record<string, unknown>;
};
export type ErrorData = { title: string; message?: string; issues: string[] };

export type CardPayload =
  | { kind: 'discover'; data: DiscoverData }
  | { kind: 'product'; data: ProductData }
  | { kind: 'stores'; data: StoresData }
  | { kind: 'empty'; data: EmptyData }
  | { kind: 'cart'; data: CartData }
  | { kind: 'login'; data: LoginData }
  | { kind: 'conflict'; data: ConflictData }
  | { kind: 'error'; data: ErrorData };
