"use server";

import { keystoneClient } from "@keystone/keystoneClient";

export async function getKeystoneMetadata() {
  try {
    const data = await keystoneClient.request(`
      query {
        keystone {
          adminMeta {
            lists {
              key
              itemQueryName
              listQueryName
              description
              label
              singular
              plural
              path
              fields {
                path
                label
                description
                fieldMeta
                viewsIndex
                customViews
                search
                isNonNull
                itemView {
                  fieldMode
                }
                listView {
                  fieldMode
                }
                createView {
                  fieldMode
                }
              }
              hideCreate
              hideDelete
              initialColumns
              initialSort
              pageSize
              labelField
            }
          }
        }
      }
    `, undefined, {
      next: { tags: ['metadata'] }
    });
    return data?.keystone?.adminMeta;
  } catch (err) {
    console.error('Error getting Keystone metadata:', err);
    throw err;
  }
}

export async function getListMetadata(listKey) {
  try {
    const data = await keystoneClient.request(`
      query($listKey: String!) {
        keystone {
          adminMeta {
            list(key: $listKey) {
              key
              itemQueryName
              listQueryName
              description
              label
              singular
              plural
              path
              fields {
                path
                label
                description
                fieldMeta
                viewsIndex
                customViews
                search
                isNonNull
                itemView {
                  fieldMode
                }
                listView {
                  fieldMode
                }
                createView {
                  fieldMode
                }
              }
              hideCreate
              hideDelete
              initialColumns
              initialSort
              pageSize
              labelField
            }
          }
        }
      }
    `, { listKey }, {
      next: { tags: ['metadata'] }
    });
    return data?.keystone?.adminMeta?.list;
  } catch (err) {
    console.error('Error getting list metadata:', err);
    throw err;
  }
} 