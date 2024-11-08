"use server";
import { gql } from "graphql-request";
import { openfrontClient } from "@storefront/lib/config";
import { cache } from "react";

import sortProducts from "@storefront/lib/util/sort-products";

import openfrontError from "@storefront/lib/util/openfront-error";
import { cookies } from "next/headers";

const emptyResponse = {
  response: { products: [], count: 0 },
  nextPage: null,
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
          productVariant {
            id
            title
            product {
              thumbnail
              title
            }
            prices {
              amount
              currency {
                code
              }
              calculatedPrice {
                calculatedAmount
                originalAmount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  return openfrontClient.request(CREATE_CART_MUTATION, { data });
}

export async function updateCart(cartId, data) {
  const UPDATE_CART_MUTATION = gql`
    mutation UpdateActiveCart($cartId: ID!, $data: CartUpdateInput!) {
      updateActiveCart(cartId: $cartId, data: $data) {
        id
        email
        type
        user { id }
        region { 
          id 
          currency { code }
        }
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            product {
              id
              title
              thumbnail
              handle
            }
            prices {
              id
              amount
              currency {
                code
              }
              calculatedPrice {
                calculatedAmount
                originalAmount
                currencyCode
              }
            }
          }
        }
        addresses {
          id
          firstName
          lastName
          address1
          address2
          company
          city
          province
          postalCode
          countryCode
          phone
        }
        paymentSessions {
          id
          status
          data
          idempotencyKey
          paymentProvider {
            id
            code
            isInstalled
          }
        }
        shippingMethods {
          id
          price
          shippingOption {
            id
            name
          }
        }
      }
    }
  `;

  return openfrontClient.request(UPDATE_CART_MUTATION, { cartId, data });
}

export const getCart = cache(async function (cartId) {
  const GET_CART_QUERY = gql`
    query GetCart($id: ID!) {
      cart(where: { id: $id }) {
        id
        email
        type
        user {
          id
        }
        region {
          id
          currency {
            code
          }
        }
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            product {
              id
              title
              thumbnail
              handle
            }
            prices {
              id
              amount
              currency {
                code
              }
              calculatedPrice {
                calculatedAmount
                originalAmount
                currencyCode
              }
            }
          }
        }
        addresses {
          id
          firstName
          lastName
          address1
          address2
          company
          city
          province
          postalCode
          countryCode
          phone
        }
        paymentSessions {
          id
          status
          data
          idempotencyKey
          paymentProvider {
            id
            code
            isInstalled
          }
        }
        shippingMethods {
          id
          price
          shippingOption {
            id
            name
          }
        }
      }
    }
  `;

  return openfrontClient.request(GET_CART_QUERY, { id: cartId });
});

export async function addItem({ cartId, variantId, quantity }) {
  const ADD_ITEM_MUTATION = gql`
    mutation AddItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: {
          lineItems: {
            create: [
              {
                productVariant: { connect: { id: $variantId } }
                quantity: $quantity
              }
            ]
          }
        }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  return openfrontClient.request(ADD_ITEM_MUTATION, {
    cartId,
    data: {
      lineItems: {
        create: [
          {
            productVariant: { connect: { id: variantId } },
            quantity,
          },
        ],
      },
    },
  });
}

export async function updateItem({ cartId, lineId, quantity }) {
  const UPDATE_ITEM_MUTATION = gql`
    mutation UpdateItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: {
          lineItems: {
            update: [{ where: { id: $lineId }, data: { quantity: $quantity } }]
          }
        }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  return openfrontClient.request(UPDATE_ITEM_MUTATION, {
    cartId,
    data: {
      lineItems: {
        update: [{ where: { id: lineId }, data: { quantity } }],
      },
    },
  });
}

export async function removeItem({ cartId, lineId }) {
  const REMOVE_ITEM_MUTATION = gql`
    mutation RemoveItem($cartId: ID!, $data: CartUpdateInput!) {
      updateCart(
        where: { id: $cartId }
        data: { lineItems: { delete: [{ id: $lineId }] } }
      ) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  return openfrontClient.request(REMOVE_ITEM_MUTATION, {
    cartId,
    data: { lineItems: { delete: [{ id: lineId }] } },
  });
}

export async function updateCartItems(cartId, lineItems) {
  const UPDATE_CART_ITEMS_MUTATION = gql`
    mutation UpdateCartItems($id: ID!, $data: CartUpdateInput!) {
      updateCart(where: { id: $id }, data: { lineItems: $data }) {
        id
        lineItems {
          id
          quantity
          productVariant {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
      }
    }
  `;

  return openfrontClient.request(UPDATE_CART_ITEMS_MUTATION, {
    id: cartId,
    data: { lineItems },
  });
}

export async function deleteDiscount(cartId, code) {
  const DELETE_DISCOUNT_MUTATION = gql`
    mutation DeleteDiscount($cartId: ID!, $code: String!) {
      removeCartDiscount(where: { id: $cartId, code: $code }) {
        id
        discounts {
          id
          code
        }
      }
    }
  `;

  return openfrontClient.request(DELETE_DISCOUNT_MUTATION, { cartId, code });
}

export async function createPaymentSessions(cartId) {
  const CREATE_PAYMENT_SESSIONS_MUTATION = gql`
    mutation CreatePaymentSessions($cartId: ID!) {
      createCartPaymentSessions(where: { id: $cartId }) {
        id
        paymentSessions {
          id
          status
        }
      }
    }
  `;

  return openfrontClient.request(CREATE_PAYMENT_SESSIONS_MUTATION, { cartId });
}

export async function setPaymentSession({ cartId, providerId }) {
  const SET_PAYMENT_SESSION_MUTATION = gql`
    mutation SetPaymentSession($cartId: ID!, $providerId: ID!) {
      setCartPaymentSession(where: { id: $cartId }, providerId: $providerId) {
        id
        paymentSessions {
          id
          status
        }
      }
    }
  `;

  return openfrontClient.request(SET_PAYMENT_SESSION_MUTATION, {
    cartId,
    providerId,
  });
}

export async function completeCart(cartId) {
  const COMPLETE_CART_MUTATION = gql`
    mutation CompleteCart($cartId: ID!) {
      completeCart(where: { id: $cartId }) {
        id
        status
      }
    }
  `;

  return openfrontClient.request(COMPLETE_CART_MUTATION, { cartId });
}

// Order actions
export const retrieveOrder = cache(async function (id) {
  const RETRIEVE_ORDER_QUERY = gql`
    query RetrieveOrder($id: ID!) {
      order(where: { id: $id }) {
        id
        status
        total
        items {
          id
          title
          quantity
        }
      }
    }
  `;

  return openfrontClient.request(RETRIEVE_ORDER_QUERY, { id });
});

// Shipping actions
export const listShippingMethods = cache(async function (regionId, productIds) {
  const LIST_SHIPPING_METHODS_QUERY = gql`
    query ListShippingMethods($regionId: ID!, $productIds: [ID!]) {
      shippingOptions(
        where: {
          region: { id: { equals: $regionId } }
          products: { some: { id: { in: $productIds } } }
        }
      ) {
        id
        name
        price
      }
    }
  `;

  return openfrontClient.request(LIST_SHIPPING_METHODS_QUERY, {
    regionId,
    productIds,
  });
});

export async function addShippingMethod({ cartId, shippingMethodId }) {
  const ADD_SHIPPING_METHOD_MUTATION = gql`
    mutation AddShippingMethod($cartId: ID!, $shippingMethodId: ID!) {
      addCartShippingMethod(
        where: { id: $cartId }
        shippingMethodId: $shippingMethodId
      ) {
        id
        shippingMethods {
          id
          name
        }
      }
    }
  `;

  return openfrontClient.request(ADD_SHIPPING_METHOD_MUTATION, {
    cartId,
    shippingMethodId,
  });
}

// Authentication actions
export async function getToken(credentials) {
  const GET_TOKEN_MUTATION = gql`
    mutation GetToken($email: String!, $password: String!) {
      authenticateUserWithPassword(email: $email, password: $password) {
        ... on UserAuthenticationWithPasswordSuccess {
          sessionToken
          item {
            id
            email
          }
        }
        ... on UserAuthenticationWithPasswordFailure {
          message
        }
      }
    }
  `;

  const result = await openfrontClient.request(GET_TOKEN_MUTATION, credentials);
  if (
    result.authenticateUserWithPassword.__typename ===
    "UserAuthenticationWithPasswordFailure"
  ) {
    throw new Error(result.authenticateUserWithPassword.message);
  }
  const token = result.authenticateUserWithPassword.sessionToken;
  token && cookies().set("_openfront_jwt", token);
  return token;
}

export async function authenticate(credentials) {
  // This might be the same as getToken, depending on your authentication flow
  return getToken(credentials);
}

export const getSession = cache(async function () {
  const GET_SESSION_QUERY = gql`
    query GetSession {
      authenticatedItem {
        ... on User {
          id
          email
        }
      }
    }
  `;

  return openfrontClient.request(GET_SESSION_QUERY);
});

// Customer actions
export const getUser = () => {
  const GET_USER_QUERY = gql`
    query GetUser {
      authenticatedItem {
        ... on User {
          id
          email
        }
      }
    }
  `;

  return openfrontClient.request(GET_USER_QUERY);
};

export const getUserAddresses = () => {
  const GET_USER_ADDRESSES_QUERY = gql`
    query GetUserAddresses {
      authenticatedItem {
        ... on User {
          id
          addresses {
            id
            address1
            city
            country {
              name
            }
          }
        }
      }
    }
  `;

  return openfrontClient.request(GET_USER_ADDRESSES_QUERY);
};

export const createUser = (userData) => {
  const CREATE_USER_MUTATION = gql`
    mutation CreateUser($data: UserCreateInput!) {
      createUser(data: $data) {
        id
        email
        firstName
        lastName
      }
    }
  `;

  return openfrontClient.request(CREATE_USER_MUTATION, { data: userData });
};

export const updateUser = (userId, updatedData) => {
  const UPDATE_USER_MUTATION = gql`
    mutation UpdateUser($userId: ID!, $data: UserUpdateInput!) {
      updateUser(userId: $userId, data: $data) {
        id
        email
        firstName
        lastName
      }
    }
  `;

  return openfrontClient.request(UPDATE_USER_MUTATION, { userId, data: updatedData });
};

export async function addShippingAddress(data) {
  const ADD_SHIPPING_ADDRESS_MUTATION = gql`
    mutation AddShippingAddress($data: AddressCreateInput!) {
      createAddress(data: $data) {
        id
        address1
        city
        country {
          name
        }
      }
    }
  `;

  return openfrontClient.request(ADD_SHIPPING_ADDRESS_MUTATION, { data });
}

export async function deleteShippingAddress(addressId) {
  const DELETE_SHIPPING_ADDRESS_MUTATION = gql`
    mutation DeleteShippingAddress($id: ID!) {
      deleteAddress(id: $id) {
        id
      }
    }
  `;

  return openfrontClient.request(DELETE_SHIPPING_ADDRESS_MUTATION, {
    id: addressId,
  });
}

export async function updateShippingAddress(addressId, data) {
  const UPDATE_SHIPPING_ADDRESS_MUTATION = gql`
    mutation UpdateShippingAddress($id: ID!, $data: AddressUpdateInput!) {
      updateAddress(id: $id, data: $data) {
        id
        address1
        city
        country {
          name
        }
      }
    }
  `;

  return openfrontClient.request(UPDATE_SHIPPING_ADDRESS_MUTATION, {
    id: addressId,
    data,
  });
}

export const listCustomerOrders = cache(async function (
  limit = 10,
  offset = 0
) {
  const LIST_CUSTOMER_ORDERS_QUERY = gql`
    query ListCustomerOrders($limit: Int!, $offset: Int!) {
      orders(
        where: { user: { id: { equals: "currentCustomerId" } } }
        take: $limit
        skip: $offset
        orderBy: { createdAt: desc }
      ) {
        id
        total
        status
        createdAt
      }
    }
  `;

  return openfrontClient.request(LIST_CUSTOMER_ORDERS_QUERY, { limit, offset });
});

// Region actions
export const listRegions = cache(async function () {
  const LIST_REGIONS_QUERY = gql`
    query ListRegions {
      regions {
        id
        name
        currency {
          code
        }
        countries {
          id
          name
          iso2
        }
      }
    }
  `;

  return openfrontClient.request(LIST_REGIONS_QUERY);
});

export const retrieveRegion = cache(async function (id) {
  const RETRIEVE_REGION_QUERY = gql`
    query RetrieveRegion($id: ID!) {
      region(where: { id: $id }) {
        id
        name
        currency {
          code
        }
        countries {
          id
          name
          iso2
        }
      }
    }
  `;

  return openfrontClient.request(RETRIEVE_REGION_QUERY, { id });
});

export const getRegion = cache(async function (countryCode) {
  const GET_REGION_QUERY = gql`
    query GetRegion($code: String!) {
      regions(where: { countries: { some: { iso2: { equals: $code } } } }) {
        id
        name
        currency {
          code
        }
        countries {
          id
          name
          iso2
        }
      }
    }
  `;

  const data = await openfrontClient.request(GET_REGION_QUERY, {
    code: countryCode
  });
  return data.regions[0];
});

// Product actions
export const getProductsById = cache(async function ({ ids, regionId }) {
  const GET_PRODUCTS_BY_ID_QUERY = gql`
    query GetProductsById($ids: [ID!]!, $regionId: ID!) {
      products(
        where: { id: { in: $ids }, region: { id: { equals: $regionId } } }
      ) {
        id
        title
        handle
        thumbnail
        productVariants {
          id
          title
          prices {
            amount
            currency {
              code
            }
          }
        }
      }
    }
  `;

  return openfrontClient.request(GET_PRODUCTS_BY_ID_QUERY, { ids, regionId });
});

export const retrievePricedProductById = cache(async function ({
  id,
  regionId,
}) {
  const RETRIEVE_PRICED_PRODUCT_BY_ID_QUERY = gql`
    query RetrievePricedProductById($id: ID!, $regionId: ID!) {
      product(where: { id: $id }) {
        id
        title
        handle
        thumbnail
        productVariants {
          id
          title
          allowBackorder
          prices(where: { region: { id: { equals: $regionId } } }) {
            id
            amount
            currency {
              code
            }
            calculatedPrice {
              calculatedAmount
              originalAmount
              currencyCode
              moneyAmountId
              variantId
              priceListId
              priceListType
            }
          }
        }
      }
    }
  `;

  return openfrontClient.request(RETRIEVE_PRICED_PRODUCT_BY_ID_QUERY, {
    id,
    regionId,
  });
});

export const retrievePricedProductByHandle = cache(async function ({
  handle,
  regionId,
}) {
  const RETRIEVE_PRICED_PRODUCT_BY_HANDLE_QUERY = gql`
    query RetrievePricedProductByHandle($handle: String!, $regionId: ID!) {
      product(where: { handle: $handle }) {
        id
        title
        description
        handle
        thumbnail
        productCollections {
          id
          title
          handle
        }
        productImages {
          id
          image {
            url
          }
        }
        productOptions {
          id
          title
          metadata
          productOptionValues {
            id
            value
          }
        }
        productVariants {
          id
          title
          sku
          inventoryQuantity
          allowBackorder
          metadata
          productOptionValues {
            id
            value
            productOption {
              id
            }
          }
          prices(where: { region: { id: { equals: $regionId } } }) {
            id
            amount
            currency {
              code
            }
            calculatedPrice {
              calculatedAmount
              originalAmount
              currencyCode
            }
          }
        }
        status
        metadata
      }
    }
  `;

  return openfrontClient.request(RETRIEVE_PRICED_PRODUCT_BY_HANDLE_QUERY, {
    handle,
    regionId,
  });
});

export const getProductByHandle = cache(async function (handle) {
  const GET_PRODUCT_BY_HANDLE_QUERY = gql`
    query GetProductByHandle($handle: String!) {
      product(where: { handle: $handle }) {
        id
        title
        handle
        thumbnail
        productVariants {
          id
          title
          prices {
            amount
            currency {
              code
            }
          }
        }
      }
    }
  `;

  const data = await openfrontClient.request(GET_PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });
  return { product: data.product };
});

export const getProductsList = cache(async function ({
  pageParam = 0,
  queryParams,
  countryCode,
}) {
  const limit = queryParams?.limit || 12;
  const offset = pageParam * limit;

  const GET_PRODUCTS_QUERY = gql`
    query GetProducts(
      $limit: Int!
      $offset: Int!
      $collectionId: ID
      $isGiftcard: Boolean
      $countryCode: String!
    ) {
      products(
        where: {
          productCollections: { some: { id: { equals: $collectionId } } }
          isGiftcard: { equals: $isGiftcard }
          productVariants: {
            some: {
              prices: {
                some: {
                  region: {
                    countries: { some: { iso2: { equals: $countryCode } } }
                  }
                }
              }
            }
          }
        }
        take: $limit
        skip: $offset
        orderBy: { createdAt: desc }
      ) {
        id
        title
        handle
        thumbnail
        productVariants {
          id
          title
          prices(
            where: {
              region: {
                countries: { some: { iso2: { equals: $countryCode } } }
              }
            }
          ) {
            id
            amount
            currency {
              code
            }
            calculatedPrice {
              calculatedAmount
              originalAmount
              currencyCode
              moneyAmountId
              variantId
              priceListId
              priceListType
            }
          }
        }
      }
      productsCount(
        where: {
          productCollections: { some: { id: { equals: $collectionId } } }
          isGiftcard: { equals: $isGiftcard }
          productVariants: {
            some: {
              prices: {
                some: {
                  region: {
                    countries: { some: { iso2: { equals: $countryCode } } }
                  }
                }
              }
            }
          }
        }
      )
    }
  `;

  try {
    const data = await openfrontClient.request(GET_PRODUCTS_QUERY, {
      limit,
      offset,
      collectionId: queryParams?.collectionId,
      isGiftcard: queryParams?.isGiftcard,
      countryCode: countryCode
    });

    const products = data.products;
    const count = data.productsCount;

    const nextPage = count > pageParam + 1 ? pageParam + 1 : null;

    return {
      response: { products, count },
      nextPage,
      queryParams,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return emptyResponse;
  }
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
  const RETRIEVE_COLLECTION_QUERY = gql`
    query RetrieveCollection($id: ID!) {
      collection(where: { id: $id }) {
        id
        title
        handle
      }
    }
  `;

  return openfrontClient.request(RETRIEVE_COLLECTION_QUERY, { id });
});

export const getCollectionsList = cache(async function (offset = 0, limit = 3) {
  const GET_COLLECTIONS_LIST_QUERY = gql`
    query GetCollectionsList($offset: Int!, $limit: Int!) {
      productCollections(skip: $offset, take: $limit) {
        id
        title
        handle
        products(take: 3) {
          id
          title
          handle
          thumbnail
          productVariants {
            id
            title
            prices {
              amount
              currency {
                code
              }
              calculatedPrice {
                calculatedAmount
                originalAmount
                currencyCode
              }
            }
          }
        }
      }
      productCollectionsCount
    }
  `;

  const data = await openfrontClient.request(GET_COLLECTIONS_LIST_QUERY, {
    offset,
    limit,
  });

  return {
    collections: data.productCollections,
    count: data.productCollectionsCount,
  };
});

export const getCollectionsListByRegion = cache(async function (
  offset = 0,
  limit = 3,
  regionId
) {
  const GET_COLLECTIONS_LIST_QUERY = gql`
    query GetCollectionsList($offset: Int!, $limit: Int!, $regionId: ID!) {
      productCollections(skip: $offset, take: $limit) {
        id
        title
        handle
        products(
          take: 3
          where: {
            productVariants: {
              some: {
                prices: { some: { region: { id: { equals: $regionId } } } }
              }
            }
          }
        ) {
          id
          title
          handle
          thumbnail
          productVariants {
            id
            title
            prices {
              calculatedPrice {
                calculatedAmount
                originalAmount
                currencyCode
                moneyAmountId
                variantId
                priceListId
                priceListType
              }
              amount
              currency {
                code
              }
            }
          }
        }
      }
      productCollectionsCount
    }
  `;

  const data = await openfrontClient.request(GET_COLLECTIONS_LIST_QUERY, {
    offset,
    limit,
    regionId,
  });

  return {
    collections: data.productCollections,
    count: data.productCollectionsCount,
  };
});

export const getCollectionByHandle = cache(async function (handle) {
  const GET_COLLECTION_BY_HANDLE_QUERY = gql`
    query GetCollectionByHandle($handle: String!) {
      collection(where: { handle: $handle }) {
        id
        title
        handle
      }
    }
  `;

  return openfrontClient.request(GET_COLLECTION_BY_HANDLE_QUERY, { handle });
});

export const getProductsByCollectionHandle = cache(
  async function getProductsByCollectionHandle({
    pageParam = 0,
    limit = 100,
    handle,
    countryCode,
  }) {
    const { id } = await getCollectionByHandle(handle);
    const region = await getRegion(countryCode);

    if (!id || !region) {
      return emptyResponse;
    }

    const GET_PRODUCTS_BY_COLLECTION_QUERY = gql`
      query GetProductsByCollection(
        $collectionId: ID!
        $regionId: ID!
        $skip: Int!
        $take: Int!
      ) {
        products(
          where: {
            productCollection: { id: { equals: $collectionId } }
            region: { id: { equals: $regionId } }
          }
          skip: $skip
          take: $take
        ) {
          id
          title
          handle
          thumbnail
          productVariants {
            id
            title
            prices {
              amount
              currency {
                code
              }
            }
          }
        }
        productsCount(
          where: {
            productCollection: { id: { equals: $collectionId } }
            region: { id: { equals: $regionId } }
          }
        )
      }
    `;

    const data = await openfrontClient.request(
      GET_PRODUCTS_BY_COLLECTION_QUERY,
      {
        collectionId: id,
        regionId: region.id,
        skip: pageParam,
        take: limit,
      }
    );

    const products = data.products;
    const count = data.productsCount;

    const nextPage = count > pageParam + limit ? pageParam + limit : null;

    return {
      response: { products, count },
      nextPage,
    };
  }
);

// Category actions
export const listCategories = cache(async function () {
  const LIST_CATEGORIES_QUERY = gql`
    query ListCategories {
      productCategories {
        id
        title
        handle
        isInternal
        isActive
      }
    }
  `;

  return openfrontClient.request(LIST_CATEGORIES_QUERY);
});

export const getCategoriesList = cache(async function (
  offset = 0,
  limit = 100
) {
  const GET_CATEGORIES_LIST_QUERY = gql`
    query GetCategoriesList($offset: Int!, $limit: Int!) {
      productCategories(skip: $offset, take: $limit) {
        id
        title
        handle
        isInternal
        isActive
        parentCategory {
          id
          title
          handle
        }
        categoryChildren {
          id
          title
          handle
        }
      }
      productCategoriesCount
    }
  `;

  const data = await openfrontClient.request(GET_CATEGORIES_LIST_QUERY, {
    offset,
    limit,
  });

  return {
    productCategories: data.productCategories,
    count: data.productCategoriesCount,
  };
});

export const getCategoryByHandle = cache(async function (categoryHandle) {
  const GET_CATEGORY_BY_HANDLE_QUERY = gql`
    query GetCategoryByHandle($handle: String!) {
      productCategory(where: { handle: $handle }) {
        id
        title
        handle
        isInternal
        isActive
        parentCategory {
          id
          title
          handle
        }
        categoryChildren {
          id
          title
          handle
        }
      }
    }
  `;

  const data = await openfrontClient.request(GET_CATEGORY_BY_HANDLE_QUERY, {
    handle: categoryHandle,
  });
  return {
    product_categories: [data.productCategory],
  };
});

export const getProductsByCategoryHandle = cache(async function ({
  pageParam = 0,
  handle,
  countryCode,
}) {
  const { product_categories } = await getCategoryByHandle(handle);
  const category = product_categories[0];
  const region = await getRegion(countryCode);

  if (!category || !region) {
    return emptyResponse;
  }

  const GET_PRODUCTS_BY_CATEGORY_QUERY = gql`
    query GetProductsByCategory(
      $categoryId: ID!
      $regionId: ID!
      $skip: Int!
      $take: Int!
    ) {
      products(
        where: {
          productCategories: { some: { id: { equals: $categoryId } } }
          region: { id: { equals: $regionId } }
        }
        skip: $skip
        take: $take
      ) {
        id
        title
        handle
        thumbnail
        productVariants {
          id
          title
          prices {
            amount
            currency {
              code
            }
          }
        }
      }
      productsCount(
        where: {
          productCategories: { some: { id: { equals: $categoryId } } }
          region: { id: { equals: $regionId } }
        }
      )
    }
  `;

  const data = await openfrontClient.request(GET_PRODUCTS_BY_CATEGORY_QUERY, {
    categoryId: category.id,
    regionId: region.id,
    skip: pageParam,
    take: 12,
  });

  const products = data.products;
  const count = data.productsCount;

  const nextPage = count > pageParam + 12 ? pageParam + 12 : null;

  return {
    response: { products, count },
    nextPage,
  };
});
