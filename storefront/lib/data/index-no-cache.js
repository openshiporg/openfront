import { gql } from 'graphql-request';
import { openfrontClient } from "@storefront/lib/config";

import sortProducts from "@storefront/lib/util/sort-products";
import transformProductPreview from "@storefront/lib/util/transform-product-preview";

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
          product {
            name
            price
          }
        }
      }
    }
  `;

  return openfrontClient.request(CREATE_CART_MUTATION, { data });
}

export async function updateCart(cartId, data) {
  const UPDATE_CART_MUTATION = gql`
    mutation UpdateCart($id: ID!, $data: CartUpdateInput!) {
      updateCart(where: { id: $id }, data: $data) {
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

  return openfrontClient.request(UPDATE_CART_MUTATION, { id: cartId, data });
}

export async function getCart(cartId) {
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

  return openfrontClient.request(GET_CART_QUERY, { id: cartId });
}

export async function addItem({ cartId, variantId, quantity }) {
  const ADD_ITEM_MUTATION = gql`
    mutation AddItem($cartId: ID!, $variantId: ID!, $quantity: Int!) {
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
          product {
            name
            price
          }
        }
      }
    }
  `;

  return openfrontClient.request(ADD_ITEM_MUTATION, { cartId, variantId, quantity });
}

export async function updateItem({ cartId, lineId, quantity }) {
  const UPDATE_ITEM_MUTATION = gql`
    mutation UpdateItem($cartId: ID!, $lineId: ID!, $quantity: Int!) {
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
          product {
            name
            price
          }
        }
      }
    }
  `;

  return openfrontClient.request(UPDATE_ITEM_MUTATION, { cartId, lineId, quantity });
}

export async function removeItem({ cartId, lineId }) {
  const REMOVE_ITEM_MUTATION = gql`
    mutation RemoveItem($cartId: ID!, $lineId: ID!) {
      updateCart(
        where: { id: $cartId }
        data: { lineItems: { delete: [{ id: $lineId }] } }
      ) {
        id
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

  return openfrontClient.request(REMOVE_ITEM_MUTATION, { cartId, lineId });
}

export async function updateCartItems(cartId, lineItems) {
  const UPDATE_CART_ITEMS_MUTATION = gql`
    mutation UpdateCartItems($id: ID!, $data: CartUpdateInput!) {
      updateCart(where: { id: $id }, data: { lineItems: $data }) {
        id
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

  return openfrontClient.request(SET_PAYMENT_SESSION_MUTATION, { cartId, providerId });
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
export async function retrieveOrder(id) {
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
}

// Shipping actions
export async function listShippingMethods(regionId, productIds) {
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

  return openfrontClient.request(LIST_SHIPPING_METHODS_QUERY, { regionId, productIds });
}

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

export async function getSession() {
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
}

// Customer actions
export async function getCustomer() {
  const GET_CUSTOMER_QUERY = gql`
    query GetCustomer {
      authenticatedItem {
        ... on Customer {
          id
          email
          firstName
          lastName
        }
      }
    }
  `;

  return openfrontClient.request(GET_CUSTOMER_QUERY);
}

export async function createCustomer(data) {
  const CREATE_CUSTOMER_MUTATION = gql`
    mutation CreateCustomer($data: CustomerCreateInput!) {
      createCustomer(data: $data) {
        id
        email
        firstName
        lastName
      }
    }
  `;

  return openfrontClient.request(CREATE_CUSTOMER_MUTATION, { data });
}

export async function updateCustomer(data) {
  const UPDATE_CUSTOMER_MUTATION = gql`
    mutation UpdateCustomer($data: CustomerUpdateInput!) {
      updateCustomer(data: $data) {
        id
        email
        firstName
        lastName
      }
    }
  `;

  return openfrontClient.request(UPDATE_CUSTOMER_MUTATION, { data });
}

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

  return openfrontClient.request(DELETE_SHIPPING_ADDRESS_MUTATION, { id: addressId });
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

export async function listCustomerOrders(limit = 10, offset = 0) {
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
}

// Region actions
export async function listRegions() {
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
}

export async function retrieveRegion(id) {
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
}

export async function getRegion(countryCode) {
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

  const data = await openfrontClient.request(GET_REGION_QUERY, { code: countryCode });
  return data.regions[0];
}

// Product actions
export async function getProductsById({ ids, regionId }) {
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
}

export async function retrievePricedProductById({ id, regionId }) {
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

  return openfrontClient.request(RETRIEVE_PRICED_PRODUCT_BY_ID_QUERY, { id, regionId });
}

export async function getProductByHandle(handle) {
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

  const data = await openfrontClient.request(GET_PRODUCT_BY_HANDLE_QUERY, { handle });
  return { product: data.product };
}

export async function getProductsList({ pageParam = 0, queryParams, countryCode }) {
  const limit = queryParams?.limit || 12;
  const region = await getRegion(countryCode);

  if (!region) {
    return emptyResponse;
  }

  const GET_PRODUCTS_QUERY = gql`
    query GetProducts($skip: Int!, $take: Int!, $regionId: ID!) {
      products(
        where: { region: { id: { equals: $regionId } } }
        skip: $skip
        take: $take
        orderBy: { createdAt: desc }
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
      productsCount(where: { region: { id: { equals: $regionId } } })
    }
  `;

  const data = await openfrontClient.request(GET_PRODUCTS_QUERY, {
    skip: pageParam,
    take: limit,
    regionId: region.id,
  });

  const products = data.products.map((product) =>
    transformProductPreview(product, region)
  );
  const count = data.productsCount;

  const nextPage = count > pageParam + limit ? pageParam + limit : null;

  return {
    response: { products, count },
    nextPage,
    queryParams,
  };
}

export async function getProductsListWithSort({
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

export async function getHomepageProducts({
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
}

// Collection actions
export async function retrieveCollection(id) {
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
}

export async function getCollectionsList(offset = 0, limit = 3) {
  const GET_COLLECTIONS_LIST_QUERY = gql`
    query GetCollectionsList(
      $offset: Int!
      $limit: Int!
    ) {
      productCollections(skip: $offset, take: $limit) {
        id
        title
        handle
        products(
          take: 3
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
                regions {
                  code
                  countries {
                    iso2
                  }
                }
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

  console.log(data);

  return {
    collections: data.productCollections,
    count: data.productCollectionsCount,
  };
}

export async function getCollectionsListByRegion(offset = 0, limit = 3, regionId) {
  const GET_COLLECTIONS_LIST_QUERY = gql`
    query GetCollectionsList(
      $offset: Int!
      $limit: Int!
      $regionId: ID!
    ) {
      productCollections(skip: $offset, take: $limit) {
        id
        title
        handle
        products(
          take: 3
          where: {
            productVariants: {
              some: {
                prices: {
                  some: {
                    region: { id: { equals: $regionId } }
                  }
                }
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
}

export async function getCollectionByHandle(handle) {
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
}

export async function getProductsByCollectionHandle({
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

  const data = await openfrontClient.request(GET_PRODUCTS_BY_COLLECTION_QUERY, {
    collectionId: id,
    regionId: region.id,
    skip: pageParam,
    take: limit,
  });

  const products = data.products.map((product) =>
    transformProductPreview(product, region)
  );
  const count = data.productsCount;

  const nextPage = count > pageParam + limit ? pageParam + limit : null;

  return {
    response: { products, count },
    nextPage,
  };
}

// Category actions
export async function listCategories() {
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
}

export async function getCategoriesList(offset = 0, limit = 100) {
  const GET_CATEGORIES_LIST_QUERY = gql`
    query GetCategoriesList($offset: Int!, $limit: Int!) {
      productCategories(skip: $offset, take: $limit) {
        id
        title
        handle
        isInternal
        isActive
      }
      productCategoriesCount
    }
  `;

  const data = await openfrontClient.request(GET_CATEGORIES_LIST_QUERY, { offset, limit });

  return {
    product_categories: data.productCategories,
    count: data.productCategoriesCount,
  };
}

export async function getCategoryByHandle(categoryHandle) {
  const GET_CATEGORY_BY_HANDLE_QUERY = gql`
    query GetCategoryByHandle($handle: String!) {
      productCategory(where: { handle: $handle }) {
        id
        title
        handle
        isInternal
        isActive
      }
    }
  `;

  const data = await openfrontClient.request(GET_CATEGORY_BY_HANDLE_QUERY, {
    handle: categoryHandle,
  });
  return {
    product_categories: [data.productCategory],
  };
}

export async function getProductsByCategoryHandle({
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

  const products = data.products.map((product) =>
    transformProductPreview(product, region)
  );
  const count = data.productsCount;

  const nextPage = count > pageParam + 12 ? pageParam + 12 : null;

  return {
    response: { products, count },
    nextPage,
  };
}

