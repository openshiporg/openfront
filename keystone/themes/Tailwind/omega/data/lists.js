"use server";

import { revalidateTag } from "next/cache";
import { keystoneClient } from "@keystone/keystoneClient";
import { fieldViews } from "@keystone/fieldViews";
import { getGqlNames } from "@keystone-6/core/types";

const expectedExports = new Set(["Cell", "Field", "controller", "CardValue"]);

export async function getList(listKey) {
  try {
    const data = await keystoneClient.request(
      `
      query($listKey: String!) {
        keystone {
          adminMeta {
            list(key: $listKey) {
              key
              label
              singular
              plural
              description
              itemQueryName
              listQueryName
              path
              initialColumns
              pageSize
              labelField
              isSingleton
              hideCreate
              hideDelete
              fields {
                path
                label
                search
                isOrderable
                isFilterable
                listView {
                  fieldMode
                }
              }
            }
          }
        }
      }
    `,
      { listKey },
      {
        next: { tags: ['lists', `list-${listKey.toLowerCase()}`] }
      }
    );

    const list = data?.keystone?.adminMeta?.list;
    // Transform the fields into the structure expected by useFilters
    const fields = {};
    list.fields.forEach(field => {
      fields[field.path] = {
        ...field,
        controller: {
          filter: field.isFilterable ? {
            types: {
              contains: {},
              not_contains: {},
              equals: {},
              not_equals: {},
            }
          } : null
        }
      };
    });

    return {
      ...list,
      fields
    };
  } catch (err) {
    console.error('Error getting list:', err);
    throw err;
  }
}

export async function getListMetadata(listKey) {
  try {
    const data = await keystoneClient.request(
      `
      query($listKey: String!) {
        keystone {
          adminMeta {
            list(key: $listKey) {
              hideDelete
              hideCreate
              fields {
                path
                isOrderable
                isFilterable
                listView {
                  fieldMode
                }
              }
            }
          }
        }
      }
    `,
      { listKey },
      {
        next: { tags: ['lists', `list-${listKey.toLowerCase()}`] }
      }
    );

    return data?.keystone?.adminMeta?.list;
  } catch (err) {
    console.error('Error getting list metadata:', err);
    throw err;
  }
}

export async function getListItems(listKey, { query = "", fields = ["id"], first = 50, skip = 0 } = {}) {
  try {
    const list = await getList(listKey);
    const data = await keystoneClient.request(`
      query($where: ${listKey}WhereInput, $orderBy: [${listKey}OrderByInput!]!, $take: Int, $skip: Int) {
        items: ${list.path}(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
          ${fields.join("\n")}
        }
        count: ${list.path}Count(where: $where)
      }
    `, {
      where: query ? { OR: [{ name: { contains: query } }] } : undefined,
      orderBy: [{ name: "asc" }],
      take: first,
      skip,
    }, {
      next: { tags: ['lists', `list-${listKey.toLowerCase()}`] }
    });

    return {
      items: data?.items || [],
      count: data?.count || 0,
    };
  } catch (err) {
    console.error('Error getting list items:', err);
    throw err;
  }
}

export async function getListItem(listKey, id, fields = "id name") {
  try {
    const list = await getList(listKey);
    const data = await keystoneClient.request(
      `
      query($id: ID!) {
        item: ${list.path}(where: { id: $id }) {
          ${fields}
        }
      }
    `,
      { id },
      {
        next: { tags: ['lists', `list-${listKey.toLowerCase()}`] }
      }
    );
    return data?.item;
  } catch (err) {
    console.error('Error getting list item:', err);
    throw err;
  }
}

export async function createListItem(listKey, data) {
  try {
    const list = await getList(listKey);
    const result = await keystoneClient.request(
      `
      mutation($data: ${listKey}CreateInput!) {
        item: ${list.gqlNames.createMutationName}(data: $data) {
          id
        }
      }
    `,
      { data }
    );

    revalidateTag('lists');
    revalidateTag(`list-${listKey.toLowerCase()}`);
    return result?.item;
  } catch (err) {
    console.error('Error creating list item:', err);
    throw err;
  }
}

