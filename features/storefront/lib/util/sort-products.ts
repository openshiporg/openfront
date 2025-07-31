import { getProductPrice } from "./get-product-price";

/**
 * Enum for sort options
 */
export enum SortOptions {
  PRICE_ASC = "price_asc",
  PRICE_DESC = "price_desc",
  CREATED_AT = "created_at",
}

/**
 * Strips currency symbols from a price string
 * @param price - Price string with currency symbol
 * @returns Price as a number
 */
const stripCurrency = (price: string): number => {
  return parseFloat(price.replace(/[^0-9.]/g, ""));
}

/**
 * Gets the minimum price for a product
 * @param product - Product object
 * @param region - Region object
 * @returns Minimum price as a number or 0 if not available
 */
const getMinPrice = (product: any, region: any): number => {
  if (!product.productVariants || product.productVariants.length === 0) {
    // Fallback to old structure if available
    if (product.price?.calculated_price) {
      return stripCurrency(product.price.calculated_price);
    }
    return 0;
  }

  const { cheapestPrice } = getProductPrice({ product, region });
  
  if (!cheapestPrice) {
    return 0;
  }
  
  return cheapestPrice.calculatedAmount || 0;
}

/**
 * Sorts products based on the provided sort option
 * @param products - Array of products to sort
 * @param sortBy - Sort option
 * @returns Sorted array of products
 */
const sortProducts = (products: any[], sortBy: SortOptions): any[] => {
  // Mock region for price calculation
  const mockRegion = {
    currency: { code: "usd" }
  };

  if (sortBy === SortOptions.PRICE_ASC) {
    return products.sort((a, b) => {
      const aPrice = getMinPrice(a, mockRegion);
      const bPrice = getMinPrice(b, mockRegion);
      
      return aPrice - bPrice;
    });
  }

  if (sortBy === SortOptions.PRICE_DESC) {
    return products.sort((a, b) => {
      const aPrice = getMinPrice(a, mockRegion);
      const bPrice = getMinPrice(b, mockRegion);
      
      return bPrice - aPrice;
    });
  }

  if (sortBy === SortOptions.CREATED_AT) {
    return products.sort((a, b) => {
      if (!a.created_at || !b.created_at) return 0

      return new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf();
    });
  }

  return products
}

export default sortProducts