"use server";
import { cache } from "react";

import sortProducts from "@storefront/lib/util/sort-products";
import transformProductPreview from "@storefront/lib/util/transform-product-preview";

import { openfrontClient } from "@storefront/lib/config";
import openfrontError from "@storefront/lib/util/openfront-error";
import { cookies } from "next/headers";
import { gql } from "urql";

const emptyResponse = {
  response: { products: [], count: 0 },
  nextPage: null,
};

/**
 * Function for getting custom headers for Openfront API requests, including the JWT token and cache revalidation tags.
 *
 * @param tags
 * @returns custom headers for Openfront API requests
 */
const getOpenfrontHeaders = (tags = []) => {
  const headers = {
    next: {
      tags,
    },
  };

  const token = cookies().get("_openfront_jwt")?.value;

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return headers;
};

// Cart actions
export async function createCart(data = {}) {
  const CREATE_CART_MUTATION = gql`
    mutation CreateCart($data: CartCreateInput!) {
      createCart(data: $data) {
        id
        email
        type
        lineItems {
          id
          quantity
          product {
            name
            price
          }
        }
      }
    }
  `;

  return openfrontClient
    .mutation(CREATE_CART_MUTATION, { data })
    .toPromise()
    .then((response) => {
      if (response.error) {
        console.error("GraphQL Error:", response.error.message);
        return null;
      }
      return response.data.createCart;
    })
    .catch((error) => {
      console.error("Error creating cart:", error);
      return null; // Returning null in case of an error, adjust based on your error handling policies
    });
}

export async function updateCart(cartId, data) {
  const UPDATE_CART_MUTATION = `
    mutation UpdateCart($id: ID!, $data: CartUpdateInput!) {
      updateCart(id: $id, data: $data) {
        id
        email
        type
        lineItems {
          id
          quantity
          product {
            name
            price
          }
        }
      }
    }
  `;

  const variables = {
    id: cartId,
    data: data,
  };

  return openfrontClient
    .mutation(UPDATE_CART_MUTATION, variables)
    .toPromise()
    .then((response) => {
      if (response.error) {
        throw new Error("GraphQL Error: " + response.error.message);
      }
      return response.data.updateCart;
    })
    .catch((error) => {
      console.error("Error updating cart:", error);
      // Optionally handle specific errors or perform side effects
      openfrontError(error); // Assuming `openfrontError` is a function to handle errors
      return null;
    });
}

export const getCart = cache(async function (cartId) {
  const GET_CART_QUERY = gql`
    query GetCart($id: ID!) {
      cart(where: { id: $id }) {
        id
        email
        type
        lineItems {
          id
          quantity
          product {
            name
            price
          }
        }
      }
    }
  `;

  return openfrontClient
    .query(GET_CART_QUERY, { id: cartId })
    .toPromise()
    .then((response) => {
      if (response.error) {
        console.error("GraphQL Error:", response.error.message);
        return null;
      }
      return response.data.cart;
    })
    .catch((error) => {
      console.error("Error retrieving cart:", error);
      return null; // Returning null in case of an error, adjust based on your error handling policies
    });
});