export async function updateListItem(listKey, id, data) {
  try {
    const list = await getList(listKey);
    const result = await keystoneClient.request(
      `
      mutation($id: ID!, $data: ${listKey}UpdateInput!) {
        item: ${list.gqlNames.updateMutationName}(where: { id: $id }, data: $data) {
          id
        }
      }
    `,
      { id, data }
    );

    revalidateTag('lists');
    revalidateTag(`list-${listKey.toLowerCase()}`);
    return result?.item;
  } catch (err) {
    console.error('Error updating list item:', err);
    throw err;
  }
}

export async function deleteListItem(listKey, id) {
  try {
    const list = await getList(listKey);
    const result = await keystoneClient.request(
      `
      mutation($id: ID!) {
        item: ${list.gqlNames.deleteMutationName}(where: { id: $id }) {
          id
        }
      }
    `,
      { id }
    );

    revalidateTag('lists');
    revalidateTag(`list-${listKey.toLowerCase()}`);
    return result?.item;
  } catch (err) {
    console.error('Error deleting list item:', err);
    throw err;
  }
}

export async function getListPageData(key, { currentPage = 1, pageSize = 50, search = "", filters = {} }) {
  'use server';
  
  try {
    // Get list metadata using existing functions
    const [list, metaData] = await Promise.all([
      getList(key),
      getListMetadata(key)
    ]);

    console.log('List data:', {
      key,
      path: list.path,
      initialColumns: list.initialColumns
    });

    // Then fetch items with the correct fields
    const query = `
      query($where: ${key}WhereInput, $orderBy: [${key}OrderByInput!]!, $take: Int, $skip: Int) {
        items: ${list.path}(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
          ${list.initialColumns.join("\n")}
        }
        count: ${list.path}Count(where: $where)
      }
    `;

    const variables = {
      where: {
        ...(search ? { OR: [{ name: { contains: search } }] } : {}),
        ...filters
      },
      orderBy: [{ name: "asc" }],
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    };

    console.log('GraphQL Query:', query);
    console.log('Variables:', variables);

    const data = await keystoneClient.request(
      query,
      variables,
      {
        next: { tags: ['lists', `list-${key.toLowerCase()}`] }
      }
    );

    return {
      list,
      metaData,
      items: data?.items || [],
      count: data?.count || 0
    };
  } catch (err) {
    console.error('Error getting list page data:', err);
    console.error('Error details:', {
      message: err.message,
      key,
      currentPage,
      pageSize,
      search,
      filters
    });
    throw err;
  }
}

export async function getAllLists() {
  try {
    const data = await keystoneClient.request(
      `
      query {
        keystone {
          adminMeta {
            lists {
              key
              fields {
                path
                label
                isOrderable
                isFilterable
                listView {
                  fieldMode
                }
                controller {
                  filter {
                    types
                  }
                  graphqlSelection
                }
                views {
                  Cell
                  supportsLinkTo
                }
              }
              labelField
              description
              label
              singular
              plural
              path
              initialColumns
              pageSize
              gqlNames {
                listQueryName
                listQueryCountName
                listOrderName
                whereInputName
              }
            }
          }
        }
      }
    `,
      {},
      {
        next: { tags: ['lists'] }
      }
    );

    const lists = {};
    data?.keystone?.adminMeta?.lists.forEach(list => {
      // Transform the fields into a map
      const fields = {};
      list.fields.forEach(field => {
        fields[field.path] = field;
      });

      lists[list.key] = {
        ...list,
        fields
      };
    });

    return lists;
  } catch (err) {
    console.error('Error getting all lists:', err);
    throw err;
  }
}

export async function getListData(key) {
  const lists = await getAllLists();
  if (!lists[key]) {
    throw new Error(`Invalid list key provided: ${key}`);
  }
  return lists[key];
}

