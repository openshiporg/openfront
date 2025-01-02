"use server";

import { revalidateTag } from "next/cache";
import { keystoneClient } from "@keystone/keystoneClient";

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

export async function deleteManyListItems(listKey, ids) {
  try {
    const list = await getList(listKey);
    const result = await keystoneClient.request(
      `
      mutation($where: [${list.gqlNames.whereUniqueInputName}!]!) {
        items: ${list.gqlNames.deleteManyMutationName}(where: $where) {
          id
          ${list.labelField}
        }
      }
    `,
      {
        where: ids.map((id) => ({ id })),
      }
    );

    revalidateTag('lists');
    revalidateTag(`list-${listKey.toLowerCase()}`);
    
    return result?.items;
  } catch (err) {
    console.error('Error deleting list items:', err);
    throw err;
  }
}

export async function getListPageData(key, { currentPage = 1, pageSize = 50, search = "", filters = {} }) {  
  try {
    // Get list metadata using existing functions
    const [list, metaData] = await Promise.all([
      getList(key),
      getListMetadata(key)
    ]);

    // Then fetch items with the correct fields
    const query = `
      query($where: ${key}WhereInput, $orderBy: [${key}OrderByInput!]!, $take: Int, $skip: Int) {
        items: ${list.path}(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
          id
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
    console.error('Error getting list table metadata:', err);
    throw err;
  }
} 