"use server"
import { gql } from "graphql-request"
import { openfrontClient } from "../config"
import { cache } from "react"

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

export const getCategoriesList = cache(async function (offset = 0, limit = 100) {
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

  return openfrontClient.request(GET_CATEGORIES_LIST_QUERY, { offset, limit });
});

export const getCategoryByHandle = cache(async function (categoryHandle: string) {
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