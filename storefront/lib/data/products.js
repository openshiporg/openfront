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
  sortBy = { createdAt: 'desc' }
}) {
  const limit = queryParams?.limit || 12;
  const offset = pageParam * limit;

  const whereClause = {
    productCollections: queryParams?.collectionId ? {
      some: { id: { equals: queryParams.collectionId } }
    } : undefined,
    isGiftcard: { equals: queryParams?.isGiftcard },
    productVariants: {
      some: {
        prices: {
          some: {
            region: {
              countries: { some: { iso2: { equals: countryCode } } }
            }
          }
        }
      }
    }
  }

  // Add ID filtering if productsIds are provided
  if (queryParams?.id?.length > 0) {
    whereClause.id = { in: queryParams.id }
  }

  const GET_PRODUCTS_QUERY = gql`
    query GetProducts(
      $limit: Int!
      $offset: Int!
      $where: ProductWhereInput!
      $orderBy: [ProductOrderByInput!]!
      $countryCode: String!
    ) {
      products(
        where: $where
        take: $limit
        skip: $offset
        orderBy: $orderBy
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
      productsCount(where: $where)
    }
  `;

  const data = await openfrontClient.request(GET_PRODUCTS_QUERY, {
    limit,
    offset,
    where: whereClause,
    orderBy: [sortBy],
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
        description {
          document
        }
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
        description {
          document
        }
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
          measurements {
            id
            value
            unit
            type
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
  sortBy = { createdAt: "desc" },
  countryCode,
}) {
  const limit = queryParams?.limit || 12;
  const pageParam = Math.max(0, page - 1); // Ensure we don't get negative pages

  const {
    response: { products, count },
  } = await getProductsList({
    pageParam,
    queryParams: {
      ...queryParams,
      limit,
      id: queryParams?.productsIds // Map productsIds to id for the where clause
    },
    sortBy,
    countryCode,
  });

  return {
    response: {
      products,
      count,
    },
    nextPage: count > (pageParam * limit) + limit ? page + 1 : null,
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

export const getProductsForSearch = cache(async function() {
  const GET_PRODUCTS_FOR_SEARCH = gql`
    query GetProductsForSearch {
      products {
        id
        title
        handle
        description {
          document
        }
        thumbnail
        productTags {
          value
        }
        productVariants {
          id
          title
          sku
        }
      }
    }
  `

  const data = await openfrontClient.request(GET_PRODUCTS_FOR_SEARCH)
  return data.products
})

