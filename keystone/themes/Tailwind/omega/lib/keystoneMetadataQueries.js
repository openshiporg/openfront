import { gql } from "graphql-request";
import { keystoneClient } from "@keystone/keystoneClient";

export async function getKeystoneMetadata() {
  // First query to get adminMeta and authenticatedItem type
  const metaQuery = gql`
    query StaticAdminMeta {
      keystone {
        adminMeta {
          lists {
            key
            path
            label
            singular
            plural
            description
            initialColumns
            pageSize
            labelField
            isSingleton
            hideCreate
            isHidden
            fields {
              path
              createView {
                fieldMode
              }
            }
            groups {
              label
              description
              fields {
                path
              }
            }
          }
        }
      }
      authenticatedItem {
        __typename
      }
    }
  `;

  const { keystone: { adminMeta }, authenticatedItem: authType } = await keystoneClient.request(metaQuery);

  // If we have an authenticated user, get their data
  let authData = null;
  if (authType && authType.__typename) {
    const authQuery = gql`
      query {
        authenticatedItem {
          ... on ${authType.__typename} {
            id
            name
            email
          }
        }
      }
    `;
    const { authenticatedItem } = await keystoneClient.request(authQuery);
    authData = authenticatedItem;
  }

  const lists = {};
  const countQueries = [];

  adminMeta.lists.forEach(list => {
    const pluralGraphQLName = list.plural || list.key + 's';
    const lowerPluralName = pluralGraphQLName.replace(/\s+/g, '').slice(0, 1).toLowerCase() + pluralGraphQLName.replace(/\s+/g, '').slice(1);
    const lowerSingularName = list.key.replace(/\s+/g, '').slice(0, 1).toLowerCase() + list.key.replace(/\s+/g, '').slice(1);

    list.gqlNames = {
      outputTypeName: list.key,
      itemQueryName: lowerSingularName,
      listQueryName: lowerPluralName,
      listQueryCountName: `${lowerPluralName}Count`,
      listOrderName: `${list.key}OrderByInput`,
      deleteMutationName: `delete${list.key}`,
      updateMutationName: `update${list.key}`,
      createMutationName: `create${list.key}`,
      deleteManyMutationName: `delete${pluralGraphQLName}`,
      updateManyMutationName: `update${pluralGraphQLName}`,
      createManyMutationName: `create${pluralGraphQLName}`,
      whereInputName: `${list.key}WhereInput`,
      whereUniqueInputName: `${list.key}WhereUniqueInput`,
      updateInputName: `${list.key}UpdateInput`,
      createInputName: `${list.key}CreateInput`,
      updateManyInputName: `${list.key}UpdateArgs`,
      relateToManyForCreateInputName: `${list.key}RelateToManyForCreateInput`,
      relateToManyForUpdateInputName: `${list.key}RelateToManyForUpdateInput`,
      relateToOneForCreateInputName: `${list.key}RelateToOneForCreateInput`,
      relateToOneForUpdateInputName: `${list.key}RelateToOneForUpdateInput`,
    };

    if (!list.isSingleton) {
      countQueries.push(`${list.key}: ${list.gqlNames.listQueryCountName}`);
    }

    lists[list.key] = list;
  });

  const countsQuery = gql`
    query {
      ${countQueries.join('\n')}
    }
  `;

  const counts = await keystoneClient.request(countsQuery);

  Object.values(lists).forEach(list => {
    if (!list.isSingleton) {
      list.count = counts[list.key] || 0;
    }
  });

  // Process visibleLists
  const visibleLists = {
    state: "ready",
    lists: new Set(
      adminMeta.lists
        .filter(list => !list.isHidden)
        .map(list => list.key)
    )
  };

  // Process authenticatedItem like in useLazyMetadata
  const authState = !authData
    ? { state: "unauthenticated" }
    : {
        state: "authenticated",
        id: authData.id,
        label: authData.name || authData.email,
        listKey: authType.__typename,
        email: authData.email
      };

  return {
    adminMeta: lists,
    visibleLists,
    authenticatedItem: authState
  };
}