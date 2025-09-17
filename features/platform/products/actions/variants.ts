'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "@/features/dashboard/lib/keystoneClient";

/**
 * Create product variant
 */
export async function createProductVariant(data: {
  title: string;
  sku?: string;
  barcode?: string;
  ean?: string;
  upc?: string;
  material?: string;
  inventoryQuantity?: number;
  manageInventory?: boolean;
  allowBackorder?: boolean;
  hsCode?: string;
  originCountry?: string;
  midCode?: string;
  productId: string;
  optionValueIds: string[];
  prices?: Array<{
    amount: number;
    compareAmount?: number;
    currencyCode: string;
    regionCode?: string;
  }>;
}) {
  const query = `
    mutation CreateProductVariant($data: ProductVariantCreateInput!) {
      createProductVariant(data: $data) {
        id
        title
        sku
        barcode
        ean
        upc
        material
        productOptionValues {
          id
          value
          productOption {
            id
            title
          }
        }
        prices {
          id
          amount
          compareAmount
          region {
            id
            code
            name
            currency {
              code
              symbol
              symbolNative
            }
          }
        }
      }
    }
  `;

  const prices = data.prices?.map((price) => ({
    amount: price.amount,
    compareAmount: price.compareAmount,
    currency: {
      connect: { code: price.currencyCode.toLowerCase() },
    },
    ...(price.regionCode
      ? {
          region: {
            connect: { code: price.regionCode },
          },
        }
      : {}),
  })) || [];

  const response = await keystoneClient(query, {
    data: {
      title: data.title,
      sku: data.sku || "",
      barcode: data.barcode || "",
      ean: data.ean || "",
      upc: data.upc || "",
      material: data.material || "",
      inventoryQuantity: data.inventoryQuantity || 100,
      manageInventory: data.manageInventory || false,
      allowBackorder: data.allowBackorder || false,
      hsCode: data.hsCode || "",
      originCountry: data.originCountry || "",
      midCode: data.midCode || "",
      product: { connect: { id: data.productId } },
      productOptionValues: {
        connect: data.optionValueIds.map((id: string) => ({ id })),
      },
      prices: { create: prices },
    },
  });

  if (response.success) {
    revalidatePath(`/dashboard/platform/products/${data.productId}`);
  }

  return response;
}

/**
 * Delete product variant
 */
