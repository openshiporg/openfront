// Define product type with options from Keystone
interface StorefrontProduct {
  id: string;
  options?: Array<{
    values?: Array<any>;
  }>;
}

export const isSimpleProduct = (product: StorefrontProduct): boolean => {
    return product.options?.length === 1 && product.options[0].values?.length === 1;
}