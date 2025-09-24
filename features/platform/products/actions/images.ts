'use server';

import { revalidatePath } from 'next/cache';
import { keystoneClient } from "../../../dashboard/lib/keystoneClient";

/**
 * Create product image
 */
export async function createProductImage(data: {
  image: File;
  altText?: string;
  imagePath?: string;
  productId: string;
}) {
  const mutation = `
    mutation CreateProductImage($data: ProductImageCreateInput!) {
      createProductImage(data: $data) {
        id
        image {
          id
          url
          extension
          filesize
          width
          height
        }
        imagePath
        altText
        products {
          id
        }
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    data: {
      image: { upload: data.image },
      altText: data.altText || '',
      imagePath: data.imagePath || '',
      products: { connect: [{ id: data.productId }] }
    }
  });

  if (response.success) {
    // Revalidate the product page to show the new image
    revalidatePath(`/dashboard/platform/products/${data.productId}`);

    return {
      success: true,
      data: response.data.createProductImage,
    };
  } else {
    console.error('Error creating product image:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to create product image',
      data: null,
    };
  }
}

/**
 * Update product image
 */
export async function updateProductImage(id: string, data: {
  altText?: string;
  imagePath?: string;
}) {
  const mutation = `
    mutation UpdateProductImage($id: ID!, $data: ProductImageUpdateInput!) {
      updateProductImage(where: { id: $id }, data: $data) {
        id
        image {
          id
          url
          extension
          filesize
          width
          height
        }
        imagePath
        altText
      }
    }
  `;

  const response = await keystoneClient(mutation, { id, data });

  if (response.success) {
    return {
      success: true,
      data: response.data.updateProductImage,
    };
  } else {
    console.error('Error updating product image:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update product image',
      data: null,
    };
  }
}

/**
 * Delete product image
 */
export async function deleteProductImage(id: string, productId: string) {
  const mutation = `
    mutation DeleteProductImage($id: ID!) {
      deleteProductImage(where: { id: $id }) {
        id
      }
    }
  `;

  const response = await keystoneClient(mutation, { id });

  if (response.success) {
    // Revalidate the product page to remove the deleted image
    revalidatePath(`/dashboard/platform/products/${productId}`);

    return {
      success: true,
      data: response.data.deleteProductImage,
    };
  } else {
    console.error('Error deleting product image:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to delete product image',
      data: null,
    };
  }
}

/**
 * Update product images order
 */
export async function updateProductImagesOrder(productId: string, imageIds: string[]) {
  const mutation = `
    mutation UpdateProductImagesOrder($id: ID!, $data: ProductUpdateInput!) {
      updateProduct(where: { id: $id }, data: $data) {
        id
        productImages {
          id
          image {
            id
            url
            extension
            filesize
            width
            height
          }
          imagePath
          altText
        }
      }
    }
  `;

  const response = await keystoneClient(mutation, {
    id: productId,
    data: {
      productImages: {
        set: imageIds.map(id => ({ id }))
      }
    }
  });

  if (response.success) {
    // Revalidate the product page to show the new order
    revalidatePath(`/dashboard/platform/products/${productId}`);

    return {
      success: true,
      data: response.data.updateProduct,
    };
  } else {
    console.error('Error updating product images order:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to update product images order',
      data: null,
    };
  }
}

/**
 * Get product images
 */
export async function getProductImages(productId: string) {
  const query = `
    query GetProductImages($productId: ID!) {
      product(where: { id: $productId }) {
        id
        productImages {
          id
          image {
            id
            url
            extension
            filesize
            width
            height
          }
          imagePath
          altText
        }
      }
    }
  `;

  const response = await keystoneClient(query, { productId });

  if (response.success) {
    return {
      success: true,
      data: response.data.product?.productImages || [],
    };
  } else {
    console.error('Error fetching product images:', response.error);
    return {
      success: false,
      error: response.error || 'Failed to fetch product images',
      data: [],
    };
  }
}