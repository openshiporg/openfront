// Centralized query key factory for type safety and consistency
export const queryKeys = {
  // Cart operations
  cart: {
    all: ['cart'] as const,
    active: () => [...queryKeys.cart.all, 'active'] as const,
    byId: (cartId: string) => [...queryKeys.cart.all, cartId] as const,
  },

  // Product operations
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (params: {
      categoryId?: string;
      collectionId?: string;
      limit?: number;
      offset?: number;
      sortBy?: string;
      countryCode?: string;
    }) => [...queryKeys.products.lists(), params] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (handle: string) => [...queryKeys.products.details(), handle] as const,
    search: (query: string, filters?: Record<string, any>) => 
      [...queryKeys.products.all, 'search', query, filters] as const,
    related: (productId: string) => 
      [...queryKeys.products.all, 'related', productId] as const,
    byCategory: (categoryId: string) => 
      [...queryKeys.products.all, 'category', categoryId] as const,
    byCollection: (collectionId: string) => 
      [...queryKeys.products.all, 'collection', collectionId] as const,
  },

  // User operations
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    orders: () => [...queryKeys.user.all, 'orders'] as const,
    order: (orderId: string) => [...queryKeys.user.orders(), orderId] as const,
    addresses: () => [...queryKeys.user.all, 'addresses'] as const,
  },

  // Categories
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
    byHandle: (handle: string) => [...queryKeys.categories.all, handle] as const,
  },

  // Collections
  collections: {
    all: ['collections'] as const,
    list: () => [...queryKeys.collections.all, 'list'] as const,
    byHandle: (handle: string) => [...queryKeys.collections.all, handle] as const,
  },

  // Regions and shipping
  regions: {
    all: ['regions'] as const,
    list: () => [...queryKeys.regions.all, 'list'] as const,
    byCountryCode: (countryCode: string) => 
      [...queryKeys.regions.all, countryCode] as const,
  },

  // Shipping
  shipping: {
    all: ['shipping'] as const,
    options: (cartId: string) => [...queryKeys.shipping.all, 'options', cartId] as const,
    fulfillment: (providerId: string) => [...queryKeys.shipping.all, 'fulfillment', providerId] as const,
    methods: (cartId: string) => [...queryKeys.shipping.all, 'methods', cartId] as const,
    rates: (params: {
      cartId: string;
      shippingAddress?: any;
    }) => [...queryKeys.shipping.all, 'rates', params] as const,
  },

  // Payment
  payment: {
    all: ['payment'] as const,
    methods: () => [...queryKeys.payment.all, 'methods'] as const,
    sessions: (cartId: string) => [...queryKeys.payment.all, 'sessions', cartId] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    details: () => [...queryKeys.orders.all, 'detail'] as const,
    detail: (orderId: string) => [...queryKeys.orders.details(), orderId] as const,
    byDisplayId: (displayId: string) => [...queryKeys.orders.all, 'displayId', displayId] as const,
  },

  // Store configuration
  store: {
    all: ['store'] as const,
    config: () => [...queryKeys.store.all, 'config'] as const,
    currencies: () => [...queryKeys.store.all, 'currencies'] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;