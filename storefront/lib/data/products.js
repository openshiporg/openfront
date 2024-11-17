"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { cache } from "react"
import sortProducts from "../util/sort-products"

const emptyResponse = {
  response: { products: [], count: 0 },
  nextPage: null,
};

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
            }
          }
        }
      }
      productsCount
    }
  `;

  const data = await openfrontClient.request(GET_PRODUCTS_QUERY, {
    limit,
    offset,
    collectionId: queryParams?.collectionId,
    isGiftcard: queryParams?.isGiftcard,
    countryCode
  });

  return {
    response: { 
      products: data.products,
      count: data.productsCount 
    },
    nextPage: data.productsCount > offset + limit ? pageParam + 1 : null,
    queryParams,
  };
});

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

export const getProductByHandle = cache(async function ({ handle, regionId }) {
  const GET_PRODUCT_BY_HANDLE_QUERY = gql`
    query GetProductByHandle($handle: String!, $regionId: ID!) {
      product(where: { handle: $handle }) {
        id
        title
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
      }
    }
  `;

  const data = await openfrontClient.request(GET_PRODUCT_BY_HANDLE_QUERY, 
    {
      handle,
      regionId,
    },
    {
      next: { tags: ["products"] }
    }
  );
  return { product: data.product };
});

export const getProductsListWithSort = cache(async function ({
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
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit);

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  };
});

export const getHomepageProducts = cache(async function ({
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

