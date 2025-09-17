'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

// Interface for product data (exported for potential use in other files)
export interface Product {
  id: string;
  title: string;
  status: string;
  description?: string;
  [key: string]: unknown;
}

/**
 * Get list of products
 */
export async function getProducts(
  where: Record<string, unknown> = {},
  take: number = 10,
  skip: number = 0,
  orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }],
  selectedFields: string = `
    id
    title
    handle
    status
    description {
      document
    }
    thumbnail
    createdAt
    updatedAt
    productVariants {
      id
      title
      sku
      inventoryQuantity
      manageInventory
    }
    productImages {
      id
      image {
        url
      }
      imagePath
      altText
    }
    productCategories {
      id
      title
    }
    productCollections {
      id
      title
    }
  `
) {
  const query = `
    query GetProducts($where: ProductWhereInput, $take: Int!, $skip: Int!, $orderBy: [ProductOrderByInput!]) {
      items: products(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {
        ${selectedFields}
      }
      count: productsCount(where: $where)
    }
  `;

  const response = await keystoneClient(query, {
    where,
    take,
    skip,
    orderBy,
  });

  if (response.success) {
    return {
      success: true,
      data: {
        items: response.data.items || [],
        count: response.data.count || 0,
      },
    };
  } else {
    console.error('Error fetching products:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch products',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get filtered products with search and pagination
 */
export async function getFilteredProducts(
  status?: string,
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  sort?: string
) {
  // Build where clause
  const where: Record<string, any> = {};
  
  // Status filtering
  if (status && status !== 'all') {
    where.status = { equals: status };
  }
  
  // Search filtering (search across title, description, handle, SKU)
  if (search?.trim()) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { handle: { contains: search, mode: 'insensitive' } },
      { 
        variants: { 
          some: { 
            sku: { contains: search, mode: 'insensitive' } 
          } 
        } 
      },
    ];
  }

  // Build orderBy clause
  let orderBy: Array<Record<string, string>> = [{ createdAt: 'desc' }];
  if (sort) {
    if (sort.startsWith('-')) {
      const field = sort.substring(1);
      orderBy = [{ [field]: 'desc' }];
    } else {
      orderBy = [{ [sort]: 'asc' }];
    }
  }

  // Calculate pagination
  const skip = (page - 1) * pageSize;

  try {
    const result = await getProducts(where, pageSize, skip, orderBy);
    return result;
  } catch (error: any) {
    console.error('Error in getFilteredProducts:', error);
    return {
      success: false,
      error: error.message || 'Failed to get filtered products',
      data: { items: [], count: 0 },
    };
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(id: string) {
  const query = `
    query GetProduct($id: ID!) {
      product(where: { id: $id }) {
        id
        title
        handle
        status
        description {
          document
        }
        thumbnail
        createdAt
        updatedAt
        productVariants {
          id
          title
          sku
          barcode
          ean
          upc
          inventoryQuantity
          allowBackorder
          manageInventory
          hsCode
          originCountry
          midCode
          material
          metadata
          primaryImage {
            id
            image {
              url
            }
            imagePath
            altText
          }
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
            currency {
              code
              symbol
              symbolNative
            }
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
        productImages {
          id
          image {
            url
          }
          imagePath
          altText
        }
        productCategories {
          id
          title
        }
        productCollections {
          id
          title
        }
        productOptions {
          id
          title
          productOptionValues {
            id
            value
            metadata
          }
        }
      }
    }
  `;

  const response = await keystoneClient(query, { id });

  if (response.success) {
    if (!response.data.product) {
      return {
        success: false,
        error: 'Product not found',
        data: null,
      };
    }

    return {
      success: true,
      data: response.data.product,
    };
  } else {
    console.error('Error fetching product:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch product',
      data: null,
    };
  }
}

/**
 * Get product status counts for StatusTabs
 */
export async function getProductStatusCounts() {
  const query = `
    query GetProductStatusCounts {
      draft: productsCount(where: { status: { equals: draft } })
      proposed: productsCount(where: { status: { equals: proposed } })
      published: productsCount(where: { status: { equals: published } })
      rejected: productsCount(where: { status: { equals: rejected } })
      all: productsCount
    }
  `;

  const response = await keystoneClient(query);

  if (response.success) {
    return {
      success: true,
      data: {
        draft: response.data.draft || 0,
        proposed: response.data.proposed || 0,
        published: response.data.published || 0,
        rejected: response.data.rejected || 0,
        all: response.data.all || 0,
      },
    };
  } else {
    console.error('Error fetching product status counts:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch product status counts',
      data: {
        draft: 0,
        proposed: 0,
        published: 0,
        rejected: 0,
        all: 0,
      },
    };
  }
}

/**
 * Update product status
 */
export async function updateProductStatus(id: string, status: string) {
  const mutation = `
    mutation UpdateProductStatus($id: ID!, $data: ProductUpdateInput!) {
      updateProduct(where: { id: $id }, data: $data) {
        id
        status
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id,
    data: { status },
  });

  if (response.success) {
    // Revalidate the product page to reflect the status change
    revalidatePath(`/dashboard/platform/products/${id}`);
    revalidatePath('/dashboard/platform/products');

    return {
      success: true,
      data: response.data.updateProduct,
    };
  } else {
    console.error('Error updating product status:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update product status',
      data: null,
    };
  }
}

/**
 * Create a new product
 */
export async function createProduct(data: {
  title: string;
  description?: string;
  handle?: string;
  status?: string;
}) {
  const mutation = `
    mutation CreateProduct($data: ProductCreateInput!) {
      createProduct(data: $data) {
        id
        title
        status
        handle
        createdAt
      }
    }
  `;

  const response = await keystoneClient(mutation, { data });

  if (response.success) {
    // Revalidate the products list to show the new product
    revalidatePath('/dashboard/platform/products');

    return {
      success: true,
      data: response.data.createProduct,
    };
  } else {
    console.error('Error creating product:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to create product',
      data: null,
    };
  }
}

/**
 * Update a product
 */
export async function updateProduct(id: string, data: Record<string, unknown>) {
  const mutation = `
    mutation UpdateProduct($id: ID!, $data: ProductUpdateInput!) {
      updateProduct(where: { id: $id }, data: $data) {
        id
        title
        status
        description
        handle
        updatedAt
      }
    }
  `;

  const response = await keystoneClient(mutation, { id, data });

  if (response.success) {
    // Revalidate both the specific product page and the products list
    revalidatePath(`/dashboard/platform/products/${id}`);
    revalidatePath('/dashboard/platform/products');

    return {
      success: true,
      data: response.data.updateProduct,
    };
  } else {
    console.error('Error updating product:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update product',
      data: null,
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string) {
  const mutation = `
    mutation DeleteProduct($id: ID!) {
      deleteProduct(where: { id: $id }) {
        id
        title
      }
    }
  `;

  const response = await keystoneClient(mutation, { id });

  if (response.success) {
    // Revalidate the products list to remove the deleted product
    revalidatePath('/dashboard/platform/products');

    return {
      success: true,
      data: response.data.deleteProduct,
    };
  } else {
    console.error('Error deleting product:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to delete product',
      data: null,
    };
  }
}

/**
 * Get regions for pricing and currency
 */
export async function getRegions() {
  const query = `
    query GetRegions {
      regions {
        id
        code
        name
        taxRate
        currency {
          code
          symbol
          symbolNative
          name
        }
      }
    }
  `;

  const response = await keystoneClient(query);
  
  if (response.success) {
    return {
      success: true,
      data: {
        regions: response.data.regions || [],
      },
    };
  } else {
    console.error('Error fetching regions:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch regions',
      data: { regions: [] },
    };
  }
}