export async function addItem({ cartId, variantId, quantity }) {
  const headers = getOpenfrontHeaders(["cart"]);

  return openfrontClient.carts.lineItems
    .create(cartId, { variant_id: variantId, quantity }, headers)
    .then(({ cart }) => cart)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function updateItem({ cartId, lineId, quantity }) {
  const headers = getOpenfrontHeaders(["cart"]);

  return openfrontClient.carts.lineItems
    .update(cartId, lineId, { quantity }, headers)
    .then(({ cart }) => cart)
    .catch((err) => openfrontError(err));
}

export async function removeItem({ cartId, lineId }) {
  const headers = getOpenfrontHeaders(["cart"]);

  return openfrontClient.carts.lineItems
    .delete(cartId, lineId, headers)
    .then(({ cart }) => cart)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function deleteDiscount(cartId, code) {
  const headers = getOpenfrontHeaders(["cart"]);

  return openfrontClient.carts
    .deleteDiscount(cartId, code, headers)
    .then(({ cart }) => cart)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function createPaymentSessions(cartId) {
  const headers = getOpenfrontHeaders(["cart"]);

  return openfrontClient.carts
    .createPaymentSessions(cartId, headers)
    .then(({ cart }) => cart)
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function setPaymentSession({ cartId, providerId }) {
  const headers = getOpenfrontHeaders(["cart"]);

  return openfrontClient.carts
    .setPaymentSession(cartId, { provider_id: providerId }, headers)
    .then(({ cart }) => cart)
    .catch((err) => openfrontError(err));
}

export async function completeCart(cartId) {
  const headers = getOpenfrontHeaders(["cart"]);

  return openfrontClient.carts
    .complete(cartId, headers)
    .then((res) => res)
    .catch((err) => openfrontError(err));
}

// Order actions
export const retrieveOrder = cache(async function (id) {
  const headers = getOpenfrontHeaders(["order"]);

  return openfrontClient.orders
    .retrieve(id, headers)
    .then(({ order }) => order)
    .catch((err) => openfrontError(err));
});

// Shipping actions
export const listShippingMethods = cache(
  async function listShippingMethods(regionId, productIds) {
    const headers = getOpenfrontHeaders(["shipping"]);

    const product_ids = productIds?.join(",");

    return openfrontClient.shippingOptions
      .list(
        {
          region_id: regionId,
          product_ids,
        },
        headers
      )
      .then(({ shipping_options }) => shipping_options)
      .catch((err) => {
        console.log(err);
        return null;
      });
  }
);

export async function addShippingMethod({ cartId, shippingMethodId }) {
  const headers = getOpenfrontHeaders(["cart"]);

  return openfrontClient.carts
    .addShippingMethod(cartId, { option_id: shippingMethodId }, headers)
    .then(({ cart }) => cart)
    .catch((err) => openfrontError(err));
}

// Authentication actions
export async function getToken(credentials) {
  return openfrontClient.auth
    .getToken(credentials, {
      next: {
        tags: ["auth"],
      },
    })
    .then(({ access_token }) => {
      access_token && cookies().set("_openfront_jwt", access_token);
      return access_token;
    })
    .catch((err) => {
      throw new Error("Wrong email or password.");
    });
}

export async function authenticate(credentials) {
  const headers = getOpenfrontHeaders(["auth"]);

  return openfrontClient.auth
    .authenticate(credentials, headers)
    .then(({ customer }) => customer)
    .catch((err) => openfrontError(err));
}

export const getSession = cache(async function getSession() {
  const headers = getOpenfrontHeaders(["auth"]);

  return openfrontClient.auth
    .getSession(headers)
    .then(({ customer }) => customer)
    .catch((err) => openfrontError(err));
});

// Customer actions
export async function getCustomer() {
  const headers = getOpenfrontHeaders(["customer"]);

  return openfrontClient.customers
    .retrieve(headers)
    .then(({ customer }) => customer)
    .catch((err) => null);
}

export async function createCustomer(data) {
  const headers = getOpenfrontHeaders(["customer"]);

  return openfrontClient.customers
    .create(data, headers)
    .then(({ customer }) => customer)
    .catch((err) => openfrontError(err));
}

export async function updateCustomer(data) {
  const headers = getOpenfrontHeaders(["customer"]);

  return openfrontClient.customers
    .update(data, headers)
    .then(({ customer }) => customer)
    .catch((err) => openfrontError(err));
}

export async function addShippingAddress(data) {
  const headers = getOpenfrontHeaders(["customer"]);

  return openfrontClient.customers.addresses
    .addAddress(data, headers)
    .then(({ customer }) => customer)
    .catch((err) => openfrontError(err));
}

export async function deleteShippingAddress(addressId) {
  const headers = getOpenfrontHeaders(["customer"]);

  return openfrontClient.customers.addresses
    .deleteAddress(addressId, headers)
    .then(({ customer }) => customer)
    .catch((err) => openfrontError(err));
}

export async function updateShippingAddress(addressId, data) {
  const headers = getOpenfrontHeaders(["customer"]);

  return openfrontClient.customers.addresses
    .updateAddress(addressId, data, headers)
    .then(({ customer }) => customer)
    .catch((err) => openfrontError(err));
}

export const listCustomerOrders = cache(async function (
  limit = 10,
  offset = 0
) {
  const headers = getOpenfrontHeaders(["customer"]);

  return openfrontClient.customers
    .listOrders({ limit, offset }, headers)
    .then(({ orders }) => orders)
    .catch((err) => openfrontError(err));
});

// Region actions
export const listRegions = cache(async function () {
  return openfrontClient.regions
    .list()
    .then(({ regions }) => regions)
    .catch((err) => {
      console.log(err);
      return null;
    });
});

export const retrieveRegion = cache(async function (id) {
  const headers = getOpenfrontHeaders(["regions"]);

  return openfrontClient.regions
    .retrieve(id, headers)
    .then(({ region }) => region)
    .catch((err) => openfrontError(err));
});

const regionMap = new Map();

export const getRegion = cache(async function (countryCode) {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode);
    }

    const regions = await listRegions();

    if (!regions) {
      return null;
    }

    regions.forEach((region) => {
      region.countries.forEach((c) => {
        regionMap.set(c.iso_2, region);
      });
    });

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("us");

    return region;
  } catch (e) {
    console.log(e.toString());
    return null;
  }
});

// Product actions
export const getProductsById = cache(async function ({ ids, regionId }) {
  const headers = getOpenfrontHeaders(["products"]);

  return openfrontClient.products
    .list({ id: ids, region_id: regionId }, headers)
    .then(({ products }) => products)
    .catch((err) => {
      console.log(err);
      return null;
    });
});

export const retrievePricedProductById = cache(async function ({
  id,
  regionId,
}) {
  const headers = getOpenfrontHeaders(["products"]);

  return openfrontClient.products
    .retrieve(`${id}?region_id=${regionId}`, headers)
    .then(({ product }) => product)
    .catch((err) => {
      console.log(err);
      return null;
    });
});

export const getProductByHandle = cache(async function (handle) {
  const headers = getOpenfrontHeaders(["products"]);

  const product = await openfrontClient.products
    .list({ handle }, headers)
    .then(({ products }) => products[0])
    .catch((err) => {
      throw err;
    });

  return { product };
});

export const getProductsList = cache(async function ({
  pageParam = 0,
  queryParams,
  countryCode,
}) {
  const limit = queryParams?.limit || 12;

  const region = await getRegion(countryCode);

  if (!region) {
    return emptyResponse;
  }

  const { products, count } = await openfrontClient.products
    .list(
      {
        limit,
        offset: pageParam,
        region_id: region.id,
        ...queryParams,
      },
      { next: { tags: ["products"] } }
    )
    .then((res) => res)
    .catch((err) => {
      throw err;
    });

  const transformedProducts = products.map((product) => {
    return transformProductPreview(product, region);
  });

  const nextPage = count > pageParam + 1 ? pageParam + 1 : null;

  return {
    response: { products: transformedProducts, count },
    nextPage,
    queryParams,
  };
});

export const getProductsListWithSort = cache(
  async function getProductsListWithSort({
    page = 0,
    queryParams,
    sortBy = "created_at",
    countryCode,
  }) {
    const limit = queryParams?.limit || 12;

    const {
      response: { products, count },
    } = await getProductsList({
      pageParam: 0,
      queryParams: {
        ...queryParams,
        limit: 100,
      },
      countryCode,
    });

    const sortedProducts = sortProducts(products, sortBy);

    const pageParam = (page - 1) * limit;

    const nextPage = count > pageParam + limit ? pageParam + limit : null;

    const paginatedProducts = sortedProducts.slice(
      pageParam,
      pageParam + limit
    );

    return {
      response: {
        products: paginatedProducts,
        count,
      },
      nextPage,
      queryParams,
    };
  }
);

export const getHomepageProducts = cache(async function getHomepageProducts({
  collectionHandles,
  currencyCode,
  countryCode,
}) {
  const collectionProductsMap = new Map();

  const { collections } = await getCollectionsList(0, 3);

  if (!collectionHandles) {
    collectionHandles = collections.map((collection) => collection.handle);
  }

  for (const handle of collectionHandles) {
    const products = await getProductsByCollectionHandle({
      handle,
      currencyCode,
      countryCode,
      limit: 3,
    });
    collectionProductsMap.set(handle, products.response.products);
  }

  return collectionProductsMap;
});

// Collection actions
export const retrieveCollection = cache(async function (id) {
  return openfrontClient.collections
    .retrieve(id, {
      next: {
        tags: ["collections"],
      },
    })
    .then(({ collection }) => collection)
    .catch((err) => {
      throw err;
    });
});

export const getCollectionsList = cache(async function (
  offset = 0,
  limit = 100
) {
  const collections = await openfrontClient.collections
    .list({ limit, offset }, { next: { tags: ["collections"] } })
    .then(({ collections }) => collections)
    .catch((err) => {
      throw err;
    });

  const count = collections.length;

  return {
    collections,
    count,
  };
});

export const getCollectionByHandle = cache(async function (handle) {
  const collection = await openfrontClient.collections
    .list({ handle: [handle] }, { next: { tags: ["collections"] } })
    .then(({ collections }) => collections[0])
    .catch((err) => {
      throw err;
    });

  return collection;
});

export const getProductsByCollectionHandle = cache(
  async function getProductsByCollectionHandle({
    pageParam = 0,
    limit = 100,
    handle,
    countryCode,
  }) {
    const { id } = await getCollectionByHandle(handle).then(
      (collection) => collection
    );

    const { response, nextPage } = await getProductsList({
      pageParam,
      queryParams: { collection_id: [id], limit },
      countryCode,
    })
      .then((res) => res)
      .catch((err) => {
        throw err;
      });

    return {
      response,
      nextPage,
    };
  }
);

// Category actions
export const listCategories = cache(async function () {
  const headers = {
    next: {
      tags: ["collections"],
    },
  };

  return openfrontClient.productCategories
    .list({ expand: "category_children" }, headers)
    .then(({ product_categories }) => product_categories)
    .catch((err) => {
      throw err;
    });
});

export const getCategoriesList = cache(async function (
  offset = 0,
  limit = 100
) {
  const { product_categories, count } = await openfrontClient.productCategories
    .list({ limit, offset }, { next: { tags: ["categories"] } })
    .catch((err) => {
      throw err;
    });

  return {
    product_categories,
    count,
  };
});

export const getCategoryByHandle = cache(async function (categoryHandle) {
  const handles = categoryHandle.map((handle, index) =>
    categoryHandle.slice(0, index + 1).join("/")
  );

  const product_categories = [];

  for (const handle of handles) {
    const category = await openfrontClient.productCategories
      .list(
        {
          handle: handle,
        },
        {
          next: {
            tags: ["categories"],
          },
        }
      )
      .then(({ product_categories: { [0]: category } }) => category)
      .catch((err) => {
        return {};
      });

    product_categories.push(category);
  }

  return {
    product_categories,
  };
});

export const getProductsByCategoryHandle = cache(async function ({
  pageParam = 0,
  handle,
  countryCode,
}) {
  const { id } = await getCategoryByHandle([handle]).then(
    (res) => res.product_categories[0]
  );

  const { response, nextPage } = await getProductsList({
    pageParam,
    queryParams: { category_id: [id] },
    countryCode,
  })
    .then((res) => res)
    .catch((err) => {
      throw err;
    });

  return {
    response,
    nextPage,
  };
});