export async function deleteProductVariant(id: string) {
  // First get the product ID for revalidation
  const productQuery = `
    query GetProductFromVariant($id: ID!) {
      productVariant(where: { id: $id }) {
        product {
          id
        }
      }
    }
  `;

  const productResponse = await keystoneClient(productQuery, { id });
  const productId = productResponse.success ? productResponse.data.productVariant?.product?.id : null;

  const query = `
    mutation DeleteProductVariant($id: ID!) {
      deleteProductVariant(where: { id: $id }) {
        id
        title
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success && productId) {
    revalidatePath(`/dashboard/platform/products/${productId}`);
  }

  return response;
}

/**
 * Update variant price (add new price to variant)
 */
export async function updateVariantPrice(variantId: string, priceData: {
  amount: number;
  compareAmount?: number;
  currencyCode: string;
  regionCode?: string;
}) {
  const query = `
    mutation AddVariantPrice($id: ID!, $input: ProductVariantUpdateInput!) {
      updateProductVariant(where: { id: $id }, data: $input) {
        id
        prices {
          id
          amount
          compareAmount
          currency {
            code
            symbol
            name
            symbolNative
          }
          region {
            id
            code
            name
            taxRate
          }
        }
      }
    }
  `;

  const response = await keystoneClient(query, {
    id: variantId,
    input: {
      prices: {
        create: [
          {
            amount: priceData.amount,
            compareAmount: priceData.compareAmount,
            currency: {
              connect: { code: priceData.currencyCode.toLowerCase() },
            },
            ...(priceData.regionCode
              ? {
                  region: {
                    connect: { code: priceData.regionCode },
                  },
                }
              : {}),
          },
        ],
      },
    },
  });

  if (response.success) {
    // Get product ID for revalidation
    const productQuery = `
      query GetProductFromVariant($id: ID!) {
        productVariant(where: { id: $id }) {
          product {
            id
          }
        }
      }
    `;

    const productResponse = await keystoneClient(productQuery, { id: variantId });
    if (productResponse.success && productResponse.data.productVariant?.product?.id) {
      revalidatePath(`/dashboard/platform/products/${productResponse.data.productVariant.product.id}`);
    }
  }

  return response;
}

/**
 * Update product variant basic info
 */
export async function updateProductVariant(variantId: string, data: {
  title?: string;
  sku?: string;
  barcode?: string;
  ean?: string;
  upc?: string;
  material?: string;
  inventoryQuantity?: number;
  manageInventory?: boolean;
  allowBackorder?: boolean;
  hsCode?: string;
  originCountry?: string;
  midCode?: string;
  primaryImageId?: string;
}) {
  const query = `
    mutation UpdateProductVariant($id: ID!, $input: ProductVariantUpdateInput!) {
      updateProductVariant(where: { id: $id }, data: $input) {
        id
        title
        sku
        barcode
        ean
        upc
        material
        inventoryQuantity
        manageInventory
        allowBackorder
        hsCode
        originCountry
        midCode
        primaryImage {
          id
          image {
            url
          }
          imagePath
          altText
        }
      }
    }
  `;

  const input: any = {};

  // Only include fields that are provided
  if (data.title !== undefined) input.title = data.title;
  if (data.sku !== undefined) input.sku = data.sku;
  if (data.barcode !== undefined) input.barcode = data.barcode;
  if (data.ean !== undefined) input.ean = data.ean;
  if (data.upc !== undefined) input.upc = data.upc;
  if (data.material !== undefined) input.material = data.material;
  if (data.inventoryQuantity !== undefined) input.inventoryQuantity = data.inventoryQuantity;
  if (data.manageInventory !== undefined) input.manageInventory = data.manageInventory;
  if (data.allowBackorder !== undefined) input.allowBackorder = data.allowBackorder;
  if (data.hsCode !== undefined) input.hsCode = data.hsCode;
  if (data.originCountry !== undefined) input.originCountry = data.originCountry;
  if (data.midCode !== undefined) input.midCode = data.midCode;

  // Handle primaryImage connection
  if (data.primaryImageId !== undefined) {
    if (data.primaryImageId === null || data.primaryImageId === '') {
      input.primaryImage = { disconnect: true };
    } else {
      input.primaryImage = { connect: { id: data.primaryImageId } };
    }
  }

  const response = await keystoneClient(query, {
    id: variantId,
    input,
  });

  if (response.success) {
    // Get product ID for revalidation
    const productQuery = `
      query GetProductFromVariant($id: ID!) {
        productVariant(where: { id: $id }) {
          product {
            id
          }
        }
      }
    `;

    const productResponse = await keystoneClient(productQuery, { id: variantId });
    if (productResponse.success && productResponse.data.productVariant?.product?.id) {
      revalidatePath(`/dashboard/platform/products/${productResponse.data.productVariant.product.id}`);
    }
  }

  return response;
}

/**
 * Update money amount (update existing price)
 */
export async function updateMoneyAmount(id: string, data: {
  amount: number;
  compareAmount?: number;
}) {
  const query = `
    mutation UpdateMoneyAmount($id: ID!, $data: MoneyAmountUpdateInput!) {
      updateMoneyAmount(where: { id: $id }, data: $data) {
        id
        amount
        compareAmount
        currency {
          code
        }
        region {
          id
          code
          name
        }
      }
    }
  `;

  const response = await keystoneClient(query, { id, data });

  if (response.success) {
    // Get product ID for revalidation
    const productQuery = `
      query GetProductFromPrice($id: ID!) {
        moneyAmount(where: { id: $id }) {
          productVariant {
            product {
              id
            }
          }
        }
      }
    `;

    const productResponse = await keystoneClient(productQuery, { id });
    if (productResponse.success && productResponse.data.moneyAmount?.productVariant?.product?.id) {
      revalidatePath(`/dashboard/platform/products/${productResponse.data.moneyAmount.productVariant.product.id}`);
    }
  }

  return response;
}

/**
 * Create product option
 */
export async function createProductOption(data: {
  title: string;
  productId: string;
}) {
  const query = `
    mutation CreateProductOption($data: ProductOptionCreateInput!) {
      createProductOption(data: $data) {
        id
        title
        productOptionValues {
          id
          value
        }
      }
    }
  `;

  const response = await keystoneClient(query, {
    data: {
      title: data.title,
      product: { connect: { id: data.productId } },
    },
  });

  if (response.success) {
    revalidatePath(`/dashboard/platform/products/${data.productId}`);
  }

  return response;
}

/**
 * Update product option
 */
export async function updateProductOption(id: string, data: {
  title: string;
}) {
  const query = `
    mutation UpdateProductOption($id: ID!, $data: ProductOptionUpdateInput!) {
      updateProductOption(where: { id: $id }, data: $data) {
        id
        title
        productOptionValues {
          id
          value
        }
      }
    }
  `;

  const response = await keystoneClient(query, { id, data });

  if (response.success) {
    // Get product ID for revalidation
    const productQuery = `
      query GetProductFromOption($id: ID!) {
        productOption(where: { id: $id }) {
          product {
            id
          }
        }
      }
    `;

    const productResponse = await keystoneClient(productQuery, { id });
    if (productResponse.success && productResponse.data.productOption?.product?.id) {
      revalidatePath(`/dashboard/platform/products/${productResponse.data.productOption.product.id}`);
    }
  }

  return response;
}

/**
 * Save variant drift changes (create new variants and delete old ones)
 */
export async function saveVariantDriftChanges(data: {
  productId: string;
  variantsToCreate: Array<{
    id: string;
    title: string;
    sku?: string;
    barcode?: string;
    ean?: string;
    upc?: string;
    material?: string;
    productOptionValues: Array<{
      id: string;
      value: string;
      productOption: {
        id: string;
        title: string;
      };
    }>;
    prices?: Array<{
      amount: number;
      compareAmount?: number;
      currency: {
        code: string;
      };
      region: {
        code: string;
      };
    }>;
  }>;
  variantsToDelete: Array<{
    id: string;
    title: string;
  }>;
}) {
  const errors: string[] = [];
  const results = {
    created: [] as any[],
    deleted: [] as any[],
  };

  try {
    // Create new variants
    for (const variant of data.variantsToCreate) {
      try {
        const optionValueIds = variant.productOptionValues.map((ov) => ov.id);

        // Transform prices to the format expected by createProductVariant
        const prices = variant.prices?.filter((price) =>
          price && price.currency && price.currency.code
        ).map((price) => ({
          amount: price.amount,
          compareAmount: price.compareAmount,
          currencyCode: price.currency.code,
          regionCode: price.region?.code,
        })) || [];

        const createResponse = await createProductVariant({
          title: variant.title,
          sku: variant.sku || "",
          barcode: variant.barcode || "",
          ean: variant.ean || "",
          upc: variant.upc || "",
          material: variant.material || "",
          productId: data.productId,
          optionValueIds,
          prices,
        });

        if (createResponse.success) {
          results.created.push(createResponse.data.createProductVariant);
        } else {
          errors.push(`Failed to create variant "${variant.title}": ${createResponse.error}`);
        }
      } catch (error) {
        errors.push(`Error creating variant "${variant.title}": ${error}`);
      }
    }

    // Delete variants that are no longer needed
    for (const variant of data.variantsToDelete) {
      try {
        const deleteResponse = await deleteProductVariant(variant.id);

        if (deleteResponse.success) {
          results.deleted.push(variant);
        } else {
          errors.push(`Failed to delete variant "${variant.title}": ${deleteResponse.error}`);
        }
      } catch (error) {
        errors.push(`Error deleting variant "${variant.title}": ${error}`);
      }
    }

    // Revalidate the product page
    revalidatePath(`/dashboard/platform/products/${data.productId}`);

    return {
      success: errors.length === 0,
      data: results,
      errors,
      message: errors.length === 0
        ? `Successfully created ${results.created.length} variants and deleted ${results.deleted.length} variants`
        : `Completed with ${errors.length} errors`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to save variant changes: ${error}`,
      data: null,
    };
  }
}
/**
 * Create product option value
 */