export async function getAdminMeta() {
  try {
    const data = await keystoneClient.request(
      `
      query StaticAdminMeta {
        keystone {
          adminMeta {
            lists {
              key
              itemQueryName
              listQueryName
              initialSort {
                field
                direction
              }
              path
              label
              singular
              plural
              description
              initialColumns
              pageSize
              labelField
              isSingleton
              groups {
                label
                description
                fields {
                  path
                }
              }
              fields {
                path
                label
                description
                fieldMeta
                viewsIndex
                customViewsIndex
                search
                isNonNull
                itemView {
                  fieldMode
                  fieldPosition
                }
                listView {
                  fieldMode
                }
              }
            }
          }
        }
      }
    `);

    const adminMeta = data?.keystone?.adminMeta;
    if (!adminMeta) {
      throw new Error('Failed to fetch admin metadata');
    }

    console.log('fieldViews available:', fieldViews);
    console.log('Expected exports:', expectedExports);

    const runtimeAdminMeta = {
      lists: {},
    };

    for (const list of adminMeta.lists) {
      runtimeAdminMeta.lists[list.key] = {
        ...list,
        groups: [],
        gqlNames: getGqlNames({
          listKey: list.key,
          pluralGraphQLName: list.listQueryName,
        }),
        fields: {},
      };

      for (const field of list.fields) {
        console.log(`Processing field ${list.key}.${field.path}:`);
        console.log('viewsIndex:', field.viewsIndex);
        console.log('fieldViews[viewsIndex]:', fieldViews[field.viewsIndex]);

        // Validate required exports
        expectedExports.forEach((exportName) => {
          if (fieldViews[field.viewsIndex][exportName] === undefined) {
            console.log(`Missing export ${exportName} for field ${list.key}.${field.path}`);
            throw new Error(
              `The view for the field at ${list.key}.${field.path} is missing the ${exportName} export`
            );
          }
        });

        const views = { ...fieldViews[field.viewsIndex] };
        console.log('Views after spread:', views);
        console.log('Controller type:', typeof views.controller);
        console.log('Controller value:', views.controller);

        const customViews = {};

        if (field.customViewsIndex !== null) {
          const customViewsSource = fieldViews[field.customViewsIndex];
          const allowedExportsOnCustomViews = new Set(
            views.allowedExportsOnCustomViews
          );
          Object.keys(customViewsSource).forEach((exportName) => {
            if (allowedExportsOnCustomViews.has(exportName)) {
              customViews[exportName] = customViewsSource[exportName];
            } else if (expectedExports.has(exportName)) {
              views[exportName] = customViewsSource[exportName];
            } else {
              throw new Error(
                `Unexpected export named ${exportName} from the custom view from field at ${list.key}.${field.path}`
              );
            }
          });
        }

        try {
          const controller = views.controller({
            listKey: list.key,
            fieldMeta: field.fieldMeta,
            label: field.label,
            description: field.description,
            path: field.path,
            customViews,
          });
          console.log('Controller created successfully:', controller);

          runtimeAdminMeta.lists[list.key].fields[field.path] = {
            ...field,
            itemView: {
              fieldMode: field.itemView?.fieldMode ?? null,
              fieldPosition: field.itemView?.fieldPosition ?? null,
            },
            graphql: {
              isNonNull: field.isNonNull,
            },
            views,
            controller,
          };
        } catch (err) {
          console.error('Error creating controller:', err);
          throw err;
        }
      }

      for (const group of list.groups) {
        runtimeAdminMeta.lists[list.key].groups.push({
          label: group.label,
          description: group.description,
          fields: group.fields.map(
            (field) => runtimeAdminMeta.lists[list.key].fields[field.path]
          ),
        });
      }
    }

    return runtimeAdminMeta;
  } catch (err) {
    console.error('Error getting admin meta:', err);
    throw err;
  }
}

export async function getListTableData(listKey) {
  try {
    const data = await keystoneClient.request(
      `
      query($listKey: String!) {
        keystone {
          adminMeta {
            list(key: $listKey) {
              key
              fields {
                path
                label
                description
                fieldMeta
                viewsIndex
                customViewsIndex
                search
                isNonNull
                itemView {
                  fieldMode
                  fieldPosition
                }
                listView {
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
      }
    `,
      { listKey }
    );

    const list = data?.keystone?.adminMeta?.list;
    if (!list) {
      throw new Error(`Invalid list key provided: ${listKey}`);
    }

    return list;
  } catch (err) {
    console.error('Error getting list table data:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      listKey
    });
    throw err;
  }
} 