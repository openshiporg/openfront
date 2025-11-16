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
