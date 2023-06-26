import { medusaClient } from "../config";

export const getProductHandles = async () => {
  const products = await medusaClient.products
    .list({ limit: 25 })
    .then(({ products }) => products);

  const handles = [];

  for (const product of products) {
    if (product.handle) {
      handles.push(product.handle);
    }
  }

  return handles;
};