export async function createProductOptionValue(data: {
  value: string;
  productOptionId: string;
}) {
  const query = `
    mutation CreateProductOptionValue($data: ProductOptionValueCreateInput!) {
      createProductOptionValue(data: $data) {
        id
        value
        productOption {
          id
          title
        }
      }
    }
  `;

  const response = await keystoneClient(query, {
    data: {
      value: data.value,
      productOption: { connect: { id: data.productOptionId } },
    },
  });

  if (response.success) {
    // Get product ID for revalidation
    const productQuery = `
      query GetProductFromOptionValue($id: ID!) {
        productOptionValue(where: { id: $id }) {
          productOption {
            product {
              id
            }
          }
        }
      }
    `;

    const productResponse = await keystoneClient(productQuery, { id: response.data.createProductOptionValue.id });
    if (productResponse.success && productResponse.data.productOptionValue?.productOption?.product?.id) {
      revalidatePath(`/dashboard/platform/products/${productResponse.data.productOptionValue.productOption.product.id}`);
    }
  }

  return response;
}

/**
 * Update product option value
 */
export async function updateProductOptionValue(id: string, data: {
  value: string;
}) {
  const query = `
    mutation UpdateProductOptionValue($id: ID!, $data: ProductOptionValueUpdateInput!) {
      updateProductOptionValue(where: { id: $id }, data: $data) {
        id
        value
        productOption {
          id
          title
        }
      }
    }
  `;

  const response = await keystoneClient(query, { id, data });

  if (response.success) {
    // Get product ID for revalidation
    const productQuery = `
      query GetProductFromOptionValue($id: ID!) {
        productOptionValue(where: { id: $id }) {
          productOption {
            product {
              id
            }
          }
        }
      }
    `;

    const productResponse = await keystoneClient(productQuery, { id });
    if (productResponse.success && productResponse.data.productOptionValue?.productOption?.product?.id) {
      revalidatePath(`/dashboard/platform/products/${productResponse.data.productOptionValue.productOption.product.id}`);
    }
  }

  return response;
}

/**
 * Delete product option value
 */
export async function deleteProductOptionValue(id: string) {
  // First get the product ID for revalidation
  const productQuery = `
    query GetProductFromOptionValue($id: ID!) {
      productOptionValue(where: { id: $id }) {
        productOption {
          product {
            id
          }
        }
      }
    }
  `;

  const productResponse = await keystoneClient(productQuery, { id });
  const productId = productResponse.success ? productResponse.data.productOptionValue?.productOption?.product?.id : null;

  const query = `
    mutation DeleteProductOptionValue($id: ID!) {
      deleteProductOptionValue(where: { id: $id }) {
        id
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success && productId) {
    revalidatePath(`/dashboard/platform/products/${productId}`);
  }

  return response;
}