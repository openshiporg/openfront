"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { cache } from "react"
import { ProductWhereClause } from "../../types/storefront"

interface GetProductsListParams {
  pageParam?: number;
  queryParams: Record<string, any>;
  countryCode: string;
  sortBy?: Record<string, 'asc' | 'desc'>;
}

export const getProductsList = cache(async function ({
  pageParam = 0,
  queryParams,
  countryCode,
  sortBy = { createdAt: 'desc' }
}: GetProductsListParams): Promise<any> {
  const limit = queryParams?.limit || 12;
  const offset = pageParam * limit;

  const whereClause: ProductWhereClause = {
    productCollections: queryParams?.collectionId ? {
      some: { id: { equals: queryParams.collectionId } }
    } : undefined,
    productCategories: queryParams?.categoryId ? {
      some: { id: { equals: queryParams.categoryId } }
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

interface RetrievePricedProductByIdParams {
  id: string;
  regionId: string;
}

export const retrievePricedProductById = cache(async function ({
  id,
  regionId,
}: RetrievePricedProductByIdParams): Promise<any> {
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

interface GetProductByHandleParams {
  handle: string;
  regionId: string;
}

export const getProductByHandle = cache(async function ({
  handle,
  regionId
}: GetProductByHandleParams): Promise<any> {
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
        productImages(orderBy: { order: asc }) {
          id
          image {
            url
          }
          imagePath
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

  return openfrontClient.request(GET_PRODUCT_BY_HANDLE_QUERY, {
    handle,
    regionId,
  });
});

export const retrievePricedProductByHandle = cache(async function ({
  handle,
  regionId,
}: GetProductByHandleParams): Promise<any> {
  const data = await getProductByHandle({ handle, regionId });
  return data;
});

interface GetProductsListWithSortParams {
  page?: number;
  queryParams: Record<string, any>;
  sortBy?: Record<string, 'asc' | 'desc'>;
  countryCode: string;
}

export const getProductsListWithSort = cache(async function ({
  page = 0,
  queryParams,
  sortBy = { createdAt: "desc" },
  countryCode,
}: GetProductsListWithSortParams) {
  const limit = queryParams?.limit || 12;
  const pageParam = Math.max(0, page - 1);

  const {
    response: { products, count },
  } = await getProductsList({
    pageParam,
    queryParams: {
      ...queryParams,
      limit,
      id: queryParams?.productsIds
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

interface GetProductsListByPriceParams {
  page?: number;
  queryParams: Record<string, any>;
  priceOrder: 'asc' | 'desc';
  countryCode: string;
}

export const getProductsListByPrice = cache(async function ({
  page = 0,
  queryParams,
  priceOrder,
  countryCode,
}: GetProductsListByPriceParams) {
  const limit = queryParams?.limit || 12;
  const pageParam = Math.max(0, page - 1);
  const offset = pageParam * limit;

  const GET_PRODUCTS_SORTED_BY_PRICE_QUERY = gql`
    query GetProductsSortedByPrice(
      $countryCode: String!
      $limit: Int!
      $offset: Int!
      $priceOrder: String!
      $collectionId: ID
      $categoryId: ID
    ) {
      getProductsSortedByPrice(
        countryCode: $countryCode
        limit: $limit
        offset: $offset
        priceOrder: $priceOrder
        collectionId: $collectionId
        categoryId: $categoryId
      ) {
        products {
          id
          title
          handle
          thumbnail
          productVariants {
            id
            title
            prices {
              id
              amount
              currency {
                code
              }
            }
          }
        }
        count
      }
    }
  `;

  const data = await openfrontClient.request(GET_PRODUCTS_SORTED_BY_PRICE_QUERY, {
    countryCode,
    limit,
    offset,
    priceOrder,
    collectionId: queryParams?.collectionId || null,
    categoryId: queryParams?.categoryId || null,
  });

  const result = data.getProductsSortedByPrice;

  return {
    response: {
      products: result.products,
      count: result.count,
    },
    nextPage: result.count > offset + limit ? page + 1 : null,
    queryParams,
  };
});
